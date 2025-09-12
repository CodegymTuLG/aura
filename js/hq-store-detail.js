/**
 * HQ Store Detail - Logic for displaying task details for stores.
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

    const ITEMS_PER_PAGE = 10;

    //================================================================================
    // II. DOM ELEMENTS
    //================================================================================

    const dom = {
        taskListContainer: document.querySelector("#task-list tbody"),
        paginationContainer: document.getElementById("pagination"),
        exportCsvButton: document.getElementById("export-csv"),
        // Navigation
        goToHQTasksButton: document.getElementById('go-to-hq-tasks'),
        goToTaskListButton: document.getElementById('go-to-task-list'),
        goToCreateTaskButton: document.getElementById('go-to-create-task'),
        goToStoreListButton: document.getElementById('go-to-store-list'),
        goToStoreScreenButton: document.getElementById('store-screen'),
    };

    //================================================================================
    // III. STATE MANAGEMENT
    //================================================================================

    const state = {
        allTasks: [],
        currentPage: 1,
    };

    //================================================================================
    // IV. API & DATA FETCHING
    //================================================================================

    async function fetchTasks() {
        try {
            // This should ideally fetch tasks related to stores, but we use the general tasks.php for now
            const response = await fetch(`${API_URL}/tasks.php`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading tasks:', error);
            dom.taskListContainer.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Failed to load tasks.</td></tr>`;
            return [];
        }
    }

    //================================================================================
    // V. UI & RENDERING
    //================================================================================

    function renderTaskList() {
        dom.taskListContainer.innerHTML = '';
        const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const tasksToRender = state.allTasks.slice(startIndex, endIndex);

        if (tasksToRender.length === 0) {
            dom.taskListContainer.innerHTML = `<tr><td colspan="8" style="text-align:center;">No tasks to display.</td></tr>`;
            return;
        }

        const rowsHtml = tasksToRender.map((task, index) => `
            <tr>
                <td>${startIndex + index + 1}</td>
                <td>${task.do_staff_store_name || 'N/A'}</td>
                <td>${task.department_name || 'N/A'}</td>
                <td>${task.start_date || '-'}</td>
                <td>${task.end_date || '-'}</td>
                <td>${task.start_time || '-'}</td>
                <td>${task.completed_time || '-'}</td>
                <td>${task.status_name || 'N/A'}</td>
            </tr>
        `).join('');
        dom.taskListContainer.innerHTML = rowsHtml;
    }

    function renderPagination() {
        const totalPages = Math.ceil(state.allTasks.length / ITEMS_PER_PAGE);
        dom.paginationContainer.innerHTML = `
            <span id="prev-page">&lt;&lt;</span> 
            <span>${state.currentPage} / ${totalPages}</span> 
            <span id="next-page">&gt;&gt;</span>
        `;

        document.getElementById('prev-page').addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderTaskList();
                renderPagination();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderTaskList();
                renderPagination();
            }
        });
    }

    //================================================================================
    // VI. EVENT HANDLERS & HELPERS
    //================================================================================

    const redirectTo = (path) => window.location.href = path;

    function exportToCsv() {
        const headers = "STT,Tên Cửa hàng,Khu vực,Bắt đầu,Kết thúc,Bắt đầu thực tế,Kết thúc thực tế,Trạng thái";
        const csvContent = state.allTasks.map((task, index) => 
            [
                index + 1,
                task.do_staff_store_name || '',
                task.department_name || '',
                task.start_date || '',
                task.end_date || '',
                task.start_time || '',
                task.completed_time || '',
                task.status_name || ''
            ].join(",")
        ).join("\n");

        const blob = new Blob([headers + "\n" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'store_task_details.csv';
        link.click();
    }

    function setupEventListeners() {
        dom.exportCsvButton.addEventListener("click", exportToCsv);
        // Navigation
        dom.goToHQTasksButton.addEventListener('click', () => redirectTo('hq-store.html'));
        dom.goToTaskListButton.addEventListener('click', () => redirectTo('hq-task-list.html'));
        dom.goToCreateTaskButton.addEventListener('click', () => redirectTo('hq-create-task.html'));
        dom.goToStoreListButton.addEventListener('click', () => redirectTo('hq-store-detail.html'));
        dom.goToStoreScreenButton.addEventListener('click', () => redirectTo('index.html'));
    }

    //================================================================================
    // VII. INITIALIZATION
    //================================================================================

    async function initialize() {
        setupEventListeners();
        state.allTasks = await fetchTasks();
        renderTaskList();
        renderPagination();
    }

    initialize();

})();