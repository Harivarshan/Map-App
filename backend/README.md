# London Property Plotter API

Express + MongoDB API that blends seeded Westminster & Soho property examples with simulated insights for clicks elsewhere on the map. Consumed by the React Leaflet frontend.

## Scripts

- `npm run dev` – start the API with hot reloading via nodemon (defaults to port `4000`).
- `npm run start` – start the API with Node.js.
- `npm run seed` – seed the Westminster & Soho showcase zone and sample properties.

## Environment setup

1. Ensure MongoDB is running locally (defaults to `mongodb://localhost:27017`).
2. Duplicate `.env.example` to `.env` and update `MONGODB_URI` if required.
3. Run `npm run seed` to populate the showcase zone.

## Endpoints

- `GET /zones` – returns the Westminster & Soho showcase polygon with headline metrics.
- `GET /property?lat={latitude}&lng={longitude}` – returns the closest seeded property inside the showcase zone, with simulation fallback elsewhere.
- `GET /health` – returns `{ "status": "ok", "dbConnected": boolean }`.

The server enables CORS for all origins, making it easy to develop the frontend on a different port.
