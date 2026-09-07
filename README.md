# Tech Stack Field Recommendation Quiz System

A full-stack application with an expert system that analyzes 10 quiz questions to recommend the ideal tech career path for students and professionals.

## 🎯 Features

- **10-Statement Rating Quiz** - Each question is a statement rated on a 1-4 scale (1 = strongly disagree, 4 = strongly agree), plus an `N/O` (no opinion) option that is skipped in scoring
- **Expert System** - Rule-based inference engine that maps each statement to a career field and weights the rating to calculate field compatibility scores
- **6 Career Paths** - Recommends from: Data Science, Web Development, DevOps, Mobile Development, Cybersecurity, and Game Development
- **Confidence Scoring** - Provides confidence level in recommendations based on response patterns
- **Alternative Suggestions** - Shows top 3 matching fields with detailed descriptions
- **Learning Roadmap** - Provides specific learning recommendations for the recommended field
- **Beautiful UI** - Modern, responsive interface with gradient design and smooth interactions

## 🏗️ Tech Stack

**Backend:**
- Python 3.8+
- Flask - Web framework
- Flask-CORS - Cross-origin request handling
- Experta (optional, for advanced rule engines)

**Frontend:**
- React 18+
- Vite (dev server + build)
- Vanilla CSS-in-JS styling (single `styles` object in `src/styles.js`)
- Fetch API for HTTP requests

## 📋 Project Structure

```
quiz/
├── quiz_backend.py          # Flask backend with expert system
├── requirements.txt         # Python dependencies
├── README.md                # This file
└── frontend/                # Vite + React app
    ├── index.html
    ├── package.json
    ├── vite.config.js       # dev proxy: /api -> http://localhost:5000
    └── src/
        ├── main.jsx
        ├── App.jsx          # screen state machine + fetch calls
        ├── api.js           # fetchQuestions() / analyze()
        ├── styles.js        # CSS-in-JS `styles` object (theme lives here)
        └── components/
            ├── StartScreen.jsx
            ├── QuizScreen.jsx
            └── ResultsScreen.jsx
```

## 🚀 Quick Start

### Backend Setup

1. **Install Python Dependencies**
```bash
pip install -r requirements.txt
```

2. **Run the Backend Server**
```bash
python quiz_backend.py
```

You should see:
```
🚀 Starting Tech Stack Quiz Expert System Backend
🔗 API running on http://localhost:5000
Available endpoints:
  - GET  /api/health
  - GET  /api/quiz-questions
  - POST /api/analyze
```

### Frontend Setup

The frontend is a Vite + React app in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

Open the printed dev URL (default http://localhost:5173). The dev server proxies
`/api` to the Flask backend on port 5000 (see `frontend/vite.config.js`), so start
the backend first.

To build for production:

```bash
cd frontend
npm run build      # outputs to frontend/dist/
npm run preview    # serve the build locally
```

For a deployed backend, set `VITE_API_BASE` to its URL at build time; `src/api.js`
reads it and falls back to a same-origin `/api` path.

## 📡 API Endpoints

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "system": "Expert System Quiz Backend"
}
```

### GET /api/quiz-questions
Retrieve all 10 quiz statements.

**Response:**
```json
[
  {
    "id": 0,
    "question": "I enjoy finding patterns and trends hidden in large amounts of data.",
    "type": "scale",
    "scale": {"min": 1, "max": 4, "allow_no_opinion": true}
  },
  ...
]
```

### POST /api/analyze
Analyze quiz responses and get a field recommendation.

**Request:** `responses` is a list of 10 items, each an integer `1`–`4` or the
string `"N/O"` (also accepts `null`) for "no opinion". `name` is optional and
echoed back in the response.

```json
{
  "name": "Kenn",
  "responses": [4, 4, 1, 1, 3, "N/O", 4, 2, 4, 3]
}
```

**Response:**
```json
{
  "name": "Kenn",
  "primary_recommendation": {
    "field_id": "data_science",
    "name": "Data Science & AI",
    "description": "Work with machine learning, statistics, and data analysis.",
    "score": 12
  },
  "alternative_recommendations": [
    {
      "field_id": "devops",
      "name": "DevOps & Infrastructure",
      "description": "...",
      "score": 5
    }
  ],
  "confidence": 62.5,
  "all_scores": {
    "data_science": 12,
    "web_development": 3,
    "devops": 5,
    "mobile_development": 2,
    "cybersecurity": 2,
    "game_development": 3
  },
  "recommendations": [
    "Learn Python and libraries like pandas, scikit-learn, and TensorFlow.",
    "Master SQL and databases for data manipulation.",
    "..."
  ]
}
```

## 🧠 Expert System Logic

The expert system uses a **rule-based inference engine**:

1. **Statement Mapping** - Each of the 10 statements maps to exactly one career field with a weight (1–2)
2. **Rating Weighting** - `score[field] += rating * weight`, where `rating` is the user's 1–4 answer; `N/O` / `null` contributes nothing
3. **Score Aggregation** - Ratings are summed per field across all statements
4. **Confidence Calculation** - Scaled spread of the top field's score vs. the mean of all field scores, clamped to 0–100
5. **Recommendation** - Field with the highest score is the primary recommendation; the next three form the alternatives

### Statements & Field Mapping

| # | Field | Weight |
|---|-------|--------|
| 0 | Data Science & AI | 2 |
| 1 | Data Science & AI | 1 |
| 2 | Web Development | 2 |
| 3 | Web Development | 1 |
| 4 | DevOps & Infrastructure | 2 |
| 5 | DevOps & Infrastructure | 1 |
| 6 | Mobile Development | 2 |
| 7 | Cybersecurity | 2 |
| 8 | Game Development | 2 |
| 9 | Game Development | 1 |

Statement text and mappings live in `ExpertSystem.statements` in `quiz_backend.py`.

## 🔧 Configuration

### Adding New Fields

Edit `quiz_backend.py` in the `ExpertSystem.__init__()` method:

```python
self.fields = {
    "new_field": {
        "name": "Field Name",
        "description": "Description",
    },
    ...
}
```

Then add at least one entry to `self.statements` that maps to the new field, and a
matching list in `self.roadmaps`.

### Adjusting Scoring Weights

Change a statement's `weight` in `self.statements` (1–2 recommended):

```python
{"id": 0, "text": "...", "field": "data_science", "weight": 2},  # raise/lower weight
```

Higher weight = a given rating counts for more toward that field.

## 🎨 Customization

### Colors & Styling

The frontend uses CSS-in-JS styling in the `styles` object. The whole theme is
defined in one place:

```javascript
// In frontend/src/styles.js
const theme = {
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  // Change gradient
  accent: '#667eea',
  // ...
}
```

### Quiz Statements

Edit the statement text and field mapping in `quiz_backend.py`:

```python
# In ExpertSystem.__init__
self.statements = [
    {"id": 0, "text": "Your custom statement.", "field": "data_science", "weight": 2},
    ...
]
```

## 📊 Understanding Results

The system provides:

1. **Primary Recommendation** - Best match with reasoning
2. **Confidence Score** - 0-100% based on response consistency
3. **Alternative Fields** - Top 2-3 secondary options
4. **Score Breakdown** - Scores for all 6 fields
5. **Learning Roadmap** - Specific steps to follow

### Interpretation

- **High Confidence (75%+)** - Clear field match, pursue with confidence
- **Medium Confidence (50-75%)** - Good match, consider alternatives too
- **Low Confidence (<50%)** - Mixed signals, take alternative fields seriously

## 🧪 Testing

### Test the Backend

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test questions endpoint
curl http://localhost:5000/api/quiz-questions

# Test analysis
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"name": "Kenn", "responses": [4, 4, 1, 1, 3, "N/O", 4, 2, 4, 3]}'
```

### Test the Frontend

1. Ensure backend is running on port 5000
2. Start React dev server
3. Complete quiz with various answer combinations
4. Verify recommendations appear correctly

## 🚢 Deployment

### Deploy Backend (Heroku Example)

```bash
# Create Procfile
echo "web: gunicorn quiz_backend:app" > Procfile

# Create requirements.txt (if not exists)
pip freeze > requirements.txt

# Deploy
heroku create
git push heroku main
```

### Deploy Frontend (Vercel Example)

```bash
cd frontend
npm install -g vercel
vercel
```

Set `VITE_API_BASE` to the deployed backend URL so `src/api.js` targets it.

## 🐛 Troubleshooting

**Frontend shows "Connection Error"**
- Ensure backend is running: `python quiz_backend.py`
- Check CORS is enabled (Flask-CORS installed)
- In dev, confirm the Vite proxy target in `frontend/vite.config.js` matches the backend port
- In a build, confirm `VITE_API_BASE` points at the deployed backend

**Backend crashes on startup**
- Install missing dependencies: `pip install -r requirements.txt`
- Check Python version (3.8+)
- Ensure port 5000 is available

**Recommendations seem incorrect**
- Verify ratings are sent as integers 1–4 (or `"N/O"`), not strings like `"3"`
- Check `/api/quiz-questions` returns all 10 statements
- Review statement-to-field mappings and weights in `self.statements`

## 📚 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Expert Systems Basics](https://en.wikipedia.org/wiki/Expert_system)
- [Rule-Based Systems](https://en.wikipedia.org/wiki/Production_system)

## 📄 License

MIT License - Feel free to modify and use this project.

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Add more career fields
- Improve scoring algorithm
- Add database persistence
- Mobile app version
- Analytics tracking
- Multi-language support

## 📧 Support

For issues or questions, create an issue or contact the development team.

---

**Happy learning! 🚀**
