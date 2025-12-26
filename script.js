const API_URL = "https://daily-brief-v74w.onrender.com/api/news";

const IMAGES = {
  india: ["images/india/1.jpg","images/india/2.jpg","images/india/3.jpg"],
  karnataka: ["images/karnataka/1.jpg","images/karnataka/2.jpg","images/karnataka/3.jpg"],
  world: ["images/world/1.jpg","images/world/2.jpg","images/world/3.jpg"],
  cricket: ["images/cricket/1.jpg","images/cricket/2.jpg","images/cricket/3.jpg"],
  football: ["images/football/1.jpg","images/football/2.jpg","images/football/3.jpg"]
};

const CACHE_KEY = "daily_brief_api_cache";

document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  loadFromCache();
  fetchFromAPI();

  themeToggle.onclick = toggleTheme;
  readingToggle.onclick = () => document.body.classList.toggle("reading");
});

/* ---------- Theme ---------- */
function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.className);
}

function restoreTheme() {
  const t = localStorage.getItem("theme");
  if (t) document.body.className = t;
}

/* ---------- Data ---------- */
function loadFromCache() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return;
  renderAll(JSON.parse(cached));
}

async function fetchFromAPI() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error();

    const json = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify(json));
    renderAll(json);
  } catch {
    // Silent fallback to cache
  }
}

/* ---------- Render ---------- */
function renderAll(payload) {
  const { data, lastUpdated } = payload;

  Object.entries(data).forEach(([section, items]) => {
    const container = document.getElementById(`${section}-news`);
    if (!container) return;

    if (!items || items.length === 0) {
      showFallback(container, section);
    } else {
      renderSection(container, items, section);
    }
  });

  document.getElementById("lastUpdated").textContent =
    ` · Updated ${new Date(lastUpdated).toLocaleString()}`;
}

function renderSection(container, items, section) {
  container.innerHTML = "";
  const imgs = shuffle(IMAGES[section]);

  items.forEach((item, i) => {
    container.innerHTML += `
      <article class="news-card">
        <div>
          <h3>
            <a href="${item.link}" target="_blank" rel="noopener">
              ${item.title}
            </a>
          </h3>
          <p class="news-source">Source: ${item.source}</p>
        </div>
        <img src="${imgs[i]}" alt="">
      </article>
    `;
  });
}

function showFallback(container, section) {
  container.innerHTML = `
    <div class="news-fallback">
      Unable to load ${section} news right now.
    </div>
  `;
}

/* ---------- Utils ---------- */
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);