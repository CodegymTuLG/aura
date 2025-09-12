/**
 * HQ Reports - Logic for displaying report charts and tables.
 * Encapsulated to avoid global scope pollution.
 */
(function () {
    'use strict';

    //================================================================================
    // I. CONFIG & CONSTANTS
    //================================================================================

    const API_URL = (() => {
        return window.location.hostname === 'localhost'
            ? 'http://localhost/auraProject/api'
            : 'https://auraorientalis.vn/auraProject/api';
    })();

    //================================================================================
    // II. DOM ELEMENTS
    //================================================================================

    const dom = {
        taskTableBody: document.querySelector("#task-table tbody"),
        taskTableBody2: document.querySelector("#task-table2 tbody"),
        taskTableHeader: document.querySelector("#task-table thead tr"),
        taskTableHeader2: document.querySelector("#task-table2"),
        taskCompletionChartCanvas: document.getElementById('taskCompletionChart'),
        taskReviewBarChartCanvas: document.getElementById('taskReviewBarChart'),
        // Filters
        yearFilter: document.getElementById('year-filter'),
        quarterFilter: document.getElementById('quarter-filter'),
        monthFilter: document.getElementById('month-filter'),
        // Navigation
        goToHQTasksButton: document.getElementById('go-to-hq-tasks'),
        goToTaskListButton: document.getElementById('go-to-task-list'),
        goToCreateTaskButton: document.getElementById('go-to-create-task'),
        goToStoreListButton: document.getElementById('go-to-store-list'),
        goToReportsButton: document.getElementById('go-to-reports'),
        goToStoreScreenButton: document.getElementById('store-screen'),
        // Loading Overlay
        loadingOverlay: document.getElementById("loading-overlay"),
        progressBar: document.getElementById("progress-bar"),
        progressText: document.getElementById("progress-text"),
        mainContainer: document.querySelector('.container'),
    };

    //================================================================================
    // III. STATE MANAGEMENT
    //================================================================================

    const state = {
        allTasks: [],
        allStores: [],
        filters: {
            year: new Date().getFullYear(),
            quarter: 'all',
            month: 'all',
        },
    };


    //================================================================================
    // III. API & DATA FETCHING
    //================================================================================

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

    function fetchData() {
        return Promise.all([
            fetchFromAPI('tasks.php'),
            fetchFromAPI('store_master.php')
        ]);
    }

    //================================================================================
    // IV. UI & RENDERING
    //================================================================================

    function renderStoreCompletionTable(storeData, weeks) {
        // Update table header
        dom.taskTableHeader.innerHTML = `
            <th data-i18n-key="store">${translate('store')}</th>
            ${weeks.map(w => `<th>${w}</th>`).join('')}
            <th data-i18n-key="average">${translate('average')}</th>
        `;
        dom.taskTableBody.innerHTML = storeData.map(store => {
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
        const headerHtml = `
            <thead>
                <tr>
                    <th rowspan="2" data-i18n-key="department">${translate('department')}</th>
                    ${weeks.map(w => `<th colspan="2">${w}</th>`).join('')}
                    <th rowspan="2" data-i18n-key="total-tasks">${translate('total-tasks')}</th>
                    <th rowspan="2" data-i18n-key="planned-percent">${translate('planned-percent')}</th>
                    <th rowspan="2" data-i18n-key="unplanned-percent">${translate('unplanned-percent')}</th>
                </tr>
                <tr>
                    ${weeks.map(() => `<th data-i18n-key="planned">${translate('planned')}</th><th data-i18n-key="unplanned">${translate('unplanned')}</th>`).join('')}
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

        dom.taskTableHeader2.innerHTML = `${headerHtml}<tbody>${bodyHtml}</tbody>`;
    }

    function drawStoreCompletionChart(storeData, weeks) {
        if (window.storeCompletionChart instanceof Chart) { window.storeCompletionChart.destroy(); }
        window.storeCompletionChart = new Chart(dom.taskCompletionChartCanvas, {
            type: 'line',
            data: {
                labels: weeks,
                datasets: storeData.map(store => {
                    const color = getRandomColor();
                    return {
                        label: store.store,
                        data: store.data,
                        borderColor: color,
                        backgroundColor: color, // For legend
                        fill: false,
                        tension: 0.1,
                        borderWidth: 2 // Default border width
                    };
                })
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: { stepSize: 10 }
                    }
                }
            }
        });
    }

    function drawDeptStatsChart(taskData, weeks) {
        if (window.deptStatsChart instanceof Chart) { window.deptStatsChart.destroy(); }
        window.deptStatsChart = new Chart(dom.taskReviewBarChartCanvas, {
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
                plugins: { legend: { display: false } }, // Hide legend for clarity
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                }
            }
        });
    }

    function populateFilterOptions() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1; // 1-4

        const years = [...new Set(state.allTasks.map(t => new Date(t.start_date).getFullYear()))].sort((a, b) => b - a);
        dom.yearFilter.innerHTML = years.map(y => `<option value="${y}" ${y === currentYear ? 'class="current-period"' : ''}>${y}</option>`).join('');
        dom.yearFilter.value = state.filters.year;

        const months = [
            "all-months", "month-1", "month-2", "month-3", "month-4", "month-5", "month-6",
            "month-7", "month-8", "month-9", "month-10", "month-11", "month-12"
        ];
        dom.monthFilter.innerHTML = months.map((key, i) => {
            const value = i === 0 ? 'all' : i;
            return `<option value="${value}" ${i === currentMonth ? 'class="current-period"' : ''} data-i18n-key="${key}">${translate(key)}</option>`;
        }).join('');
        dom.monthFilter.value = state.filters.month;

        // Highlight current quarter
        const quarterOption = dom.quarterFilter.querySelector(`option[value="${currentQuarter}"]`);
        if (quarterOption) quarterOption.classList.add('current-period');
        dom.quarterFilter.value = state.filters.quarter;
    }

    function renderReports() {
        const { weeks, storeData, deptData } = processData(state.allTasks, state.allStores, state.filters);

        renderStoreCompletionTable(storeData, weeks);
        drawStoreCompletionChart(storeData, weeks);

        renderDeptStatsTable(deptData, weeks);
        drawDeptStatsChart(deptData, weeks);
    }
    //================================================================================
    // V. HELPERS & DATA PROCESSING
    //================================================================================

    function updateProgress(percentage) {
        dom.progressBar.style.width = `${percentage}%`;
        dom.progressText.textContent = `${Math.round(percentage)}%`;
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
        return color;
    }

    const getISOWeek = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    function getWeekRangeAroundToday(weeksBefore, weeksAfter) {
        const today = new Date();
        const currentWeek = getISOWeek(today.toISOString());
        const currentYear = today.getFullYear();

        const startWeek = currentWeek - weeksBefore;
        const endWeek = currentWeek + weeksAfter;
        return Array.from({ length: endWeek - startWeek + 1 }, (_, i) => `W${startWeek + i}`);
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
        // Default to a range around today if no specific filter is set
        return getWeekRangeAroundToday(3, 0);
    }

    function processData(tasks, stores, filters) {
        const weeks = getWeeksForFilter(filters);
        const weekSet = new Set(weeks);

        const filteredTasks = tasks.filter(task => {
            if (!task.start_date || !task.isoWeek) return false;
            const taskDate = new Date(task.start_date);
            const weekLabel = `W${task.isoWeek}`;
            return taskDate.getFullYear() == filters.year && weekSet.has(weekLabel);
        });

        // Group tasks by store, department, and week
        const storeWeeklyStats = {};
        const deptWeeklyStats = {};

        filteredTasks.forEach(task => {
            if (!task.isoWeek) return;
            const weekLabel = `W${task.isoWeek}`;

            // --- Store Stats ---
            const storeId = task.store_id;
            storeWeeklyStats[storeId] = storeWeeklyStats[storeId] || {};
            storeWeeklyStats[storeId][weekLabel] = storeWeeklyStats[storeId][weekLabel] || { done: 0, total: 0 };
            storeWeeklyStats[storeId][weekLabel].total++;
            if (task.status_name === 'Done') storeWeeklyStats[storeId][weekLabel].done++;

            // --- Department Stats ---
            const deptName = task.department_name || 'Unknown';
            const isPlanned = task.key_work && task.key_work.trim() !== '';
            
            deptWeeklyStats[deptName] = deptWeeklyStats[deptName] || {};
            deptWeeklyStats[deptName][weekLabel] = deptWeeklyStats[deptName][weekLabel] || { planned: 0, unplanned: 0 };

            if (isPlanned) deptWeeklyStats[deptName][weekLabel].planned++;
            else deptWeeklyStats[deptName][weekLabel].unplanned++;
        });

        // Format data for the chart and table
        const storeData = stores.map(store => {
            const weeklyData = weeks.map(weekLabel => {
                const stats = storeWeeklyStats[store.store_id]?.[weekLabel];
                return stats && stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
            });
            return { store: store.store_name, data: weeklyData };
        }).sort((a, b) => { // Sort by average descending to keep the highest performers on top
            const avgA = a.data.reduce((sum, val) => sum + val, 0) / (a.data.length || 1);
            const avgB = b.data.reduce((sum, val) => sum + val, 0) / (b.data.length || 1);
            return avgB - avgA;
        });

        // Format department data
        const deptData = Object.keys(deptWeeklyStats).map(deptName => {
            const weeklyPlanned = weeks.map(weekLabel => deptWeeklyStats[deptName][weekLabel]?.planned || 0);
            const weeklyUnplanned = weeks.map(weekLabel => deptWeeklyStats[deptName][weekLabel]?.unplanned || 0);
            return {
                dept: deptName,
                planned: weeklyPlanned,
                unplanned: weeklyUnplanned
            };
        }).sort((a, b) => a.dept.localeCompare(b.dept)); // Sort alphabetically

        return { weeks, storeData, deptData };
    }

    //================================================================================
    // VI. INITIALIZATION
    //================================================================================

    const redirectTo = (path) => window.location.href = path;

    function setupEventListeners() {
        // Navigation
        dom.goToHQTasksButton.addEventListener('click', () => redirectTo('hq-store.html'));
        dom.goToTaskListButton.addEventListener('click', () => redirectTo('hq-task-list.html'));
        dom.goToCreateTaskButton.addEventListener('click', () => redirectTo('hq-create-task.html'));
        dom.goToStoreListButton.addEventListener('click', () => redirectTo('hq-store-detail.html'));
        dom.goToReportsButton.addEventListener('click', () => redirectTo('hq-report.html'));
        dom.goToStoreScreenButton.addEventListener('click', () => redirectTo('index.html'));
    }

    function handleFilterChange() {
        state.filters.year = dom.yearFilter.value;
        state.filters.quarter = dom.quarterFilter.value;
        state.filters.month = dom.monthFilter.value;

        // Logic để đảm bảo chỉ một trong hai (quý hoặc tháng) được chọn
        if (dom.monthFilter.value !== 'all') {
            // Nếu chọn một tháng cụ thể, reset bộ lọc quý
            dom.quarterFilter.value = 'all';
            state.filters.quarter = 'all';
        } else if (dom.quarterFilter.value !== 'all') {
            // Nếu chọn một quý cụ thể, reset bộ lọc tháng
            dom.monthFilter.value = 'all';
            state.filters.month = 'all';
        }

        renderReports();
    }

    async function initialize() {
        setupEventListeners();
        updateProgress(10);

        const [tasks, stores] = await fetchData();
        state.allTasks = tasks;
        state.allStores = stores;
        updateProgress(40);

        // Pre-calculate ISO week for each task once
        state.allTasks.forEach(task => {
            task.isoWeek = getISOWeek(task.start_date);
        });

        populateFilterOptions();
        renderReports();
        updateProgress(100);

        // Hide loading overlay and show content
        setTimeout(() => {
            dom.loadingOverlay.classList.add('hidden');
            dom.mainContainer.style.display = 'block';
        }, 500); // Wait 0.5s to show 100%

        dom.yearFilter.addEventListener('change', handleFilterChange);
        dom.quarterFilter.addEventListener('change', handleFilterChange);
        dom.monthFilter.addEventListener('change', handleFilterChange);

        // Re-render reports on language change
        document.addEventListener('languageChanged', renderReports);
    }

    initialize();

})();