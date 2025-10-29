# Resume Backend Service

Production-ready backend for powering my resume and portfolio content with API endpoints, private portfolio rendering, and PDF generation.

## Live
- API Base: deployed on Vercel (auto-deploys from `main`)
- Public assets: served from `public/` (e.g. `/screenshots/...`)

## Features
- Admin API to read/update resume data stored in `data/resume.json`
- Private portfolio renderer: serves Markdown from `data/portfolios/*.md`
- PDF generation from HTML template via Headless Chromium
- Email relay API (Microsoft Graph)

## Project Structure
```
api/
  admin.ts                # Consolidated admin API (resume + portfolio)
  admin-auth.ts           # Admin authentication helpers
  generate-pdf.ts         # Generates PDF resume via Puppeteer/Chromium
  send-email.ts           # Contact form email via Microsoft Graph
  auth/callback.ts        # OAuth callback endpoint

data/
  resume.json             # Single source of truth for resume & projects
  portfolios/             # Project portfolio pages (Markdown)
    *.md

public/
  screenshots/            # Publicly served screenshots used in portfolios

templates/
  resume-template.html    # HTML template used for PDF generation

vercel.json               # Vercel functions configuration
```

## Key Endpoints
- GET `/api/admin?type=resume` — fetch resume data
- POST `/api/admin?type=resume` — save resume data (expects JSON body)
- GET `/api/admin?type=portfolio&slug=:slug` — returns Markdown content + metadata for private projects
- POST `/api/generate-pdf` — returns a PDF generated from `templates/resume-template.html`
- POST `/api/send-email` — relays a contact message via Microsoft Graph

## Data Model
- `data/resume.json` contains:
  - `personalInfo`, `experience`, `education`, `certifications`, `skills`
  - `projects[]` — cards shown on the site
    - `portfolioFile` points to a file in `data/portfolios/`
    - `liveUrl`, `githubUrl`, `relatedRepos[]` supported

## Portfolios (Markdown)
- Add a Markdown file under `data/portfolios/`
- Reference it from `data/resume.json` → `projects[].portfolioFile`
- Images should be placed under `public/screenshots/` and linked with absolute paths like `/screenshots/your-image.png`

## Development
Requirements: Node 18+, npm

```bash
# Install
npm install

# Run a local build check (Vercel builds use this)
npm run build

# Lint (optional)
# npm run lint
```

## Deployment (Vercel)
- Push to `main` → Vercel builds and deploys automatically
- Functions are defined under `api/` (Vercel Serverless Functions)
- Static assets are served from `public/`

## Notes
- Headless Chromium provided by `@sparticuz/chromium` for serverless PDF generation
- Sensitive text in screenshots is intentionally blurred or downsampled

## License
Proprietary — All rights reserved
