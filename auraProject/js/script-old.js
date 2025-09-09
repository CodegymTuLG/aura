document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const homeScreen = document.querySelector('.home-screen');
    const calendarButtons = document.querySelectorAll('#calendar .day');
    const taskStatusButtons = document.querySelectorAll('.status');
    const taskList = document.getElementById('task-list');
    const hqScreen = document.getElementById('hq-screen');
    
    // Week Info
    const previousWeek = document.getElementById('previous-week');
    const nextWeek = document.getElementById('next-week');
    const weekNumber = document.getElementById('week-number');
    const chooseDate = document.getElementById('choose-date');
    const weekDates = document.getElementById('week-dates');
    // const toDay = new Date();
    // let selectedDay = toDay.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let selectedDay = new Date();
    selectedDay.setHours(0, 0, 0, 0);
    let selectedWeek = getISOWeekNumber(selectedDay);
    weekNumber.innerHTML = `W${selectedWeek.toString().padStart(2, '0')}`;

    function getISOWeekNumber(date) {
        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);
        currentDate.setDate(currentDate.getDate() + 3 - (currentDate.getDay() + 6) % 7);
        const week1 = new Date(currentDate.getFullYear(), 0, 4);
        return 1 + Math.round(((currentDate - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    previousWeek.addEventListener('click', () => {
        // Trừ 7 ngày cho đối tượng Date
        selectedDay.setDate(selectedDay.getDate() - 7);

        // Giảm tuần chọn đi 1 (nếu bạn muốn dùng selectedWeek)
        selectedWeek = selectedWeek - 1;

        // Cập nhật UI tuần
        weekNumber.innerHTML = `W${selectedWeek.toString().padStart(2, '0')}`;

        renderByDate(selectedDay);
        renderTasks(selectedDay, 'Active', 'all', 'all');
    });

    nextWeek.addEventListener('click', () => {
        
        // Cộng thêm 7 ngày cho selectedDay
        selectedDay.setDate(selectedDay.getDate() + 7);

        // Tăng tuần được chọn lên 1
        selectedWeek = selectedWeek + 1;

        // Cập nhật UI cho tuần
        weekNumber.innerHTML = `W${selectedWeek.toString().padStart(2, '0')}`;
        
        renderByDate(selectedDay);
        renderTasks(selectedDay, 'Active', 'all', 'all');
    });

    // Hàm lấy ngày bắt đầu tuần (Monday)
    function startOfWeek(date) {
        const dt = new Date(date);
        const diff = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1);
        return new Date(dt.setDate(diff));
    }

    function renderByDate(date) {
        const d = new Date(date);
        monDay = startOfWeek(d);
        const dayOfWeek = Array.from({ length: 7 }, (_, idx) => {
            const d = new Date(monDay);      // Tạo bản sao để giữ nguyên monDay
            d.setDate(d.getDate() + idx);    // Cộng thêm idx ngày
            return d;
        });
            function formatDayMonthYear(d) {
            const date = d instanceof Date ? d : new Date(d);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }
        function formatDayMonth(d) { return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });};    
        weekDates.textContent = `${formatDayMonth(dayOfWeek[0])} ~ ${formatDayMonth(dayOfWeek[6])} ${d.getFullYear()}`;
        calendarButtons.forEach((button, index) => {
            button.dataset.day = formatDayMonthYear(dayOfWeek[index]);
        });
        chooseDate.innerHTML = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        calendarButtons.forEach(button => {
            button.classList.remove('selected');
            if (button.dataset.day === formatDayMonthYear(selectedDay)) {
                button.classList.add('selected');
            }
        });
    }
        
    // Popup
    const registerTaskPopupParent = document.getElementById('register-task-popup_parent');
    const registerTaskPopup = document.getElementById('register-task-popup');
    const registerTaskForm = document.getElementById('register-task-form');

    // Colors
    const departments = ["#8ecae6", "#219ebc", "#ffafcc", "#bde0fe", "#ffc8dd"];
    const assignees = ["#ffb703", "#fb8500", "#9b5de5", "#00b4d8", "#d00000"];

    // Dropdowns
    const selectStore = document.getElementById('select-store');
    const selectStaff = document.getElementById('select-staff');

    if (hqScreen) {
        hqScreen.addEventListener('click', () => {
            window.location.href = `screen-hq/hq-index.html`; 
        });
    } 

    // Async functions load tables from DB
    async function loadCodeMaster() {
        try {
            const response = await fetch('http://localhost:3000/api/code');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading code master:', error);
            return [];
        }
    }

    async function loadCommon() {
        try {
            const response = await fetch('http://localhost:3000/api/common');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading common:', error);
            return [];
        }
    }

    async function loadDepartments() {
        try {
            const response = await fetch('http://localhost:3000/api/departments');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading departments:', error);
            return [];
        }
    }

    async function loadManuals() {
        try {
            const response = await fetch('http://localhost:3000/api/manuals');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading manuals:', error);
            return [];
        }
    }

    async function loadRegionMaster() {
        try {
            const response = await fetch('http://localhost:3000/api/region');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading region master:', error);
            return [];
        }
    }

    async function loadRoles() {
        try {
            const response = await fetch('http://localhost:3000/api/roles');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading roles:', error);
            return [];
        }
    }

    async function loadStaffMaster() {
        try {
            const response = await fetch('http://localhost:3000/api/staff');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading staff master:', error);
            return [];
        }
    }

    async function loadStoreChecks() {
        try {
            const response = await fetch('http://localhost:3000/api/storeChecks');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading store checks:', error);
            return [];
        }
    }

    async function loadStoreMaster() {
        try {
            const response = await fetch('http://localhost:3000/api/store');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading store master:', error);
            return [];
        }
    }

    async function loadTasks() {
        try {
            const response = await fetch('http://localhost:3000/api/tasks');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    async function loadTempleTasks() {
        try {
            const response = await fetch('http://localhost:3000/api/templeTasks');
            if (!response.ok) {
                const text = await response.text();
                console.error('Fetch failed:', response.status, text);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading temple tasks:', error);
            return [];
        }
    }

    // Khai báo function load default data 
    async function loadStart() {
        // Placeholder cho Store
        const stores = await loadStoreMaster();
        const staff = await loadStaffMaster();
        const placeholderStore = document.createElement('option');
        placeholderStore.value = "all";
        placeholderStore.selected = true;
        placeholderStore.textContent = '—— All ——';
        selectStore.appendChild(placeholderStore);

        // Đổ stores vào selector
        stores.forEach(store => {
            const opt = document.createElement('option');
            opt.value = store.store_id;       // id store làm value
            opt.textContent = store.store_name; // hiển thị tên store
            selectStore.appendChild(opt);
        });

        // Reset Staff selector
        function resetStaffSelector() {
            selectStaff.innerHTML = ''; // clear cũ
            const placeholderStaff = document.createElement('option');
            placeholderStaff.value = "all";
            placeholderStaff.selected = true;
            placeholderStaff.textContent = '—— All ——';
            selectStaff.appendChild(placeholderStaff);
        };

        // Placeholder Staff selector khi load trang lần đầu
        resetStaffSelector();

        // Đổ staff tương ứng vào selector
        selectStore.addEventListener('change', () => {
            const selectedStoreId = selectStore.value || 'all';
            resetStaffSelector(); // reset lại trước
            staff.forEach(s =>{
                if (s.store_id === Number(selectedStoreId)) {
                    const opt = document.createElement('option');
                    opt.value = s.staff_id;
                    opt.textContent = s.staff_name;
                    selectStaff.appendChild(opt);
                }
            });
            renderTasks(selectedDay, 'Active', selectedStoreId, 'all');
        });

        selectStaff.addEventListener('change', () => {
            const selectedStoreId = selectStore.value || 'all';
            const selectedStaffId = selectStaff.value || 'all';
            renderTasks(selectedDay, 'Active', selectedStoreId, selectedStaffId);
        });

        // Render Tasks khi load trang lần đầu
        renderByDate(selectedDay);
        renderTasks(selectedDay, 'Active', 'all', 'all');
    }

    // Xác định status từ status_id
    async function taskStatus(status_id) {
        const codes = await loadCodeMaster(); 
        const codeMatch = codes.find(c => c.code_master_id === status_id);
        return codeMatch?.name || null;
    }

    function fixDate(dateInput, hours = 7) {
        const date = new Date(dateInput);
        date.setHours(date.getHours() + hours);
        return date.toISOString().slice(0, 10);
    };
    
    // Function Render tasks
    async function renderTasks(day, status = 'Active', storeId = 'all', staffId = 'all') {
        taskList.innerHTML = '';
        const tasks = await loadTasks();

        const formatDate = (date) => {
            const d = (date instanceof Date) ? date : new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        // Load staff 1 lần
        const staffList = await loadStaffMaster();
        const staffMap = new Map(staffList.map(s => [s.staff_id, s.store_id]));

        const filteredTasks = tasks.filter(task => {
            const dateFixed = fixDate(new Date(task.start_date));
            const storeIdFixed = Number(storeId) || 'all';
            const taskStoreId = staffMap.get(String(task.do_staff_id)) || null;
            const staffIdFixed = Number(staffId) || 'all';

            const matchDay = dateFixed === formatDate(day);
            const matchStatus = (status && status !== 'Active') ? task.status === status : true;
            const matchStore = (storeIdFixed && storeIdFixed !== 'all') ? taskStoreId === storeIdFixed : true;
            const matchStaff = (staffIdFixed && staffIdFixed !== 'all') ? task.do_staff_id === staffIdFixed : true;

            return matchDay && matchStatus && matchStore && matchStaff;
        });

        updateTaskStats(tasks, day, storeId, staffId);

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<p>No tasks found.</p>`;
            return;
        }

        filteredTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            const depColor = departments[index % departments.length];
            const userColor = assignees[index % assignees.length];
            const statusColor = task.status_id === 10 ? 'green' : 'red';
            taskDiv.classList.add('task');

            taskDiv.innerHTML = `
                <div class="task-left">
                    <div class="task-number">${index + 1}.</div>
                    <div class="task-icon">
                        <div class="square" style="background-color:${depColor}"></div>
                        <div class="circle" style="background-color:${userColor}"></div>
                    </div>
                    <div class="task-details">
                        ${task.task_name}<br>
                        <small>RE ${task.re} ・ ${fixDate(new Date(task.end_date))}</small>
                    </div>
                    <div class="task-status" style="color:${statusColor};">Loading...</div>
                </div>
            `;
            const statusDiv = taskDiv.querySelector('.task-status');
            taskStatus(task.status_id).then(name => {
                statusDiv.textContent = name || 'Unknown';
                // Có thể thay đổi màu sắc hoặc class nếu cần
            }).catch(err => {
                console.error('Failed to load status:', err);
                statusDiv.textContent = 'Error';
            });

            taskDiv.addEventListener('click', () => handleTaskClick(task));
            taskList.appendChild(taskDiv);
        });
    }

    // Function Update task statistics
    async function updateTaskStats(tasks, day, storeId, staffName) {
        const formatDate = (date) => {
            const d = (date instanceof Date) ? date : new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Tính số lượng task
        const activeCount = tasks.filter(task => task.date === formatDate(day) && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;
        const notYetCount = tasks.filter(task => task.date === formatDate(day) && task.status === 'Not yet' && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;
        const overdueCount = tasks.filter(task => task.date === formatDate(day) && task.status === 'Overdue' && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;
        const onProgressCount = tasks.filter(task => task.date === formatDate(day) && task.status === 'On Progress' && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;
        const completedCount = tasks.filter(task => task.date === formatDate(day) && task.status === 'Completed' && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;

        // Cập nhật giao diện
        document.querySelector('.status[data-status="Active"]').textContent = `Active tasks: ${activeCount}`;
        document.querySelector('.status[data-status="Not yet"]').textContent = `Not yet: ${notYetCount}`;
        document.querySelector('.status[data-status="Overdue"]').textContent = `Overdue: ${overdueCount}`;
        document.querySelector('.status[data-status="On Progress"]').textContent = `On Progress: ${onProgressCount}`;
        document.querySelector('.status[data-status="Completed"]').textContent = `Completed: ${completedCount}`;
    }

    // Begin Function Handle task click
    function handleTaskClick(task) {
        if (task.status === 'Not yet') {
            showRegisterTaskPopup(task);
        } else {
            showTaskDetailPopup(task);
        }
    }

    // Begin Function Show Register Task Popup
    function showRegisterTaskPopup(task) {
        if (!registerTaskPopup) {
            console.error("Popup is missing, can't show it.");
            return;
        }

        registerTaskPopupParent.style.display = 'flex'; // show overlay
        registerTaskPopup.style.display = 'flex';       // show popup

        registerTaskForm.innerHTML = `
            <h3>Register Task: ${task.name}</h3>
            <a href="https://www.youtube.com/watch?v=8KkX71WBpFE" target="_blank">Manual</a>
            <p>Deadline: ${task.deadline}</p>
            <p>Re: ${task.re}</p>
            <textarea id="task-comment" name="task-comment" placeholder="Add your comment..."></textarea>
            <div class="camera-section">
                <input id="task-photos" type="file" name="task-photos" accept="image/*" capture="camera" multiple />
            </div>
            <div style="display:flex; justify-content:space-between;">
                <button id="submit-task" class="btn-submit">Submit</button>
                <button id="close-popup" class="btn-close">Close</button>
            </div>
        `;

        document.getElementById('submit-task').addEventListener('click', function () {
            const comment = document.getElementById('task-comment').value;
            const updatedTask = { ...task, status: 'Completed', comment };

            fetch('http://localhost:3000/update-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            })
            .then(response => response.json())
            .then(() => {
                alert('Task updated successfully!');
                closePopup();
            })
            .catch(error => console.error('Error updating task:', error));
        });

        document.getElementById('close-popup').addEventListener('click', closePopup);
    }

    function closePopup() {
        registerTaskPopupParent.style.display = 'none';
        registerTaskPopup.style.display = 'none';
    }

    // Show Task Detail Popup → redirect
    function showTaskDetailPopup(task) {
        const taskData = encodeURIComponent(JSON.stringify(task));
        window.location.href = `Detailtask.html?task=${taskData}`;
    }

    // Calendar buttons
    calendarButtons.forEach(button => {        
        button.addEventListener('click', () => {
            const storeId = selectStore.value;
            const staffName = selectStaff.value === 'all' ? 'all' : selectStaff.options[selectStaff.selectedIndex].textContent;

            selectedDay = new Date(button.dataset.day);

            // Xoá class 'selected' khỏi tất cả button
            calendarButtons.forEach(btn => btn.classList.remove('selected'));

            // Thêm class 'selected' cho button vừa click
            button.classList.add('selected');

            // Render task và cập nhật ngày hiển thị
            renderTasks(selectedDay, 'Active', storeId, staffName);
            renderByDate(selectedDay);
        });
    });

    // Task status buttons
    taskStatusButtons.forEach(button => {
        button.addEventListener('click', () => {
            let status = button.dataset.status;
            const storeId = selectStore.value;
            const staffName = selectStaff.value === 'all' ? 'all' : selectStaff.options[selectStaff.selectedIndex].textContent;

            // Nếu button đã được chọn, bỏ chọn nó và đặt status về 'Active'. Nếu không, bỏ chọn tất cả button khác và chọn button này
            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                status = 'Active';
            } else {
                taskStatusButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
            }
            
            renderTasks(selectedDay, status, storeId, staffName);
        });
    });

    loadStart();
});
