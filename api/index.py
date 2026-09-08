"""Tech Stack Field Recommendation Quiz — Flask expert-system backend.

The quiz presents 10 first-person statements. The user rates each one on a
1-5 scale (1 = strongly disagree, 3 = neutral, 5 = strongly agree). Each
non-neutral answer is turned into a *fact* and fed to a miniature
production-rule engine (`RuleEngine`) that fires scoring rules on an
agenda. The field with the highest total score is the primary
recommendation; the ordered list of fired-rule explanations is returned
as `reasoning`.

The engine is a deliberately small illustration of two classic
expert-system ideas — see `RuleEngine`'s docstring:

  * Smart Rule Matching   — the Rete algorithm's alpha network
  * Tie-Breakers for Rules — conflict resolution (salience / specificity /
                             recency) with refraction

Deployment: this file lives at `api/index.py`, one of Vercel's default
Python entrypoint locations, so Vercel auto-detects the module-level `app`
(a WSGI callable). Because `package.json` is under `frontend/`, Vercel treats
the repo as a Python project and routes EVERY path to this function — so Flask
serves the built frontend too (`serve_frontend` below), and `vercel.json`
bundles `frontend/dist` into the function via `functions.includeFiles`.
`buildCommand` in `vercel.json` runs the Vite build first. Do NOT add an
`/api/*` `rewrites` rule — Vercel routes internal rewrites by their rewritten
destination path, which would hand Flask the wrong URL.

Run locally: `python api/index.py` (API on http://localhost:5000, debug=True);
the frontend runs separately via `npm run dev` (port 5173).
"""

import os
import time
from collections import defaultdict, deque
from threading import Lock

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# The built Vite frontend, bundled into the serverless function via
# `vercel.json` -> functions.includeFiles. Vercel detects this repo as a
# Python project (package.json lives in frontend/), so it routes *every* path
# to this function — Flask therefore has to serve the static site itself.
_FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist"
)

# --- Simple per-IP sliding-window rate limiting -----------------------------
# Best-effort: state is per-process, so on a serverless/multi-worker host it
# only throttles bursts that land on the same instance. Enough to blunt a
# client hammering refresh or buttons.
RATE_LIMIT_MAX = 30            # requests ...
RATE_LIMIT_WINDOW = 10.0      # ... per this many seconds, per IP
_rate_hits = defaultdict(deque)
_rate_lock = Lock()


@app.before_request
def _rate_limit():
    if request.method == "OPTIONS" or not request.path.startswith("/api/"):
        return None  # only rate-limit the API, not static asset loads
    ip = (request.headers.get("x-forwarded-for", request.remote_addr or "?")
          .split(",")[0].strip())
    now = time.monotonic()
    with _rate_lock:
        hits = _rate_hits[ip]
        while hits and now - hits[0] > RATE_LIMIT_WINDOW:
            hits.popleft()
        if len(hits) >= RATE_LIMIT_MAX:
            retry = round(RATE_LIMIT_WINDOW - (now - hits[0]), 1)
            resp = jsonify({"error": "Too many requests — slow down.",
                            "retry_after": retry})
            resp.status_code = 429
            resp.headers["Retry-After"] = str(int(retry) + 1)
            return resp
        hits.append(now)
    return None


# ---------------------------------------------------------------------------
# Rule engine
# ---------------------------------------------------------------------------
#
# A rule is a plain function `rule(engine, fact) -> activation | None`.
# An *activation* is a dict describing a rule that is ready to fire:
#
#   {
#     "name":        str,          # rule id (for refraction + the trace)
#     "salience":    int,          # hand-set priority — higher fires first
#     "specificity": int,          # how many conditions the rule tests
#     "key":         hashable,     # identity for refraction (fire-once)
#     "delta":       {field: int}, # score changes to apply when it fires
#     "note":        str,          # human-readable line for `reasoning`
#   }
#
# Each rule declares the fact type ("predicate") it reacts to via
# RULES_BY_TRIGGER, so a new fact only wakes the handful of rules that
# actually care about it.


def rule_affinity(engine, fact):
    """Generic: a single "I agree" answer nudges its field up.

    Trigger: `affinity`. One condition, ordinary priority. The delta here is
    exactly the old `(rating - 3) * weight`, so base scoring is unchanged.
    """
    _, field, strength, weight, sid = fact
    delta = strength * weight
    return {
        "name": "strong-affinity",
        "salience": 10,
        "specificity": 1,
        "key": ("strong-affinity", sid),
        "delta": {field: delta},
        "note": f"Leaned into {engine.field_name(field)} (Q{sid + 1}) → +{delta}",
    }


def rule_aversion(engine, fact):
    """Generic: a single "I disagree" answer nudges its field down."""
    _, field, strength, weight, sid = fact
    delta = strength * weight
    return {
        "name": "strong-aversion",
        "salience": 10,
        "specificity": 1,
        "key": ("strong-aversion", sid),
        "delta": {field: -delta},
        "note": f"Pushed back on {engine.field_name(field)} (Q{sid + 1}) → -{delta}",
    }


def rule_paired_affinity(engine, fact):
    """Specific: BOTH statements for one field got an "agree".

    Trigger: `affinity`. Two conditions, so it is more *specific* than
    `rule_affinity`; it is also given a higher *salience* so it lands first
    in the trace. (Even at equal salience the higher specificity would win
    the tie.) Fires once per field via its `key`.
    """
    _, field, *_ = fact
    hits = [f for f, _rec in engine.alpha["affinity"] if f[1] == field]
    if len(hits) < 2:
        return None
    return {
        "name": "paired-affinity",
        "salience": 20,
        "specificity": 2,
        "key": ("paired-affinity", field),
        "delta": {field: 2},
        "note": f"Two answers both point at {engine.field_name(field)} → +2 bonus",
    }


def rule_paired_aversion(engine, fact):
    """Specific: BOTH statements for one field got a "disagree" (symmetric)."""
    _, field, *_ = fact
    hits = [f for f, _rec in engine.alpha["aversion"] if f[1] == field]
    if len(hits) < 2:
        return None
    return {
        "name": "paired-aversion",
        "salience": 20,
        "specificity": 2,
        "key": ("paired-aversion", field),
        "delta": {field: -2},
        "note": f"Two answers both reject {engine.field_name(field)} → -2",
    }


def rule_broad_enthusiasm(engine, fact):
    """Generic catch-all: agreed with almost everything.

    Trigger: `affinity`. Zero scored conditions and low salience, so it
    always resolves *last* — the classic "generic rule loses to specific
    ones". Adds no score, only a caveat to the trace.
    """
    if len(engine.alpha["affinity"]) < 5:
        return None
    return {
        "name": "broad-enthusiasm",
        "salience": 5,
        "specificity": 0,
        "key": ("broad-enthusiasm",),
        "delta": {},
        "note": "You reacted positively to most statements — the top match is less clear-cut.",
    }


RULES_BY_TRIGGER = {
    "affinity": [rule_affinity, rule_paired_affinity, rule_broad_enthusiasm],
    "aversion": [rule_aversion, rule_paired_aversion],
}


class RuleEngine:
    """A miniature production-rule engine.

    Two textbook expert-system ideas, in a deliberately small form:

    1. Smart Rule Matching  (technically: the Rete algorithm's *alpha
       network*).
       In plain terms: instead of re-checking every rule against every known
       fact whenever something changes, we keep a small index of facts
       grouped by type (`self.alpha`) and only push a *newly asserted* fact
       through the rules that react to that type (`RULES_BY_TRIGGER`). A fact
       already in working memory is dropped on arrival, so nothing is matched
       twice. The rulebook can grow without the match cost growing with it.

    2. Tie-Breakers for Rules  (technically: *conflict-resolution
       strategies* — salience, specificity, recency).
       In plain terms: when several rules are ready at once we need an order.
       A rule with a higher hand-set priority (**salience**) goes first;
       ties go to the more detailed rule (**specificity** — more
       conditions); remaining ties go to the rule triggered by the most
       recently learned fact (**recency**). Every activation fires only once
       (**refraction**).
    """

    def __init__(self, fields):
        self._fields = fields
        self.wm = set()                # working memory: facts seen (dedup)
        self.alpha = defaultdict(list)  # alpha memory: predicate -> [(fact, recency)]
        self.clock = 0                  # monotonic recency stamp
        self.agenda = []               # pending activations
        self.fired = set()             # activation keys already fired (refraction)
        self.scores = {fid: 0 for fid in fields}
        self.reasoning = []

    def field_name(self, field_id):
        return self._fields[field_id]["name"]

    # -- Rete alpha step: assert one fact, match only what is new ----------
    def assert_fact(self, fact):
        if fact in self.wm:
            return                      # already known -> nothing new to match
        self.wm.add(fact)
        self.clock += 1
        predicate = fact[0]
        self.alpha[predicate].append((fact, self.clock))
        for rule in RULES_BY_TRIGGER.get(predicate, ()):
            activation = rule(self, fact)
            if activation and activation["key"] not in self.fired:
                activation["recency"] = self.clock
                self.agenda.append(activation)

    def assert_rating(self, statement, rating):
        """Translate a 1-5 answer into a fact (neutral 3 asserts nothing)."""
        field, weight, sid = statement["field"], statement["weight"], statement["id"]
        if rating >= 4:
            self.assert_fact(("affinity", field, rating - 3, weight, sid))
        elif rating <= 2:
            self.assert_fact(("aversion", field, 3 - rating, weight, sid))

    # -- Conflict resolution: order the agenda, then fire once each -------
    def run(self):
        self.agenda.sort(
            key=lambda a: (-a["salience"], -a["specificity"], -a["recency"])
        )
        for activation in self.agenda:
            if activation["key"] in self.fired:
                continue
            self.fired.add(activation["key"])
            for field_id, delta in activation["delta"].items():
                self.scores[field_id] += delta
            self.reasoning.append(activation["note"])

        if not self.reasoning:
            self.reasoning.append(
                "No strong preferences detected — answers were mostly neutral."
            )
        return self.scores, self.reasoning


class ExpertSystem:
    """Rule-based scoring engine for the tech-field quiz."""

    def __init__(self):
        self.fields = {
            "data_science": {
                "name": "Data Science & AI",
                "description": "Work with machine learning, statistics, and data analysis.",
            },
            "web_development": {
                "name": "Web Development",
                "description": "Build websites and web applications, front-end to back-end.",
            },
            "devops": {
                "name": "DevOps & Infrastructure",
                "description": "Automate deployments, scale systems, and keep services reliable.",
            },
            "mobile_development": {
                "name": "Mobile Development",
                "description": "Create native and cross-platform apps for phones and tablets.",
            },
            "cybersecurity": {
                "name": "Cybersecurity",
                "description": "Protect systems and data by finding and closing security gaps.",
            },
            "game_development": {
                "name": "Game Development",
                "description": "Design and build interactive games, engines, and real-time graphics.",
            },
            "iot": {
                "name": "IoT & Embedded",
                "description": "Program microcontrollers and connected devices that sense and act on the physical world.",
            },
            "networking": {
                "name": "Networking",
                "description": "Design, run, and troubleshoot Data Centers and the networks that move data between systems.",
            },
        }

        # Each statement maps to exactly one field. Every field has the same
        # number of statements and every weight is 1, so no field is favoured.
        self.statements = [
            {"id": 0, "text": "I enjoy finding patterns and trends in data. Big Numbers === Stonks.", "field": "data_science", "weight": 1},
            {"id": 1, "text": "Working with statistics and math models sounds like money.", "field": "data_science", "weight": 1},
            {"id": 2, "text": "I like seeing an interface come to life visually as I build it brick by brick.", "field": "web_development", "weight": 1},
            {"id": 3, "text": "I care a lot about how a product looks and feels to the people using it.", "field": "web_development", "weight": 1},
            {"id": 4, "text": "I want to Automating repetitive tasks, think smarter not harder.", "field": "devops", "weight": 1},
            {"id": 5, "text": "I enjoy making sure a system stays fast and online as it grows to millions of users, CS MENTALITY!.", "field": "devops", "weight": 1},
            {"id": 6, "text": "Building an app that lives in someone's pocket and taps the camera, GPS, and sensors excites me.", "field": "mobile_development", "weight": 1},
            {"id": 7, "text": "Designing smooth touch interactions and offline-friendly apps for phones sounds great.", "field": "mobile_development", "weight": 1},
            {"id": 8, "text": "I like thinking about how hackers break into systems and how to reverse engineer them.", "field": "cybersecurity", "weight": 1},
            {"id": 9, "text": "Hardening systems, hunting for vulnerabilities, and responding to incidents appeals to me.", "field": "cybersecurity", "weight": 1},
            {"id": 10, "text": "I enjoy building game worlds, physics, and real-time graphics.", "field": "game_development", "weight": 1},
            {"id": 11, "text": "I want to build something creative and interactive that people play with for fun.", "field": "game_development", "weight": 1},
            {"id": 12, "text": "Repairing a Washing Machine sounds like a fun challenge.", "field": "iot", "weight": 1},
            {"id": 13, "text": "I like microcontrollers and embedded systems.", "field": "iot", "weight": 1},
            {"id": 14, "text": "I like how data travels across networks and how it gets to its destination.", "field": "networking", "weight": 1},
            {"id": 15, "text": "I want my response times 0.200 seconds than 0.500 seconds.", "field": "networking", "weight": 1},
        ]

        self.roadmaps = {
            "data_science": [
                "Learn Python and libraries like pandas, scikit-learn, and TensorFlow.",
                "Master SQL and databases for data manipulation.",
                "Study statistics, probability, and linear algebra.",
                "Build a portfolio of end-to-end analysis and modeling projects.",
                "Practice communicating findings with clear visualizations.",
            ],
            "web_development": [
                "Get comfortable with HTML, CSS, and modern JavaScript.",
                "Learn a front-end framework such as React.",
                "Build a back-end with Node.js, Flask, or Django and a REST API.",
                "Understand databases, authentication, and deployment.",
                "Ship a few full-stack projects and put them online.",
            ],
            "devops": [
                "Learn Linux fundamentals and shell scripting.",
                "Get hands-on with Docker and container orchestration (Kubernetes).",
                "Practice infrastructure as code with Terraform or similar tools.",
                "Set up CI/CD pipelines and monitoring/alerting.",
                "Learn one major cloud provider (AWS, GCP, or Azure).",
            ],
            "mobile_development": [
                "Pick a platform: Swift/SwiftUI for iOS or Kotlin for Android.",
                "Or learn a cross-platform framework like React Native or Flutter.",
                "Understand mobile UI patterns, navigation, and state management.",
                "Work with device APIs: camera, location, notifications, storage.",
                "Publish an app to the App Store or Google Play.",
            ],
            "cybersecurity": [
                "Learn networking fundamentals and how common protocols work.",
                "Study the OWASP Top 10 and practice on deliberately vulnerable apps.",
                "Get comfortable with Linux, scripting, and tools like Burp Suite and Nmap.",
                "Try Capture The Flag challenges to build offensive and defensive skills.",
                "Explore a certification path such as Security+ or OSCP.",
            ],
            "game_development": [
                "Learn a game engine such as Unity (C#) or Unreal (C++).",
                "Study game loops, physics, collision detection, and rendering basics.",
                "Practice math for games: vectors, matrices, and trigonometry.",
                "Build and finish small games to learn scope management.",
                "Share your games and gather player feedback.",
            ],
            "iot": [
                "Learn C/C++ and Python for microcontrollers.",
                "Get hands-on with an Arduino or ESP32 and basic electronics (GPIO, I2C, SPI).",
                "Read sensors and drive actuators, then log the data.",
                "Connect devices to the cloud with MQTT and understand power and memory constraints.",
                "Build an end-to-end project: device, gateway, dashboard.",
            ],
            "networking": [
                "Learn the OSI/TCP-IP models and how IP, TCP, UDP, and DNS work.",
                "Practice subnetting, routing, switching, and VLANs (labs in Packet Tracer or GNS3).",
                "Get comfortable with Wireshark, ping/traceroute, and other diagnostic tools.",
                "Study firewalls, NAT, VPNs, and basic network security.",
                "Work toward a certification such as CompTIA Network+ or CCNA.",
            ],
        }

    def get_questions(self):
        return [
            {
                "id": s["id"],
                "question": s["text"],
                "type": "scale",
                "scale": {"min": 1, "max": 5, "allow_no_opinion": False},
            }
            for s in self.statements
        ]

    def analyze(self, responses):
        engine = RuleEngine(self.fields)
        for statement, response in zip(self.statements, responses):
            if response is not None:
                engine.assert_rating(statement, int(response))
        scores, reasoning = engine.run()

        ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)

        def as_field(field_id, score):
            return {
                "field_id": field_id,
                "name": self.fields[field_id]["name"],
                "description": self.fields[field_id]["description"],
                "score": score,
            }

        top_id, top_score = ranked[0]
        mean_score = sum(scores.values()) / len(scores)
        max_possible = top_score if top_score > 0 else 1
        confidence = round(max(0.0, min(100.0, (top_score - mean_score) / max_possible * 100)), 1)

        return {
            "primary_recommendation": as_field(top_id, top_score),
            "alternative_recommendations": [as_field(fid, sc) for fid, sc in ranked[1:4]],
            "confidence": confidence,
            "all_scores": scores,
            "recommendations": self.roadmaps[top_id],
            "reasoning": reasoning,
        }


engine = ExpertSystem()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "system": "Expert System Quiz Backend"})


@app.route("/api/quiz-questions", methods=["GET"])
def quiz_questions():
    return jsonify(engine.get_questions())


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    responses = data.get("responses")

    if not isinstance(responses, list) or len(responses) != len(engine.statements):
        return (
            jsonify({"error": f"'responses' must be a list of {len(engine.statements)} items."}),
            400,
        )

    for r in responses:
        if not (isinstance(r, int) and 1 <= r <= 5):
            return (
                jsonify({"error": "Each response must be an integer 1-5."}),
                400,
            )

    result = engine.analyze(responses)
    result["name"] = (data.get("name") or "").strip()
    return jsonify(result)


# ---------------------------------------------------------------------------
# Static frontend (production only)
# ---------------------------------------------------------------------------
# Serve the built Vite app for every non-API path. The `/api/*` rules above are
# more specific, so Werkzeug matches them first; anything else falls through to
# here. In local dev the frontend runs on its own Vite server (port 5173) and
# `_FRONTEND_DIST` usually doesn't exist — that's fine, these routes just 404.


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    file_path = os.path.join(_FRONTEND_DIST, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(_FRONTEND_DIST, path)
    return send_from_directory(_FRONTEND_DIST, "index.html")  # SPA entry


if __name__ == "__main__":
    print("🚀 Starting Tech Stack Quiz Expert System Backend")
    print("🔗 API running on http://localhost:5000")
    print("Available endpoints:")
    print("  - GET  /api/health")
    print("  - GET  /api/quiz-questions")
    print("  - POST /api/analyze")
    app.run(host="0.0.0.0", port=5000, debug=True)
