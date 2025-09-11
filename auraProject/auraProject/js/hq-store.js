// ===== Get navigation buttons =====
const goToHQTasksButton        = document.getElementById('go-to-hq-tasks');
const goToReceivingTaskButton  = document.getElementById('go-to-task-list');
const goToCreateTaskButton     = document.getElementById('go-to-create-task');
const goToStoreListButton      = document.getElementById('go-to-store-list');
const goToReportsButton        = document.getElementById('go-to-reports');
const goToStoreScreenButton    = document.getElementById('store-screen');

// ===== Redirect helpers =====
const redirectTo = (path) => window.location.href = path;

// ===== Event listeners =====
goToHQTasksButton.addEventListener('click', () => redirectTo('screen-hq.html'));
goToReceivingTaskButton.addEventListener('click', () => redirectTo('hq-task-list.html'));
goToCreateTaskButton.addEventListener('click', () => redirectTo('hq-create-task.html'));
goToStoreListButton.addEventListener('click', () => redirectTo('hq-store-detail.html'));
goToReportsButton.addEventListener('click', () => redirectTo('hq-report.html'));
goToStoreScreenButton.addEventListener('click', () => redirectTo('index.html'));

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
const DEPT_COLORS={
  12: "#8ecae6", // OP
  13: "#219ebc", // ORD
  14: "#bde0fe", // ADM
  15: "#ffd54f", // HR
  16: "#ffc8dd", // IMP
  17: "#c5e1a5", // MKT
  18: "#ffafcc"  // QC
};
const MEMBER_COLORS=["#ffb703","#fb8500","#9b5de5","#00b4d8","#d00000","#4caf50","#6a4c93"];
const statusClassMap={"Not Yet":"status-notyet","Overdue":"status-overdue","On Progress":"status-progress","Done":"status-done"};

/* ===== State ===== */
let weeks=[], weekToDaysMap={}, currentWeekIndex=0, currentDayIndex=0, statusFilter=null, allWeekMode=false, deptFilter = 'all', staffFilter = 'all';

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
      <linearGradient id="gStar" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%"  stop-color="#ffe680"/>
        <stop offset="60%" stop-color="#ffd54f"/>
        <stop offset="100%" stop-color="#ffc84d"/>
      </linearGradient>
    </defs>
    <polygon fill="url(#gStar)" stroke="#ffb300" stroke-width="3"
      points="50,5 62,36 94,38 69,58 77,91 50,74 23,91 31,58 6,38 38,36"/>
    <!-- eyes -->
    <circle cx="38" cy="45" r="10" fill="#0b1a2b"/>
    <circle cx="62" cy="47" r="9" fill="#0b1a2b"/>
    <circle cx="34" cy="42" r="3.5" fill="#fff"/>
    <circle cx="58" cy="44" r="3.5" fill="#fff"/>
    <!-- cheeks -->
    <ellipse cx="32" cy="60" rx="6" ry="4" fill="#ff86b6" opacity=".7"/>
    <ellipse cx="68" cy="61" rx="6" ry="4" fill="#ff86b6" opacity=".7"/>
    <!-- mouth -->
    <path d="M38 64 Q50 73 64 64" fill="none" stroke="#7a3b00" stroke-width="4" stroke-linecap="round"/>
    <!-- sparkles -->
    <path d="M20 34 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2z" fill="#fff8b3" opacity=".8"/>
    <path d="M78 28 l1.5 -4 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5z" fill="#fff8b3" opacity=".85"/>
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
const weekLabelEl = document.getElementById("weekLabel");
const weekRangeEl = document.getElementById("weekRange");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const dayTabsEl = document.getElementById("dayTabs");
const summaryEl = document.getElementById("status-summary");
const weekTitleEl = document.getElementById("weekTitle");
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
    return tasks; // trả về mảng tasks
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return []; // trả về mảng rỗng nếu lỗi
  }
}

async function render() {
  const tasks = await loadTasks();

  if (!tasks || !selectedDay) return;

  // ===== Helper functions =====
  async function updateTaskCheckListBatch(taskId, checks) {
    try {
      const res = await fetch(`${API_URL}/task_check_list.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, checks })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error updating task_check_list batch:", err);
      return { success: false };
    }
  }
  function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")} ${date.getFullYear()}`;
  }

  function startOfWeek() {
    const d = new Date(selectedDay);
    const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1); // Monday
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
    return baseTasks.filter(t => t.status_name === statusFilter);
  }

  function filterTasksByDept(baseTasks) {
    if (!deptFilter || deptFilter === 'all') return baseTasks;
    return baseTasks.filter(t => String(t.dept_id) === deptFilter);
  }

  function filterTasksByStaff(baseTasks) {
    if (!staffFilter || staffFilter === 'all') return baseTasks;
    return baseTasks.filter(t => String(t.do_staff_id) === staffFilter);
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
  let baseTasks = allWeekMode ? filterTasksBySelectedWeek() : filterTasksBySelectedDay();

  // ===== Render Filter Selectors =====
  const deptFilterEl = document.getElementById('dept-filter');
  const staffFilterEl = document.getElementById('staff-filter');

  // 1. Lấy danh sách phòng ban duy nhất và render
  const depts = [...new Map(baseTasks.map(t => [t.dept_id, {id: t.dept_id, name: t.department_name}])).values()];
  deptFilterEl.innerHTML = `<option value="all" data-i18n-key="all-depts">${translate('all-depts')}</option>` + depts.map(d => `<option value="${d.id}" ${deptFilter === String(d.id) ? 'selected' : ''}>${d.name}</option>`).join('');
  deptFilterEl.onchange = (e) => {
    deptFilter = e.target.value;
    staffFilter = 'all'; // Reset bộ lọc nhân viên khi đổi phòng ban
    render();
  };

  // 2. Lọc task theo phòng ban đã chọn để lấy danh sách nhân viên tương ứng
  const tasksForStaffFilter = filterTasksByDept(baseTasks);
  const staffs = [...new Map(tasksForStaffFilter.map(t => [t.do_staff_id, {id: t.do_staff_id, name: t.do_staff_name}])).values()];

  // 3. Render danh sách nhân viên đã được lọc
  staffFilterEl.innerHTML = `<option value="all" data-i18n-key="all-staff">${translate('all-staff')}</option>` + staffs.map(s => `<option value="${s.id}" ${staffFilter === String(s.id) ? 'selected' : ''}>${s.name}</option>`).join('');
  staffFilterEl.onchange = (e) => {
    staffFilter = e.target.value;
    render();
  };

  // ===== Apply all filters =====
  // Lọc lại từ baseTasks ban đầu để đảm bảo tính đúng đắn
  let filteredTasks = filterTasksByDept(baseTasks); 
  filteredTasks = filterTasksByStaff(filteredTasks);

  // Cập nhật lại baseTasks sau khi lọc theo phòng ban/nhân viên để summary tính toán đúng
  const summaryTasks = filteredTasks;

  // Lọc theo trạng thái cuối cùng để hiển thị danh sách
  const showing = filterTasksBySelectedStatus(filteredTasks);


  // ===== Summary counts =====
  const counts = { all: 0, "Not Yet": 0, "Overdue": 0, "On Progress": 0, "Done": 0 };
  baseTasks.forEach(t => {
    const sName = t.status_name;
    if (sName && counts[sName] !== undefined) counts[sName]++;
  });
  counts.all = summaryTasks.length;

  const rieHour = summaryTasks.reduce((sum, t) => sum + (Number(t.re) || 0), 0);

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
    const statusName = t.status_name || '';
    const hasStar = Number(t.status_id) === 9;
    return `
      <div class="task" data-task-id="${t.task_id}">
        <div class="task-left">
          <div class="task-number">${i + 1}.</div>
          <div class="task-icon">
            <div class="square" style="background:${DEPT_COLORS[t.dept_id] || '#ccc'}">${(t.department_name || '').toUpperCase().slice(0, 3)}</div>
            <div class="circle" style="background-color:${MEMBER_COLORS[t.do_staff_id % MEMBER_COLORS.length] || '#777'}"></div>
          </div>
          <div class="task-details">
            ${t.task_name || ""}<br>
            <small>RE ${t.re || 0} min • ${formatDate(t.start_date)} – ${formatDate(t.end_date)}</small>
          </div>
        </div>
        <div class="task-status ${statusClassMap[statusName] || ''} ${hasStar ? 'has-star' : ''}">
          ${hasStar ? `<button class="done-star-btn" title="Collect star">${starSVG(42)}</button>` : ''}
          <span>${statusName}</span>
        </div>
      </div>
    `;
  }).join("") || `<div class="muted">No tasks for selected day/week.</div>`;

  // ===== Popup with check-lists =====
  const popupEl = document.getElementById("popup");
  if (!popupEl) {
    console.error("Popup element with id='popup' not found in HTML.");
    return;
  }

  document.querySelectorAll(".task").forEach(taskEl => {
    const taskId = Number(taskEl.dataset.taskId);
    const task = tasks.find(t => t.task_id === taskId);

    if (task) { // Luôn cho phép click vào task
      taskEl.style.cursor = "pointer";
      taskEl.onclick = () => {
        const isInteractive = task.status_name === "Not Yet" || task.status_name === "On Progress";
        const checks = task.check_lists || [];

        let tableHTML = `<table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Check</th>
              <th>Check Name</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>`;
        checks.forEach((c, i) => {
          tableHTML += `<tr data-check-id="${c.check_list_id}">
            <td>${i + 1}</td>
            <td><input type="checkbox" ${c.check_status === "Done" ? 'checked' : ''} ${isInteractive ? '' : 'disabled'}></td>
            <td>${c.check_list_name}</td>
            <td>${c.check_status || ''}</td>
            <td>${c.completed_at && c.check_status === "Done" ? formatDate(c.completed_at) : ''}</td>
          </tr>`;
        });
        tableHTML += '</tbody></table>';

        const popupContent = `
          <div class="popup-content">
            <h3>Task #${task.task_id}: ${task.task_name}</h3>
            <p><strong>Store:</strong> ${task.do_staff_store_name || ''} • <strong>Dept:</strong> ${task.department_name || ''} • <strong>Staff:</strong> ${task.do_staff_name || ''}</p>
            <p><strong>RE:</strong> ${task.re || 0} min • <strong>Start:</strong> ${formatDate(task.start_date)} • <strong>End:</strong> ${formatDate(task.end_date)}</p>
            ${tableHTML}
            <button id="closePopup">Close</button>
          </div>
        `;
        popupEl.innerHTML = popupContent;

        popupEl.style.display = 'flex';

        if (isInteractive) {
          popupEl.querySelectorAll("input[type=checkbox]").forEach(cb => {
            cb.onchange = async () => {
              const trs = popupEl.querySelectorAll("tbody tr");
              const checksToUpdate = Array.from(trs).map(tr => ({
                check_list_id: Number(tr.dataset.checkId),
                check_status: tr.querySelector("input").checked ? "Done" : "On Progress"
              }));
              await updateTaskCheckListBatch(task.task_id, checksToUpdate);
              render(); // Render lại để cập nhật trạng thái
            };
          });
        }

        // Đóng popup khi click vào nút close hoặc click ra ngoài vùng content
        const closePopup = () => popupEl.style.display = 'none';
        document.getElementById("closePopup").onclick = closePopup;
        popupEl.onclick = (e) => {
          if (e.target === popupEl) closePopup();
        };
      };
    }
  });
}

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

// Re-render on language change
document.addEventListener('languageChanged', render);

render();