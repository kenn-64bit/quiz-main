"""Tech Stack Field Recommendation Quiz — Flask expert-system backend.

The quiz presents 10 first-person statements. The user rates each one on a
1-4 scale (1 = strongly disagree, 4 = strongly agree) or picks "N/O" (no
opinion). Each statement is mapped to a single career field with a weight;
the rating multiplied by the weight is added to that field's score. The
field with the highest score is the primary recommendation.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


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
        }

        # Each statement maps to exactly one field. Weight (1-2) reflects how
        # strongly agreement signals that field. Every field is covered.
        self.statements = [
            {"id": 0, "text": "I enjoy finding patterns and trends hidden in large amounts of data.", "field": "data_science", "weight": 2},
            {"id": 1, "text": "Working with statistics and mathematical models sounds exciting to me.", "field": "data_science", "weight": 1},
            {"id": 2, "text": "I like seeing an interface come to life visually as I build it.", "field": "web_development", "weight": 2},
            {"id": 3, "text": "I care a lot about how a product looks and feels to the people using it.", "field": "web_development", "weight": 1},
            {"id": 4, "text": "Automating repetitive tasks so they never have to be done by hand appeals to me.", "field": "devops", "weight": 2},
            {"id": 5, "text": "I would enjoy making sure a system stays fast and online as it grows to millions of users.", "field": "devops", "weight": 1},
            {"id": 6, "text": "Building an app that runs in someone's pocket and uses the camera or GPS excites me.", "field": "mobile_development", "weight": 2},
            {"id": 7, "text": "I like thinking about how attackers break into systems and how to stop them.", "field": "cybersecurity", "weight": 2},
            {"id": 8, "text": "I would enjoy building game worlds, physics, and real-time graphics.", "field": "game_development", "weight": 2},
            {"id": 9, "text": "I want to build something creative and interactive that people play with for fun.", "field": "game_development", "weight": 1},
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
        }

    def get_questions(self):
        return [
            {
                "id": s["id"],
                "question": s["text"],
                "type": "scale",
                "scale": {"min": 1, "max": 4, "allow_no_opinion": True},
            }
            for s in self.statements
        ]

    def analyze(self, responses):
        scores = {fid: 0 for fid in self.fields}

        for statement, response in zip(self.statements, responses):
            if response is None or response == "N/O":
                continue
            rating = int(response)
            scores[statement["field"]] += rating * statement["weight"]

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
        max_possible = top_score if top_score else 1
        confidence = round(max(0.0, min(100.0, (top_score - mean_score) / max_possible * 100)), 1)

        return {
            "primary_recommendation": as_field(top_id, top_score),
            "alternative_recommendations": [as_field(fid, sc) for fid, sc in ranked[1:4]],
            "confidence": confidence,
            "all_scores": scores,
            "recommendations": self.roadmaps[top_id],
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
        if r is None or r == "N/O":
            continue
        if not (isinstance(r, int) and 1 <= r <= 4):
            return (
                jsonify({"error": "Each response must be an integer 1-4, or \"N/O\"."}),
                400,
            )

    result = engine.analyze(responses)
    result["name"] = (data.get("name") or "").strip()
    return jsonify(result)


if __name__ == "__main__":
    print("🚀 Starting Tech Stack Quiz Expert System Backend")
    print("🔗 API running on http://localhost:5000")
    print("Available endpoints:")
    print("  - GET  /api/health")
    print("  - GET  /api/quiz-questions")
    print("  - POST /api/analyze")
    app.run(host="0.0.0.0", port=5000, debug=True)
