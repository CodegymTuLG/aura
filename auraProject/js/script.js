/* ===== Helpers ===== */
function toDateAny(v){
  if (v == null) return null;
  if (v instanceof Date) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  if (typeof v === "number"){ const epoch=new Date(Date.UTC(1899,11,30)); const d=new Date(epoch.getTime()+v*86400000); return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
  if (typeof v === "string"){
    const s=v.trim(); let m=s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if(m) return new Date(+m[1],+m[2]-1,+m[3]);
    m=s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
    if(m){ let a=+m[1],b=+m[2],y=+m[3]; if(y<100) y+=2000; if(a>12) return new Date(y,b-1,a); if(b>12) return new Date(y,a-1,b); return new Date(y,a-1,b); }
    const d=new Date(s); if(!isNaN(d)) return new Date(d.getFullYear(),d.getMonth(),d.getDate());
  }
  return null;
}

// function fmtMMM(d){ const mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${d.getDate()} ${mo[d.getMonth()]}`; }
function getISOWeek(date){ const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())); const dayNum=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-dayNum+3); const firstThursday=new Date(Date.UTC(d.getUTCFullYear(),0,4)); return 1+Math.round((d-firstThursday)/(7*24*3600*1000)); }
function getWeekStart(date){ const d=new Date(date); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); d.setHours(0,0,0,0); return d; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

/* Dept colors (sửa theo quy ước nếu muốn) */
const DEPT_COLORS={OP:"#8ecae6",ORD:"#219ebc",ADM:"#bde0fe",HR:"#ffd54f",IMP:"#ffc8dd",MKT:"#c5e1a5",QC:"#ffafcc"};
const MEMBER_COLORS=["#ffb703","#fb8500","#9b5de5","#00b4d8","#d00000","#4caf50","#6a4c93"];
const statusClassMap={"Not Yet":"status-notyet","Overdue":"status-overdue","On Progress":"status-progress","Done":"status-done"};

/* ===== State ===== */
let weeks=[], weekToDaysMap={}, currentWeekIndex=0, currentDayIndex=0, statusFilter=null, allWeekMode=false;

/* UI refs */
const fileInput=document.getElementById("fileInput");
const weekTitle=document.getElementById("weekTitle");

const listEl=document.getElementById("task-list");


/* === EXP HUD logic === */
let xp=0, levelMax=20; // mỗi 20 sao đầy 1 thanh
const xpFill=document.getElementById("xpFill");
const xpCount=document.getElementById("xpCount");
const xpStar=document.getElementById("xpStar");

function addXP(n=1){
  xp+=n;
  xpCount.textContent = xp;
  const pct=((xp%levelMax)/levelMax)*100;
  xpFill.style.width=pct+"%";
  // đập nhịp sao tổng
  xpStar.classList.remove("pulse");
  void xpStar.offsetWidth; // restart animation
  xpStar.classList.add("pulse");
}

/* === âm thanh vui khi click sao === */
let audioCtx;
function playChime(){
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const o=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type="triangle";
    const t=audioCtx.currentTime;
    o.frequency.setValueAtTime(660,t);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.2,t+0.02);
    o.frequency.exponentialRampToValueAtTime(1320,t+0.15);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
    o.start(t); o.stop(t+0.24);
  }catch(e){}
}

/* Star SVG (cartoon) */
function starSVG(size){
  return `
<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
  <defs>
    <radialGradient id="goldCoinGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="60%" style="stop-color:#FFC400;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
    </radialGradient>
    
    <filter id="dropshadow" height="130%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
      <feOffset dx="0" dy="1" result="offsetblur" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <circle cx="50" cy="50" r="45" fill="url(#goldCoinGradient)" stroke="#B8860B" stroke-width="2" filter="url(#dropshadow)"/>
  
  <circle cx="50" cy="50" r="41" fill="none" stroke="#FFC800" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="#FFFACD" stroke-width="0.5"/>
  
  <text x="50" y="60" font-family="Arial, sans-serif" font-size="45" font-weight="bold" fill="#B8860B" text-anchor="middle" stroke="#DAA520" stroke-width="0.5" >$</text>

  <circle cx="20" cy="25" r="2" fill="#fff8b3" opacity="0.8"/>
  <circle cx="80" cy="28" r="2.5" fill="#fff8b3" opacity="0.9"/>
  <circle cx="35" cy="85" r="1.5" fill="#fff8b3" opacity="0.7"/>
</svg>`;
}

/* ——— Sao bay về HUD khi click ——— */
function spawnFlyingStar(fromBtn){
  const svgHTML = starSVG(38);
  const fly = document.createElement('div');
  fly.className = 'fly-star';
  fly.innerHTML = svgHTML;
  document.body.appendChild(fly);

  const r = fromBtn.getBoundingClientRect();
  const startX = r.left + r.width/2;
  const startY = r.top + r.height/2;

  const t = document.getElementById('xpStar').getBoundingClientRect();
  const endX = t.left + t.width/2;
  const endY = t.top  + t.height/2;

  fly.style.left = startX+'px';
  fly.style.top  = startY+'px';
  fly.style.transform = 'translate(-50%,-50%)';

  // tạo cung cong đi hướng 11 giờ
  const midX = (startX + endX)/2 - 120; // lệch trái để cong
  const midY = Math.min(startY, endY) - 150;

  const frames = [
    { transform: `translate(-50%,-50%) translate(0px,0px) scale(1) rotate(0deg)`, offset: 0 },
    { offset: .55, transform: `translate(-50%,-50%) translate(${midX-startX}px, ${midY-startY}px) scale(1.1) rotate(180deg)` },
    { transform: `translate(-50%,-50%) translate(${endX-startX}px, ${endY-startY}px) scale(.6) rotate(360deg)`, offset: 1 }
  ];
  const anim = fly.animate(frames, { duration: 900, easing: 'cubic-bezier(.25,.1,.3,1)' });
  anim.onfinish = () => { fly.remove(); addXP(1); playChime(); };
}

/* event delegation cho click star */
document.getElementById('task-list').addEventListener('click', (e)=>{
  const btn = e.target.closest('.done-star-btn');
  if(!btn) return;
  spawnFlyingStar(btn);
});

// Gán tuần hiện tại
const weekLabelEl=document.getElementById("weekLabel");
const weekRangeEl=document.getElementById("weekRange");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const dayTabsEl = document.getElementById("dayTabs");
const summaryEl = document.getElementById("status-summary");
const weekTitleEl = document.getElementById("weekTitle");
const hqScreen = document.getElementById('hq-screen');
let selectedDay = new Date();

// Tự xác định base API URL dựa trên hostname
const getAPIBaseURL = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost/auraProject/api';
  } else {
    return 'https://auraorientalis.vn/auraProject/api';
  }
};

const API_URL = getAPIBaseURL();

// ===== Load tasks =====
async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks.php`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const tasks = await response.json();
    console.log('loadtask'+tasks);
    return tasks; // trả về mảng tasks
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return []; // trả về mảng rỗng nếu lỗi
  }
}

// ===== Load code master =====
async function loadCodeMaster() {
  try {
    const response = await fetch(`${API_URL}/code_master.php`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const codes = await response.json();
    return codes;
  } catch (err) {
    console.error("Error fetching codes:", err);
    return [];
  }
}

async function render() {
  const tasks = await loadTasks();
  const codes = await loadCodeMaster();

  if (!tasks || !codes || !selectedDay) return;

  // ===== Helper functions =====
  const codeMap = {};
  codes.forEach(c => { codeMap[c.code_master_id] = c.name; });
  function codeIdToName(id) { return codeMap[id] || null; }

  function formatDate(d) {
    const date = new Date(d);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")} ${date.getFullYear()}`;
  }

  function startOfWeek() {
    const d = new Date(selectedDay);
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  function filterTasksBySelectedDay() {
    const slDay = new Date(selectedDay);
    slDay.setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      if (!t.start_date) return false;
      const d = new Date(t.start_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === slDay.getTime();
    });
  }

  function filterTasksBySelectedWeek() {
    const start = startOfWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return tasks.filter(t => {
      if (!t.start_date) return false;
      const d = new Date(t.start_date);
      return d >= start && d <= end;
    });
  }

  function filterTasksBySelectedStatus(baseTasks) {
    if (!statusFilter || statusFilter === "all") return baseTasks;
    if (statusFilter === "Active") return baseTasks; // Active = baseTasks
    return baseTasks.filter(t => codeIdToName(t.status_id) === statusFilter);
  }

  // ===== Render Week Label & Range =====
  const slDay = new Date(selectedDay);
  slDay.setHours(0, 0, 0, 0);
  slDay.setDate(slDay.getDate() + 3 - (slDay.getDay() + 6) % 7);

  const week1 = new Date(slDay.getFullYear(), 0, 4);
  const selectedWeek = 1 + Math.round(((slDay - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  weekLabelEl.innerHTML = `W${String(selectedWeek).padStart(2, '0')}`;

  const start = startOfWeek();
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const options = { month: 'short', day: '2-digit' };
  weekRangeEl.innerHTML = (start.getFullYear() === end.getFullYear())
    ? `${start.toLocaleDateString('en-US', options)} ~ ${end.toLocaleDateString('en-US', options)} ${end.getFullYear()}`
    : `${start.toLocaleDateString('en-US', options)} ${start.getFullYear()} ~ ${end.toLocaleDateString('en-US', options)} ${end.getFullYear()}`;

  // ===== Render Day Tabs =====
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  dayTabsEl.innerHTML = dayNames.map((day, i) => `<button data-day="${i}">${day}</button>`).join("");
  const selectedIndex = (selectedDay.getDay() + 6) % 7; // Monday=0
  dayTabsEl.querySelectorAll("button").forEach(btn => {
    const btnDayIndex = parseInt(btn.dataset.day, 10);
    btn.classList.toggle("active", btnDayIndex === selectedIndex);
    btn.onclick = () => {
      selectedDay.setDate(selectedDay.getDate() + (btnDayIndex - selectedIndex));
      render();
    };
  });

  // ===== Filter tasks =====
  const baseTasks = allWeekMode ? filterTasksBySelectedWeek() : filterTasksBySelectedDay();
  const showing = filterTasksBySelectedStatus(baseTasks);

  // ===== Summary counts =====
  const counts = { all: 0, "Not Yet": 0, "Overdue": 0, "On Progress": 0, "Done": 0 };
  baseTasks.forEach(t => {
    const statusName = codeIdToName(t.status_id);
    if (statusName && counts[statusName] !== undefined) counts[statusName]++;
  });
  counts.all = baseTasks.length;

  const rieHour = baseTasks.reduce((sum, t) => sum + (Number(t.re) || 0), 0);

  summaryEl.innerHTML = `
    <div data-filter="all" class="${statusFilter === 'all' ? 'selected' : ''}"><strong>${counts.all}</strong> Active</div>
    <div data-filter="Not Yet" class="${statusFilter === 'Not Yet' ? 'selected' : ''}" style="color:red;"><strong>${counts["Not Yet"]}</strong> Not Yet</div>
    <div data-filter="Overdue" class="${statusFilter === 'Overdue' ? 'selected' : ''}" style="color:darkred;"><strong>${counts["Overdue"]}</strong> Overdue</div>
    <div data-filter="On Progress" class="${statusFilter === 'On Progress' ? 'selected' : ''}" style="color:blue;"><strong>${counts["On Progress"]}</strong> On Progress</div>
    <div data-filter="Done" class="${statusFilter === 'Done' ? 'selected' : ''}" style="color:green;"><strong>${counts["Done"]}</strong> Done</div>
    <div><strong>${rieHour}</strong> RE</div>
  `;
  summaryEl.querySelectorAll("[data-filter]").forEach(el => {
    el.onclick = () => {
      const f = el.getAttribute("data-filter");
      statusFilter = (statusFilter === f) ? null : f;
      render();
    };
  });

  // ===== Render Task List =====
  listEl.innerHTML = showing.map((t, i) => {
    const hasStar = Number(t.status_id) === 9;
    return `
      <div class="task">
        <div class="task-left">
          <div class="task-number">${i + 1}.</div>
          <div class="task-icon">
            <div class="square" style="background:${DEPT_COLORS[codeIdToName(t.dept_id)] || '#ccc'}">${(codeIdToName(t.dept_id) || '').toUpperCase().slice(0, 3)}</div>
            <div class="circle" style="background:${t.do_staff_id}"></div>
          </div>
          <div class="task-details">
            ${t["Task Name"] || ""}<br>
            <small>RE ${t.re || 0} min • ${formatDate(t.start_date)} – ${formatDate(t.end_date)}</small>
          </div>
        </div>
        <div class="task-status ${statusClassMap[codeIdToName(t.status_id)] || ''} ${hasStar ? 'has-star' : ''}">
          ${hasStar ? `<button class="done-star-btn" title="Collect star">${starSVG(42)}</button>` : ''}
          <span>${codeIdToName(t.status_id) || ""}</span>
        </div>
      </div>
    `;
  }).join("") || `<div class="muted">No tasks for selected day/week.</div>`;
}

hqScreen.addEventListener('click', () => {
    window.location.href = 'screen-hq.html';
});
nextWeekBtn.addEventListener("click", () => {
    selectedDay.setDate(selectedDay.getDate()+7);
    console.log('selectedDay:',selectedDay);
    render();
});
prevWeekBtn.addEventListener("click", () => {
    selectedDay.setDate(selectedDay.getDate()-7);
    console.log('selectedDay:',selectedDay);
    render();
});
summaryEl.querySelectorAll("[data-filter]").forEach(el => {
  el.onclick = () => {
    const f = el.getAttribute("data-filter");
    statusFilter = (statusFilter === f) ? null : f;
    renderWeek();
  };
});
weekTitleEl.addEventListener("click", () => {
  // Đảo trạng thái allWeekMode
  allWeekMode = !allWeekMode;

  // Render lại toàn bộ giao diện
  render();
});

render();