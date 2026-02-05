// schedule.js
// Vanilla JS weekly calendar rendered inside a Shadow DOM.
// - Waits for CSS to load before measuring custom properties
// - Positions blocks absolutely inside day columns
// - Draws a "now" line that sits inside today's column
// - Supports light/dark by reading data-theme on the host

/* ---------- Configuration (you can replace/override as needed) ---------- */

// Example office hours. With weekStartsOn=1 (Mon), use Monday=0 .. Sunday=6.
const officeHours = [
  { day: 0, start: "11:50", end: "12:50", title: "Office Hours", tip: "TETC111" }, // Mon
  //{ day: 1, start: "09:15", end: "10:15", title: "Office Hours", tip: "TETC111" }, // Tue
  { day: 2, start: "11:50", end: "12:50", title: "Office Hours", tip: "TETC111" }, // Thu
  { day: 3, start: "11:00", end: "12:40", title: "In Lab (COSC350)", tip: "HS143" }, // Thu
  { day: 3, start: "13:00", end: "15:00", title: "Office Hours", tip: "TETC111" }, // Fri
];

// Calendar config
const config = {
  startHour: 8,   // visible window (24h)
  endHour: 20,
  weekStartsOn: 1, // 1 = Monday
  blocks: officeHours,
};

/* ------------------------- Utility functions ------------------------- */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date, weekStartsOn = 0) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function timeToMinutes(curTime) {
  const [h, m] = curTime.split(":").map(Number);
  return h * 60 + m;
}

function pad2(n) {
  return n.toString().padStart(2, "0");
}

function minsToLabel(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  const p = h >= 12 ? "pm" : "am";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}${m ? ":" + pad2(m) : ""}${p}`;
}

// Always compute "now" in Eastern time
function getEasternTime() {
  const estString = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  return new Date(estString);
}

/* --------------------------- Render pieces --------------------------- */

function renderHeader(container, startDate) {
  // Empty spacer cell over the time axis
  const empty = document.createElement("div");
  container.appendChild(empty);

  // Day cells
  for (let i = 0; i < 7; i++) {
    const d = addDays(startDate, i);
    const day = document.createElement("div");
    day.className = "day";
    const md = `${d.getMonth() + 1}/${d.getDate()}`;
    const dayName = DAY_NAMES[d.getDay()];
    day.innerHTML = `${dayName}<small>${md}</small>`;
    container.appendChild(day);
  }
}

function renderGrid(grid, startDate, startHour, endHour) {
  // Time column
  const timeCol = document.createElement("div");
  timeCol.className = "time-col";

  const slots = (endHour - startHour) * 2; // half-hour rows
  for (let i = 0; i < slots; i++) {
    const row = document.createElement("div");
    row.className = "time-slot";
    if (i % 2 === 0) {
      // label only on the hour rows
      const totalMins = startHour * 60 + i * 30;
      row.dataset.time = minsToLabel(totalMins);
    }
    timeCol.appendChild(row);
  }
  grid.appendChild(timeCol);

  // Day columns
  for (let col = 0; col < 7; col++) {
    const dayCol = document.createElement("div");
    dayCol.className = "day-col";

    // Mark today for subtle background
    const today = new Date();
    const cellDate = addDays(startDate, col);
    if (today.toDateString() === cellDate.toDateString()) {
      dayCol.classList.add("is-today");
    }

    for (let i = 0; i < slots; i++) {
      const s = document.createElement("div");
      s.className = "slot";
      dayCol.appendChild(s);
    }
    grid.appendChild(dayCol);
  }
}

function placeBlocks(grid){
  const hourHeight = parseFloat(getComputedStyle(grid).getPropertyValue('--hour-height'));
  const halfHourHeight = hourHeight / 2;

  const dayCols = Array.from(grid.querySelectorAll('.day-col'));

  // Map “Monday=0..Sunday=6” into the grid index depending on weekStartsOn
  const offset = (7 + (1 - config.weekStartsOn)) % 7;

  const viewStart = config.startHour * 60;
  const viewEnd   = config.endHour * 60;

  config.blocks.forEach(b => {
    if (b.day < 0 || b.day > 6) return;

    const idx = (b.day + offset) % 7;
    const col = dayCols[idx];
    if (!col) return;

    const startM = timeToMinutes(b.start);
    const endM   = timeToMinutes(b.end);

    // clamp to visible window
    const sM = Math.max(viewStart, Math.min(startM, viewEnd));
    const eM = Math.max(viewStart, Math.min(endM, viewEnd));
    if (eM <= sM) return;

    const relStart = sM - viewStart;
    const relEnd   = eM - viewStart;

    const topPx    = (relStart / 30) * halfHourHeight;
    const heightPx = Math.max(halfHourHeight / 2, ((relEnd - relStart) / 30) * halfHourHeight);

    const block = document.createElement('div');
    block.className = 'block';
    block.style.top = `${topPx}px`;
    block.style.height = `${heightPx}px`;
    block.setAttribute('data-tip', b.tip || '');
    block.innerHTML = `
      <div class="title">${b.title || 'Busy'}</div>
      <div class="time">${minsToLabel(startM)} – ${minsToLabel(endM)}</div>
    `;
    col.appendChild(block);
  });
}

function renderNowLine(grid, startDate, line) {
  const now = getEasternTime();

  // Only show within the rendered week and visible hours
  const end = addDays(startDate, 7);
  const withinWeek = now >= startDate && now < end;

  const hourHeight = parseFloat(getComputedStyle(grid).getPropertyValue("--hour-height"));
  if (!withinWeek || now.getHours() < config.startHour || now.getHours() >= config.endHour) {
    line.style.setProperty("--now-y", "-9999px");
    return;
  }

  // Vertical position
  const minsIntoDay = now.getHours() * 60 + now.getMinutes();
  const minsIntoView = minsIntoDay - config.startHour * 60;
  const y = (minsIntoView / 60) * hourHeight;
  line.style.setProperty("--now-y", `${y}px`);

  // Horizontal position/width inside the grid
  const styles = getComputedStyle(grid);
  const timeColWidth = parseFloat(styles.getPropertyValue("--time-col-width")) || 72;
  const gridWidth = grid.clientWidth;
  const colWidth = (gridWidth - timeColWidth) / 7;

  // Map actual weekday (0=Sun) into 0..6 where 0 is weekStartsOn
  const dayIdx = (now.getDay() - config.weekStartsOn + 7) % 7;
  const offsetX = timeColWidth + dayIdx * colWidth;

  // Constrain to today's column
  line.style.left = `${offsetX}px`;
  line.style.width = `${colWidth}px`;
  line.style.right = ""; // ensure right doesn't override width
}

/* ---------------------------- Shadow/CSS ----------------------------- */

// Create the shadow root and inject the stylesheet; return a promise once loaded
function setCSS(calDiv) {
  const shadow = calDiv.attachShadow({ mode: "open" });

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "schedule-style.css";
  shadow.appendChild(link);

  const cssReady = new Promise((resolve) => {
    if (link.sheet) resolve(); // already in cache
    else link.addEventListener("load", resolve, { once: true });
  });

  return { shadow, cssReady };
}

/* --------------------------- Main entrypoint ------------------------- */

// Render the calendar into #scheduleDiv. Keep signature simple for drop-in use.
export async function renderSchedule() {
  const host = document.getElementById("scheduleDiv");
  if (!host) return;

  // Mirror the page theme onto the host for shadow CSS to react
  const pageTheme = document.documentElement.dataset.theme || "light";
  host.setAttribute("data-theme", pageTheme);

  const { shadow: s, cssReady } = setCSS(host);

  // Build DOM structure that matches CSS selectors
  const calendar = document.createElement("div");
  calendar.className = "calendar";

  const header = document.createElement("div");
  header.className = "cal-header";

  const gridWrap = document.createElement("div");
  gridWrap.className = "scroll-wrap";

  const grid = document.createElement("div");
  grid.className = "cal-grid";

  // The "now" line lives **inside** the grid so it scrolls/alig ns correctly
  const line = document.createElement("div");
  line.className = "today-banner";

  gridWrap.appendChild(grid);
  calendar.appendChild(header);
  calendar.appendChild(gridWrap);
  s.appendChild(calendar);

  // Compute week start based on config
  const weekStart = startOfWeek(new Date(), config.weekStartsOn);

  // Wait for CSS so custom properties are available
  await cssReady;

  renderHeader(header, weekStart);
  renderGrid(grid, weekStart, config.startHour, config.endHour);

  // Append now line after grid exists (so child order doesn't confuse queries)
  grid.appendChild(line);

  placeBlocks(grid);
  renderNowLine(grid, weekStart, line);

  // Keep the now-line aligned on resize
  window.addEventListener("resize", () => renderNowLine(grid, weekStart, line));
}
