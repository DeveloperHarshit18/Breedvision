# 🐄 BreedVision — AI-Powered Cattle & Buffalo Breed Recognition

BreedVision is a full-stack web application that lets you upload a photo of any
cow or buffalo and instantly identifies its breed using AI, complete with production
stats, origin, and physical characteristics.

---

## 📁 Project Structure

```
breedvision/
├── frontend/                      # React.js SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js / .css
│   │   │   ├── UploadZone.js / .css   ← drag-and-drop image upload
│   │   │   ├── ConfidenceBar.js / .css
│   │   │   ├── BreedCard.js / .css    ← breed detail display
│   │   │   └── LoadingSpinner.js / .css
│   │   ├── pages/
│   │   │   ├── HomePage.js / .css     ← upload interface
│   │   │   ├── ResultPage.js / .css   ← prediction results
│   │   │   └── HistoryPage.js / .css  ← dashboard
│   │   ├── services/
│   │   │   └── api.js                 ← all HTTP calls in one place
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend/                       # Flask REST API
│   ├── app.py                     ← application factory
│   ├── routes/
│   │   ├── predict.py             ← POST /api/predict
│   │   ├── history.py             ← GET/DELETE /api/history
│   │   └── breeds.py              ← GET /api/breeds
│   ├── ml/
│   │   └── predictor.py           ← ML prediction (swap in real model here)
│   ├── utils/
│   │   ├── validators.py
│   │   └── logger.py
│   ├── .env.example
│   └── requirements.txt
│
├── database/
│   └── seed.py                    ← populates MongoDB with sample breed data
│
└── README.md
```

---

## 🧠 How ML Prediction Works

`backend/ml/predictor.py` exposes one public function:

```python
predict_breed(image_path: str) -> {"breed": str, "confidence": float}
```

**Three backend options — just uncomment the one you want:**

| Mode | How to enable | Notes |
|------|--------------|-------|
| **Mock** (default) | Works out-of-the-box | Seeds result from file size; great for dev/demo |
| **Roboflow API** | Set `USE_ROBOFLOW=true` + `ROBOFLOW_API_KEY` in `.env` | Requires a trained Roboflow project |
| **Custom model** | Fill in `_predict_with_custom_model()` | TFLite / ONNX / PyTorch |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Python | 3.9+ |
| MongoDB | 6+ (running locally, or MongoDB Atlas URI) |
| npm | 9+ |

---

### Step 1 — Clone / download the project

```bash
# If you have the zip, extract it, then:
cd breedvision
```

---

### Step 2 — Backend setup

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install Python packages
pip install -r requirements.txt

# 3. Create your .env file
cp .env.example .env
# Edit .env if you need a different MongoDB URI

# 4. Start the Flask server
python app.py
# → Running on http://localhost:5000
```

---

### Step 3 — Seed the database

```bash
# In a new terminal (venv still active):
cd database
python seed.py
# → Inserted 6 breeds into breedvision.breeds ✅
```

---

### Step 4 — Frontend setup

```bash
cd frontend

# 1. Install Node packages
npm install

# 2. Start the React dev server
npm start
# → Running on http://localhost:3000
```

Open **http://localhost:3000** in your browser. The React proxy will forward
all `/api/*` requests to Flask on port 5000.

---

## 🔌 API Reference

### `POST /api/predict`
Upload an image and receive a breed prediction.

**Request** — `multipart/form-data`
```
image: <file>   (jpg / png / webp, max 10 MB)
```

**Response 200**
```json
{
  "breed": "Gir",
  "confidence": 0.92,
  "details": {
    "origin": "Gujarat, India",
    "milk": "15–20 L/day",
    "features": "Distinctive domed forehead, long pendulous ears…",
    "purpose": "Dairy",
    "weight_kg": "400–475 (cow) / 550–650 (bull)"
  }
}
```

---

### `GET /api/history?page=1&limit=10`
Returns paginated prediction history.

### `DELETE /api/history/<id>`
Deletes one history record.

### `DELETE /api/history`
Clears all history.

### `GET /api/breeds`
Returns all breeds in the catalogue.

### `GET /api/breeds/<name>`
Returns a single breed by name (case-insensitive).

---

## 🌐 Production Deployment

### Backend (e.g. Render / Railway)

```bash
# Use gunicorn instead of the Flask dev server
gunicorn "app:create_app()" --bind 0.0.0.0:5000 --workers 2
```

Set the following environment variables in your host:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/breedvision
USE_ROBOFLOW=false   # or true + ROBOFLOW_API_KEY
```

### Frontend (e.g. Vercel / Netlify)

```bash
cd frontend
npm run build
# Upload the /build folder, or let Vercel auto-detect Create React App.
```

Set `REACT_APP_API_URL=https://your-backend-url.com` in Vercel environment
variables so the frontend knows where to send requests.

---

## 🐄 Breed Database

The seed script adds these breeds by default:

| Breed | Origin | Milk / Day | Purpose |
|-------|--------|-----------|---------|
| **Gir** | Gujarat, India | 15–20 L | Dairy |
| **Sahiwal** | Punjab, India/Pakistan | 10–16 L | Dual |
| **Murrah** | Haryana, India | 20–30 L | Buffalo Dairy |
| **Holstein Friesian** | Netherlands | 25–40 L | Dairy |
| **Ongole** | Andhra Pradesh, India | 5–8 L | Dual |
| **Tharparkar** | Rajasthan, India | 8–12 L | Dual |

Add more breeds by editing `database/seed.py` and re-running it.

---

## 🛠 Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoServerError: connect ECONNREFUSED` | Start MongoDB: `sudo systemctl start mongod` or use Atlas |
| `CORS error in browser` | Make sure Flask is running on port 5000 with CORS enabled |
| `Module not found` in React | Run `npm install` inside `frontend/` |
| Backend returns 503 | Check `backend/ml/predictor.py` for errors |
| Empty history page | Seed the DB and make at least one prediction first |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/real-model`
3. Commit and push
4. Open a Pull Request

---

## 📜 License

MIT — free to use, modify, and distribute.
