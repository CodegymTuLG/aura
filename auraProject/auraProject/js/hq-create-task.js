/**
 * HQ Create Task - Logic for creating new and repeated tasks.
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
        // Navigation
        goToHQTasksButton: document.getElementById('go-to-hq-tasks'),
        goToReceivingTaskButton: document.getElementById('go-to-task-list'),
        goToCreateTaskButton: document.getElementById('go-to-create-task'),
        goToStoreListButton: document.getElementById('go-to-store-list'),
        goToReportsButton: document.getElementById('go-to-reports'),
        goToStoreScreenButton: document.getElementById('store-screen'),

        // Form elements
        isRepeatRadios: document.querySelectorAll('input[name="is-repeat"]'),
        startInput: document.getElementById("start-day"),
        endInput: document.getElementById("end-day"),
        keywordInput: document.getElementById("keyword"),
        suggestionList: document.getElementById('suggestion-list'),
        manualLinkInput: document.getElementById("manual-link"),
        fileUploadButton: document.getElementById("upload-file"),
        storeNameSearchInput: document.getElementById("store-filter"),
        storeRegionSearchInput: document.getElementById("region-filter"),
        storeListTable: document.getElementById("store-list"),
        storeListBody: document.getElementById("store-list").getElementsByTagName('tbody')[0],
        storeListHeaderCheckbox: document.getElementById("store-list").querySelector('thead input[type="checkbox"]'),
        storeTableTitle: document.getElementById('storeTableTitle'),
        reInput: document.getElementById("re"),
        taskNameInput: document.getElementById("task-name"),
        taskTypeSelect: document.getElementById("task-type"),
        responseTypeSelect: document.getElementById("response-type"),
        responseTypeNumberInput: document.getElementById("response-type-number"),
        taskDetailsInput: document.getElementById("task-details"),

        // Action Buttons
        checkButton: document.getElementById('check-button'),
        addButton: document.getElementById('add-button'),
        addRepeatButton: document.getElementById('add-repeat-task'),
        createTaskButton: document.getElementById("create-task"),
    };

    //================================================================================
    // III. STATE MANAGEMENT
    //================================================================================

    const state = {
        isRepeat: 'Yes',
        selectedStores: [],
        cachedData: {
            templateTasks: null,
            stores: null,
            regions: null,
            codes: null,
        }
    };

    //================================================================================
    // IV. API & DATA FETCHING
    //================================================================================

    async function fetchFromAPI(endpoint) {
        try {
            const response = await fetch(`${API_URL}/${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            return [];
        }
    }

    const getTemplateTasks = async () => {
        if (!state.cachedData.templateTasks) {
            const [tasks, codes] = await Promise.all([
                fetchFromAPI('template_tasks.php'),
                getCodes()
            ]);
            const codeMap = new Map(codes.map(c => [c.code_master_id, c.name]));
            state.cachedData.templateTasks = tasks.map(t => ({
                ...t,
                task_type_name: codeMap.get(t.task_type_id) || "Unknown",
                response_type_name: codeMap.get(t.response_type_id) || "Unknown"
            }));
        }
        return state.cachedData.templateTasks;
    };

    const getStores = async () => {
        if (!state.cachedData.stores) {
            const [stores, regions] = await Promise.all([
                fetchFromAPI('store_master.php'),
                getRegions()
            ]);
            const regionMap = new Map(regions.map(r => [r.region_id, r.region_name]));
            state.cachedData.stores = stores.map(store => ({
                ...store,
                region_name: regionMap.get(store.region_id) || null
            }));
        }
        return state.cachedData.stores;
    };

    const getRegions = () => state.cachedData.regions || (state.cachedData.regions = fetchFromAPI('region_master.php'));
    const getCodes = () => state.cachedData.codes || (state.cachedData.codes = fetchFromAPI('code_master.php'));

    async function postTask(taskData, isRepeat) {
        const endpoint = isRepeat ? 'repeat-task' : 'add-task';
        try {
            const response = await fetch(`${API_URL}/${endpoint}.php`, { // Assuming .php extension
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });
            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
            alert(`Task successfully ${isRepeat ? 'added as repeat' : 'created'}!`);
        } catch (error) {
            alert(`Error saving task: ${error.message}`);
            console.error("Error posting task:", error);
        }
    }

    //================================================================================
    // V. UI & RENDERING
    //================================================================================

    function renderStoreTable(storesToRender) {
        dom.storeListBody.innerHTML = '';
        if (!storesToRender || storesToRender.length === 0) {
            dom.storeListBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No stores found.</td></tr>`;
            return;
        }

        const rowsHtml = storesToRender.map(store => `
            <tr>
                <td data-label="Select"><input type="checkbox" class="select-store" data-store-code="${store.store_code}"></td>
                <td data-label="Store Code">${store.store_code || ''}</td>
                <td data-label="Store Name">${store.store_name || ''}</td>
                <td data-label="Region">${store.region_name || ''}</td>
            </tr>
        `).join('');
        dom.storeListBody.innerHTML = rowsHtml;
    }

    async function filterAndRenderStores() {
        const nameFilter = dom.storeNameSearchInput.value.toLowerCase().trim();
        const regionFilter = dom.storeRegionSearchInput.value.toLowerCase().trim();
        const allStores = await getStores();

        if (nameFilter || regionFilter) {
            dom.storeTableTitle.textContent = "Search Results";
            const filteredStores = allStores.filter(store =>
                (store.store_name?.toLowerCase().includes(nameFilter) ||
                 store.store_code?.toLowerCase().includes(nameFilter)) &&
                (store.region_name?.toLowerCase().includes(regionFilter))
            );
            renderStoreTable(filteredStores);
        } else {
            dom.storeTableTitle.textContent = "Selected Stores";
            const storesFromState = state.selectedStores.map(code => allStores.find(s => s.store_code === code));
            renderStoreTable(storesFromState);
        }
    }

    function showConfirmationPopup(taskData, isRepeat) {
        // Remove any existing popup
        const existingPopup = document.getElementById('task-confirmation-popup');
        if (existingPopup) existingPopup.remove();
    
        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'task-confirmation-popup';
        popupOverlay.className = 'confirmation-popup-overlay';
    
        const popupContent = `
            <div class="confirmation-popup-content">
                <h3>Confirm Task Creation</h3>
                <p>Please review the details below before creating the task.</p>
                <ul class="confirmation-details-list">
                    <li><strong>Task Name:</strong> <span>${taskData.taskName}</span></li>
                    <li><strong>Keyword:</strong> <span>${taskData.keyword}</span></li>
                    <li><strong>Stores:</strong> <span>${taskData.storeList.length} selected</span></li>
                    <li><strong>Dates:</strong> <span>${taskData.startDate} to ${taskData.endDate}</span></li>
                    <li><strong>RE(h):</strong> <span>${taskData.re}</span></li>
                </ul>
                <div class="confirmation-popup-actions">
                    <button id="cancel-task-creation" class="popup-btn-cancel">Cancel</button>
                    <button id="confirm-task-creation" class="popup-btn-confirm">Confirm & Create</button>
                </div>
            </div>
        `;
    
        popupOverlay.innerHTML = popupContent;
        document.body.appendChild(popupOverlay);
    
        const closePopup = () => popupOverlay.remove();
    
        document.getElementById('cancel-task-creation').onclick = closePopup;
        popupOverlay.onclick = (e) => {
            if (e.target === popupOverlay) closePopup();
        };
        document.getElementById('confirm-task-creation').onclick = () => {
            postTask(taskData, isRepeat);
            resetForm();
            closePopup();
        };
    }

    function showConfirmationPopup(taskData, isRepeat) {
        // Remove any existing popup
        const existingPopup = document.getElementById('task-confirmation-popup');
        if (existingPopup) existingPopup.remove();
    
        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'task-confirmation-popup';
        popupOverlay.className = 'confirmation-popup-overlay';
    
        const popupContent = `
            <div class="confirmation-popup-content">
                <h3 data-i18n-key="popup-confirm-title">Confirm Task Creation</h3>
                <p data-i18n-key="popup-confirm-message">Please review the details below before creating the task.</p>
                <ul class="confirmation-details-list">
                    <li><strong data-i18n-key="popup-task-name">Task Name</strong>: <span>${taskData.taskName}</span></li>
                    <li><strong data-i18n-key="popup-keyword">Keyword</strong>: <span>${taskData.keyword}</span></li>
                    <li><strong data-i18n-key="popup-is-repeat">Is Repeat</strong>: <span>${taskData.isRepeat}</span></li>
                    <li><strong data-i18n-key="popup-dates">Dates</strong>: <span>${taskData.startDate} to ${taskData.endDate}</span></li>
                    <li><strong data-i18n-key="popup-re-h">RE(h)</strong>: <span>${taskData.re}</span></li>
                    <li><strong data-i18n-key="popup-task-type">Task Type</strong>: <span>${taskData.taskType}</span></li>
                    <li><strong data-i18n-key="popup-response-type">Response Type</strong>: <span>${taskData.responseType}${taskData.responseTypeNumber ? ` (${taskData.responseTypeNumber})` : ''}</span></li>
                    <li><strong data-i18n-key="popup-stores">Stores</strong>: <span>${taskData.storeList.length} selected</span></li>
                    <li><strong data-i18n-key="popup-manual-link">Manual Link</strong>: <span>${taskData.manualLink || '(none)'}</span></li>
                    <li><strong data-i18n-key="popup-task-details">Task Details</strong>: <span>${taskData.taskDetails || '(none)'}</span></li>
                </ul>
                <div class="confirmation-popup-actions">
                    <button id="cancel-task-creation" class="popup-btn-cancel" data-i18n-key="popup-cancel-btn">Cancel</button>
                    <button id="confirm-task-creation" class="popup-btn-confirm" data-i18n-key="popup-confirm-btn">Confirm & Create</button>
                </div>
            </div>
        `;
    
        popupOverlay.innerHTML = popupContent;
        document.body.appendChild(popupOverlay);
    
        applyTranslations(popupOverlay); // Apply translations to the new popup
        const closePopup = () => popupOverlay.remove();
    
        document.getElementById('cancel-task-creation').onclick = closePopup;
        popupOverlay.onclick = (e) => { if (e.target === popupOverlay) closePopup(); };
        document.getElementById('confirm-task-creation').onclick = () => { postTask(taskData, isRepeat); resetForm(); closePopup(); };
    }

    //================================================================================
    // VI. CORE LOGIC & HELPERS
    //================================================================================

    const redirectTo = (path) => window.location.href = path;

    function resetForm() {
        dom.keywordInput.value = '';
        dom.manualLinkInput.value = '';
        state.selectedStores = [];
        dom.reInput.value = '';
        dom.taskNameInput.value = '';
        dom.taskTypeSelect.selectedIndex = 0;
        dom.responseTypeSelect.selectedIndex = 0;
        dom.responseTypeNumberInput.value = '';
        dom.taskDetailsInput.value = '';
        filterAndRenderStores();
    }

    function validateForm() {
        const requiredFields = {
            "Start date": dom.startInput,
            "End date": dom.endInput,
            "Keyword": dom.keywordInput,
            "Manual link": dom.manualLinkInput,
            "RE(h)": dom.reInput,
            "Task Name": dom.taskNameInput,
        };

        const missingFields = [];
        for (const [name, element] of Object.entries(requiredFields)) {
            element.style.border = "";
            if (!element.value) {
                missingFields.push(name);
                element.style.border = "2px solid red";
            }
        }

        dom.storeListTable.style.border = "";
        if (state.selectedStores.length === 0) {
            missingFields.push("Store Selection");
            dom.storeListTable.style.border = "2px solid red";
        }

        if (missingFields.length > 0) {
            alert(translate('fill-required-fields-alert') + "\n- " + missingFields.join("\n- "));
            return false;
        }

        // Date validation
        const startDate = new Date(dom.startInput.value);
        const endDate = new Date(dom.endInput.value);
        if (endDate < startDate) {
            alert(translate('end-date-before-start-alert'));
            dom.startInput.style.border = "2px solid red";
            dom.endInput.style.border = "2px solid red";
            return false;
        }
        return true;
    }

    async function autofillFormFromKeyword() {
        const keyword = dom.keywordInput.value.trim().toLowerCase();
        if (state.isRepeat !== 'Yes' || !keyword) return;

        const templateTasks = await getTemplateTasks();
        const matchedTask = templateTasks.find(task => task.key_work.toLowerCase() === keyword);

        if (matchedTask) {
            dom.manualLinkInput.value = matchedTask.manual_id || '';
            dom.reInput.value = matchedTask.re || '';
            dom.taskNameInput.value = matchedTask.task_name || '';
            dom.taskTypeSelect.value = matchedTask.task_type_name || '';
            dom.responseTypeSelect.value = matchedTask.response_type_name || '';
            dom.responseTypeNumberInput.value = matchedTask.response_num || '';

            // Disable fields
            [dom.manualLinkInput, dom.reInput, dom.taskNameInput, dom.taskTypeSelect, dom.responseTypeSelect, dom.responseTypeNumberInput, dom.fileUploadButton]
                .forEach(el => el.disabled = true);
        }
    }

    function resetAndEnableFormFields() {
        [dom.keywordInput, dom.manualLinkInput, dom.reInput, dom.taskNameInput, dom.taskTypeSelect, dom.responseTypeSelect, dom.responseTypeNumberInput, dom.fileUploadButton]
            .forEach(el => {
                if (el.tagName !== 'BUTTON') el.value = '';
                el.disabled = false;
            });
    }

    //================================================================================
    // VII. EVENT HANDLERS
    //================================================================================

    function handleIsRepeatChange(event) {
        state.isRepeat = event.target.value;
        dom.addRepeatButton.style.display = state.isRepeat === "Yes" ? "none" : "inline-block";
        if (state.isRepeat === 'No') {
            resetAndEnableFormFields();
        } else {
            autofillFormFromKeyword();
        }
    }

    async function handleKeywordInput() {
        if (state.isRepeat !== 'Yes') {
            dom.suggestionList.style.display = "none";
            return;
        }

        const inputValue = dom.keywordInput.value.toLowerCase().trim();
        const templateTasks = await getTemplateTasks();
        const keywords = [...new Set(templateTasks.map(task => task.key_work).filter(Boolean))];

        const filteredKeywords = keywords.filter(key => key.toLowerCase().includes(inputValue));

        dom.suggestionList.innerHTML = '';
        if (filteredKeywords.length > 0 && inputValue) {
            dom.suggestionList.style.display = "block";
            filteredKeywords.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                li.onclick = () => {
                    dom.keywordInput.value = suggestion;
                    dom.suggestionList.style.display = "none";
                    autofillFormFromKeyword();
                };
                dom.suggestionList.appendChild(li);
            });
        } else {
            dom.suggestionList.style.display = "none";
        }
    }

    function handleAddStores() {
        const selectedCheckboxes = dom.storeListBody.querySelectorAll('.select-store:checked');
        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one store to add.');
            return;
        }
        selectedCheckboxes.forEach(cb => {
            const storeCode = cb.dataset.storeCode;
            if (!state.selectedStores.includes(storeCode)) {
                state.selectedStores.push(storeCode);
            }
        });
        alert(`Added ${selectedCheckboxes.length} store(s). Total selected: ${state.selectedStores.length}.`);
        dom.storeNameSearchInput.value = '';
        dom.storeRegionSearchInput.value = '';
        filterAndRenderStores(); // Show the selected stores list
    }

    function handleCheckSelectedStores() {
        if (state.selectedStores.length === 0) {
            alert('No stores have been added to the task yet.');
            return;
        }
        // This can be expanded to show a popup, for now, an alert is fine.
        alert(`Currently selected stores:\n- ${state.selectedStores.join('\n- ')}`);
    }


    function handleTaskCreation(isRepeat = false) {
        if (!validateForm()) return;

        const taskData = {
            isRepeat: state.isRepeat,
            startDate: dom.startInput.value,
            endDate: dom.endInput.value,
            keyword: dom.keywordInput.value,
            manualLink: dom.manualLinkInput.value,
            storeList: state.selectedStores,
            re: dom.reInput.value,
            taskName: dom.taskNameInput.value,
            taskType: dom.taskTypeSelect.value,
            responseType: dom.responseTypeSelect.value,
            responseTypeNumber: dom.responseTypeNumberInput.value || '',
            taskDetails: dom.taskDetailsInput.value || ''
        };

        showConfirmationPopup(taskData, isRepeat); // Gọi popup xác nhận
    }

    function setupEventListeners() {
        // Navigation
        dom.goToHQTasksButton.addEventListener('click', () => redirectTo('hq-store.html'));
        dom.goToReceivingTaskButton.addEventListener('click', () => redirectTo('hq-task-list.html'));
        dom.goToCreateTaskButton.addEventListener('click', () => redirectTo('hq-create-task.html'));
        dom.goToStoreListButton.addEventListener('click', () => redirectTo('hq-store-detail.html'));
        dom.goToReportsButton.addEventListener('click', () => redirectTo('hq-report.html'));
        dom.goToStoreScreenButton.addEventListener('click', () => redirectTo('index.html'));

        // Form Logic
        dom.isRepeatRadios.forEach(radio => radio.addEventListener("change", handleIsRepeatChange));
        dom.keywordInput.addEventListener("input", handleKeywordInput);
        dom.keywordInput.addEventListener("blur", () => setTimeout(() => dom.suggestionList.style.display = "none", 150));
        dom.storeNameSearchInput.addEventListener("input", filterAndRenderStores);
        dom.storeRegionSearchInput.addEventListener("input", filterAndRenderStores);

        // Action Buttons
        dom.addButton.addEventListener('click', handleAddStores);
        dom.checkButton.addEventListener('click', handleCheckSelectedStores);
        dom.createTaskButton.addEventListener("click", () => handleTaskCreation(false));
        dom.addRepeatButton.addEventListener("click", () => handleTaskCreation(true));
    }

    //================================================================================
    // VIII. INITIALIZATION
    //================================================================================

    function initialize() {
        const today = new Date().toISOString().split("T")[0];
        dom.startInput.value = today;
        dom.endInput.value = today;
        dom.addRepeatButton.style.display = "none"; // Default is "Yes"

        setupEventListeners();
        filterAndRenderStores(); // Initial render for selected stores (which is empty)
    }

    initialize();

})();