# Tender Compliance Validator

An AI-powered tool for procurement teams to upload RFP documents and vendor proposals, automatically extract compliance requirements, validate each vendor against them, detect contract risks, and view results in an interactive dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python 3.11 + FastAPI |
| LLM | Gemini 2.5 Flash via Vertex AI |
| Embeddings | all-MiniLM-L6-v2 (local) |
| Vector Search | FAISS |
| Database | Supabase (PostgreSQL) |
| PDF Parsing | PyMuPDF |
| Streaming | Server-Sent Events via sse-starlette |
| Auth | gcloud Application Default Credentials |

---

## Project Structure

```
tender-compliance-validator/
├── backend/
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── routers/
│       │   ├── sessions.py
│       │   ├── documents.py
│       │   ├── pipeline.py
│       │   ├── requirements.py
│       │   └── results.py
│       ├── services/
│       │   ├── llm_client.py
│       │   ├── pdf_extractor.py
│       │   ├── chunker.py
│       │   ├── requirement_extractor.py
│       │   ├── embedder.py
│       │   ├── validator.py
│       │   └── risk_detector.py
│       ├── models/
│       │   ├── types.py
│       │   └── schemas.py
│       └── utils/
│           └── sse.py
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api/
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       ├── pages/
│       └── utils/
└── supabase/
    └── migrations/
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema below applied
- A Google Cloud project with Vertex AI enabled
- `gcloud` CLI authenticated (`gcloud auth application-default login`)

---

## Database Schema

Run the migration in `supabase/migrations/001_initial_schema.sql` against your Supabase project. It creates four tables:

- `tender_sessions` — one row per upload session
- `requirements` — one row per extracted requirement per session
- `vendor_results` — compliance scores and per-requirement results per vendor
- `risk_reports` — risk flags and tone scores per vendor

---

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

**.env.example**

```
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_name
GOOGLE_CLOUD_LOCATION=us-central1
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=50
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Health check: `GET /api/health`.

---

## Frontend Setup

```bash
cd frontend
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

**.env.example**

```
VITE_API_BASE_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Application Flow

1. **Upload** — Enter a session name, drop in the RFP PDF and one or more vendor proposal PDFs, and click Start Analysis. Returning users can re-enter a session name to resume from where they left off.

2. **Analyse RFP** — The backend extracts text with PyMuPDF, chunks it into ~500-word segments, runs Gemini concurrently across all chunks to extract compliance requirements, then deduplicates them in a second Gemini pass. Progress streams live to the frontend via SSE.

3. **Review Requirements** — The extracted requirements appear in an editable table. You can edit text, change the category, adjust the page number, add rows, delete rows, and check or uncheck which requirements proceed to validation.

4. **Validate** — The backend embeds each vendor proposal with `all-MiniLM-L6-v2`, builds a FAISS index per vendor, retrieves the top matching chunks per requirement, and uses Gemini to assign Met / Partial / Missing status with a confidence score. Vendor progress streams live via SSE.

5. **Dashboard** — Vendor summary cards show compliance scores, tone ratings, and risk levels. A requirement mapping table lets you click any cell to open a deep dive with the matched excerpt, reasoning, and confidence breakdown. Risk reports show flagged contract clauses sorted by severity.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sessions` | Create a new session |
| GET | `/api/sessions/{id}` | Get session status |
| GET | `/api/sessions/by-name/{name}` | Look up session by name |
| POST | `/api/sessions/{id}/upload-rfp` | Upload the RFP PDF |
| POST | `/api/sessions/{id}/upload-vendors` | Upload vendor PDFs |
| GET | `/api/sessions/{id}/stream/rfp` | SSE — run RFP extraction pipeline |
| GET | `/api/sessions/{id}/stream/validate` | SSE — run validation and risk pipeline |
| GET | `/api/sessions/{id}/requirements` | Fetch all requirements |
| PATCH | `/api/sessions/{id}/requirements/{req_id}` | Update a requirement |
| POST | `/api/sessions/{id}/requirements` | Add a requirement |
| DELETE | `/api/sessions/{id}/requirements/{req_id}` | Delete a requirement |
| GET | `/api/sessions/{id}/results` | Fetch vendor results |
| GET | `/api/sessions/{id}/risks` | Fetch risk reports |

---

## Requirements Categories

Requirements are classified into four categories:

- **Legal** — certifications, compliance obligations, data regulations
- **Technical** — system capabilities, uptime, integrations
- **Financial** — pricing structure, payment terms, cost constraints
- **Operational** — delivery timelines, staffing, support levels

---

## Compliance Statuses

| Status | Meaning |
|---|---|
| Met | Directly and specifically addressed with clear evidence |
| Partial | Mentioned or implied but lacks specificity or a firm commitment |
| Missing | No relevant content found in the vendor proposal |

---

## Environment Notes

- Uploaded PDFs are stored temporarily under `uploads/{session_id}/` on the backend server. This directory is gitignored.
- The Gemini client uses a concurrency semaphore (max 5 simultaneous calls) to avoid rate limit errors.
- The sentence transformer model (`all-MiniLM-L6-v2`) is loaded once at module level on first request. Expect a short warm-up delay.
- SSE streams close automatically when the pipeline emits a `✅ Done` or `✅ All vendors` event. If the stream drops, the frontend falls back to polling the session status endpoint every 5 seconds.