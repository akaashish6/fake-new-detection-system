# TruthLens — AI-Powered Fake News Detection System 🔍

A web application designed to detect fake news, viral rumors, sensationalist posts, and misleading claims using **Python Flask**, **React (Vite)**, **Google Gemini 2.5 Flash API**, and **SQLite**.

---

## 🌟 Key Features

1. **Multi-Input Verification**:
   - **Text Claim**: Paste raw text, viral WhatsApp forwards, tweets, or rumors.
   - **News Link / URL**: Paste article link for automatic extraction and fact-checking.
   - **Screenshot Upload**: Drag & drop screenshots of social posts or news clippings (analyzed using Gemini 2.5 Flash native vision capabilities).
2. **Hindi & Hinglish Support**:
   - Automatically detects Hindi script (\u0900-\u097F) or Romanized Hinglish phrasing.
   - Tailors Gemini's reasoning to account for South Asian viral trends, WhatsApp forwards, and local context.
3. **Structured Verdict Report Card**:
   - Color-coded Verdict Badges (**Real**, **Fake**, **Misleading**, **Unverifiable**).
   - Animated SVG **Confidence Meter Gauge** (0-100%).
   - Clear, objective **AI Fact Check Reasoning**.
   - Flagged **Manipulation & Psychological Techniques** (e.g. *Emotional Language*, *False Urgency*, *Fabricated Quote*, *Out of Context*).
   - **Verification Sources** with direct links and domain pills retrieved via Google Search Grounding.
4. **Scan History**:
   - Stored persistently in SQLite (`scans.db`).
   - Filter by verdict or search by keyword.
   - Scan detail view modal & clear history options.
5. **Modern Glassmorphism UI**:
   - Clean dark-slate glass theme, responsive layout, drag-and-drop uploader, and celebratory confetti effects for verified real claims.

---

## 🚀 Project Structure

```
fake new detection system/
├── app.py                     # Flask REST API & static file server
├── gemini_service.py          # Gemini 2.5 Flash API client, grounding & multimodal logic
├── database.py                # SQLite database manager
├── requirements.txt           # Python dependencies
├── .env                       # Environment configuration (GEMINI_API_KEY)
├── .env.example               # Template for environment configuration
└── frontend/                  # React (Vite) Frontend App
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── index.css
        └── components/
            ├── Header.jsx
            ├── InputForm.jsx
            ├── LoadingCard.jsx
            ├── ReportCard.jsx
            └── HistoryView.jsx
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### 2. Configure Gemini API Key
Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
Open `.env` (or copy `.env.example` to `.env`) and add your key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
```

### 3. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 4. Build / Install Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## 🏃 Running the Application

### Option A: Single Command Run (Flask serves built React app)
```bash
python app.py
```
Open [http://localhost:5000](http://localhost:5000) in your web browser.

### Option B: Development Mode (Hot Reloading)
1. **Start Backend Server**:
   ```bash
   python app.py
   ```
2. **Start React Dev Server** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
Open [http://localhost:5173](http://localhost:5173) in your web browser.
