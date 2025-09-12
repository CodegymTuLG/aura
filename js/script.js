/**
 * Store Tasks - Logic for the main store task view screen (index.html).
 * Encapsulated to avoid global scope pollution.
 */
(function () {
    'use strict';

    //================================================================================
    // CONFIG & CONSTANTS
    //================================================================================

    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost/auraProject/api' : 'https://auraorientalis.vn/auraProject/api';
    const DEPT_COLORS = {
      12: "#8ecae6", // OP
      13: "#219ebc", // ORD
      14: "#bde0fe", // ADM
      15: "#ffd54f", // HR
      16: "#ffc8dd", // IMP
      17: "#c5e1a5", // MKT
      18: "#ffafcc"  // QC
    };
    const STATUS_CLASS_MAP = { "Not Yet": "status-notyet", "Overdue": "status-overdue", "On Progress": "status-progress", "Done": "status-done" };
    const XP_PER_STAR = 20;

    //================================================================================
    // DOM & STATE
    //================================================================================
    const dom = {
        weekLabel: document.getElementById("weekLabel"),
        weekRange: document.getElementById("weekRange"),
        prevWeekBtn: document.getElementById("prevWeek"),
        nextWeekBtn: document.getElementById("nextWeek"),
        dayTabs: document.getElementById("dayTabs"),
        summary: document.getElementById("status-summary"),
        weekTitle: document.getElementById("weekTitle"),
        storeFilter: document.getElementById("store-filter"),
        staffFilter: document.getElementById("staff-filter"),
        hqScreenBtn: document.getElementById('hq-screen'),
        taskList: document.getElementById("task-list"),
        popup: document.getElementById("popup"),
        xpFill: document.getElementById("xpFill"),
        xpCount: document.getElementById("xpCount"),
        xpStar: document.getElementById("xpStar")
    };
    const state = {
        allTasks: [],
        codeMap: {},
        selectedDay: new Date(),
        statusFilter: null,
        storeFilter: "all",
        staffFilter: "all",
        allWeekMode: false,
        xp: 0,
        audioCtx: null
    };

    //================================================================================
    // API & DATA FETCHING
    //================================================================================
    async function fetchFromAPI(endpoint) {
        try {
            const response = await fetch(`${API_URL}/${endpoint}.php`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error); dom.taskList.innerHTML = `<div class="muted">Error loading data.</div>`;
            return [];
        }
    }
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
            return { success: false, message: err.message };
        }
    }

    //================================================================================
    // UI & RENDERING
    //================================================================================
    function renderWeekHeader() {
        // ===== Week label =====
        const slDay = new Date(state.selectedDay); slDay.setHours(0, 0, 0, 0);
        slDay.setDate(slDay.getDate() + 3 - (slDay.getDay()+6)%7);
        const week1 = new Date(slDay.getFullYear(),0,4);
        const selectedWeek = 1 + Math.round(((slDay-week1)/86400000-3+(week1.getDay()+6)%7)/7);
        dom.weekLabel.innerHTML = `W${String(selectedWeek).padStart(2, '0')}`;
        const start = getWeekStart(state.selectedDay), end = new Date(start); end.setDate(start.getDate() + 6);
        const options = {month:'short',day:'2-digit'};
        dom.weekRange.innerHTML = (start.getFullYear() === end.getFullYear())
    ? `${start.toLocaleDateString('en-US',options)} ~ ${end.toLocaleDateString('en-US',options)} ${end.getFullYear()}`
    : `${start.toLocaleDateString('en-US',options)} ${start.getFullYear()} ~ ${end.toLocaleDateString('en-US',options)} ${end.getFullYear()}`;
    }
    function renderDayTabs() {
        const dayNames=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
        dom.dayTabs.innerHTML = dayNames.map((day, i) => `<button data-day-index="${i}">${day}</button>`).join('');
        const selectedIndex = (state.selectedDay.getDay() + 6) % 7;
        const activeButton = dom.dayTabs.querySelector(`[data-day-index="${selectedIndex}"]`);
        if (activeButton) activeButton.classList.add("active");
    }
    function renderSummary(tasksToSummarize) {
        const counts = { all: 0, "Not Yet": 0, "Overdue": 0, "On Progress": 0, "Done": 0 };
        tasksToSummarize.forEach(t => {
            const s = t.status_name;
            if (s && counts[s] !== undefined) counts[s]++;
        });
        counts.all = tasksToSummarize.length;
        const rieHour = tasksToSummarize.reduce((sum, t) => sum + (Number(t.re) || 0), 0);

        dom.summary.innerHTML = `
            <div data-filter="all" class="${state.statusFilter === 'all' || !state.statusFilter ? 'selected' : ''}"><strong>${counts.all}</strong> Active</div>
            <div data-filter="Not Yet" class="${state.statusFilter === 'Not Yet' ? 'selected' : ''}" style="color:red;"><strong>${counts["Not Yet"]}</strong> Not Yet</div>
            <div data-filter="Overdue" class="${state.statusFilter === 'Overdue' ? 'selected' : ''}" style="color:darkred;"><strong>${counts["Overdue"]}</strong> Overdue</div>
            <div data-filter="On Progress" class="${state.statusFilter === 'On Progress' ? 'selected' : ''}" style="color:blue;"><strong>${counts["On Progress"]}</strong> On Progress</div>
            <div data-filter="Done" class="${state.statusFilter === 'Done' ? 'selected' : ''}" style="color:green;"><strong>${counts["Done"]}</strong> Done</div>
            <div><strong>${rieHour}</strong> RE</div>
        `;
    }
    function renderTaskList(tasksToRender) {
        dom.taskList.innerHTML = tasksToRender.map((t, i) => {
            const sName = t.status_name, hasStar = Number(t.status_id) === 9;
            return `<div class="task" data-task-id="${t.task_id}">
                <div class="task-left">
                    <div class="task-number">${i + 1}.</div>
                    <div class="task-icon">
                        <div class="square" style="background:${DEPT_COLORS[t.dept_id] || '#ccc'}">${(t.department_name || '').toUpperCase().slice(0, 3)}</div>
                    </div>
                    <div class="task-details">${t.task_name}<br>
                    <small>RE ${t.re || 0} min • ${formatDate(t.start_date)} – ${formatDate(t.end_date)}</small></div>
                </div>
                <div class="task-status ${STATUS_CLASS_MAP[sName] || ''} ${hasStar ? 'has-star' : ''}">
                    ${hasStar ? `<button class="done-star-btn" title="Collect star">${starSVG(42)}</button>` : ''}
                    <span>${sName || ""}</span>
                </div>
            </div>`;
        }).join('') || `<div class="muted">No tasks for selected day/week.</div>`;
    }
    async function render() {
        renderWeekHeader();
        renderDayTabs();

        if (!state.allTasks.length) { dom.taskList.innerHTML = `<div class="muted">Loading tasks...</div>`; return; }
        // ===== Filter tasks =====
        const slDay = new Date(state.selectedDay); slDay.setHours(0, 0, 0, 0);
        const start = getWeekStart(state.selectedDay);
        const end = addDays(start, 6);

        let baseTasks = state.allWeekMode
            ? state.allTasks.filter(t => t.start_date && new Date(t.start_date) >= start && new Date(t.start_date) <= end)
            : state.allTasks.filter(t => t.start_date && new Date(t.start_date).setHours(0, 0, 0, 0) === slDay.getTime());

        // ===== Render Filter Selectors =====
        // 1. Lấy danh sách cửa hàng duy nhất và render
        const stores = [...new Map(state.allTasks.map(t => [t.store_id, {id: t.store_id, name: t.do_staff_store_name }])).values()];
        dom.storeFilter.innerHTML = `<option value="all" data-i18n-key="all-stores">${translate('all-stores')}</option>` + stores.map(s => `<option value="${s.id}" ${state.storeFilter == s.id ? 'selected' : ''}>${s.name || 'Unknown Store'}</option>`).join('');
        // 2. Lọc task theo cửa hàng đã chọn
        if (state.storeFilter !== 'all') {
            baseTasks = baseTasks.filter(t => t.store_id == state.storeFilter);
        }
        // 3. Lấy danh sách nhân viên tương ứng và render (sau khi đã lọc cửa hàng)
        const staffs = [...new Map(baseTasks.map(t => [t.do_staff_id, {id: t.do_staff_id, name: t.do_staff_name}])).values()];
        dom.staffFilter.innerHTML = `<option value="all" data-i18n-key="all-staff">${translate('all-staff')}</option>` + staffs.map(s => `<option value="${s.id}" ${state.staffFilter == s.id ? 'selected' : ''}>${s.name || 'Unknown Staff'}</option>`).join('');
        // 4. Lọc task theo nhân viên đã chọn
        if (state.staffFilter !== 'all') {
            baseTasks = baseTasks.filter(t => t.do_staff_id == state.staffFilter);
        }
        // ===== Apply status filter and render =====
        const tasksToDisplay = (!state.statusFilter || state.statusFilter === 'all')
            ? baseTasks
            : baseTasks.filter(t => t.status_name === state.statusFilter);

        // Summary should reflect the tasks after store/staff filter
        renderSummary(baseTasks);
        renderTaskList(tasksToDisplay);
    }
    function showTaskPopup(taskId) {
        const task = state.allTasks.find(t => t.task_id === taskId);
        if (!task) return;
    
        const isInteractive = task.status_name === "Not Yet" || task.status_name === "On Progress" || task.status_name === "Overdue";
        const responseTypeName = state.codeMap[task.response_type_id] || 'Check list';
    
        let responseContent = '';
        switch (responseTypeName) {
                case 'Check list':
                    const checks = task.check_lists || [];
                    let tableHTML = `<table>
                        <thead>
                            <tr><th>STT</th><th>Check</th><th>Check Name</th><th>Status</th><th>Time</th></tr>
                        </thead>
                        <tbody>`;
                    checks.forEach((c, i) => {
                        tableHTML += `<tr data-check-id="${c.check_list_id}">
                            <td>${i + 1}</td>
                            <td><input type="checkbox" ${c.check_status === "Done" ? 'checked' : ''} ${!isInteractive ? 'disabled' : ''}></td>
                            <td>${c.check_list_name}</td>
                            <td>${c.check_status || ''}</td>
                            <td>${c.completed_at && c.check_status === "Done" ? formatDate(c.completed_at) : ''}</td>
                        </tr>`;
                    });
                    tableHTML += '</tbody></table>';
                    responseContent = tableHTML;
                    break;
                case 'Yes-No':
                    responseContent = `
                        <div class="response-yes-no">
                            <label><input type="radio" name="yes-no-response" value="Yes" ${!isInteractive ? 'disabled' : ''}> Yes</label> <label><input type="radio" name="yes-no-response" value="No" ${!isInteractive ? 'disabled' : ''}> No</label>
                        </div>
                    `;
                    if (isInteractive) responseContent += `<button class="popup-submit-btn">Submit</button>`;
                    break;
                case 'Picture':
                    responseContent = `
                        <div class="response-picture">
                            <input type="file" id="picture-upload" accept="image/*" style="display:none;" multiple>
                            <button class="popup-upload-btn" onclick="document.getElementById('picture-upload').click();">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>
                                Upload Image
                            </button>
                            <div id="image-preview"></div>
                        </div>`;
                    if (isInteractive) responseContent += `<button class="popup-submit-btn">Submit</button>`;
                    break;
                default:
                    responseContent = `<p><i>(No interactive response type defined)</i></p>`;
            }
        dom.popup.innerHTML = `
            <div class="popup-content">
                <h3 data-task-id-in-popup="${task.task_id}">Task #${task.task_id}: ${task.task_name}</h3>
                <p><strong>Store:</strong> ${task.do_staff_store_name||''} • <strong>Dept:</strong> ${task.department_name||''} • <strong>Staff:</strong> ${task.do_staff_name||''}</p>
                <p><strong>RE:</strong> ${task.re||0} min • <strong>Start:</strong> ${formatDate(task.start_date)} • <strong>End:</strong> ${formatDate(task.end_date)}</p>
                <div class="response-container">${responseContent}</div>
                <button id="closePopup">Close</button>
            </div>
        `;
        dom.popup.style.display = 'flex';

        // Add event listener for picture upload preview
        const picUpload = document.getElementById('picture-upload');
        if (picUpload) picUpload.addEventListener('change', handlePicturePreview);
    }

    //================================================================================
    // HELPERS & EVENT HANDLERS
    //================================================================================
    function formatDate(d) {
        if (!d) return "";
        const date = new Date(d);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }
    function handlePicturePreview(event) {
        const preview = document.getElementById('image-preview');
        if (!preview) return;
        preview.innerHTML = ''; // Clear previous previews
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML += `<img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 100px; margin: 5px;">`;
                };
                reader.readAsDataURL(file);
            });
        }
    }
    function getWeekStart(date){ const d=new Date(date); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); d.setHours(0,0,0,0); return d; }
    function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

    /* === EXP HUD logic === */
    function addXP(n=1){
      state.xp += n;
      dom.xpCount.textContent = state.xp;
      const pct = ((state.xp % XP_PER_STAR) / XP_PER_STAR) * 100;
      dom.xpFill.style.width = pct + "%";
      dom.xpStar.classList.remove("pulse");
      void dom.xpStar.offsetWidth; // restart animation
      dom.xpStar.classList.add("pulse");
    }
    function playChime(){
      try{
        state.audioCtx = state.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const o = state.audioCtx.createOscillator();
        const g = state.audioCtx.createGain();
        o.connect(g); g.connect(state.audioCtx.destination);
        o.type="triangle";
        const t = state.audioCtx.currentTime;
        o.frequency.setValueAtTime(660,t);
        g.gain.setValueAtTime(0.0001,t);
        g.gain.exponentialRampToValueAtTime(0.2,t+0.02);
        o.frequency.exponentialRampToValueAtTime(1320,t+0.15);
        g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
        o.start(t); o.stop(t+0.24);
      }catch(e){ console.warn("Audio context error", e); }
    }
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
    function spawnFlyingStar(fromBtn){
      const svgHTML = starSVG(38);
      const fly = document.createElement('div');
      fly.className = 'fly-star';
      fly.innerHTML = svgHTML;
      document.body.appendChild(fly);

      const r = fromBtn.getBoundingClientRect();
      const startX = r.left + r.width/2;
      const startY = r.top + r.height/2;

      const t = dom.xpStar.getBoundingClientRect();
      const endX = t.left + t.width/2;
      const endY = t.top  + t.height/2;

      fly.style.left = startX+'px';
      fly.style.top  = startY+'px';
      fly.style.transform = 'translate(-50%,-50%)';

      const midX = (startX + endX)/2 - 120;
      const midY = Math.min(startY, endY) - 150;

      const frames = [
        { transform: `translate(-50%,-50%) translate(0px,0px) scale(1) rotate(0deg)`, offset: 0 },
        { offset: .55, transform: `translate(-50%,-50%) translate(${midX-startX}px, ${midY-startY}px) scale(1.1) rotate(180deg)` },
        { transform: `translate(-50%,-50%) translate(${endX-startX}px, ${endY-startY}px) scale(.6) rotate(360deg)`, offset: 1 }
      ];
      const anim = fly.animate(frames, { duration: 900, easing: 'cubic-bezier(.25,.1,.3,1)' });
      anim.onfinish = () => { fly.remove(); addXP(1); playChime(); };
    }

    function setupEventListeners() {
        dom.hqScreenBtn.addEventListener('click', () => window.location.href = 'hq-store.html');

        dom.nextWeekBtn.addEventListener("click", () => {
            state.selectedDay.setDate(state.selectedDay.getDate() + 7);
            render();
        });
        dom.prevWeekBtn.addEventListener("click", () => {
            state.selectedDay.setDate(state.selectedDay.getDate() - 7);
            render();
        });
        dom.weekTitle.addEventListener("click", () => {
            state.allWeekMode = !state.allWeekMode;
            render();
        });
        dom.storeFilter.addEventListener('change', (e) => {
            state.storeFilter = e.target.value;
            state.staffFilter = 'all'; // Reset staff filter when store changes
            render();
        });
        dom.staffFilter.addEventListener('change', (e) => {
            state.staffFilter = e.target.value;
            render();
        });
        // Event Delegation for day tabs, summary filters, and task clicks
        dom.dayTabs.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const dayIndex = parseInt(e.target.dataset.dayIndex, 10);
                const currentIndex = (state.selectedDay.getDay() + 6) % 7;
                state.selectedDay.setDate(state.selectedDay.getDate() + (dayIndex - currentIndex));
                render();
            }
        });
        dom.summary.addEventListener('click', (e) => {
            const filterEl = e.target.closest('[data-filter]');
            if (filterEl) {
                const filter = filterEl.dataset.filter;
                state.statusFilter = (state.statusFilter === filter) ? null : filter;
                render();
            }
        });
        dom.taskList.addEventListener('click', (e) => {
            const taskEl = e.target.closest('.task');
            const starBtn = e.target.closest('.done-star-btn');
            if (starBtn) {
                spawnFlyingStar(starBtn);
            } else if (taskEl) {
                const taskId = Number(taskEl.dataset.taskId);
                showTaskPopup(taskId);
            }
        });
        // Popup event handlers
        dom.popup.addEventListener('click', async (e) => {
            if (e.target.id === 'closePopup' || e.target.classList.contains('popup-content') === false && e.target.closest('.popup-content') === null) {
                dom.popup.style.display = 'none';
            }
            if (e.target.type === 'checkbox') {
                const taskId = Number(dom.popup.querySelector('[data-task-id-in-popup]').dataset.taskIdInPopup);
                const trs = dom.popup.querySelectorAll("tbody tr");
                const checksToUpdate = Array.from(trs).map(tr => ({
                    check_list_id: Number(tr.dataset.checkId),
                    check_status: tr.querySelector("input").checked ? "Done" : "On Progress"
                }));
                await updateTaskCheckListBatch(taskId, checksToUpdate);
                // Re-fetch data and re-render
                state.allTasks = await fetchFromAPI('tasks');
                render();
            }
        });
        // Re-render on language change
        document.addEventListener('languageChanged', render);
    }

    //================================================================================
    // INITIALIZATION
    //================================================================================
    async function initialize() {
        setupEventListeners();
        render(); // Initial render for layout
        const [tasks, codes] = await Promise.all([
            fetchFromAPI('tasks'),
            fetchFromAPI('code_master')
        ]);
        state.allTasks = tasks;
        codes.forEach(c => state.codeMap[c.code_master_id] = c.name);
        render(); // Re-render with data
    }
    initialize();
})();