# Daily Brief

Clear headlines for a 10-minute morning read — a minimal, static news digest web app that fetches structured headlines from a backend API, caches results in localStorage, and presents short context and images per section.

**Project Structure**
- `index.html`: Main static entry (layout and controls).
- `styles.css`: Styling, theming (`dark` / `light`) and reading mode.
- `script.js`: Fetches `/api/news`, caches responses, renders sections and images, and provides theme/reading toggles.
- `images/`: Local image assets used as thumbnails per section.

**Features**
- Sections for India, Karnataka, World, Cricket, Football.
- Lightweight rendering of headlines with contextual snippets extracted from titles.
- Local caching via `localStorage` for offline/fallback experience.
- Theme toggle (`dark` / `light`) persisted to `localStorage`.
- Reading mode to narrow content width and change image sizes.
- Simple image fallback logic using local `images/` assets.

**How it works**
- `script.js` requests the API at `https://daily-brief-v74w.onrender.com/api/news` (see `API_URL`).
- Response shape expected: `{ data: { india: [...], world: [...] }, lastUpdated: "2025-12-26T..." }`.
- Successful responses are saved under `localStorage` key `daily_brief_api_cache`.
- On load the app restores theme, tries to render from cache, then updates from the API.

**Run locally**
You can open `index.html` directly in a browser, but a simple static server is recommended to avoid CORS/local file issues:

- Python 3:

```bash
python -m http.server 8000
```

- Node (http-server):

```bash
npx http-server -c-1
```

Then open `http://localhost:8000`.

**Configuration / Customization**
- API endpoint: edit `API_URL` in `script.js` to point to your own news API.
- Add images: put thumbnails under `images/<section>/` and follow the `1.jpg`, `2.jpg`, etc. naming.
- Context rules: `getContextFromHeadline()` in `script.js` contains regex heuristics — update as needed.

**Development notes**
- The UI is intentionally minimal and accessible.
- Styles support two classes on `<body>`: `dark` and `light`. The theme control writes the current class to `localStorage`.
- Reading mode toggles the `reading` class on `<body>` to adjust layout.

**Deploying**
- This is a static site — host on GitHub Pages, Netlify, Vercel, or any static hosting provider.
- If using a custom backend for the API, ensure CORS is allowed for the site origin.

**Troubleshooting**
- If headlines don't appear: open DevTools → Network to check the API call and console for JSON parse errors.
- If images are missing: ensure files exist under `images/<section>/` and filenames match those expected by `IMAGES` mapping in `script.js`.
- To clear cache: run `localStorage.removeItem('daily_brief_api_cache')` in the console or clear site storage.

**Contributing**
- Small fixes and improvements welcome. Suggested workflow:
  1. Fork the repo and create a topic branch.
  2. Update files and test locally.
  3. Open a PR with a concise description of changes.

**License**
- Include your preferred license file (e.g., `LICENSE`). If none present, add one before publishing.

**Contact**
- For questions or help, open an issue in the repository or contact the maintainer.

---

Enjoy a calmer morning — concise headlines, less noise.