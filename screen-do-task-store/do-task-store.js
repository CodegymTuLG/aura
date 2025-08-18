document.addEventListener("DOMContentLoaded", function() {
    const taskTableBody = document.querySelector("#task-table tbody");
    const calendar = document.querySelector("#calendar");
    const taskData = []; // load from 'data.json' later

    // Fetch data from JSON file
    async function fetchData() {
        try {
            const response = await fetch('index-store.json');
            const data = await response.json();
            taskData.push(...data);  // Push data into taskData array
            renderTasks(taskData);   // Call function to render tasks
            renderCalendar();        // Call function to render calendar
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Render Task List
    function renderTasks(data) {
        taskTableBody.innerHTML = ''; // Clear previous tasks
        data.forEach(task => {
            const row = document.createElement('tr');
            const statusColor = task.status === 'Completed' ? 'green' : 'red';
            row.innerHTML = `
                <td>${task.store}</td>
                <td>${task.name}</td>
                <td style="color:${statusColor};">${task.status}</td>
                <td>${task.comment || ''}</td>
            `;
            taskTableBody.appendChild(row);
        });
    }

    // Render Calendar Days
    function renderCalendar() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();

        // Create a month view
        let calendarHTML = '';
        for (let day = 1; day <= 31; day++) {
            const dateStr = `${day < 10 ? '0' : ''}${day}/${month + 1 < 10 ? '0' : ''}${month + 1}/${year}`;
            calendarHTML += `<button class="calendar-day" data-date="${dateStr}">${day}</button>`;
        }
        calendar.innerHTML = calendarHTML;

        // Highlight the selected date
        const buttons = document.querySelectorAll('.calendar-day');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const selectedDate = this.getAttribute('data-date');
                filterTasksByDate(selectedDate);  // Filter tasks based on selected date
            });
        });
    }

    // Filter Tasks by Date
    function filterTasksByDate(date) {
        const filteredTasks = taskData.filter(task => task.date === date);
        renderTasks(filteredTasks);
    }

    // Initialize
    fetchData();
});
