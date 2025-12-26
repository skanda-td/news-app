const API_URL = "https://daily-brief-v74w.onrender.com/api/news";

const IMAGES = {
  india: ["images/india/1.jpg", "images/india/2.jpg", "images/india/3.jpg"],
  karnataka: ["images/karnataka/1.jpg", "images/karnataka/2.jpg", "images/karnataka/3.jpg"],
  world: ["images/world/1.jpg", "images/world/2.jpg", "images/world/3.jpg"],
  cricket: ["images/cricket/1.jpg", "images/cricket/2.jpg", "images/cricket/3.jpg"],
  football: ["images/football/1.jpg", "images/football/2.jpg", "images/football/3.jpg"]
};

const CACHE_KEY = "daily_brief_api_cache";
document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  loadFromCache();    
  fetchFromAPI();     

  themeToggle.onclick = toggleTheme;
  readingToggle.onclick = () => document.body.classList.toggle("reading");
});

function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.className);
}

function restoreTheme() {
  const theme = localStorage.getItem("theme");
  if (theme) document.body.className = theme;
}

function loadFromCache() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return;

  try {
    renderAll(JSON.parse(cached));
  } catch {
    localStorage.removeItem(CACHE_KEY);
  }
}

async function fetchFromAPI() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error();

    const json = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify(json));
    renderAll(json);
  } catch {
    // fallback to cache only
  }
}

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

  const last = document.getElementById("lastUpdated");
  if (last) {
    last.textContent = ` · Updated ${new Date(lastUpdated).toLocaleString()}`;
  }
}

function renderSection(container, items, section) {
  container.innerHTML = "";
  const imgs = shuffle(IMAGES[section] || []);

  items.forEach((item, i) => {
    const context = getContextFromHeadline(item.title);

    container.innerHTML += `
      <article class="news-card">
        <div>
          <h3>
            <a href="${item.link}" target="_blank" rel="noopener">
              ${item.title}
            </a>
          </h3>
          <p class="news-context">${context}</p>
          <p class="news-source">Source: ${item.source}</p>
        </div>
        <img src="${imgs[i] || imgs[0] || ""}" alt="">
      </article>
    `;
  });
}

function showFallback(container, section) {
  container.innerHTML = `
    <div class="news-fallback">
      Unable to load ${capitalize(section)} news right now.
    </div>
  `;
}

function getContextFromHeadline(title = "") {
  const t = title.toLowerCase();

  if (/(lynch|killed|attack|blast|shoot|violence)/.test(t))
    return "Reports a violent incident and the surrounding circumstances.";

  if (/(court|pil|verdict|law|gst|tax)/.test(t))
    return "Covers a legal or policy-related development.";

  if (/(govt|government|cabinet|minister|centre|state)/.test(t))
    return "Details a government or political decision.";

  if (/(warning|alert|storm|cold wave|weather)/.test(t))
    return "Provides a public safety or weather-related update.";

  if (/(test|match|series|vs|wins|defeats)/.test(t))
    return "Summarizes a sports match or series update.";

  if (/(talks|meeting|envoys|diplomatic|peace)/.test(t))
    return "Describes diplomatic discussions or international relations.";

  return "Provides context on a recent news development.";
}

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);