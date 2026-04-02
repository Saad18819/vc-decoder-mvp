# VC Term Sheet Decoder (MVP)

Legal-tech **MVP** for founders: paste VC term-sheet language (liquidation preference, anti-dilution, etc.) and get a **risk index (0–100)**, plain-English **verdicts**, **negotiation tips**, and **pattern‑based flags** (e.g. participating preferred, 2x/3x, full ratchet).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · **Gemini** or **OpenAI** (optional) + heuristics.

---

## Features

- **Clause analyzer** — Large textarea + `/api/analyze` server route
- **Risk gauge** — Semi-circle SVG + progress bar
- **Snapshot** — Plain-English verdict (green / amber / red bands) + copy-to-clipboard
- **Heuristic rules** — Non-participating vs participating, 1x vs 2x/3x, full ratchet, merged with AI when configured
- **Auth UI (demo)** — Login / Sign up + session in `localStorage` + profile avatar (initial)
- **AI providers** — Gemini first (`GEMINI_API_KEY`), then OpenAI (`OPENAI_API_KEY`), else heuristics only

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If port **3000** is busy or you see stale errors:

```bash
npm run dev:clean
```

---

## Environment variables

Copy `.env.example` to **`.env.local`** (recommended) or `.env`.

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini — used **first** if set ([AI Studio](https://aistudio.google.com/apikey)) |
| `GEMINI_MODEL` | Optional; default `gemini-2.0-flash` |
| `OPENAI_API_KEY` | OpenAI — used if Gemini is not configured |
| `OPENAI_MODEL` | Optional; default `gpt-4o-mini` |

Never commit real keys. `.env` and `.env*.local` are gitignored.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run dev:clean` | Clear `.next`, free ports 3000–3005, dev on **3000** |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

---

## Project structure (high level)

```
src/
  app/
    api/analyze/route.ts   # POST JSON → AnalysisResult
    login/ signup/ profile/
    page.tsx               # Decoder home
  components/
    term-sheet-decoder.tsx
    risk-gauge.tsx
    site-header-nav.tsx
    ui/                    # shadcn components
  lib/
    analyzer.ts            # Heuristics + Gemini + OpenAI
    auth-session.ts        # Client session helpers
```

---

## Deploy

Works on [Vercel](https://vercel.com): set `GEMINI_API_KEY` or `OPENAI_API_KEY` in project **Environment Variables**.

---

## License

MIT

---

## Author

[Saad18819](https://github.com/Saad18819) — [vc-decoder-mvp](https://github.com/Saad18819/vc-decoder-mvp)
