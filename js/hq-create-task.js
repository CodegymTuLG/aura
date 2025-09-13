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
        goToStoreScreenButton: document.getElementById('store-screen'),

        // Form elements
        isRepeatRadios: document.querySelectorAll('input[name="is-repeat"]'),
        startInput: document.getElementById("start-day"),
        endInput: document.getElementById("end-day"),
        keywordInput: document.getElementById("keyword"),
        suggestionList: document.getElementById('suggestion-list'),
        manualLinkInput: document.getElementById("manual-link"),
        fileUploadButton: document.getElementById("upload-file"),
        manualFileInput: document.getElementById('manual-file-input'),
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
        checklistContainer: document.getElementById('checklist-container'),
        checklistTableBody: document.getElementById('checklist-table').getElementsByTagName('tbody')[0],
        checklistMessageCell: document.getElementById('checklist-message-cell'),

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

    async function handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('manualFiles[]', files[i]);
        }

        // Show some loading indicator
        dom.fileUploadButton.disabled = true;
        dom.fileUploadButton.innerHTML = '...'; // Simple loading text

        try {
            const response = await fetch(`${API_URL}/upload.php`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || `Server error: ${response.statusText}`);
            }

            const fileUrls = result.filePaths.map(path => 
                `${window.location.protocol}//${window.location.host}/auraProject/${path}`
            );

            // Append new URLs to the existing ones, separated by a comma and space
            dom.manualLinkInput.value += (dom.manualLinkInput.value ? ', ' : '') + fileUrls.join(', ');

        } catch (error) {
            alert(`Error uploading file: ${error.message}`);
            console.error('File upload error:', error);
        } finally {
            dom.fileUploadButton.disabled = false;
            dom.fileUploadButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-upload" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/></svg>`;
            event.target.value = ''; // Clear the file input
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

    /**
     * Shows a generic popup to display a list of items.
     * @param {string} title The title of the popup.
     * @param {object[]} items An array of store objects ({name, region}) to display in a table.
     */
    function showInfoPopup(title, items) {
        const existingPopup = document.getElementById('info-popup');
        if (existingPopup) existingPopup.remove();
    
        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'info-popup';
        popupOverlay.className = 'confirmation-popup-overlay';
    
        let tableContent;
        if (items.length > 0) {
            const tableRows = items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name || ''}</td>
                    <td>${item.region || 'N/A'}</td>
                </tr>
            `).join('');
    
            tableContent = `
                <div class="info-popup-table-container">
                    <table class="info-popup-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th data-i18n-key="store-name">Store Name</th>
                                <th data-i18n-key="region">Region</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            `;
        } else {
            tableContent = `<p style="text-align:center; margin: 20px 0;">No items to display.</p>`;
        }
    
        popupOverlay.innerHTML = `
            <div class="confirmation-popup-content" style="max-width: 450px;">
                <h3>${title}</h3>
                ${tableContent}
                <div class="confirmation-popup-actions">
                    <button id="close-info-popup" class="popup-btn-confirm">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(popupOverlay);

        applyTranslations(popupOverlay); // Apply translations to the new popup table headers

        const closePopup = () => popupOverlay.remove();
        document.getElementById('close-info-popup').onclick = closePopup;
        popupOverlay.onclick = (e) => { if (e.target === popupOverlay) closePopup(); };
    }

    function addChecklistRow() {
        const rowCount = dom.checklistTableBody.rows.length;
        if (rowCount >= 5) {
            // Optional: alert('Tối đa 5 nội dung');
            return;
        }

        const newRow = dom.checklistTableBody.insertRow();
        newRow.innerHTML = `
            <td class="row-index">${rowCount + 1}</td>
            <td><input type="text" placeholder="Enter checklist content..."></td>
            <td>
                <button type="button" class="delete-btn" title="Delete row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m3.5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m3.5-.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06"/>
                    </svg>
                </button>
            </td>
        `;

        const input = newRow.querySelector('input[type="text"]');
        input.addEventListener('input', handleChecklistInput);  // Kích hoạt trên mỗi lần gõ phím
        input.addEventListener('change', handleChecklistInput); // Kích hoạt sau khi nhập xong
        input.addEventListener('blur', handleChecklistInput);   // Kích hoạt khi rời khỏi ô
        newRow.querySelector('.delete-btn').addEventListener('click', handleDeleteChecklistRow);
    }

    /**
     * Updates the message in the checklist table's footer.
     */
    function updateChecklistMessage() {
        const rowCount = dom.checklistTableBody.rows.length;
        if (rowCount >= 5) {
            dom.checklistMessageCell.textContent = translate('checklist-max-items-alert');
        } else {
            dom.checklistMessageCell.textContent = translate('checklist-add-new-prompt');
        }
        // Apply translation again in case language changed
        applyTranslations(dom.checklistMessageCell.parentElement);
    }

    /**
     * Dọn dẹp các dòng checklist trống thừa, chỉ giữ lại một dòng trống duy nhất ở cuối.
     */
    function cleanupEmptyChecklistRows() {
        const allInputs = Array.from(dom.checklistTableBody.querySelectorAll('input[type="text"]'));
        const emptyInputs = allInputs.filter(input => input.value.trim() === '');

        // Giữ lại một dòng trống cuối cùng, xóa tất cả các dòng trống khác
        if (emptyInputs.length > 1) {
            // Lấy input trống cuối cùng
            const lastEmptyInput = emptyInputs[emptyInputs.length - 1];
            emptyInputs.forEach(input => {
                if (input !== lastEmptyInput) {
                    input.closest('tr').remove();
                }
            });
            updateChecklistIndexes();
            updateChecklistMessage();
        }
    }

    function handleChecklistInput(event) {
        // Bỏ qua sự kiện 'input' khi người dùng đang gõ ký tự phức hợp (VD: tiếng Việt)
        if (event.isComposing) {
            return;
        }

        // Dọn dẹp các dòng trống thừa trước
        cleanupEmptyChecklistRows();

        // Kiểm tra xem có cần thêm dòng mới không
        const allInputs = Array.from(dom.checklistTableBody.querySelectorAll('input[type="text"]'));
        const isAnyRowEmpty = allInputs.some(input => input.value.trim() === '');

        // Nếu không có dòng nào trống, thêm một dòng mới
        if (!isAnyRowEmpty) {
            addChecklistRow();
            updateChecklistMessage();
        }
    }

    function handleDeleteChecklistRow(event) {
        const row = event.target.closest('tr');
        row.remove();
        updateChecklistIndexes();
        updateChecklistMessage();

        // Sau khi xóa, kiểm tra xem có cần thêm dòng trống không
        const hasEmptyRow = Array.from(dom.checklistTableBody.querySelectorAll('input[type="text"]')).some(input => input.value.trim() === '');
        if (!hasEmptyRow) {
            addChecklistRow();
            updateChecklistMessage();
        }
    }

    function updateChecklistIndexes() {
        const rows = dom.checklistTableBody.rows;
        for (let i = 0; i < rows.length; i++) {
            rows[i].querySelector('.row-index').textContent = i + 1;
        }
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
            alert((window.translate ? translate('fill-required-fields-alert') : 'Please fill in the following required fields:') + "\n- " + missingFields.join("\n- "));
            return false;
        }

        // Date validation
        const startDate = new Date(dom.startInput.value);
        const endDate = new Date(dom.endInput.value);
        if (endDate < startDate) {
            alert(window.translate ? translate('end-date-before-start-alert') : 'End date cannot be before the start date.');
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

    function handleResponseTypeChange(event) {
        const selectedValue = event.target.value;
        if (selectedValue === 'Check-List') {
            dom.checklistContainer.style.display = 'block';
            // Add first row if table is empty
            if (dom.checklistTableBody.rows.length === 0) {
                addChecklistRow();
                updateChecklistMessage();
            }
        } else {
            dom.checklistContainer.style.display = 'none';
        }

        // Show/hide the number input based on selection
        if (selectedValue === 'Check-List' || selectedValue === 'Yes-No') {
            dom.responseTypeNumberInput.style.display = 'none';
        } else {
            dom.responseTypeNumberInput.style.display = 'block'; // Or 'inline-block'
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

    async function handleAddStores() {
        const selectedCheckboxes = dom.storeListBody.querySelectorAll('.select-store:checked');
        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one store to add.');
            return;
        }

        const addedStoreCodes = [];
        selectedCheckboxes.forEach(cb => {
            const storeCode = cb.dataset.storeCode;
            if (!state.selectedStores.includes(storeCode)) {
                state.selectedStores.push(storeCode);
                addedStoreCodes.push(storeCode);
            }
        });

        const allStores = await getStores();
        const addedStoreInfo = addedStoreCodes.map(code => { // Changed to array of objects
            const store = allStores.find(s => s.store_code === code);
            if (store) {
                return { name: store.store_name, region: store.region_name };
            }
            return { name: code, region: 'N/A' }; // Fallback
        });
    
        showInfoPopup('Stores Added to Task', addedStoreInfo);

        dom.storeNameSearchInput.value = '';
        dom.storeRegionSearchInput.value = '';
        filterAndRenderStores(); // Show the selected stores list
    }

    async function handleCheckSelectedStores() {
        if (state.selectedStores.length === 0) {
            showInfoPopup('Selected Stores', ['No stores have been added to the task yet.']);
            return;
        }
        // This can be expanded to show a popup, for now, an alert is fine.
        const allStores = await getStores();
        const selectedStoreInfo = state.selectedStores.map(code => { // Changed to array of objects
            const store = allStores.find(s => s.store_code === code);
            if (store) {
                return { name: store.store_name, region: store.region_name };
            }
            return { name: code, region: 'N/A' };
        });
        showInfoPopup('Currently Selected Stores', selectedStoreInfo);
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
        dom.goToStoreScreenButton.addEventListener('click', () => redirectTo('index.html'));

        // Form Logic
        dom.isRepeatRadios.forEach(radio => radio.addEventListener("change", handleIsRepeatChange));
        dom.keywordInput.addEventListener("input", handleKeywordInput);
        dom.keywordInput.addEventListener("blur", () => setTimeout(() => dom.suggestionList.style.display = "none", 150));
        dom.storeNameSearchInput.addEventListener("input", filterAndRenderStores);
        dom.storeRegionSearchInput.addEventListener("input", filterAndRenderStores);
        dom.responseTypeSelect.addEventListener('change', handleResponseTypeChange);
        dom.fileUploadButton.addEventListener('click', () => dom.manualFileInput.click());
        dom.manualFileInput.addEventListener('change', handleFileUpload);

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

        // Trigger change event on load to set initial visibility
        handleResponseTypeChange({ target: dom.responseTypeSelect });
    }

    initialize();

})();