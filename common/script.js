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
    const today = new Date();
    const currentWeek = getISOWeekNumber(new Date());
    const currentDay = new Date();
    const locale = 'en-US'; // hoặc 'en-US', 'vi-VN' tuỳ ngôn ngữ
    const options = { day: '2-digit', month: 'short' };
    let selectedDay = currentDay;
    let selectedWeek = currentWeek;
    const start = startOfWeek(selectedDay);
    const end = endOfWeek(selectedDay);
    const year = end.getFullYear(); // hoặc lấy year từ start: thường giống nhau
    const formattedStart = formatDayMonth(start);
    const formattedEnd = formatDayMonth(end);
    weekNumber.innerHTML = `W${selectedWeek.toString().padStart(2, '0')}`;
    chooseDate.innerHTML = selectedDay.toLocaleDateString();

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

        // Hiển thị ngày được chọn
        chooseDate.innerHTML = selectedDay.toLocaleDateString();

        weekDates.textContent = `${formattedStart} ~ ${formattedEnd} ${year}`;
    });

    nextWeek.addEventListener('click', () => {
        // Cộng thêm 7 ngày cho selectedDay
        selectedDay.setDate(selectedDay.getDate() + 7);

        // Tăng tuần được chọn lên 1
        selectedWeek = selectedWeek + 1;

        // Cập nhật UI cho tuần
        weekNumber.innerHTML = `W${selectedWeek.toString().padStart(2, '0')}`;

        // Hiển thị ngày đã chọn
        chooseDate.innerHTML = selectedDay.toLocaleDateString();

        weekDates.textContent = `${formattedStart} ~ ${formattedEnd} ${year}`;
    });

    // Hàm lấy ngày bắt đầu tuần (Monday)
    function startOfWeek(date) {
        const dt = new Date(date);
        const diff = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1);
        return new Date(dt.setDate(diff));
    }

    // Hàm lấy ngày kết thúc tuần (Sunday)
    function endOfWeek(date) {
        const dt = new Date(date);
        const dayOfWeek = dt.getDay(); // Chủ Nhật = 0, Thứ Hai = 1, ..., Thứ 7 = 6
        if (dayOfWeek === 0) {
            // Nếu là Chủ Nhật, trả về chính nó
            return dt;
        }
        // Ngược lại, tính Chủ Nhật của tuần đó
        const lastDay = dt.getDate() - (dayOfWeek - 1) + 6;
        dt.setDate(lastDay);
        return dt;
    }

    function formatDayMonth(date) {
        return date.toLocaleDateString(locale, options);
    }

    weekDates.textContent = `${formattedStart} ~ ${formattedEnd} ${year}`;

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
            window.location.href = `../screen-hq/hq-index.html`; 
        });
    } 

    // Fetch store & staff data
    fetch('../common/data-store-staff.json')
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        const stores = data.stores;

        // Placeholder cho Store
        const placeholderStore = document.createElement('option');
        placeholderStore.value = "all";
        placeholderStore.selected = true;
        placeholderStore.textContent = '—— All ——';
        selectStore.appendChild(placeholderStore);

        // Đổ stores vào selector
        stores.forEach(store => {
            const opt = document.createElement('option');
            
            opt.value = store.id;       // lưu id store làm value
            opt.textContent = store.name; // hiển thị tên store
            selectStore.appendChild(opt);
        });

        // Khi chọn store → hiển thị staff tương ứng
        selectStore.addEventListener('change', () => {
            const selectedStoreId = selectStore.value;
            const store = stores.find(s => s.id === selectedStoreId);

            // Reset staff dropdown
            selectStaff.innerHTML = '';
            const placeholderStaff = document.createElement('option');
            placeholderStaff.value = "all";
            placeholderStaff.selected = true;
            placeholderStaff.textContent = '—— All ——';
            selectStaff.appendChild(placeholderStaff);

            if (store && store.staff) {
                store.staff.forEach(emp => {
                    const opt = document.createElement('option');
                    opt.value = emp.id;   // id employee làm value
                    opt.textContent = emp.name;
                    selectStaff.appendChild(opt);
                });
            }
        });
    })
    .catch(err => console.error('Failed to load store-staff.json:', err));

    // Begin Function Load tasks
    async function loadTasks() {
        try {
            const response = await fetch('common/data.json'); 
            return await response.json();
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
    // End Function Load tasks

    // Function Render tasks
    async function renderTasks(day, status = 'Active', storeId = 'all', staffName = 'all') {
        taskList.innerHTML = '';
        const tasks = await loadTasks();
        const filteredTasks = tasks.filter(task => {
            const matchDay = task.date.includes(day);
            const matchStatus = (status && status !== 'Active') ? task.status === status : true;
            const matchStore = (storeId && storeId !== 'all') ? task.storeId === storeId : true;
            const matchStaff = (staffName && staffName !== 'all') ? task.staffName === staffName : true;
            return matchDay && matchStatus && matchStore && matchStaff;
        });
        
        updateTaskStats(tasks, day, storeId, staffName);

        if (filteredTasks.length === 0) {
            const displayStatus = (!status || status === 'Active') ? 'Active' : status;
            taskList.innerHTML = `<p>No tasks found.</p>`;
            return;
        }

        filteredTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            const depColor = departments[index % departments.length];
            const userColor = assignees[index % assignees.length];
            const statusColor = task.status === 'Completed' ? 'green' : 'red';
            taskDiv.classList.add('task');
            taskDiv.innerHTML = `
                <div class="task-left">
                    <div class="task-number">${index + 1}.</div>
                    <div class="task-icon">
                        <div class="square" style="background-color:${depColor}"></div>
                        <div class="circle" style="background-color:${userColor}"></div>
                    </div>
                    <div class="task-details">
                        ${task.name}<br>
                        <small>RE ${task.re} ・ ${task.deadline}</small>
                    </div>
                    <div class="task-status" style="color:${statusColor};">${task.status}</div>
                </div>
            `;

            taskDiv.addEventListener('click', () => handleTaskClick(task));
            taskList.appendChild(taskDiv);
        });
    }
    // End Function Render tasks

    // Function Update task statistics
    async function updateTaskStats(tasks, day, storeId, staffName) {

        // Tính số lượng task
        const activeCount = tasks.filter(task => task.date.includes(day) && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;
        const notYetCount = tasks.filter(task => task.date.includes(day) && task.status === 'Not yet' && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;
        const overdueCount = tasks.filter(task => task.date.includes(day) && task.status === 'Overdue' && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;
        const onProgressCount = tasks.filter(task => task.date.includes(day) && task.status === 'On Progress' && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;
        const completedCount = tasks.filter(task => task.date.includes(day) && task.status === 'Completed' && (task.storeId === storeId || storeId === 'all') && (task.staffName === staffName || staffName === 'all')).length;

        // Cập nhật giao diện
        document.querySelector('.status[data-status="Active"]').textContent = `Active tasks: ${activeCount}`;
        document.querySelector('.status[data-status="Not yet"]').textContent = `Not yet: ${notYetCount}`;
        document.querySelector('.status[data-status="Overdue"]').textContent = `Overdue: ${overdueCount}`;
        document.querySelector('.status[data-status="On Progress"]').textContent = `On Progress: ${onProgressCount}`;
        document.querySelector('.status[data-status="Completed"]').textContent = `Completed: ${completedCount}`;
    }
    // End Function Update task statistics

    // Begin Function Handle task click
    function handleTaskClick(task) {
        if (task.status === 'Not yet') {
            showRegisterTaskPopup(task);
        } else {
            showTaskDetailPopup(task);
        }
    }
    // End Function Handle task click

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
    // End Function Show Register Task Popup

    function closePopup() {
        registerTaskPopupParent.style.display = 'none';
        registerTaskPopup.style.display = 'none';
    }

    // Show Task Detail Popup → redirect
    function showTaskDetailPopup(task) {
        const taskData = encodeURIComponent(JSON.stringify(task));
        window.location.href = `../document/Detailtask.html?task=${taskData}`;
    }

    // Calendar buttons
    calendarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const storeId = selectStore.value;
            const staffName = selectStaff.value === 'all' ? 'all' : selectStaff.options[selectStaff.selectedIndex].textContent;

            selectedDay = button.dataset.day || '30/06';
            // Xoá class 'selected' khỏi tất cả button
            calendarButtons.forEach(btn => btn.classList.remove('selected'));

            // Thêm class 'selected' cho button vừa click
            button.classList.add('selected');

            // Render task và cập nhật ngày hiển thị
            renderTasks(selectedDay, 'Active', storeId, staffName);
            chooseDate.innerHTML = selectedDay;
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
    // End Task status buttons

    // Khi selector Store thay đổi
    selectStore.addEventListener('change', () => {
        const storeId = selectStore.value;

        // Render task theo store đã chọn, status mặc định 'Active'
        renderTasks(selectedDay, 'Active', storeId, 'all');
    });
    // End Khi selector Store thay đổi

    // Khi selector Staff thay đổi
    selectStaff.addEventListener('change', () => {
        const storeId = selectStore.value;
        const staffName = selectStaff.value === 'all' ? 'all' : selectStaff.options[selectStaff.selectedIndex].textContent;

        // Render task theo store đã chọn, status mặc định 'Active'
        renderTasks(selectedDay, 'Active', storeId, staffName);
    });
    // End Khi selector Staff thay đổi

    // Initial render
    renderTasks(selectedDay, 'Active', 'all', 'all');
});
