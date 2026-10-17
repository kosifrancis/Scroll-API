# Scroll

Scroll is a responsive social feed for sharing the small things that make a day. The Vite app connects to the Express API when it is available and offers an interactive preview when it is not.

## Run locally

```sh
npm ci --prefix frontend
npm run dev --prefix frontend
```

Vite proxies `/api` and `/uploads` to `http://localhost:3000`. Start the API with `npm start` from the repository root and configure `MONGO_URI` and `JWT_SECRET` in the server environment.

## Connect a hosted API

The repository includes a Render Blueprint in `render.yaml` for the Express API. Deploy it from Render and provide `MONGO_URI` in Render's dashboard; Render generates `JWT_SECRET`. The API allows requests from the GitHub Pages origin.

After the API is deployed, add its public origin (for example, `https://your-api.onrender.com`) as the GitHub Actions repository variable `VITE_API_URL` under **Settings → Secrets and variables → Actions → Variables**. Then run the **Publish Scroll frontend** workflow again. The build adds `/api` automatically, so enter only the origin. Until that variable is configured, the frontend stays in preview mode and explains that the API URL is missing when someone tries to sign in.

## Publish on GitHub Pages

The `Publish Scroll frontend` workflow builds and deploys the frontend from `main`. Enable GitHub Pages with **Settings → Pages → Build and deployment → GitHub Actions**, then push a frontend change or run the workflow manually. The project site is served from `/Scroll-API/`.
