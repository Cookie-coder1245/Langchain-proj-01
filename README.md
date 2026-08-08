# Viva — AI Technical Interviewer

FastAPI + LangChain + Gemini backend, React + Vite + Tailwind frontend.
Chalkboard, oral-exam themed UI.

```
Interview Setup -> Generate Question -> Write Answer -> AI Evaluation -> Results -> Try Another
```

## Project structure

```
viva/
├── backend/
│   ├── main.py            # FastAPI app, LangChain chains, Gemini calls
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/interviewApi.js
│   │   ├── components/    # Navbar, InterviewSetup, QuestionCard, AnswerEditor,
│   │   │                  # EvaluationResult, ScoreCard, ScoreGauge, Strengths,
│   │   │                  # Weaknesses, LoadingState, ErrorMessage
│   │   ├── pages/InterviewPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env               # VITE_API_URL
├── BACKEND_FIXES.txt
└── README.md
```

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and put your real key in:

```
GOOGLE_API_KEY=your_gemini_api_key_here
```

Get a key at https://aistudio.google.com/apikey — and if you ever paste a
key into code or a file you share, rotate it immediately afterward.

Run it:

```bash
uvicorn main:app --reload
```

Backend runs at **http://127.0.0.1:8000**. Interactive docs at
http://127.0.0.1:8000/docs.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**. It reads the backend URL from
`frontend/.env` (`VITE_API_URL=http://127.0.0.1:8000`) — change this if you
deploy the backend elsewhere.

## 3. Testing the full flow

1. Start the backend (`uvicorn main:app --reload`) and confirm
   http://127.0.0.1:8000/health returns `{"status":"ok"}`.
2. Start the frontend (`npm run dev`) and open http://localhost:5173.
3. Fill in Role / Topic / Difficulty and click **Generate question** —
   you should see "Generating your question…" then the question screen.
   If this fails, check the backend terminal for the real error (an
   invalid/missing `GOOGLE_API_KEY` is the most common cause).
4. Write an answer and click **Submit answer** — you should see
   "Analyzing your answer…" then a score, strengths, weaknesses, and
   feedback.
5. Click **Try another question** to loop with the same setup, or
   **Start over** to reset.

## 4. Final verification checklist

- [ ] Backend installs and runs with `uvicorn main:app --reload`
- [ ] `/health` returns 200
- [ ] Frontend installs and runs with `npm run dev`
- [ ] CORS: no console errors when the frontend calls the backend
- [ ] Generate question works end-to-end with a real Gemini key
- [ ] Evaluate answer works end-to-end
- [ ] Loading states show during both requests, buttons disable
- [ ] A bad/missing API key shows a friendly error, not a stack trace
- [ ] Layout holds up on mobile width (~375px) with no horizontal scroll
- [ ] Tab/keyboard navigation reaches every interactive element with a
      visible focus ring

See `BACKEND_FIXES.txt` for exactly what was wrong with the original
upload and what was built to replace it.
