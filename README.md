SIH Delhi-NCR Air Quality Intelligence Platform

A full‑stack project providing real-time and historical insights on air quality and pollution source contributions across Delhi‑NCR. The frontend is a modern React + Vite app with rich dashboards and scenario modeling; the backend is a FastAPI service that fuses CPCB pollutant signals with NASA FIRMS fire data to estimate source breakdowns.


Key Features

- Interactive dashboards for AQI status, source breakdowns, and trends
- Live and historical views with exportable tables and charts
- Scenario modeling (e.g., wind factor and stubble reduction) with Sankey flow visualization
- Live backend endpoint that computes source contributions using pollutant heuristics and FIRMS hotspots
- Accessible UI with tooltips, toasts, and responsive layout


Architecture Overview

- Frontend (Vite + React + TypeScript, Tailwind, shadcn/ui)
  - Routing: `react-router-dom` with protected routes scaffolded
  - State/Data: `@tanstack/react-query` for async and caching
  - Visualization: `recharts` and `chart.js` wrappers; Leaflet map for AQI locations
  - Components: Modular dashboard widgets in `src/components/dashboard/*`
  - Data: Uses `src/data/airQualityData.ts` as seed/historical data and calls the backend via hooks
  - Hooks:
    - `use-backend-source-impact.ts` fetches `GET /api/source-breakdown`
    - `use-live-source-impact.ts` pulls WAQI API (tokened) and estimates sources heuristically
    - `use-aqi-simulation.ts`, `use-source-shift.ts` power UI interactions/simulations

- Backend (FastAPI)
  - Endpoint: `GET /api/source-breakdown` (CORS enabled)
  - Data providers (mocked for dev):
    - `services/fetch_cpcb.py` returns pollutant levels (pm25, pm10, no2, so2)
    - `services/fetch_firms.py` returns FIRMS fire hotspot count
  - Processor: `services/source_processor.py` computes stubble/traffic/industrial/other to 100%
  - API docs: Swagger at `/docs`


Directory Structure (excerpt)

```
backend/
  main.py                     # FastAPI app + /api/source-breakdown
  services/
    fetch_cpcb.py             # CPCB mock fetch
    fetch_firms.py            # FIRMS mock fetch
    source_processor.py       # Source breakdown rules
  requirements.txt

src/
  main.tsx                    # App bootstrap
  App.tsx                     # Routes and providers
  pages/
    Index.tsx                 # Dashboard overview
    SourceBreakdown.tsx       # Detailed source analysis + scenarios
    PolicyDashboard.tsx       # Policy-oriented view
    Forecast.tsx, Reports.tsx, Settings.tsx, NotFound.tsx
  hooks/
    use-backend-source-impact.ts
    use-live-source-impact.ts
    use-aqi-simulation.ts
    use-source-shift.ts
  components/
    dashboard/*               # Charts, cards, map, tables
    layout/*                  # Sidebar + layout
    ui/*                      # shadcn/ui primitives
```


Prerequisites

- Node.js 18+ and npm
- Python 3.12+ (Conda optional)


Setup – Frontend

1) Install dependencies
```bash
npm install
```

2) Environment variables (optional, for WAQI live estimator in `use-live-source-impact.ts`)
```bash
echo "VITE_AQI_TOKEN=your_waqi_token" > .env
```

3) Start the dev server (Vite on port 8080)
```bash
npm run dev
```

4) Build and preview
```bash
npm run build
npm run preview
```


Setup – Backend

Option A: Conda (recommended for isolation)
```bash
conda create -n air python=3.12
conda activate air
cd backend
pip install -r requirements.txt
```

Option B: venv
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Environment variables
```bash
# backend/.env
MAP_KEY=your_nasa_firms_api_key_here
```

Run the backend (port 8000)
```bash
cd backend
python main.py
# or
./start.sh
```

API

- Swagger UI: `http://localhost:8000/docs`
- Source breakdown: `GET http://localhost:8000/api/source-breakdown`

Response (example)
```json
{
  "timestamp": null,
  "zone": "Delhi Central",
  "sources": { "stubble": 18.0, "traffic": 40.0, "industrial": 20.0, "other": 22.0 },
  "previous": { "stubble": 13.0, "traffic": 35.0, "industrial": 20.0, "other": 32.0 }
}
```


Frontend–Backend Integration

- The hook `src/hooks/use-backend-source-impact.ts` targets `http://localhost:8000` by default and consumes `/api/source-breakdown`.
- The `SourceBreakdown` page automatically prefers live backend data and falls back to historical seed data.
- For WAQI-based live estimation, set `VITE_AQI_TOKEN` and use `use-live-source-impact.ts`.


Development Notes

- CORS is enabled for all origins in the backend for local development.
- CPCB and FIRMS integrations are mocked; replace with real API requests for production.
- The breakdown logic normalizes to 100% and provides a previous-day comparison sample.
- Vite dev server runs on port 8080; backend runs on port 8000.


Scripts

Frontend
```bash
npm run dev        # start Vite dev server
npm run build      # production build to dist/
npm run preview    # preview built app
npm run lint       # run eslint
```

Backend
```bash
python backend/main.py      # run FastAPI with uvicorn reload
./backend/start.sh          # convenience script
```


Contributing

1. Create a feature branch
2. Keep edits focused and linted (TypeScript + ESLint)
3. Open a PR describing the change and testing steps


License

Proprietary/Project‑specific. Update if you intend to open-source.

