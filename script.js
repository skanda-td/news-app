const FEEDS = {
  india: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
  karnataka: "https://news.google.com/rss/search?q=Karnataka+OR+Bengaluru&hl=en-IN&gl=IN&ceid=IN:en",
  world: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
  cricket: "https://news.google.com/rss/search?q=Cricket&hl=en-IN&gl=IN&ceid=IN:en",
  football: "https://news.google.com/rss/search?q=Football+Soccer&hl=en-IN&gl=IN&ceid=IN:en"
};

const IMAGES = {
  india: ["images/india/1.jpg","images/india/2.jpg","images/india/3.jpg"],
  karnataka: ["images/karnataka/1.jpg","images/karnataka/2.jpg","images/karnataka/3.jpg"],
  world: ["images/world/1.jpg","images/world/2.jpg","images/world/3.jpg"],
  cricket: ["images/cricket/1.jpg","images/cricket/2.jpg","images/cricket/3.jpg"],
  football: ["images/football/1.jpg","images/football/2.jpg","images/football/3.jpg"]
};

const SECTION_CACHE = s => `daily_brief_${s}`;
const DATE_KEY = "daily_brief_date";

document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();

  Object.keys(FEEDS).forEach(loadCachedSection);
  refreshOncePerDay();

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

/* ---------- Loading ---------- */
function loadCachedSection(section) {
  const cached = localStorage.getItem(SECTION_CACHE(section));
  if (!cached) return;

  renderSection(
    document.getElementById(`${section}-news`),
    JSON.parse(cached),
    section
  );
}

function refreshOncePerDay() {
  const today = new Date().toDateString();
  if (localStorage.getItem(DATE_KEY) === today) return;

  Object.entries(FEEDS).forEach(([section, url]) => {
    refreshSection(section, url);
  });

  localStorage.setItem(DATE_KEY, today);
  document.getElementById("lastUpdated").textContent =
    ` · Updated ${new Date().toLocaleDateString()}`;
}

async function refreshSection(section, feedUrl) {
  try {
    const items = await fetchSection(feedUrl);
    if (!items.length) throw new Error();

    localStorage.setItem(SECTION_CACHE(section), JSON.stringify(items));

    renderSection(
      document.getElementById(`${section}-news`),
      items,
      section
    );
  } catch {
    showFallback(section);
  }
}

/* ---------- RSS ---------- */
async function fetchSection(feedUrl) {
  const res = await fetch(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`
  );
  const xml = await res.text();
  return parseRSS(xml);
}

function parseRSS(xml) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  return [...doc.querySelectorAll("item")].slice(0, 3).map(i => ({
    title: i.querySelector("title")?.textContent || "",
    link: i.querySelector("link")?.textContent || "",
    source: extractSource(i.querySelector("link")?.textContent || "")
  }));
}

function extractSource(link) {
  try {
    return new URL(link).hostname.replace("www.", "").toUpperCase();
  } catch {
    return "news.google.com";
  }
}

/* ---------- UI ---------- */
function renderSection(container, items, section) {
  container.innerHTML = "";
  const imgs = shuffle(IMAGES[section]);

  items.forEach((item, i) => {
    container.innerHTML += `
      <article class="news-card">
        <div>
          <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
          <p class="news-source">Source: ${item.source}</p>
        </div>
        <img src="${imgs[i]}" alt="">
      </article>
    `;
  });
}

function showFallback(section) {
  const c = document.getElementById(`${section}-news`);
  if (c.children.length) return;

  c.innerHTML = `
    <div class="news-fallback">
      Unable to load ${section} news right now.
    </div>
  `;
}

const shuffle = a => [...a].sort(() => Math.random() - 0.5);