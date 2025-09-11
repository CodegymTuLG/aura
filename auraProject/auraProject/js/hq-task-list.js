  // ===== DOM Elements =====
  const goToHQTasksButton = document.getElementById("go-to-hq-tasks");
  const goToTaskListButton = document.getElementById("go-to-task-list");
  const createTaskButton = document.getElementById("go-to-create-task");
  const storeListButton = document.getElementById("go-to-store-list");
  const viewReportButton = document.getElementById("go-to-reports");
  const storeScreenButton = document.getElementById("store-screen");

  const taskSearchInput = document.getElementById("taskSearch");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const weekFilterHeader = document.getElementById("weekFilter");
  const respFilterHeader = document.getElementById("respFilter");
  const taskTableBody = document.getElementById('taskTableBody');
  const timeFilterToggleButton = document.getElementById("time-filter-toggle");

  const togglePieButton = document.getElementById("togglePie");
  const toggleBarButton = document.getElementById("toggleBar");
  const pieChartCanvas = document.getElementById("progressPieChart");
  const barChartCanvas = document.getElementById("progressBarChart");
  const loadingOverlay = document.getElementById("loading-overlay");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const mainContainer = document.querySelector('.container');

  // ===== State =====
  let allTasks = [];
  let activeWeekFilter = null;
  let activeRespFilter = null;
  let timeFilterMode = 'this_week'; // 'this_week' or 'all'
  let pieChart, barChart;

  // ===== API & Helpers =====
  const getAPIBaseURL = () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost/auraProject/api'
      : 'https://auraorientalis.vn/auraProject/api';
  };
  const API_URL = getAPIBaseURL();

  function updateProgress(percentage) {
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${Math.round(percentage)}%`;
  }

  async function loadTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks.php`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error loading tasks:', error);
      taskTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Failed to load tasks.</td></tr>`;
      return [];
    }
  }

  const getISOWeek = (dateStr) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // ===== Navigation =====
  const redirectTo = (path) => window.location.href = path;
  goToHQTasksButton.addEventListener('click', () => redirectTo('hq-store.html'));
  goToTaskListButton.addEventListener('click', () => redirectTo('hq-task-list.html'));
  createTaskButton.addEventListener('click', () => redirectTo('hq-create-task.html'));
  storeListButton.addEventListener('click', () => redirectTo('hq-store-detail.html'));
  viewReportButton.addEventListener('click', () => redirectTo('hq-report.html'));
  storeScreenButton.addEventListener('click', () => redirectTo('index.html'));

  // ===== Rendering & Filtering =====
  function renderTable(tasks) {
    if (tasks.length === 0) {
      taskTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No tasks match the current filters.</td></tr>`;
      return;
    }

    const tableHtml = tasks.map((task, index) => {
      // Note: The fields 'progress' and 'unable' are not in the standard task object from tasks.php
      // I'll use placeholders. You might need to adjust this based on your actual API response.
      return `
        <tr>
          <td>${index + 1}</td>
          <td>W${task.isoWeek}</td>
          <td>${task.department_name || 'N/A'}</td>
          <td>
            <div class="task-name">${task.task_name}</div>
            <div class="task-dates">${task.start_date} → ${task.end_date}</div>
          </td>
          <td>${task.progress || '0 / 0'}</td>
          <td>${task.unable || 0}</td>
          <td><span class="status ${task.status_name?.toLowerCase().replace(' ', '') || 'waiting'}">${task.status_name || 'Waiting'}</span></td>
        </tr>
      `;
    }).join('');
    taskTableBody.innerHTML = tableHtml;
  }

  function filterAndRender() {
    const search = taskSearchInput.value.toLowerCase();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    let filtered = allTasks;

    // 1. Filter by time mode (This Week / All)
    if (timeFilterMode === 'this_week') {
        const today = new Date();
        const currentWeekNumber = getISOWeek(today.toISOString());
        filtered = filtered.filter(t => t.isoWeek === currentWeekNumber);
    }

    filtered = filtered.filter(t => {
      const nameMatch = t.task_name.toLowerCase().includes(search);
      const weekMatch = !activeWeekFilter || `W${t.isoWeek}` === activeWeekFilter;
      const respMatch = !activeRespFilter || t.department_name === activeRespFilter;
      const startMatch = !startDate || t.start_date >= startDate;
      const endMatch = !endDate || t.end_date <= endDate;
      return nameMatch && weekMatch && respMatch && startMatch && endMatch;
    });

    renderTable(filtered);
  }

  // ===== Chart Logic =====
  function getPieData(tasks) {
    const statusCounts = { 'Done': 0, 'On Progress': 0, 'Not Yet': 0, 'Overdue': 0 };
    tasks.forEach(t => {
      if (statusCounts[t.status_name] !== undefined) {
        statusCounts[t.status_name]++;
      }
    });
    return {
        labels: ["Done", "On Progress", "Not Yet", "Overdue"],
        data: [statusCounts['Done'], statusCounts['On Progress'], statusCounts['Not Yet'], statusCounts['Overdue']]
    };
  }

  function getBarData(tasks) {
    const grouped = {};
    tasks.forEach(t => {
      const week = `W${t.isoWeek}`;
      if (!grouped[week]) grouped[week] = { done: 0, total: 0 };
      grouped[week].total++;
      if (t.status_name === "Done") grouped[week].done++;
    });
    const weeks = Object.keys(grouped).sort();
    const values = weeks.map(w => (grouped[w].done / grouped[w].total * 100).toFixed(1));
    return { weeks, values };
  }

  function drawPieChart() {
    if (pieChart) pieChart.destroy();
    const { labels, data } = getPieData(allTasks);
    pieChart = new Chart(pieChartCanvas, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ["#43a047", "#42a5f5", "#eeeeee", "#d32f2f"],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } }
      }
    });
  }

  function drawBarChart() {
    if (barChart) barChart.destroy();
    const { weeks, values } = getBarData(allTasks);
    barChart = new Chart(barChartCanvas, {
      type: "bar",
      data: {
        labels: weeks,
        datasets: [{
          label: "% Done",
          data: values,
          backgroundColor: "#42a5f5"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { callback: value => value + "%" } }
        }
      }
    });
  }

  function toggleChart(canvas, button, chartType) {
      const isHidden = canvas.style.display === "none";
      canvas.style.display = isHidden ? "block" : "none";
      button.classList.toggle("green", isHidden);
      button.classList.toggle("red", !isHidden);

      if (isHidden) {
          if (chartType === 'pie' && !pieChart) drawPieChart();
          if (chartType === 'bar' && !barChart) drawBarChart();
      }
  }

  // ===== Event Listeners =====
  taskSearchInput.addEventListener("input", debounce(filterAndRender, 300));
  startDateInput.addEventListener("change", filterAndRender);
  endDateInput.addEventListener("change", filterAndRender);

  timeFilterToggleButton.addEventListener('click', () => {
    if (timeFilterMode === 'this_week') {
        timeFilterMode = 'all';
        timeFilterToggleButton.textContent = 'All Tasks';
        timeFilterToggleButton.classList.replace('green', 'red');
    } else {
        timeFilterMode = 'this_week';
        timeFilterToggleButton.textContent = 'This Week';
        timeFilterToggleButton.classList.replace('red', 'green');
    }
    filterAndRender();
  });

  weekFilterHeader.addEventListener("click", () => {
    activeWeekFilter = activeWeekFilter ? null : "W28"; // Example filter
    filterAndRender();
  });

  respFilterHeader.addEventListener("click", () => {
    activeRespFilter = activeRespFilter ? null : "PLANNING"; // Example filter
    filterAndRender();
  });

  togglePieButton.addEventListener("click", () => toggleChart(pieChartCanvas, togglePieButton, 'pie'));
  toggleBarButton.addEventListener("click", () => toggleChart(barChartCanvas, toggleBarButton, 'bar'));

  // ===== Initial Load =====
  async function initialize() {
    updateProgress(10);

    allTasks = await loadTasks();
    updateProgress(50);

    // Pre-calculate week numbers for performance
    allTasks.forEach(task => {
        task.isoWeek = getISOWeek(task.start_date);
    });
    updateProgress(60);

    filterAndRender();
    updateProgress(70);

    // Default to showing both charts
    pieChartCanvas.style.display = "block";
    togglePieButton.classList.add("green");
    togglePieButton.classList.remove("red");
    drawPieChart();
    updateProgress(85);

    barChartCanvas.style.display = "block";
    toggleBarButton.classList.add("green");
    toggleBarButton.classList.remove("red");
    drawBarChart();
    updateProgress(100);

    // Hide loading overlay and show content
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        mainContainer.style.display = 'block';
    }, 500); // Đợi 0.5s để người dùng thấy 100%
  }

  initialize();
