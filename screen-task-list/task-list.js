const allTasks = Array.from({ length: 30 }, (_, i) => {
  const week = `W${26 + (i % 5)}`;
  const responsibleList = ["Trainer Perishable", "Trainer Delica/D&D", "Trainer Aeon CF", "PLANNING"];
  const responsible = responsibleList[i % responsibleList.length];

  const startDate = new Date(2025, 6, 1 + i); // July = 6
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 4 + 1));

  const formatDate = (date) => date.toISOString().split('T')[0];

  return {
    week: week,
    name: `Task #${i + 1} - ${["Promo", "Audit", "Delivery", "Label", "Report"][i % 5]}`,
    responsible: responsible,
    start: formatDate(startDate),
    end: formatDate(endDate),
    progress: `${Math.floor(Math.random() * 20)} / 25`,
    unable: Math.floor(Math.random() * 3),
    status: ["Waiting", "Reporting"][i % 2]
  };
});

let activeWeek = null;
let activeResp = null;

function renderTable(tasks) {
  const tbody = document.getElementById('taskTableBody');
  tbody.innerHTML = '';
  tasks.forEach((task, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${task.week}</td>
      <td>${task.responsible}</td>
      <td>
        <div class="task-name">${task.name}</div>
        <div class="task-dates">${task.start} → ${task.end}</div>
      </td>
      <td>${task.progress}</td>
      <td>${task.unable}</td>
      <td><span class="status ${task.status.toLowerCase()}">${task.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterTasks() {
  const search = document.getElementById("taskSearch").value.toLowerCase();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  let filtered = allTasks.filter(t => {
    const nameMatch = t.name.toLowerCase().includes(search);
    const weekMatch = !activeWeek || t.week === activeWeek;
    const respMatch = !activeResp || t.responsible === activeResp;
    const startMatch = !startDate || t.start >= startDate;
    const endMatch = !endDate || t.end <= endDate;
    return nameMatch && weekMatch && respMatch && startMatch && endMatch;
  });

  renderTable(filtered);
}

// 🔄 Sự kiện lọc theo tiêu đề
document.getElementById("weekFilter").addEventListener("click", () => {
  const current = activeWeek;
  activeWeek = current ? null : "W28"; // hoặc lọc lần đầu theo W28, hoặc xoá nếu đã chọn
  filterTasks();
});

document.getElementById("respFilter").addEventListener("click", () => {
  const current = activeResp;
  activeResp = current ? null : "Trainer Delica/D&D";
  filterTasks();
});

// 🔄 Lọc khi nhập
document.getElementById("taskSearch").addEventListener("input", filterTasks);
document.getElementById("startDate").addEventListener("change", filterTasks);
document.getElementById("endDate").addEventListener("change", filterTasks);

// 🚀 Render lần đầu
renderTable(allTasks);
// Giả lập dữ liệu – thay bằng dữ liệu thực tế từ tasks/json của bạn
const exampleTasks = [
  { name: "Task A", status: "Completed", week: "W28", progress: 10, total: 10 },
  { name: "Task B", status: "In Progress", week: "W28", progress: 3, total: 10 },
  { name: "Task C", status: "Completed", week: "W29", progress: 10, total: 10 },
  { name: "Task D", status: "Waiting", week: "W27", progress: 2, total: 10 },
  // Thêm task thực tế của bạn ở đây
];

// Xử lý dữ liệu cho Pie Chart
function getPieData(tasks) {
  let done = 50, progress = 25, waiting = 20;
  tasks.forEach(t => {
    if (t.status.toLowerCase() === "completed") done++;
    else if (t.status.toLowerCase() === "in progress") progress++;
    else waiting++;
  });
  return [done, progress, waiting];
}

// Xử lý dữ liệu cho Bar Chart (theo tuần)
function getBarData(tasks) {
  const grouped = {};
  tasks.forEach(t => {
    if (!grouped[t.week]) grouped[t.week] = { done: 0, total: 0 };
    grouped[t.week].total += 1;
    if (t.status.toLowerCase() === "completed") grouped[t.week].done += 1;
  });
  const weeks = Object.keys(grouped);
  const values = weeks.map(w => (grouped[w].done / grouped[w].total * 100).toFixed(1));
  return { weeks, values };
}

// Khởi tạo chart khi cần
let pieChart, barChart;

// Sự kiện toggle button
document.getElementById("togglePie").addEventListener("click", function () {
  const ctx = document.getElementById("progressPieChart");
  ctx.style.display = ctx.style.display === "none" ? "block" : "none";
  this.classList.toggle("green");
  this.classList.toggle("red");

  if (ctx.style.display === "block" && !pieChart) {
    // Vẽ Pie Chart
    const data = getPieData(exampleTasks);
    pieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["completed", "Processing", "Waiting"],
        datasets: [{
          data,
          backgroundColor: ["#43a047", "#ffa726", "#eeeeee"],
        }]
      },
      options: {
        plugins: { legend: { position: "bottom" } }
      }
    });
  }
});

document.getElementById("toggleBar").addEventListener("click", function () {
  const ctx = document.getElementById("progressBarChart");
  ctx.style.display = ctx.style.display === "none" ? "block" : "none";
  this.classList.toggle("green");
  this.classList.toggle("red");
  if (ctx.style.display === "block" && !barChart) {
    // Vẽ Bar Chart
    const res = getBarData(exampleTasks);
    barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: res.weeks,
        datasets: [{
          label: "completed",
          data: res.values,
          backgroundColor: "#42a5f5"
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { callback: value => value + "%" } }
        }
      }
    });
  }
});
       document.addEventListener("DOMContentLoaded", function() {
            // Event listener for back button
            const goToHqScreen = document.getElementById('back-to-home');
            if(goToHqScreen) {
                goToHqScreen.addEventListener('click', function() {
                    window.location.href = `../screen-hq/hq-index.html`;
                });
            }

            // Fetch tasks and render them
            async function loadTasks() {
                try {
                    const response = await fetch('data.json');
                    console.log('Fetch response:', response);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const tasks = await response.json();
                    console.log('Tasks loaded:', tasks);
                    return tasks;
                } catch (error) {
                    console.error('Error loading tasks:', error);
                    return [];
                }
            }

            function renderTasks(tasks) {
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = ''; // Clear the existing list

                tasks.forEach((task) => {
                    const taskDiv = document.createElement('div');
                    taskDiv.classList.add('task-item');
                    taskDiv.innerHTML = `
                        <div class="task-name">${task.name}</div>
                        <div class="task-status">${task.status}</div>
                        <div class="task-dates">From: ${task.startDate} To: ${task.endDate}</div>
                    `;
                    taskList.appendChild(taskDiv);
                });
            }

            // Event listeners for filter buttons
            const filterButtons = document.querySelectorAll('#task-filters button');
            filterButtons.forEach((button) => {
                button.addEventListener('click', function() {
                    const status = button.dataset.status;
                    filterTasksByStatus(status);
                });
            });

            // Filter tasks by status
            function filterTasksByStatus(status) {
                const filteredTasks = tasks.filter(task => task.status.toLowerCase() === status);
                renderTasks(filteredTasks);
            }

            // Event listener for date filter
            const dateFilter = document.getElementById('task-date-filter');
            dateFilter.addEventListener('change', function(event) {
                const selectedDate = event.target.value;
                filterTasksByDate(selectedDate);
            });

            // Filter tasks by selected date
            function filterTasksByDate(date) {
                const filteredTasks = tasks.filter(task => task.startDate === date || task.endDate === date);
                renderTasks(filteredTasks);
            }

            // Initially load all tasks
            loadTasks();
        });