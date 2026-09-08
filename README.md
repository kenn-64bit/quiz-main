# Tech Stack Field Recommendation Quiz System

A full-stack application with an expert system that analyzes 24 quiz questions to recommend the ideal tech career path for students and professionals.

## 🎯 Features

- **24-Statement Rating Quiz** - Each question is a statement rated on a 1-5 scale (1 = strongly disagree, 3 = neutral, 5 = strongly agree); 3 statements per career field
- **Expert System** - Rule-based inference engine that centers each answer on the respondent's own mean rating, then maps the answers that stand out to a career field to calculate compatibility scores
- **8 Career Paths** - Recommends from: Data Science, Web Development, DevOps, Mobile Development, Cybersecurity, Game Development, IoT & Embedded, and Networking
- **Confidence Scoring** - Blends how far the top field beat the runner-up, how strong its score is, and how consistent its answers were; flags a `close_call` when the top two are near-tied
- **Alternative Suggestions** - Shows top 3 matching fields with detailed descriptions
- **Learning Roadmap** - Provides specific learning recommendations for the recommended field
- **Retro UI** - Early-2000s Windows-XP / "carrd" aesthetic: glossy lime titlebar, beveled panels, monospace type
