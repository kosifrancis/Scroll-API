# Scroll

Scroll is a responsive social feed for sharing the small things that make a day. The Vite app connects to the Express API when it is available and offers an interactive preview when it is not.

## Run locally

```sh
npm ci --prefix frontend
npm run dev --prefix frontend
```

Vite proxies `/api` and `/uploads` to `http://localhost:3000`. Start the API with `npm start` from the repository root and configure `MONGO_URI` and `JWT_SECRET` in the server environment.

## Connect a hosted API

Set `VITE_API_URL` to the public API origin (or origin ending in `/api`) before building. For GitHub Actions, add a repository Actions variable named `VITE_API_URL`. Configure the API's `FRONTEND_URL` to `https://kosifrancis.github.io` and set its `CORS_ORIGINS` when the site uses a different origin.

## Publish on GitHub Pages

The `Publish Scroll frontend` workflow builds and deploys the frontend from `main`. Enable GitHub Pages with **Settings → Pages → Build and deployment → GitHub Actions**, then push a frontend change or run the workflow manually. The project site is served from `/Scroll-API/`.
