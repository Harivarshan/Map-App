# London Property Plotter

React + Leaflet frontend backed by an Express + MongoDB API. The map spotlights a high-density Westminster & Soho showcase zone with seeded property examples and falls back to simulated insights elsewhere in London.

## Prerequisites

- Node.js 18 or later
- npm 9 or later

## Getting Started

Install dependencies for both workspaces:

```powershell
npm install --prefix backend
npm install --prefix frontend
```

### Run the development servers

Run each process in a separate terminal:

```powershell
npm run dev --prefix backend
npm run dev --prefix frontend
```

The frontend dev server runs on [http://localhost:5173](http://localhost:5173) and expects the API at [http://localhost:4000](http://localhost:4000). The backend enables CORS, so cross-origin requests work out of the box.

### Seed the showcase zone (MongoDB)

1. Ensure MongoDB is running locally (defaults to `mongodb://localhost:27017`).
2. Duplicate `backend/.env.example` to `backend/.env` and adjust `MONGODB_URI` if needed.
3. Seed the database:

	```powershell
	npm run seed --prefix backend
	```

The seed script creates the Westminster & Soho polygon and inserts curated property records used during the demo.

### Configure the frontend API base (optional)

Override the default API origin by creating a `.env` file inside `frontend/`:

```text
VITE_API_URL=http://localhost:4000
```

## API Reference

`GET /zones`

- Returns the Westminster & Soho showcase zone polygon, colour, and headline metrics.

`GET /property?lat={latitude}&lng={longitude}`

- Finds the nearest seeded property inside the showcase zone (with fallback to a simulated insight elsewhere).
- Responds with valuation, rent, yield, and zone metadata for the clicked coordinate.

`GET /health`

- Lightweight health probe returning `{ "status": "ok", "dbConnected": boolean }`.

## VS Code Task

A build task is available under `Terminal → Run Task… → frontend: build`. It runs `npm --prefix frontend run build`.

## Production Build

Generate a production bundle:

```powershell
npm run build --prefix frontend
```

Then serve the `/dist` directory with your preferred static file server, and point it at the running backend API.
