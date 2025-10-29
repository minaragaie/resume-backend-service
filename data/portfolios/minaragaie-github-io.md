# 🧭 Portfolio Site (minaragaie.github.io)

## Overview

A cost‑efficient, production‑ready portfolio and resume site featuring a VS Code‑inspired UX, dynamic projects, and private‑repo portfolios — all without a traditional database. Content is sourced directly from GitHub using serverless functions, enabling zero infra cost and frictionless deployments.

- Live: https://minaragaie.github.io/
- Frontend Repo: https://github.com/minaragaie/minaragaie.github.io
- Backend (Serverless) Repo: https://github.com/minaragaie/resume-backend-service

---

## Why No Database?

To be financially lean, we store canonical content in GitHub and read it at runtime/build time:

- resume.json (source of truth for projects/experience)
- portfolio markdown files (one per project)
- GitHub API used for both public and private access via Octokit

Benefits:
- Zero DB cost and maintenance
- Versioned content with history + PR reviews
- Works perfectly in serverless

---

## Architecture

### Frontend (GitHub Pages)
- Next.js 15 (App Router) with `output: export` for static export
- Deployed via `gh-pages` to `gh-pages` branch
- Themeable VS Code‑like UI: activity bar, explorer sidebar, draggable tabs
- Smooth sidebar/drawer transitions that push content responsively
- Projects section and sidebar are driven by backend data (no hardcoded fallbacks)

### Backend (Vercel Serverless)
- Single endpoint family: `/api/admin?type=...`
- Reads from GitHub (not local FS) using `@octokit/rest`
- Endpoints:
  - `type=resume` → serves resume.json
  - `type=portfolio&slug=...` → serves portfolio markdown for private repos
  - `type=github-activity` → unified GitHub data for repos/stats/languages
- `github-storage.js` abstracts GitHub reads (`readResumeData`, `getFileContent`)

### Private Repos Handling
- Projects can set `isPrivateRepo: true`
- Frontend requests `/api/admin?type=portfolio&slug=...`
- Backend fetches `data/portfolios/<file>.md` from the repo via Octokit and returns content
- UI displays a "Private Repository" badge and lock icons for related repos

---

## Admin Without DB

- Admin content (resume and portfolio markdown) is edited through Git commits/PRs
- Serverless functions read directly from the repo; no migrations, no ORM
- On GitHub Pages builds, an alternate `/admin` placeholder is used (no server)
- In full environments (local/Vercel), admin endpoints are live

---

## GitHub Activity Page (/github)

- Uses backend `type=github-activity` endpoint
- Responsive layout for mobile (stacked header, grid breakpoints, full‑width buttons)
- Repos that map to portfolio projects show a "View Project" CTA

---

## Deployment

- Backend: Vercel auto-deploy on push to main
- Frontend: `npm run build:github` + `gh-pages` publishes static `out/` to `gh-pages`
- CI exports `NEXT_PUBLIC_API_BASE_URL` so the static frontend calls the stable backend alias
- Step ensures `.txt` artifacts (Next internal) are removed before publish

---

## Notable Engineering Details

- Sidebar tree uses live backend data for projects; shows empty state gracefully
- Smooth content push with unified transition classes
- Markdown links enhanced with theme-aware colors and context icons (external, anchor, email, GitHub)
- Custom 404 with VS Code‑like UI and navigation buttons
- Project metadata shows private indicators for main and related repos

---

## Tech Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons
- Vercel Serverless, `@octokit/rest` (GitHub API), GitHub Pages

---

## Results

- Single source of truth (GitHub) for portfolio content
- Zero database cost, fully auditable content changes
- Fast static frontend on GitHub Pages + flexible serverless backend on Vercel
