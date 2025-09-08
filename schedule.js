/* Scripts for updating the current schedule, from the weekly schedule viewer */

/* Basic configuration files - these will be updated on schedule changes */
// Available office hours (assuming monday = 0)
const officeHours = [
    {day: 0, start: "17:30", end: "19:30", title: "Office Hours", tip:"TETC111"},  // Monday 5:30pm-7:30pm
    {day: 1, start: "9:15", end: "10:15", title: "Office Hours", tip:"TETC111"},  // Tuesday 9:15am-10:15am
    {day: 4, start: "14:00", end: "15:00", title: "Office Hours", tip:"TETC111"},  // Friday 2:00pm-3:00pm
    {day: 3, start: "9:15", end: "10:15", title: "Office Hours", tip:"TETC111"}  // Thursday 9:15am-10:15am
];

// Configurations for the calender
const config = {
    // Time configs, in military time
    startHour: 8,
    endHour: 20,
    weekStartsOn: 1,
    blocks: officeHours
};

/* Scheduling element logic */

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Helper function to determine start of the week
function startOfWeek(date, weekStartsOn = 0){
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0,0,0,0);
    return d;
}

// Helper function to determine day
function addDays(date, n){
    const d = new Date(date);
    d.setDate(d.getDate()+n);
    return d;
}

// Helper function to convert time to minutes
function timeToMinutes(curTime){
    const [h,m] = curTime.split(":").map(Number);
    return h * 60 + m;
}

// Helper function to pad times with 0
function pad2(n){
    return n.toString().padStart(2, '0');
}

// Helper function to convert minutes time into 12-hour time
function minsToLabel(mins){
    const h = Math.floor(mins/60), m = mins%60;
    const p = h>=12 ? "pm" : "am";
    const hh = ((h+11)%12)+1;
    return `${hh}${m?":"+pad2(m):""}${p}`
}

// Helper function to render the headers of the given div
function renderHeader(container, startDate){
    const empty = document.createElement("div");  // First empty cell
    container.appendChild(empty);
    // Make a cell for each day
    for(let i = 0; i < DAY_NAMES.length; i++){
        const d = addDays(startDate, i);
        const day = document.createElement("div");
        day.className = "day";
        const md = `${d.getMonth()+1}/${d.getDate()}`;
        const dayName = DAY_NAMES[d.getDay()];
        day.innerHTML = `${dayName}<small>${md}</small>`;
        container.appendChild(day);
    }
}

// Helper function to render the grid
function renderGrid(grid, startDate, startHour, endHour){
    // Time column
    const timeCol = document.createElement("div");
    timeCol.className = "time-col";
    const slots = (endHour - startHour) * 2; // half-hours
    for(let i=0;i<slots;i++){
        const row = document.createElement("div");
        row.className = "time-slot";
        if(i%2===0){ // on the hour
        const totalMins = (startHour*60) + i*30;
        row.dataset.time = minsToLabel(totalMins);
        }
        timeCol.appendChild(row);
    }
    grid.appendChild(timeCol);

    // Day columns
    for(let col=0; col<7; col++){
        const dayCol = document.createElement("div");
        dayCol.className = "day-col";
        // Mark today
        const today = new Date();
        const cellDate = addDays(startDate, col);
        if(today.toDateString() === cellDate.toDateString()){
        dayCol.classList.add("is-today");
        }
        // Time slots
        for(let i=0;i<slots;i++){
        const s = document.createElement("div");
        s.className = "slot";
        dayCol.appendChild(s);
        }
        grid.appendChild(dayCol);
    }
}

// Helper function to place each timeslot
function placeBlocks(grid, startHour){
    const hourHeight = parseFloat(getComputedStyle(grid).getPropertyValue('--hour-height'));
    console.log(hourHeight);
    const halfHourHeight = hourHeight/2;

    // Day columns are nodes 1-7
    const dayCols = [...grid.children].slice(1);

    // Place each block
    config.blocks.forEach(b=>{
        if(b.day<0 || b.day>6) return;
        const col = dayCols[b.day];
        const startM = timeToMinutes(b.start);
        const endM   = timeToMinutes(b.end);
        const relStart = Math.max(0, startM - (config.startHour*60));
        const relEnd   = Math.max(0, endM   - (config.startHour*60));
        const topPx = (relStart/30) * halfHourHeight;
        const heightPx = Math.max(halfHourHeight/2, ((relEnd-relStart)/30) * halfHourHeight);

        const block = document.createElement("div");
        block.className = "block";
        block.style.top = `${topPx}px`;
        block.style.height = `${heightPx}px`;
        block.setAttribute("data-tip", b.tip || "");
        block.innerHTML = `
            <div class="title">${b.title || "Busy"}</div>
            <div class="time">${minsToLabel(timeToMinutes(b.start))} – ${minsToLabel(timeToMinutes(b.end))}</div>
        `;
        col.appendChild(block);
    });
}

// Helper function to render a line at the current time
function renderNowLine(grid, startDate, shadowDom, line){
    const now = new Date();
    const isThisWeek = (() => {
        const end = addDays(startDate, 7);
        return now >= startDate && now < end;
    })();

    const hourHeight = parseFloat(getComputedStyle(grid).getPropertyValue('--hour-height'));

    if(!isThisWeek || now.getHours() < config.startHour || now.getHours() >= config.endHour){
        line.style.setProperty('--now-y', '-9999px');
        return;
    }
    // Vertical position of the current time
    const minsIntoDay = now.getHours()*60 + now.getMinutes();
    const minsIntoView = minsIntoDay - config.startHour*60;
    const y = (minsIntoView/60) * hourHeight;

    // Horizontal width (across day column of "today")
    const timeColWidth = 72;
    const colWidth = (grid.clientWidth - timeColWidth) / 7;
    const offsetX = timeColWidth + (now.getDay() - config.weekStartsOn + 7)%7 * colWidth;

    line.style.left = `${offsetX}px`;
    line.style.right = `${Math.max(0, grid.clientWidth - offsetX - colWidth)}px`;
    line.style.setProperty('--now-y', `${y}px`);
}

// Helper function to set the inner css of the schedule
function setCSS(calDiv){
    // Add a shadow DOM to the calender div
    const shadow = calDiv.attachShadow({ mode: "open" });

    // Inject the link and html inside of the shadow dom
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "schedule-style.css";
    shadow.appendChild(link);

    // Wait for the CSS to load
    const cssReady = new Promise(resolve => {
        if (link.sheet) resolve();
        else link.addEventListener("load", resolve, {once: true});
    })

    return { shadow, cssReady };
}

/** Main schedule function to return a weekly-calender of current office hours */
export async function renderSchedule(){
    
    // Extract the current divs from a shadow dom
    const calDiv = document.getElementById("scheduleDiv");
    const { shadow: s, cssReady } = setCSS(calDiv);
    
    // Create the child elements with classnames matching css file
    const calendar = document.createElement("div");
    calendar.id = "calendar";
    calendar.className = "calendar";
    
    const header = document.createElement("div");
    header.id = "calHeader";
    header.className = "cal-header";

    const gridWrap = document.createElement("div");
    gridWrap.id = "gridWrap";
    gridWrap.className = "scroll-wrap";

    const grid = document.createElement("div");
    grid.id = "calGrid";
    grid.className = "cal-grid";

    const line = document.createElement("div");
    line.id = "nowLine";
    line.className = "today-banner";
    
    // Add new elements to calender element
    gridWrap.appendChild(grid);
    calendar.appendChild(header);
    calendar.appendChild(gridWrap);
    calendar.appendChild(line);

    // Append the calender master element to the shadow dom
    s.appendChild(calendar);

    const weekStart = startOfWeek(new Date(), config.weekStartsOn); // Get the current week

    await cssReady;  // Await for the CSS to properly load

    renderHeader(header, weekStart);  // Set the headers
    renderGrid(grid, weekStart, config.startHour, config.endHour);  // Make the cells of the weekly calender grid
    placeBlocks(grid, config.startHour);  // Place the currently scheduled office hours
    renderNowLine(grid, weekStart, s, line);  // Place a line at the current time
    window.addEventListener("resize", () => renderNowLine(grid, weekStart, s, line));  // Update now line on window resize
}