/**
 * hq-store-detail.js
 * Handles logic for the HQ Store Detail page.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // ===== Get navigation buttons =====
    const goToHQTasksButton = document.getElementById('go-to-hq-tasks');
    const goToTaskListButton = document.getElementById('go-to-task-list');
    const goToCreateTaskButton = document.getElementById('go-to-create-task');
    const goToStoreListButton = document.getElementById('go-to-store-list');
    const goToStoreScreenButton = document.getElementById('store-screen');

    // ===== Redirect helpers =====
    const redirectTo = (path) => window.location.href = path;

    // ===== Event listeners for navigation =====
    if (goToHQTasksButton) goToHQTasksButton.addEventListener('click', () => redirectTo('hq-store.html'));
    if (goToTaskListButton) goToTaskListButton.addEventListener('click', () => redirectTo('hq-task-list.html'));
    if (goToCreateTaskButton) goToCreateTaskButton.addEventListener('click', () => redirectTo('hq-create-task.html'));
    if (goToStoreListButton) goToStoreListButton.addEventListener('click', () => redirectTo('hq-store-detail.html'));
    if (goToStoreScreenButton) goToStoreScreenButton.addEventListener('click', () => redirectTo('index.html'));

    const tableBody = document.querySelector('#task-list tbody');
    const pageTitle = document.querySelector('.button-group h1');
    const searchInput = document.getElementById('search-input');
    const paginationContainer = document.getElementById('pagination-container');

    // State management
    let allStoreTasks = []; // All tasks for the selected store
    let filteredTasks = []; // Tasks after search/filter
    let currentPage = 1;
    const ROWS_PER_PAGE = 10;



    /**
     * Tự xác định base API URL dựa trên hostname
     * @returns {string} Base URL for the API
     */
    const getAPIBaseURL = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost/auraProject/api';
        } else {
            // Replace with your production API URL if different
            return 'https://auraorientalis.vn/auraProject/api';
        }
    };
    const API_URL = getAPIBaseURL();

    /**
     * Fetches all tasks from the API.
     * @returns {Promise<Array>} A promise that resolves to an array of tasks.
     */
    async function fetchTasks() {
        try {
            const response = await fetch(`${API_URL}/tasks.php`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching tasks:", error);
            tableBody.innerHTML = `<tr><td colspan="10">Error loading data. Please try again later.</td></tr>`;
            return [];
        }
    }

    /**
     * Formats a date string into a more readable format (e.g., 25/12/2023).
     * Returns an empty string if the date is invalid.
     * @param {string | Date} dateString - The date to format.
     * @returns {string} The formatted date.
     */
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * Renders a slice of task data for the current page into the table.
     */
    function renderTable() {
        tableBody.innerHTML = ''; // Clear existing table

        if (filteredTasks.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10">No tasks found for this store.</td></tr>`;
            renderPagination(); // Update pagination to show 0 pages
            return;
        }

        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

        tableBody.innerHTML = paginatedTasks.map((task, index) => {
            const itemIndex = startIndex + index + 1;
            return `
            <tr class="task-row" data-task-index="${startIndex + index}" style="cursor: pointer;">
                <td>${itemIndex}</td>
                <td>${task.do_staff_store_name || 'N/A'}</td>
                <td>${task.department_name || 'N/A'}</td>
                <td>${task.task_name || 'N/A'}</td>
                <td>${task.region_name || 'N/A'}</td>
                <td>${formatDate(task.start_date)}</td>
                <td>${formatDate(task.end_date)}</td>
                <td>${formatDate(task.actual_start_date)}</td>
                <td>${formatDate(task.actual_end_date)}</td>
                <td>${task.status_name || 'N/A'}</td>
            </tr>
        `}).join('');

        renderPagination();
    }

    /**
     * Renders pagination controls based on the total number of filtered tasks.
     */
    function renderPagination() {
        paginationContainer.innerHTML = ''; // Clear old pagination
        const totalPages = Math.ceil(filteredTasks.length / ROWS_PER_PAGE);
    
        if (totalPages <= 1) return;
    
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
                paginationHtml += `<span class="pagination-info">...</span>`;
            }
        }
    
        // Page number buttons
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
    
        // Ellipsis at the end
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<span class="pagination-info">...</span>`;
            }
            paginationHtml += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }
    
        // > (Next page) and >> (Next 5 pages) buttons
        paginationHtml += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>`;
        paginationHtml += `<button class="page-btn" data-page="${Math.min(totalPages, currentPage + 5)}" ${currentPage >= totalPages ? 'disabled' : ''}>&gt;&gt;</button>`;
    
        paginationContainer.innerHTML = paginationHtml;
    
        // Add event listeners to new buttons
        paginationContainer.querySelectorAll('.page-btn[data-page]').forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== currentPage) {
                    currentPage = page;
                    renderTable();
                }
            });
        });
    }

    /**
     * Filters tasks based on the search input and re-renders the table.
     */
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) {
            filteredTasks = [...allStoreTasks];
        } else {
            filteredTasks = allStoreTasks.filter(task =>
                (task.task_name && task.task_name.toLowerCase().includes(searchTerm)) ||
                (task.department_name && task.department_name.toLowerCase().includes(searchTerm)) ||
                (task.region_name && task.region_name.toLowerCase().includes(searchTerm))
            );
        }

        currentPage = 1; // Reset to first page after search
        renderTable();
    }

    /**
     * Main function to initialize the page.
     */
    async function init() {
        // Lấy tất cả các task từ API
        const allTasks = await fetchTasks();
        allStoreTasks = allTasks; // Gán toàn bộ task, không lọc theo store_id
        filteredTasks = [...allStoreTasks]; // Initially, filtered tasks are all tasks

        searchInput.addEventListener('input', handleSearch);

        tableBody.addEventListener('click', (e) => {
            const row = e.target.closest('.task-row');
            if (!row) return;

            const taskIndex = parseInt(row.dataset.taskIndex, 10);
            const task = filteredTasks[taskIndex];

            if (task) {
                window.location.href = `detail-task.html?id=${task.task_id}`;
            }
        });
        renderTable(); // Hiển thị bảng với toàn bộ dữ liệu
    }

    init();
});