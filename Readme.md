# Smart Resume Screener

An AI-powered recruitment platform that lets recruiters upload candidate resumes and a job description, extracts structured information from each resume, compares candidates against the job requirements using a hybrid scoring engine, and ranks them with a transparent match score and AI justification.

## Pipeline

```
PDF Resume → PDF.js Text Extraction → LLM Structured Extraction → Hybrid Scoring (40% Skills + 25% Experience + 15% Education + 10% Projects + 10% LLM Semantic) → Candidate Ranking → Shortlisting → AI Justification → Recruiter Dashboard
```

The system uses a hybrid scoring architecture combining deterministic resume analysis with LLM-based semantic matching. Two LLM operations run through a secure Supabase Edge Function:

1. **Resume extraction** — the LLM parses resume text into structured JSON (name, skills, education, experience, projects, certifications).
2. **Semantic matching** — the LLM compares the candidate profile against the job description and returns a 0–100 semantic relevance score plus matching/missing skills, strengths, and a written justification.

When no LLM key is configured, the pipeline gracefully falls back to a deterministic extractor and token-overlap semantic score so the app keeps working.

## Features

- **Recruiter dashboard** with live stats: total candidates, shortlisted, under review, average match score.
- **Job description editor**: title, full description, required skills (with autocomplete from a 90+ skill dictionary), and minimum years of experience.
- **PDF resume upload**: drag-and-drop multiple PDFs, per-file processing status, and error surfacing.
- **Structured extraction**: name, email, phone, skills, education, experience, projects, and certifications pulled from resume text.
- **Hybrid scoring** (not LLM-only): 40% skills, 25% experience, 15% education, 10% projects, 10% semantic — converted to a 1–10 score.
- **Candidate ranking table** sortable by score, filterable by Shortlist / Review / Reject, with a name/skill search box.
- **Candidate details page**: large score ring, progress bars for every match dimension, matching & missing skill tags, AI strengths, and a written justification.
- **Sample data** pre-seeded so the dashboard is populated on first load.
- **Error handling** for invalid PDFs, empty resumes, parsing failures, and missing job descriptions.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| PDF parsing | pdfjs-dist (client-side text extraction) |
| Backend / database | Supabase (Postgres + Row Level Security) |
| LLM inference | Supabase Edge Function → OpenAI API (gpt-4o-mini) |
| Scoring engine | Custom hybrid scorer (see below) |

## Architecture

```
src/
├── components/      # Reusable UI: Sidebar, StatCard, ScoreBadge, SkillTag, ProgressBar, StatusBadge, Toasts
├── pages/          # Dashboard, JobDescription, ResumeUpload, CandidateRanking, CandidateDetails
├── store/          # AppContext — global state, Supabase sync, upload orchestration
└── lib/
    ├── types.ts        # Shared TypeScript interfaces
    ├── supabase.ts     # Supabase client singleton
    ├── skills.ts       # 90+ skill dictionary + canonicalization
    ├── pdf.ts          # PDF → text extraction (pdfjs-dist)
    ├── extractor.ts    # Deterministic text → structured resume (fallback)
    ├── scorer.ts       # Hybrid scoring engine (accepts LLM override)
    ├── llm.ts         # Edge Function client (extract + semantic match)
    ├── data.ts         # Supabase data access + resume processing pipeline
    └── sampleData.ts   # Seed job + 5 sample candidates
```

### Data flow

1. The recruiter saves a job description (stored in the `jobs` table).
2. On resume upload, a `candidates` row is created with `status = processing`.
3. `pdfjs-dist` extracts text from the PDF in the browser.
4. The resume text is sent to the **`resume-screener` Edge Function** which calls the LLM to extract structured JSON (name, skills, education, experience, projects, certifications). If the LLM is unavailable, a deterministic rule-based extractor is used.
5. The structured profile + job are sent back to the Edge Function for **LLM semantic matching**, returning a 0–100 semantic score, matching/missing skills, strengths, and a justification.
6. `scoreCandidate` runs the hybrid scoring engine, using the LLM semantic score for the 10% semantic weight and LLM-provided qualitative fields when available.
7. The candidate row is updated with scores, matching/missing skills, strengths, justification, and `status = ready`.
8. The dashboard and ranking table read from Supabase and stay in sync via the `AppContext` store.

## Scoring Methodology

The final score is a weighted blend of five dimensions, then scaled to 1–10:

| Dimension | Weight | Source |
| --- | --- | --- |
| Technical Skill Match | 40% | % of required skills found in the resume (dictionary-normalized) |
| Experience Match | 25% | Estimated years vs. the job's minimum |
| Education Match | 15% | Degree level detected (advanced / bachelor / other) |
| Project Match | 10% | Jaccard similarity between project technologies and required skills |
| LLM Semantic Match | 10% | LLM (OpenAI) semantic relevance score 0–100 (falls back to token overlap if no key) |

**Example:** Skills 92% · Experience 80% · Education 100% · Projects 85% · Semantic 90%
→ Final = 0.4·92 + 0.25·80 + 0.15·100 + 0.1·85 + 0.1·90 = 89.3% → **8.93 / 10**

Recommendation thresholds: **≥ 75%** Shortlist · **50–74%** Review · **< 50%** Reject.

## LLM Integration

Two LLM operations run through a single Supabase Edge Function (`resume-screener`) so the OpenAI API key never touches the browser:

```
React → Supabase Edge Function → OpenAI API → Structured JSON → React/Supabase
```

### 1. Resume extraction (`action: "extract"`)

The edge function sends the resume text to the LLM with a system prompt that returns structured JSON:

```json
{ "name": "", "email": "", "phone": "", "skills": [], "education": [], "experience": [], "projects": [], "certifications": [] }
```

If the LLM is unavailable, the deterministic rule-based extractor (`extractor.ts`) is used instead.

### 2. Semantic matching (`action: "match"`)

The edge function sends the structured candidate profile + job description to the LLM and receives:

```json
{
  "semanticScore": 87,
  "matchingSkills": [],
  "missingSkills": [],
  "strengths": [],
  "experienceMatch": "",
  "educationMatch": "",
  "recommendation": "SHORTLIST",
  "justification": ""
}
```

The `semanticScore` (0–100) feeds the 10% LLM Semantic Match weight in the hybrid scorer. The LLM's matching/missing skills, strengths, and justification override the deterministic versions when present.

### LLM prompts

**Extraction prompt:**
> You are an AI resume parser. Extract structured information from the resume text. Return ONLY valid JSON with the exact shape: name, email, phone, skills, education, experience, projects, certifications.

**Matching prompt:**
> You are an AI recruitment assistant. Compare the candidate profile with the job description. Evaluate technical skills, relevant experience, education, projects, and semantic relevance. Return ONLY valid JSON: semanticScore (0-100), matchingSkills, missingSkills, strengths, experienceMatch, educationMatch, recommendation, justification.

### Configuring the LLM key

Add an `OPENAI_API_KEY` secret in Supabase → Edge Functions → Secrets. Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`). Until a key is added, the app uses the deterministic fallback and stays fully functional.

## Database Structure

Two tables in Supabase (Postgres), both with Row Level Security enabled:

- **`jobs`** — `id`, `title`, `description`, `required_skills` (text[]), `min_experience_years`, `created_at`
- **`candidates`** — `id`, `job_id` (FK → jobs), `name`, `email`, `phone`, `file_name`, `raw_text`, `skills`, `education` (jsonb), `experience` (jsonb), `projects` (jsonb), `certifications`, `match_score` (numeric 3,2), five `*_match_pct` columns, `matching_skills`, `missing_skills`, `strengths`, `experience_match_text`, `education_match_text`, `recommendation`, `justification`, `status`, `error_message`, `created_at`

This is a single-tenant tool with no sign-in screen, so policies grant `anon, authenticated` CRUD. See `src/lib/data.ts` for the access layer.

## Setup

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run typecheck # tsc --noEmit
```

Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are pre-populated in `.env`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key (read/write via RLS) |

Never commit a service-role key or an LLM API key to the frontend. LLM keys belong in Supabase Edge Function secrets.

## Security

- API keys live in environment variables, never hardcoded.
- The anon key is safe for the frontend because RLS policies gate every query.
- Uploads are validated client-side and restricted to PDF files.
- `.env` files are gitignored.
