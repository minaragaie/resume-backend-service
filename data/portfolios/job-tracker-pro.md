# 💼 JobTracker Pro — Smart Job Application Manager

## Full-Stack Web Application | Portfolio Project

---

## 🎯 Project Overview

**JobTracker Pro** is a modern, full‑stack job application tracker built with Next.js (App Router), Prisma + PostgreSQL, and a companion Chrome extension. It helps candidates capture job details from LinkedIn and Indeed, organize applications, upload resumes, and automatically extract Target Roles and Key Skills using OpenResume AI — all wrapped in a cohesive UI using shadcn/ui.

**GitHub:** https://github.com/minaragaie/job-tracker-frontend  
**Status:** Active Development  
**Team Size:** Solo Developer

---

## ✨ Highlights

- **Authentication with Middleware**: Secure routes using Next.js Middleware; unauthenticated users are redirected to `login`/`register`.
- **Database‑backed Auth**: Prisma + PostgreSQL with `bcryptjs` for password hashing.
- **Chrome Extension**: One‑click import from LinkedIn and Indeed with robust DOM parsing and fallbacks.
- **AI‑Assisted Resume Parsing**: PDF upload → OpenResume AI → extract and review Target Roles + Key Skills before saving.
- **Job Type: Multi‑select**: Store multiple job types (e.g., "Full‑time, Contract").
- **Clean UX**: shadcn/ui components, conditional sidebar layout, and mobile‑friendly navigation.

---

## 🧭 What this app does

- **Track job applications** with fields like company, role, location, salary, work mode, company size, job types, remote policy, and tech stack.
- **Import job data from job boards** using the Chrome extension. It scrapes titles, companies, locations, job types (supports multiple), and tech stack, with resilient fallbacks.
- **Upload and parse resumes (PDF)** and auto‑suggest Target Roles and Key Skills. Users confirm/adjust in a modal before saving.
- **Persist data** in PostgreSQL via Prisma models.
- **Route protection** using Next.js Middleware. Auth pages (`/login`, `/register`) are public; everything else is guarded.

---

## 🧩 Architecture Overview

- **Frontend**: Next.js 15 (App Router), React, shadcn/ui
- **Auth**: API routes (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`) with Prisma + `bcryptjs`
- **Middleware**: `middleware.ts` handles server‑side redirects for protected routes
- **Database**: Prisma ORM + PostgreSQL
- **Resume Parsing**: Backend integration with OpenResume AI and frontend confirmation flow
- **Extension**: Content scripts for LinkedIn/Indeed and a universal extractor with heuristics and regex fall derecho

---

## 🛠️ Key Features in Code

### Authentication & Authorization
- `app/login/page.tsx` and `app/register/page.tsx`: Simplified client pages; rely on Middleware for redirects; full‑page reload after auth for reliability.
- `middleware.ts`: Skips auth on `/login`, `/register`, API, and Next assets; protects the rest.
- `lib/auth.ts` + `lib/prisma.ts`: Prisma‑backed user store; single PrismaClient instance; `bcryptjs` for password hashing.

### Database & Models
- `prisma/schema.prisma`: `Application.jobType` updated to support multiple values (stored as JSON array string).
- Supports fields for company, role, location, salary, work mode, company size, job types, remote policy, and tech stack.

### Resume Parsing & AI Integration
- `app/api/resumes/route.ts`: PDF → OpenResume AI → extract featured skills and job titles with fallbacks and role suggestions from skills.
- `lib/parse-resume-from-pdf/.../extract-skills.ts`: Skill extraction that filters out noise (company names/titles) and focuses on real tech/design skills.
- `components/resume-selector.tsx`: Upload + AI parse + confirmation modal; user can edit Target Roles/Key Skills before saving.

### Chrome Extension
- `content-script.js`, `content-scripts/indeed.js`, `content-scripts/linkedin.js`: Robust scraping for titles, companies, locations, salary, job types (multi), work mode, company size, and tech stack (expanded to include design/UX tools). Includes a "Test Extraction" button and debug logging.
- Universal extractor with heuristics and regex fallbacks for varied DOM structures.

### Application Management
- `app/applications/new/page.tsx`: Multi‑select job types via badges; maps URL params from extension imports.
- Comprehensive application tracking with all relevant fields and metadata.

### UI/UX
- `components/conditional-layout.tsx`: Client layout decides when to show the sidebar (hidden on auth pages).
- shadcn/ui components throughout for consistent, accessible design.
- Mobile‑friendly navigation and responsive layouts.

---

## 🤖 AI Skills Extraction & Resume Parsing Internals

This project includes a small parsing library to turn raw PDF text into structured resume data and high‑quality skills:

### Extraction Entry Points (per section)
- `lib/parse-resume-from-pdf/extract-resume-from-sections/extract-profile.ts`
- `lib/parse-resume-from-pdf/extract-resume-from-sections/extract-work-experience.ts`
- `lib/parse-resume-from-pdf/extract-resume-from-sections/extract-education.ts`
- `lib/parse-resume-from-pdf/extract-resume-from-sections/extract-project.ts`
- `lib/parse-resume-from-pdf/extract-resume-from-sections/extract-skills.ts`

### Skills Extraction Details
- `extract-skills.ts` filters noise like company names and job titles and keeps only actual technical/design skills. It uses curated keyword sets plus regex rules to validate tokens and normalize output.
- If work experience lacks clear role signals, the system infers Target Roles from the extracted skills.

### Parsing Utilities (`lib/parse-resume-from-pdf/extract-resume-from-sections/lib/`)
- `get-section-lines.ts`: splits the raw text into section‑scoped line groups.
- `subsections.ts`: identifies and normalizes common subsections (e.g., bullets, headings).
- `bullet-points.ts`: handles bullet normalization and prefix cleanup.
- `common-features.ts`: helpers to detect entities like dates, organizations, and titles.
- `feature-scoring-system.ts`: simple scoring to rank likely matches when multiple candidates are found.

These utilities combine with the OpenResume AI output in `app/api/resumes/route.ts` to produce:
- Featured skills and a de‑duplicated Key Skills list
- Candidate Target Roles (from explicit titles or inferred from skills)
- A short profile summary when available

---

## 🧪 Data Resilience

- **Extension extraction fallbacks**: If selectors fail, the extension uses page title, headings, and general text analysis (regex) to infer values.
- **Resume parsing fallbacks**: If work experience is empty, roles are suggested from extracted skills.
- **Full reload post‑auth**: Ensures Cookies/Middleware state is applied consistently after login/register.

---

## 📦 Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 18
- TypeScript
- shadcn/ui
- Tailwind CSS

### Backend
- Next.js API routes
- Next.js Middleware
- Prisma ORM
- PostgreSQL

### Authentication
- `bcryptjs` for password hashing
- Session-based auth with cookies

### AI/Parsing
- OpenResume AI integration
- Custom PDF parsing library

### Extension
Purchase Chrome Extension (content scripts for LinkedIn/Indeed)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally or in the cloud

### Environment
Create a `.env` in the project root:

```env
DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/<DB_NAME>"
# Ensure no unsupported query params (e.g., remove ?schema=public if present)
```

### Install & Dev
```bash
npm install
npm run dev
```
- App runs at `http://localhost:3000`

### Database
```bash
npx prisma migrate dev
npx prisma studio
```

---

## 🧩 Chrome Extension (Import from LinkedIn/Indeed)

1. Go to `chrome://extensions` → Enable Developer Mode
2. Load Unpacked → select the project folder (extension scripts live at the root and in `content-scripts/`)
3. Open a job post on LinkedIn/Indeed and use the extension button to import
4. Optional: Use the "Test Extraction" debug button to validate selectors

The extension extracts:
- Title, Company, Location, Salary
- Tech Stack (includes engineering + design/UX tools)
- Work Mode, Remote Policy, Company Size
- Job Types (supporting multiple values)

---

## 📄 Resume Upload & AI Parsing

- Upload a PDF in the app
- Backend calls OpenResume AI to parse content
- Extracted fields: **Target Roles**, **Key Skills**, and summary; roles suggested from skills if needed
- A confirmation dialog lets users edit before saving

---

## 🔒 Authentication Flow

- Public routes: `/login`, `/register`
- Protected routes: everything else
- Middleware enforces redirects server‑side; successful login triggers a full reload to apply auth state

---

## 📚 Notable Design Choices

- **Server‑side redirects** simplify client pages and avoid spinner loops
- **Heuristic extraction** for job boards handles varied DOM structures
- **Skill noise filtering** avoids company names and job titles in Key Skills
- **Multi‑select job types** reflects real‑world listings

---

## 🗺️ Roadmap Ideas

- OAuth providers (Google/LinkedIn)
- Advanced search/filters for applications
- Interview pipeline and reminders
- Attach multiple resumes per application
- Analytics dashboard (applications by stage, response rates)

---

## 👤 About this project

Built to streamline job hunting by reducing manual copy‑paste, leveraging AI to structure resume data, and offering a smooth, theme‑consistent UX. Ideal for showcasing full‑stack proficiency: modern React patterns, server middleware, database modeling, AI integration, and extension development.

