/**
 * HQ Task List & Reports - Combined logic for the main dashboard page.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ===================================
  //  DOM Elements
  // ===================================
  const goToHQTasksButton = document.getElementById("go-to-hq-tasks");
  const goToTaskListButton = document.getElementById("go-to-task-list");
  const createTaskButton = document.getElementById("go-to-create-task");
  const storeListButton = document.getElementById("go-to-store-list");
  const viewReportButton = document.getElementById("go-to-reports");
  const storeScreenButton = document.getElementById("store-screen");

  // --- Task List Elements ---
  const taskSearchInput = document.getElementById("taskSearch");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const mainTaskListHeader = document.querySelector('#main-task-list-table thead');
  const taskTableBody = document.getElementById('taskTableBody');
  const paginationContainer = document.getElementById('pagination-container');
  const timeFilterToggleButton = document.getElementById("time-filter-toggle");

  const togglePieButton = document.getElementById("togglePie");
  const toggleBarButton = document.getElementById("toggleBar");
  const pieChartCanvas = document.getElementById("progressPieChart");
  const barChartCanvas = document.getElementById("progressBarChart");
  const loadingOverlay = document.getElementById("loading-overlay"); // Now inside report-content
  const progressBar = document.getElementById("progress-bar"); // Now inside report-content
  const progressText = document.getElementById("progress-text"); // Now inside report-content
  const contentWrapper = document.getElementById('content-wrapper'); // Wrapper for split-view

  const reportContent = document.getElementById('report-content');
  const filterPopup = document.getElementById('filter-popup');
  const exportCsvButton = document.getElementById('export-csv');

  // --- Report Elements ---
  // These will be assigned when the report is initialized to avoid errors on page load
  let yearFilter, quarterFilter, monthFilter, taskCompletionChartCanvas, taskReviewBarChartCanvas, taskTable, taskTable2;

  // ===================================
  //  State
  // ===================================
  let allTasks = [];
  let allStores = [];
  let filteredTasks = []; // Tasks after filtering, sorting

  // --- Task List State ---
  let timeFilterMode = 'this_week'; // 'this_week' or 'all'
  let pieChart, barChart;
  let currentPage = 1;
  let sortConfig = { column: null, direction: 'asc' };
  let columnFilters = {};
  const tasksPerPage = 25;

  // --- Report State ---
  let isReportInitialized = false;
  let isReportReady = false;
  let storeCompletionChart, deptStatsChart;

  // ===================================
  //  API & Helpers
  // ===================================
  const getAPIBaseURL = () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost/auraProject/api'
      : 'https://auraorientalis.vn/auraProject/api';
  };
  const API_URL = getAPIBaseURL();

  function updateProgress(percentage) {
    if (progressBar && progressText) {
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}%`;
    }
  }

  async function fetchFromAPI(endpoint) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${endpoint}:`, error);
      return [];
    }
  }

  const getISOWeek = (dateStr) => {
    if (!dateStr) return null;
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

  // ===================================
  //  Excel-like Filter Popup Logic
  // ===================================
  function showFilterPopup(targetHeader) {
    const column = targetHeader.dataset.column;
    if (!column) return;

    const rect = targetHeader.getBoundingClientRect();
    filterPopup.style.left = `${rect.left}px`;
    filterPopup.style.top = `${rect.bottom + window.scrollY}px`;

    // Get unique values for the column
    const uniqueValues = [...new Set(allTasks.map(task => {
        if (column === 'isoWeek') return `W${task.isoWeek}`;
        return task[column] || '(Blank)';
    }))].sort();

    // Build popup content
    filterPopup.innerHTML = `
        <div class="filter-popup-actions">
            <button id="sort-asc">Sort A to Z</button>
            <button id="sort-desc">Sort Z to A</button>
        </div>
        <input type="text" id="filter-search" class="filter-popup-search" placeholder="Search...">
        <div id="filter-list" class="filter-popup-list">
            <label><input type="checkbox" id="select-all-filter" checked> (Select All)</label>
            ${uniqueValues.map(val => `<label><input type="checkbox" class="filter-item" value="${val}" checked> ${val}</label>`).join('')}
        </div>
        <div class="filter-popup-footer">
            <button id="filter-apply">OK</button>
            <button id="filter-cancel">Cancel</button>
        </div>
    `;

    filterPopup.style.display = 'flex';

    // --- Add event listeners for the new popup ---
    document.getElementById('sort-asc').onclick = () => {
        sortConfig = { column, direction: 'asc' };
        applyFiltersAndClosePopup();
    };
    document.getElementById('sort-desc').onclick = () => {
        sortConfig = { column, direction: 'desc' };
        applyFiltersAndClosePopup();
    };

    const filterSearch = document.getElementById('filter-search');
    const filterList = document.getElementById('filter-list');
    filterSearch.oninput = () => {
        const searchTerm = filterSearch.value.toLowerCase();
        filterList.querySelectorAll('label').forEach(label => {
            if (label.querySelector('#select-all-filter')) return; // Skip "Select All"
            const text = label.textContent.toLowerCase();
            label.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    };

    const selectAllCheckbox = document.getElementById('select-all-filter');
    const itemCheckboxes = filterList.querySelectorAll('.filter-item');
    selectAllCheckbox.onchange = () => {
        itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
    };

    itemCheckboxes.forEach(cb => {
        cb.onchange = () => {
            const allChecked = [...itemCheckboxes].every(item => item.checked);
            selectAllCheckbox.checked = allChecked;
        };
    });

    document.getElementById('filter-apply').onclick = () => {
        const selectedValues = new Set();
        itemCheckboxes.forEach(cb => {
            if (cb.checked) {
                selectedValues.add(cb.value);
            }
        });
        columnFilters[column] = selectedValues;
        applyFiltersAndClosePopup();
    };

    document.getElementById('filter-cancel').onclick = () => {
        filterPopup.style.display = 'none';
    };
  }

  function applyFiltersAndClosePopup() {
    currentPage = 1;
    filterAndRender();
    updateActiveFilterHeaders();
    filterPopup.style.display = 'none';
  }

  function updateActiveFilterHeaders() {
      mainTaskListHeader.querySelectorAll('th[data-column]').forEach(th => {
          const column = th.dataset.column;
          const hasFilter = columnFilters[column] && columnFilters[column].size > 0;
          const hasSort = sortConfig.column === column;
          if (hasFilter || hasSort) {
              th.classList.add('active-filter');
          } else {
              th.classList.remove('active-filter');
          }
      });
  }

  // Close popup if clicked outside
  document.addEventListener('click', (e) => {
      if (filterPopup.style.display === 'flex' && !filterPopup.contains(e.target) && !e.target.closest('.clickable')) {
          filterPopup.style.display = 'none';
      }
  });

  // ===================================
  //  Navigation
  // ===================================
  const redirectTo = (path) => window.location.href = path;
  goToHQTasksButton.addEventListener('click', () => redirectTo('hq-store.html'));
  goToTaskListButton.addEventListener('click', () => redirectTo('hq-task-list.html'));
  createTaskButton.addEventListener('click', () => redirectTo('hq-create-task.html'));
  storeListButton.addEventListener('click', () => redirectTo('hq-store-detail.html'));
  storeScreenButton.addEventListener('click', () => redirectTo('index.html'));

  // ===================================
  //  Task List Logic
  // ===================================
  function renderTable(tasks) {
    if (tasks.length === 0) {
      taskTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No tasks match the current filters.</td></tr>`;
      return;
    }
 
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    const tableHtml = paginatedTasks.map((task, index) => {
      const taskNumber = startIndex + index + 1;
      return `
        <tr class="task-row" data-task-index="${startIndex + index}" style="cursor: pointer;">
          <td>${taskNumber}</td>
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

  function renderPagination(totalTasks) {
    const totalPages = Math.ceil(totalTasks / tasksPerPage);
    paginationContainer.innerHTML = ''; // Clear old pagination

    if (totalPages <= 1) {
        return;
    }

    let paginationHtml = '';
    const maxVisibleButtons = 5;

    // << (Previous 5 pages) and < (Previous page) buttons
    paginationHtml += `<button class="page-btn" data-page="${Math.max(1, currentPage - 5)}" ${currentPage <= 1 ? 'disabled' : ''}>&lt;&lt;</button>`;
    paginationHtml += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>`;

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisibleButtons) {
        const half = Math.floor(maxVisibleButtons / 2);
        startPage = currentPage - half;
        endPage = currentPage + half;

        if (startPage < 1) {
            startPage = 1;
            endPage = maxVisibleButtons;
        }

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - maxVisibleButtons + 1;
        }
    }

    // Ellipsis at the beginning
    if (startPage > 1) {
        paginationHtml += `<button class="page-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            paginationHtml += `<span class="page-btn" style="cursor:default; border:none; background:none;">...</span>`;
        }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    // Ellipsis at the end
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += `<span class="page-btn" style="cursor:default; border:none; background:none;">...</span>`;
        }
        paginationHtml += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // > (Next page) and >> (Next 5 pages) buttons
    paginationHtml += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>`;
    paginationHtml += `<button class="page-btn" data-page="${Math.min(totalPages, currentPage + 5)}" ${currentPage >= totalPages ? 'disabled' : ''}>&gt;&gt;</button>`;

    paginationContainer.innerHTML = paginationHtml;

    // Add event listeners to new buttons
    document.querySelectorAll('.page-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const page = parseInt(e.target.dataset.page);
            if (page) {
                currentPage = page;
                filterAndRender();
            }
        });
    });
  }

  function filterAndRender() {
    // Reset to first page if filters change, but not if it's a pagination click
    const search = taskSearchInput.value.toLowerCase();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Reset to first page if filters change, but not if it's a pagination click
    // This is handled by the event listeners that call this function.

    let filtered = allTasks;

    // 1. Filter by time mode (This Week / All)
    if (timeFilterMode === 'this_week') {
        const today = new Date();
        const currentWeekNumber = getISOWeek(today.toISOString());
        const currentYear = today.getFullYear();
        filtered = filtered.filter(t => {
            const taskYear = new Date(t.start_date).getFullYear();
            return t.isoWeek === currentWeekNumber && taskYear === currentYear;
        });
    }

    // 2. Filter by column filters
    Object.keys(columnFilters).forEach(column => {
        const filterValues = columnFilters[column];
        if (filterValues && filterValues.size > 0) {
            filtered = filtered.filter(task => { 
                let taskValue = task[column];
                if (column === 'isoWeek') taskValue = `W${taskValue}`;
                if (taskValue === null || taskValue === undefined) taskValue = '(Blank)';
                return filterValues.has(String(taskValue)); 
            });
        }
    });

    // 3. Filter by general search, date range
    if (search || startDate || endDate) {
        filtered = filtered.filter(t => {
            const nameMatch = !search || t.task_name.toLowerCase().includes(search);
            const startMatch = !startDate || t.start_date >= startDate;
            const endMatch = !endDate || t.end_date <= endDate;
            return nameMatch && startMatch && endMatch;
        });
    }

    // 4. Apply sorting
    if (sortConfig.column) {
        filtered.sort((a, b) => {
            let valA = a[sortConfig.column];
            let valB = b[sortConfig.column];
            
            // Handle 'progress' column (e.g., "10 / 20") by calculating percentage
            if (sortConfig.column === 'progress') {
                const [doneA, totalA] = (valA || '0 / 0').split(' / ').map(Number);
                const [doneB, totalB] = (valB || '0 / 0').split(' / ').map(Number);
                valA = totalA > 0 ? doneA / totalA : 0;
                valB = totalB > 0 ? doneB / totalB : 0;
            }

            // Handle null/undefined values
            if (valA == null) valA = sortConfig.direction === 'asc' ? Infinity : -Infinity;
            if (valB == null) valB = sortConfig.direction === 'asc' ? Infinity : -Infinity;

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
            }

            return sortConfig.direction === 'asc' 
                ? String(valA).localeCompare(String(valB)) 
                : String(valB).localeCompare(String(valA));
        });
    }
    
    filteredTasks = filtered; // Update the global state
    renderTable(filteredTasks);
    renderPagination(filteredTasks.length);
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

  /**
   * Exports the currently filtered task data to a CSV file.
   */
  function exportToCSV() {
      if (filteredTasks.length === 0) {
          alert("No data to export.");
          return;
      }

      // Define CSV headers based on the table
      const headers = [
          "No.", "Week", "Department", "Task", "Start Date", "End Date", "Progress", "Stores Unable", "Status"
      ];

      // Map filtered data to CSV rows, ensuring proper quoting for strings
      const rows = filteredTasks.map((task, index) => [
          index + 1,
          `W${task.isoWeek}`,
          `"${(task.department_name || 'N/A').replace(/"/g, '""')}"`,
          `"${(task.task_name || 'N/A').replace(/"/g, '""')}"`,
          task.start_date || '',
          task.end_date || '',
          `"${task.progress || '0 / 0'}"`,
          task.unable || 0,
          `"${(task.status_name || 'N/A').replace(/"/g, '""')}"`
      ]);

      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `task_list_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  // ===================================
  //  Report Logic (Merged)
  // ===================================
  async function initializeReport() {
    if (isReportInitialized) return;

    updateProgress(0);

    // 1. Assign report DOM elements
    yearFilter = document.getElementById('year-filter');
    quarterFilter = document.getElementById('quarter-filter');
    monthFilter = document.getElementById('month-filter');
    taskCompletionChartCanvas = document.getElementById('taskCompletionChart');
    taskReviewBarChartCanvas = document.getElementById('taskReviewBarChart');
    taskTable = document.getElementById('task-table');
    taskTable2 = document.getElementById('task-table2');

    // 2. Fetch additional data required for reports
    updateProgress(10);
    allStores = await fetchFromAPI('store_master.php');
    updateProgress(30);

    // 3. Render initial charts for the main view (now part of report init)
    pieChartCanvas.style.display = "block";
    togglePieButton.classList.add("green");
    togglePieButton.classList.remove("red");
    drawPieChart();
    updateProgress(50);

    barChartCanvas.style.display = "block";
    toggleBarButton.classList.add("green");
    toggleBarButton.classList.remove("red");
    drawBarChart();
    updateProgress(70);

    // 4. Populate filters and render detailed report sections
    populateFilterOptions();
    renderReports();
    updateProgress(100);

    yearFilter.addEventListener('change', handleFilterChange);
    quarterFilter.addEventListener('change', handleFilterChange);
    monthFilter.addEventListener('change', handleFilterChange);

    isReportInitialized = true;
  }

  function populateFilterOptions() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

    const years = [...new Set(allTasks.map(t => new Date(t.start_date).getFullYear()))].sort((a, b) => b - a);
    yearFilter.innerHTML = years.map(y => `<option value="${y}" ${y === currentYear ? 'class="current-period"' : ''}>${y}</option>`).join('');
    yearFilter.value = currentYear;

    const months = [
        "all-months", "month-1", "month-2", "month-3", "month-4", "month-5", "month-6",
        "month-7", "month-8", "month-9", "month-10", "month-11", "month-12"
    ];
    monthFilter.innerHTML = months.map((key, i) => {
        const value = i === 0 ? 'all' : i;
        const translatedText = typeof translate === 'function' ? translate(key) : key;
        return `<option value="${value}" ${i === currentMonth ? 'class="current-period"' : ''} data-i18n-key="${key}">${translatedText}</option>`;
    }).join('');
    monthFilter.value = currentMonth;

    const quarterOption = quarterFilter.querySelector(`option[value="${currentQuarter}"]`);
    if (quarterOption) quarterOption.classList.add('current-period');
    quarterFilter.value = 'all';
  }

  function getWeeksForFilter(filters) {
    const { year, quarter, month } = filters;
    if (month !== 'all') {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        const startWeek = getISOWeek(start.toISOString());
        const endWeek = getISOWeek(end.toISOString());
        return Array.from({ length: endWeek - startWeek + 1 }, (_, i) => `W${startWeek + i}`);
    }
    if (quarter !== 'all') {
        const startMonth = (quarter - 1) * 3;
        const start = new Date(year, startMonth, 1);
        const end = new Date(year, startMonth + 3, 0);
        const startWeek = getISOWeek(start.toISOString());
        const endWeek = getISOWeek(end.toISOString());
        return Array.from({ length: endWeek - startWeek + 1 }, (_, i) => `W${startWeek + i}`);
    }
    // Default to all weeks in the year if no specific filter
    return Array.from({ length: 53 }, (_, i) => `W${i + 1}`);
  }

  function processReportData(filters) {
    const weeks = getWeeksForFilter(filters);
    const weekSet = new Set(weeks);

    const filteredTasks = allTasks.filter(task => {
        if (!task.start_date || !task.isoWeek) return false;
        const taskDate = new Date(task.start_date);
        const weekLabel = `W${task.isoWeek}`;
        return taskDate.getFullYear() == filters.year && weekSet.has(weekLabel);
    });

    // --- Store Stats ---
    const storeWeeklyStats = {};
    filteredTasks.forEach(task => {
        if (!task.isoWeek) return;
        const weekLabel = `W${task.isoWeek}`;
        const storeId = task.store_id;
        storeWeeklyStats[storeId] = storeWeeklyStats[storeId] || {};
        storeWeeklyStats[storeId][weekLabel] = storeWeeklyStats[storeId][weekLabel] || { done: 0, total: 0 };
        storeWeeklyStats[storeId][weekLabel].total++;
        if (task.status_name === 'Done') storeWeeklyStats[storeId][weekLabel].done++;
    });

    const storeData = allStores.map(store => {
        const weeklyData = weeks.map(weekLabel => {
            const stats = storeWeeklyStats[store.store_id]?.[weekLabel];
            return stats && stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
        });
        return { store: store.store_name, data: weeklyData };
    }).sort((a, b) => {
        const avgA = a.data.reduce((sum, val) => sum + val, 0) / (a.data.length || 1);
        const avgB = b.data.reduce((sum, val) => sum + val, 0) / (b.data.length || 1);
        return avgB - avgA;
    });

    const deptWeeklyStats = {};
    filteredTasks.forEach(task => {
        if (!task.isoWeek) return;
        const weekLabel = `W${task.isoWeek}`;
        const deptName = task.department_name || 'Unknown';
        const isPlanned = task.key_work && task.key_work.trim() !== '';
        
        deptWeeklyStats[deptName] = deptWeeklyStats[deptName] || {};
        deptWeeklyStats[deptName][weekLabel] = deptWeeklyStats[deptName][weekLabel] || { planned: 0, unplanned: 0 };

        if (isPlanned) deptWeeklyStats[deptName][weekLabel].planned++;
        else deptWeeklyStats[deptName][weekLabel].unplanned++;
    });

    const deptData = Object.keys(deptWeeklyStats).map(deptName => {
        const weeklyPlanned = weeks.map(weekLabel => deptWeeklyStats[deptName][weekLabel]?.planned || 0);
        const weeklyUnplanned = weeks.map(weekLabel => deptWeeklyStats[deptName][weekLabel]?.unplanned || 0);
        return {
            dept: deptName,
            planned: weeklyPlanned,
            unplanned: weeklyUnplanned
        };
    }).sort((a, b) => a.dept.localeCompare(b.dept));

    return { weeks, storeData, deptData };
  }

  function renderStoreCompletionTable(storeData, weeks) {
    if (!taskTable) return;
    const translatedStore = typeof translate === 'function' ? translate('store') : 'Store';
    const translatedAverage = typeof translate === 'function' ? translate('average') : 'Average';

    taskTable.querySelector('thead tr').innerHTML = `
        <th>${translatedStore}</th>
        ${weeks.map(w => `<th>${w}</th>`).join('')}
        <th>${translatedAverage}</th>
    `;
    taskTable.querySelector('tbody').innerHTML = storeData.map(store => {
        const average = store.data.length > 0 ? store.data.reduce((a, b) => a + b, 0) / store.data.length : 0;
        return `
            <tr>
                <td>${store.store}</td>
                ${store.data.map(d => `<td>${d.toFixed(2)}%</td>`).join("")}
                <td><b>${average.toFixed(2)}%</b></td>
            </tr>
        `;
    }).join('');
  }

  function renderDeptStatsTable(taskData, weeks) {
    if (!taskTable2) return;
    const headerHtml = `
        <thead>
            <tr>
                <th rowspan="2">${typeof translate === 'function' ? translate('department') : 'Department'}</th>
                ${weeks.map(w => `<th colspan="2">${w}</th>`).join('')}
                <th rowspan="2">${typeof translate === 'function' ? translate('total-tasks') : 'Total'}</th>
                <th rowspan="2">${typeof translate === 'function' ? translate('planned-percent') : '% Planned'}</th>
                <th rowspan="2">${typeof translate === 'function' ? translate('unplanned-percent') : '% Unplanned'}</th>
            </tr>
            <tr>
                ${weeks.map(() => `<th>${typeof translate === 'function' ? translate('planned') : 'P'}</th><th>${typeof translate === 'function' ? translate('unplanned') : 'U'}</th>`).join('')}
            </tr>
        </thead>
    `;
    const bodyHtml = taskData.map(department => {
        const totalPlanned = department.planned.reduce((a, b) => a + b, 0);
        const totalUnplanned = department.unplanned.reduce((a, b) => a + b, 0);
        const totalTasks = totalPlanned + totalUnplanned;
        const plannedPercentage = totalTasks > 0 ? ((totalPlanned / totalTasks) * 100).toFixed(2) : 0;
        const unplannedPercentage = totalTasks > 0 ? ((totalUnplanned / totalTasks) * 100).toFixed(2) : 0;
        return `
            <tr>
                <td>${department.dept}</td>
                ${department.planned.map((p, i) => `<td>${p}</td><td>${department.unplanned[i]}</td>`).join('')}
                <td>${totalTasks}</td>
                <td>${plannedPercentage}%</td>
                <td>${unplannedPercentage}%</td>
            </tr>
        `;
    }).join('');
    taskTable2.innerHTML = `${headerHtml}<tbody>${bodyHtml}</tbody>`;
  }

  function drawStoreCompletionChart(data, weeks) {
    if (storeCompletionChart) storeCompletionChart.destroy();
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
        return color;
    };
    storeCompletionChart = new Chart(taskCompletionChartCanvas, {
        type: 'line',
        data: {
            labels: weeks,
            datasets: data.map(store => ({
                label: store.store,
                data: store.data,
                borderColor: getRandomColor(),
                fill: false,
                tension: 0.1,
                borderWidth: 2
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { min: 0, max: 100, ticks: { stepSize: 10 } }
            }
        }
    });
  }

  function drawDeptStatsChart(taskData, weeks) {
    if (deptStatsChart) deptStatsChart.destroy();
    deptStatsChart = new Chart(taskReviewBarChartCanvas, {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [
                ...taskData.map((department, index) => ({
                    label: department.dept + ' Planned',
                    data: department.planned,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    stack: `Stack ${index}`
                })),
                ...taskData.map((department, index) => ({
                    label: department.dept + ' Unplanned',
                    data: department.unplanned,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    stack: `Stack ${index}`
                }))
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
    });
  }

  function renderReports() {
    const filters = {
        year: yearFilter.value,
        quarter: quarterFilter.value,
        month: monthFilter.value,
    };
    const { weeks, storeData, deptData } = processReportData(filters);

    renderStoreCompletionTable(storeData, weeks);
    drawStoreCompletionChart(storeData, weeks);
    renderDeptStatsTable(deptData, weeks);
    drawDeptStatsChart(deptData, weeks);
  }

  function handleFilterChange() {
    if (monthFilter.value !== 'all') {
        quarterFilter.value = 'all';
    } else if (quarterFilter.value !== 'all') {
        monthFilter.value = 'all';
    }
    renderReports();
  }

  // ===================================
  //  Event Listeners
  // ===================================
  const debouncedFilter = debounce(() => {
    currentPage = 1; // Reset page when filtering
    filterAndRender();
  }, 300);

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
    debouncedFilter();
  });

  mainTaskListHeader.addEventListener("click", (e) => {
    const header = e.target.closest('th.clickable');
    if (header) showFilterPopup(header);
  });

  taskTableBody.addEventListener('click', (e) => {
      const row = e.target.closest('.task-row');
      if (!row) return;

      const taskIndex = parseInt(row.dataset.taskIndex, 10);
      const task = filteredTasks[taskIndex];

      if (task) {
          window.location.href = `detail-task.html?id=${task.task_id}`;
      }
  });

  togglePieButton.addEventListener("click", () => toggleChart(pieChartCanvas, togglePieButton, 'pie'));
  toggleBarButton.addEventListener("click", () => toggleChart(barChartCanvas, toggleBarButton, 'bar'));
  exportCsvButton.addEventListener('click', exportToCSV);

  viewReportButton.addEventListener('click', () => {
    const isSplitView = contentWrapper.classList.toggle('split-view');
    viewReportButton.classList.toggle('active-report', isSplitView);
  
    if (isSplitView) {
      reportContent.style.display = 'block';
      // Only initialize and show loading on the very first click
      if (!isReportInitialized) {
        loadingOverlay.classList.add('visible'); // Show loading
        initializeReport().then(() => {
            // Once done, hide loading
            loadingOverlay.classList.remove('visible');
            isReportReady = true;
        });
      }
    } else {
      reportContent.style.display = 'none';
    }
  });

  // ===================================
  //  Initial Load
  // ===================================
  async function initialize() {
    // 1. Fetch data and render the main task list immediately
    allTasks = await fetchFromAPI('tasks.php');
    allTasks.forEach(task => { 
        task.isoWeek = getISOWeek(task.start_date); 
    });
    // Render only the task list, no report/chart processing
    filterAndRender();
  }
  initialize();
});
