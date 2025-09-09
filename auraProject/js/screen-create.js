const backButton = document.getElementById('store-screen');
const addRepeatButton = document.getElementById('add-repeat-task');
const checkButton = document.getElementById('check-button');
const radios = document.querySelectorAll('input[name="is-repeat"]');
const startInput = document.getElementById("start-day");
const endInput = document.getElementById("end-day");
const keywordInput = document.getElementById("keyword");
const manualLinkInput = document.getElementById("manual-link");
const fileUploadButton = document.getElementById("upload-file");
const storeNameSearchInput = document.getElementById("store-filter");
const storeRegionSearchInput = document.getElementById("region-filter");
const storeListTable = document.getElementById("store-list");
const reInput = document.getElementById("re");
const taskNameInput = document.getElementById("task-name");
const taskTypeSelect = document.getElementById("task-type");
const responseTypeSelect = document.getElementById("response-type");
const responseTypeNumberInput = document.getElementById("response-type-number");
const taskDetailsInput = document.getElementById("task-details");
const createTaskButton = document.getElementById("create-task");
const addButton = document.getElementById('add-button');
const storeListBody = storeListTable.getElementsByTagName('tbody')[0];
const headerCheckbox = storeListTable.querySelector('thead input[type="checkbox"]');
const goToHQTasksButton = document.getElementById('go-to-hq-tasks');
const goToReceivingTaskButton = document.getElementById('go-to-task-list');
const goToCreateTaskButton = document.getElementById('go-to-create-task');
const goToStoreListButton = document.getElementById('go-to-store-list');
const goToReportsButton = document.getElementById('go-to-reports');
const goToStoreScreenButton = document.getElementById('store-screen');

const today = new Date().toISOString().split("T")[0];
const redirectTo = (path) => window.location.href = path;

// ===== Event listeners =====
goToHQTasksButton.addEventListener('click', () => redirectTo('screen-hq.html'));
goToReceivingTaskButton.addEventListener('click', () => redirectTo('task-list.html'));
goToCreateTaskButton.addEventListener('click', () => redirectTo('screen-create.html'));
goToStoreListButton.addEventListener('click', () => redirectTo('store-detail.html'));
goToReportsButton.addEventListener('click', () => redirectTo('report.html'));
goToStoreScreenButton.addEventListener('click', () => redirectTo('index.html'));
// Đặt các giá trị mặc định
let isRepeatValue = document.querySelector('input[name="is-repeat"]:checked').value; // Mặc định là "Yes"
let startDate = today; // Mặc định là ngày hôm nay
let endDate = today; // Mặc định là ngày hôm nay
let manualLinkValue = manualLinkInput.value || '';
let storeList = []; // Biến lưu trữ danh sách cửa hàng
let taskDetailsValue = taskDetailsInput.value || ''; // Mặc định là chuỗi rỗng
storeListTable.querySelector('tbody').innerHTML = ''; // Đặt danh sách ban đầu của table store list là trống
startInput.value = today; // Mặc định startInput là ngày hôm nay
endInput.value = today; // Mặc định endInput là ngày hôm nay

// Tự xác định base API URL dựa trên hostname
const getAPIBaseURL = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost/auraProject/api';
  } else {
    return 'https://auraorientalis.vn/auraProject/api';
  }
};

const API_URL = getAPIBaseURL();

// loadTaskDatas => loadTemplateTasks
async function loadCodeMaster() {
  try {
    const response = await fetch(`${API_URL}/code_master.php`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json(); // mảng code_master
  } catch (err) {
    console.error("Error fetching code master:", err);
    return [];
  }
}
async function loadTemplateTasks() {
  try {
    const [tasksRes, codes] = await Promise.all([
      fetch(`${API_URL}/template_tasks.php`),
      loadCodeMaster()
    ]);

    if (!tasksRes.ok) throw new Error(`HTTP error! status: ${tasksRes.status}`);
    let template_tasks = await tasksRes.json();

    // map function để lấy name từ code_master
    function codeIdToName(id) {
      return codes.find(c => c.code_master_id == id)?.name || "Unknown";
    }

    // gán thêm field hiển thị
    template_tasks = template_tasks.map(t => ({
      ...t,
      task_type_name: codeIdToName(t.task_type_id),
      response_type_name: codeIdToName(t.response_type_id)
    }));

    return template_tasks;
  } catch (err) {
    console.error("Error fetching template_tasks:", err);
    return [];
  }
}
async function loadRegions() {
  try {
    const response = await fetch(`${API_URL}/region_master.php`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json(); // mảng region_master
  } catch (err) {
    console.error("Error fetching regions:", err);
    return [];
  }
}
async function loadStores() {
  try {
    const [storeRes, regions] = await Promise.all([
      fetch(`${API_URL}/store_master.php`),
      loadRegions()
    ]);

    if (!storeRes.ok) throw new Error(`HTTP error! status: ${storeRes.status}`);
    const stores = await storeRes.json();

    // Map region_id -> region_name
    const regionMap = {};
    regions.forEach(r => {
      regionMap[r.region_id] = r.region_name;
    });

    // Thêm trường region_name vào mỗi store
    return stores.map(store => ({
      ...store,
      region_name: regionMap[store.region_id] || null
    }));
  } catch (err) {
    console.error("Error fetching stores:", err);
    return [];
  }
}
async function autofillFieldsByKeyword() {
    if (isRepeatValue === "Yes" && keywordInput.value.trim() !== "") {
        const templateTasks = await loadTemplateTasks();
        const matchedTask = templateTasks.find(task => 
            task.key_work.toLowerCase() === keywordInput.value.toLowerCase()
        );

        if (matchedTask) {
            manualLinkInput.value = matchedTask.manual_id || '';
            manualLinkValue = manualLinkInput.value;

            // Ẩn input
            manualLinkInput.style.display = 'none';

            // Kiểm tra xem đã có linkText chưa
            let linkText = document.getElementById("manualLinkDisplay");
            if (!linkText) {
                linkText = document.createElement('span');
                linkText.id = "manualLinkDisplay";
                linkText.style.color = 'blue';
                linkText.style.textDecoration = 'underline';
                linkText.style.cursor = 'pointer';
                manualLinkInput.insertAdjacentElement('afterend', linkText);
            }

            // Cập nhật link
            linkText.textContent = manualLinkValue;
            linkText.onclick = function () {
                window.open(manualLinkValue, '_blank');
            };

            // Vô hiệu hoá upload file button
            fileUploadButton.disabled = true;
            fileUploadButton.style.display = 'none';

            if (reInput) {
                reInput.value = matchedTask.re || '';
                reInput.disabled = true;
            }

            if (taskNameInput) {
                taskNameInput.value = matchedTask.task_name || '';
                taskNameInput.disabled = true;
            }

            if (taskTypeSelect) {
                taskTypeSelect.value = matchedTask.task_type_name || '';
                taskTypeSelect.disabled = true;
            }

            if (responseTypeSelect) {
                responseTypeSelect.value = matchedTask.response_type_name || '';
                responseTypeSelect.disabled = true;
            }

            if (responseTypeNumberInput) {
                responseTypeNumberInput.value = matchedTask.response_num || '';
                // Nếu response_type_id thuộc Yes/No hoặc Check-List thì ẩn responseTypeNumberInput
                if (matchedTask.response_type_id === "Yes-No" || matchedTask.response_type_id === "Check-List") {
                    responseTypeNumberInput.style.display = 'none';
                } else {
                    responseTypeNumberInput.disabled = true;
                    responseTypeNumberInput.style.display = 'inline-block';                        
                }
            }
        }

        // Reset border cho các input
        [keywordInput, manualLinkInput, reInput, taskNameInput, taskTypeSelect, responseTypeSelect]
        .forEach(input => {
            if (input) input.style.border = ""; 
        }); 
    } else {
        // Nếu IsRepeatValue là "No" thì reset các trường
        keywordInput.style.display = 'inline-block';
        keywordInput.disabled = false;            
        manualLinkInput.style.display = 'inline-block';
        manualLinkInput.value = '';
        // Đặt linkText là rỗng
        document.getElementById("manualLinkDisplay")?.remove();
        fileUploadButton.style.display = 'inline-block';
        fileUploadButton.disabled = false;
        reInput.value = '';
        reInput.disabled = false;
        taskNameInput.value = '';
        taskNameInput.disabled = false;
        taskTypeSelect.value = '';
        taskTypeSelect.disabled = false;
        responseTypeSelect.value = '';
        responseTypeSelect.disabled = false;
        responseTypeNumberInput.style.display = 'inline-block';
        responseTypeNumberInput.disabled = false;
        responseTypeNumberInput.value = '';

        // Kiểm tra tính duy nhất của keywordInput
        const templateTasks = await loadTemplateTasks();
        const existingTask = templateTasks.find(task => 
            task.key_work.toLowerCase() === keywordInput.value.toLowerCase()
        );
        if (existingTask) {
            // Nếu đã có task với keyword này thì hiển thị cảnh báo
            keywordInput.style.border = "2px solid red";
            alert(`Keyword "${keywordInput.value}" already exists. Please choose a different keyword.`);
        } else {
            keywordInput.style.border = ""; // Reset border nếu không trùng
        }
    }
}
async function handleKeywordSuggestions(event) {
    const suggestionList = document.getElementById('suggestion-list');
    suggestionList.innerHTML = ''; // Clear previous suggestions

    if (isRepeatValue !== "Yes") {
        suggestionList.style.display = "none";
        return;
    }

    const inputValue = keywordInput.value.toLowerCase().trim();
    const templateTasks = await loadTemplateTasks();

    // Lấy danh sách key_work duy nhất
    const keywordSuggest = templateTasks
        .map(task => task.key_work)   // dùng đúng field trong DB
        .filter((value, index, self) => value && self.indexOf(value) === index);

    let filteredSuggest = keywordSuggest;
    // Nếu là sự kiện input thì lọc theo giá trị nhập
    if (event.type === "input" && inputValue !== "") {
        filteredSuggest = keywordSuggest.filter(key =>
            key.toLowerCase().includes(inputValue)
        );
    }

    if (filteredSuggest.length > 0) {
        suggestionList.style.display = "block";
        filteredSuggest.forEach(suggestion => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', function () {
                keywordInput.value = suggestion;
                suggestionList.innerHTML = '';
                suggestionList.style.display = "none";
                autofillFieldsByKeyword(); // gọi autofill sau khi chọn
            });
            suggestionList.appendChild(suggestionItem);
        });

        // Đóng suggestionList khi click ra ngoài
        document.addEventListener('mousedown', function hideSuggestionList(e) {
            if (!suggestionList.contains(e.target) && e.target !== keywordInput) {
                suggestionList.style.display = "none";
                document.removeEventListener('mousedown', hideSuggestionList);
            }
        });
    } else {
        suggestionList.style.display = "none";
    }

    keywordValue = keywordInput.value;
    autofillFieldsByKeyword();
}
function getSelectedStores() {
    const rows = storeListBody.querySelectorAll('tr');
    const selectedStores = storeList;
    rows.forEach(row => {
        const checkbox = row.querySelector('.select-store');
        if (checkbox && checkbox.checked) {
            // Kiểm tra tính duy nhất của cửa hàng
            if (selectedStores.some(store => store.id === row.cells[1].textContent)) {
                return; // Cửa hàng đã được thêm, không thêm lại
            }
            // Thêm cửa hàng vào danh sách selectedStores
            const id = row.cells[1].textContent;
            const name = row.cells[2].textContent;
            const region = row.cells[3].textContent;
            selectedStores.push({ id, name, region });
        }
    });
    return selectedStores;
}
function getAllStores() {
    const rows = storeListBody.querySelectorAll('tr');
    const allStores = [];
    rows.forEach(row => {
        const id = row.cells[1].textContent;
        const name = row.cells[2].textContent;
        const region = row.cells[3].textContent;
        allStores.push({ id, name, region });
    });
    return allStores;
}
async function filterAndRenderStores() {
    const nameValue = storeNameSearchInput.value?.toLowerCase().trim() || "";
    const regionValue = storeRegionSearchInput.value?.toLowerCase().trim() || "";
    const storeListBody = storeListTable.getElementsByTagName('tbody')[0];
    const tableTitle = document.getElementById('storeTableTitle');

    try {
        const [stores, regions] = await Promise.all([loadStores(), loadRegions()]);

        // Tạo map region_id -> region_name
        const regionMap = {};
        regions?.forEach(r => {
            if (r?.region_id != null) {
                regionMap[r.region_id] = r.region_name || "";
            }
        });

        let displayStores = [];

        if (nameValue || regionValue) {
            // Có input => Search Stores
            tableTitle.textContent = "Search Stores";
            displayStores = (stores || []).filter(store =>
                (store?.store_id?.toString().toLowerCase().includes(nameValue) ||
                 store?.store_code?.toLowerCase().includes(nameValue) ||
                 store?.store_name?.toLowerCase().includes(nameValue)) &&
                (regionMap[store?.region_id] || "").toLowerCase().includes(regionValue)
            );
        } else {
            // Input trống => Selected Stores
            tableTitle.textContent = "Selected Stores";

            // Lấy store đã chọn (từ hàm getSelectedStores)
            const selectedStores = getSelectedStores(); // [{id, name, region}, ...]
            displayStores = selectedStores.map(s => ({
                store_code: s.id,
                store_name: s.name,
                region_id: null,
                region_name: s.region
            }));
        }

        // Xóa body cũ
        storeListBody.innerHTML = '';

        // Tạo row cho mỗi store
        displayStores.forEach(store => {
            const row = document.createElement('tr');

            // Checkbox
            const tdCheckbox = document.createElement('td');
            tdCheckbox.setAttribute('data-label', 'Select');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('select-store');
            tdCheckbox.appendChild(checkbox);
            row.appendChild(tdCheckbox);

            // Store Code
            const tdCode = document.createElement('td');
            tdCode.textContent = store?.store_code ?? '';
            tdCode.setAttribute('data-label', 'Store Code');
            row.appendChild(tdCode);

            // Store Name
            const tdName = document.createElement('td');
            tdName.textContent = store?.store_name ?? '';
            tdName.setAttribute('data-label', 'Store Name');
            row.appendChild(tdName);

            // Region Name
            const tdRegion = document.createElement('td');
            tdRegion.textContent = store?.region_name ?? '';
            tdRegion.setAttribute('data-label', 'Region');
            row.appendChild(tdRegion);

            storeListBody.appendChild(row);
        });

        // Nếu không có kết quả
        if (displayStores.length === 0) {
            const emptyRow = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.textContent = "No stores found";
            td.classList.add('text-center');
            emptyRow.appendChild(td);
            storeListBody.appendChild(emptyRow);
        }

    } catch (err) {
        console.error("Error filtering stores:", err);
        storeListBody.innerHTML = "<tr><td colspan='4' class='text-center' style='color:red;'>Error loading stores</td></tr>";
    }
}

// Gắn sự kiện input
storeNameSearchInput.addEventListener("input", filterAndRenderStores);
storeRegionSearchInput.addEventListener("input", filterAndRenderStores);

// Khởi tạo mặc định hiển thị Selected Stores
filterAndRenderStores();


keywordInput.addEventListener("input", autofillFieldsByKeyword);
backButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // điều hướng về trang home
});
radios.forEach(radio => {
radio.addEventListener("change", function(event) {
    const val = event.target.value;
    isRepeatValue = val;

    if (val === "Yes") {
        addRepeatButton.style.display = "none";
    } else {
        addRepeatButton.style.display = "inline-block";
        keywordInput.value = ''; // Reset keywordInput khi chuyển sang "No"
    }

    if (document.activeElement === keywordInput) {
    handleKeywordSuggestions({ type: "focus" });
    }

    autofillFieldsByKeyword(event);
});
});
startInput.addEventListener("change", () => {
    startDate = startInput.value;
    // Kiểm tra nếu startDate lớn hơn endDate thì hiển thị cảnh báo
    if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be later than end date.");
        startInput.value = endDate; // Reset start date to end date
    }
});
endInput.addEventListener("change", () => {
    endDate = endInput.value;
    // Kiểm tra nếu endDate nhỏ hơn startDate thì hiển thị cảnh báo
    if (new Date(endDate) < new Date(startDate)) {
        alert("End date cannot be earlier than start date.");
        endInput.value = startDate; // Reset end date to start date
    }
});
["focus", "click", "input"].forEach(evt => {
    keywordInput.addEventListener(evt, handleKeywordSuggestions);
});
manualLinkInput.addEventListener("input", function () {
    manualLinkValue = manualLinkInput.value.trim();

    // Kiểm tra định dạng link hợp lệ (bắt đầu bằng http:// hoặc https://)
    const urlPattern = /^(https?:\/\/)[^\s]+$/;
    if (manualLinkValue) {
        if (urlPattern.test(manualLinkValue)) {
            manualLinkInput.style.borderColor = '';
            // Thay thế manualLinkInput bằng text đường dẫn, khi click mở link
            const linkText = document.createElement('span');
            linkText.textContent = manualLinkValue;
            linkText.style.color = 'blue';
            linkText.style.textDecoration = 'underline';
            linkText.style.cursor = 'pointer';
            linkText.onclick = function () {
                window.open(manualLinkValue, '_blank');
            };
            manualLinkInput.parentNode.replaceChild(linkText, manualLinkInput);
        } else {
            manualLinkInput.style.borderColor = 'red';
        }
    } else {
        manualLinkInput.style.borderColor = '';
    }
});
fileUploadButton.addEventListener("click", function () {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf,image/png,image/jpeg';
    fileInput.multiple = true;
    fileInput.onchange = function () {
        const files = Array.from(fileInput.files);
        if (files.length > 5) {
            alert("You can upload up to 5 files only.");
            return;
        }
        // Hiển thị danh sách tên file đã tải lên dưới button upload
        let fileDisplay = document.getElementById('uploaded-file-display');
        if (!fileDisplay) {
            fileDisplay = document.createElement('div');
            fileDisplay.id = 'uploaded-file-display';
            fileDisplay.style.marginTop = '8px';
            fileUploadButton.parentNode.insertBefore(fileDisplay, fileUploadButton.nextSibling);
        }
        fileDisplay.innerHTML = '';
        files.forEach((file, idx) => {
            if (
                file.type === 'application/pdf' ||
                file.type === 'image/png' ||
                file.type === 'image/jpeg'
            ) {
                const fileItem = document.createElement('div');
                fileItem.style.display = 'flex';
                fileItem.style.alignItems = 'center';
                fileItem.style.marginBottom = '4px';
                fileItem.innerHTML = `
                    <span>${file.name}</span>
                    <button type="button" class="remove-uploaded-file" data-idx="${idx}" style="margin-left:8px;">x</button>
                `;
                fileDisplay.appendChild(fileItem);
            } else {
                alert(`File "${file.name}" is not a valid PDF, PNG, or JPEG file.`);
            }
        });
        // Xử lý nút x để huỷ bỏ file đã upload
        fileDisplay.querySelectorAll('.remove-uploaded-file').forEach(btn => {
            btn.onclick = function () {
                btn.parentNode.remove();
            };
        });
    };
    fileInput.click();
});
storeNameSearchInput.addEventListener("input", filterAndRenderStores);
storeRegionSearchInput.addEventListener("input", filterAndRenderStores);
if (addButton) {
    addButton.addEventListener('click', function () {
        if (headerCheckbox && headerCheckbox.checked) {
            storeList = getAllStores();
        } else {
            storeList = getSelectedStores();
        }

        if (storeList.length === 0) {
            alert('Please select at least one store.');
            return;
        }

        // Hiển thị thông báo đã thêm cửa hàng
        alert(`Added ${storeList.length} store(s) to the task.`);

        // Reset input và header checkbox
        storeNameSearchInput.value = '';
        storeRegionSearchInput.value = '';
        if (headerCheckbox) headerCheckbox.checked = false;

        // Cập nhật table để hiển thị Selected Stores
        filterAndRenderStores();
    });
}
if (headerCheckbox) {
    headerCheckbox.addEventListener('change', function () {
        const check = headerCheckbox.checked;
        storeListBody.querySelectorAll('.select-store').forEach(cb => {
            cb.checked = check;
        });
    });
}
if (checkButton) {
    checkButton.addEventListener('click', function () {
        if (storeList.length === 0) {
            alert('No stores selected.');
            return;
        }

        // Tạo nội dung bảng popup
        let popupContent = '<table class="popup-store-table">';
        popupContent += '<thead><tr><th>ID</th><th>Name</th><th>Region</th></tr></thead><tbody>';
        storeList.forEach(store => {
            popupContent += `<tr>
                <td>${store.id}</td>
                <td>${store.name}</td>
                <td>${store.region}</td>
            </tr>`;
        });
        popupContent += '</tbody></table>';

        // Xóa popup cũ nếu tồn tại
        let existingPopup = document.getElementById('store-popup');
        if (existingPopup) existingPopup.remove();

        // Tạo popup
        const popup = document.createElement('div');
        popup.id = 'store-popup';
        popup.classList.add('store-popup');
        popup.innerHTML = `
            <h3 class="popup-title">Selected Stores</h3>
            <div class="popup-table-container">${popupContent}</div>
            <button id="close-store-popup" class="popup-close-btn">Close</button>
        `;
        document.body.appendChild(popup);

        // Close button
        document.getElementById('close-store-popup').onclick = function () {
            popup.remove();
        };
    });
}
responseTypeSelect.addEventListener("change", function () {
    const selectedType = responseTypeSelect.value;
    let container = document.getElementById("checklist-table-container");

    // Nếu chọn Check-List mà chưa có bảng thì tạo
    if (!container && selectedType === "Check-List") {
        container = document.createElement("div");
        container.id = "checklist-table-container";
        container.innerHTML = `
            <div class="checklist-box">
                <table class="checklist-table">
                    <caption>Check List</caption>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Check Content</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody id="checklist-body">
                        <tr>
                            <td>1</td>
                            <td><input type="text" class="check-input"></td>
                            <td><button class="delete-btn">🗑</button></td>
                        </tr>
                        <tr id="add-row">
                            <td colspan="3"><em>Nhập nội dung để thêm dòng mới...</em></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        responseTypeSelect.insertAdjacentElement("afterend", container);

        const tbody = container.querySelector("#checklist-body");
        const addRow = container.querySelector("#add-row");
        let checkContent = [];

        // Cập nhật mảng dữ liệu
        function updateCheckContent() {
            checkContent = [];
            tbody.querySelectorAll(".check-input").forEach(input => {
                if (input.value.trim() !== "") {
                    checkContent.push(input.value.trim());
                }
            });
            console.log("Check List:", checkContent);
        }

        // Lắng nghe nhập liệu
        tbody.addEventListener("input", function (e) {
            if (e.target.classList.contains("check-input")) {
                const allInputs = tbody.querySelectorAll(".check-input");
                const lastInput = allInputs[allInputs.length - 1];

                // Nếu ô cuối có dữ liệu
                if (lastInput.value.trim() !== "") {
                    if (allInputs.length < 5) {
                        // Thêm dòng mới nếu chưa đạt giới hạn
                        const newRow = document.createElement("tr");
                        newRow.innerHTML = `
                            <td>${allInputs.length + 1}</td>
                            <td><input type="text" class="check-input"></td>
                            <td><button class="delete-btn">🗑</button></td>
                        `;
                        tbody.insertBefore(newRow, addRow);
                        addRow.innerHTML = `<td colspan="3"><em>Nhập nội dung để thêm dòng mới...</em></td>`;
                    } else {
                        // Đã đạt 5 dòng → cập nhật thông báo
                        addRow.innerHTML = `<td colspan="3" style="color:red;"><em>Tối đa 05 nội dung cho Check List</em></td>`;
                    }
                }
                updateCheckContent();
            }
        });

        // Xoá hàng
        tbody.addEventListener("click", function (e) {
            if (e.target.classList.contains("delete-btn")) {
                e.target.closest("tr").remove();

                // Đánh lại số thứ tự
                const rows = tbody.querySelectorAll("tr:not(#add-row)");
                rows.forEach((row, index) => {
                    row.querySelector("td").textContent = index + 1;
                });

                // Reset lại thông báo nếu < 5 dòng
                const allInputs = tbody.querySelectorAll(".check-input");
                if (allInputs.length < 5) {
                    addRow.innerHTML = `<td colspan="3"><em>Nhập nội dung để thêm dòng mới...</em></td>`;
                }

                updateCheckContent();
            }
        });
    }

    // Hiển thị theo loại
    if (selectedType === "Check-List") {
        if (container) container.style.display = "block";
        responseTypeNumberInput.style.display = "none";
        manualLinkInput.style.display = "none";
    } 
    else if (selectedType === "Picture") {
        if (container) container.style.display = "none";
        responseTypeNumberInput.style.display = "inline-block";
        manualLinkInput.style.display = "none";

        // validate số lượng ảnh
        responseTypeNumberInput.addEventListener("input", function () {
            const value = parseInt(responseTypeNumberInput.value, 10);
            if (isNaN(value) || value < 1 || value > 20) {
                responseTypeNumberInput.style.borderColor = "red";
                responseTypeNumberInput.value = '10';
                alert("Please enter a number between 1 and 20.");
            } else {
                responseTypeNumberInput.style.borderColor = "";
            }
        });
    } 
    else if (selectedType === "Yes-No") {
        if (container) container.style.display = "none";
        responseTypeNumberInput.style.display = "none";
        manualLinkInput.style.display = "none";
    }
});

taskDetailsInput.addEventListener("input", function () {
    taskDetailsValue = taskDetailsInput.value.trim();
});
if (addRepeatButton) {
    addRepeatButton.style.display = isRepeatValue === "Yes" ? "none" : "inline-block";
}
createTaskButton.addEventListener("click", function () {
    // Reset border trước mỗi lần check
    [startInput, endInput, keywordInput, manualLinkInput, reInput, taskNameInput, taskTypeSelect, responseTypeSelect]
        .forEach(input => {
            if (input) input.style.border = "";
        });

    let storeElement = document.getElementById("store-list-form");
    if (storeElement) storeElement.style.border = "";

    let missingFields = [];

    if (!startInput.value) {
        missingFields.push("Start date");
        startInput.style.border = "2px solid red";
    }
    if (!endInput.value) {
        missingFields.push("End date");
        endInput.style.border = "2px solid red";
    }
    if (!keywordInput.value) {
        missingFields.push("Keyword");
        keywordInput.style.border = "2px solid red";
    }
    if (!manualLinkInput.value) {
        missingFields.push("Manual link");
        manualLinkInput.style.border = "2px solid red";
    }
    if (storeList.length === 0) {
        missingFields.push("Store");
        if (storeElement) storeElement.style.border = "2px solid red";
    }
    if (!reInput.value) {
        missingFields.push("Re");
        reInput.style.border = "2px solid red";
    }
    if (!taskNameInput.value) {
        missingFields.push("Task name");
        taskNameInput.style.border = "2px solid red";
    }
    if (!taskTypeSelect.value) {
        missingFields.push("Task type");
        taskTypeSelect.style.border = "2px solid red";
    }
    if (!responseTypeSelect.value) {
        missingFields.push("Response type");
        responseTypeSelect.style.border = "2px solid red";
    }

    if (missingFields.length > 0) {
        alert("Please fill in the following required fields:\n- " + missingFields.join("\n- "));
        return;
    }

    // Lấy dữ liệu task hiện tại
    const taskValue = {
        startDate: startInput.value,
        endDate: endInput.value,
        keyword: keywordInput.value,
        manualLink: manualLinkInput.value,
        storeList: storeList.map(store => store.name),
        re: reInput.value,
        taskName: taskNameInput.value,
        taskType: taskTypeSelect.value,
        responseType: responseTypeSelect.value,
        responseTypeNumber: responseTypeNumberInput.value || '',
        taskDetails: taskDetailsInput.value || ''
    };

    // Reset các trường sau khi tạo task thành công
    keywordInput.value = '';
    manualLinkInput.value = '';
    storeList = [];
    reInput.value = '';
    taskNameInput.value = '';
    taskTypeSelect.value = 'Thống kê';
    responseTypeSelect.value = 'Img';
    responseTypeNumberInput.value = '';
    taskDetailsInput.value = '';

    // Hiển thị taskValue thông qua popup
    let popupContent = `
        <table border="1" style="border-collapse:collapse;width:100%">
            <tr>
                <th>Start Date</th><th>End Date</th><th>Keyword</th><th>Manual Link</th>
                <th>Store</th><th>RE</th><th>Task Name</th><th>Task Type</th>
                <th>Response Type</th><th>Response Number</th><th>Task Detail</th>
            </tr>
            <tr>
                <td>${taskValue.startDate}</td>
                <td>${taskValue.endDate}</td>
                <td>${taskValue.keyword}</td>
                <td>${taskValue.manualLink}</td>
                <td>${taskValue.storeList.join(', ')}</td>
                <td>${taskValue.re}</td>
                <td>${taskValue.taskName}</td>
                <td>${taskValue.taskType}</td>
                <td>${taskValue.responseType}</td>
                <td>${taskValue.responseTypeNumber}</td>
                <td>${taskValue.taskDetails}</td>
            </tr>
        </table>
    `;

    // Xoá popup cũ nếu có
    let existingPopup = document.getElementById('task-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Tạo popup
    const popup = document.createElement('div');
    popup.id = 'task-popup';
    Object.assign(popup.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        border: '1px solid #ccc',
        padding: '16px',
        zIndex: '9999',
        maxHeight: '80vh',
        overflowY: 'auto'
    });

    popup.innerHTML = `
        <h3>Create Task</h3>
        ${popupContent}
        <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
            <button id="close-task-popup">Close</button>
            <button id="confirm-create-task">Confirm</button>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById('close-task-popup').onclick = function () {
        popup.remove();
    };

    // Lưu taskValue vào file task-to-do.json dùng Node.js API
    document.getElementById('confirm-create-task').onclick = function () {
        fetch("http://localhost:3000/add-task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskValue)
        })
        .then(res => res.json())
        .then(data => {
            alert("Task saved!");
        })
        .catch(err => {
            alert(
                "Lỗi lưu task: " + error.message + "\n\n" +
                "Hướng dẫn chạy server Node.js:\n" +
                "1. Run CMD: cd \"C:\Users\WIN10\Documents\Aura Web\public\auraProject\"\n" +
                "2. CMD: node server.js\n" +
                "   (Nếu thành công, CMD sẽ in ra: Server chạy tại http://localhost:3000)\n" +
                "3. Quan trọng: Giữ cửa sổ CMD luôn mở.\n" +
                "   Nếu đóng thì server tắt ngay → web gọi API sẽ báo ERR_CONNECTION_REFUSED"
            );
        });
        popup.remove();
    };

    // Dùng Firebase Database
    // document.getElementById('confirm-create-task').onclick = async () => {
    //     writeTask(taskValue);
    //     popup.remove();
    // };
});
addRepeatButton.addEventListener("click", function () {
// Reset border trước mỗi lần check
    [startInput, endInput, keywordInput, manualLinkInput, reInput, taskNameInput, taskTypeSelect, responseTypeSelect]
        .forEach(input => {
            if (input) input.style.border = "";
        });

    let storeElement = document.getElementById("store-list-form");
    if (storeElement) storeElement.style.border = "";

    let missingFields = [];

    if (!startInput.value) {
        missingFields.push("Start date");
        startInput.style.border = "2px solid red";
    }
    if (!endInput.value) {
        missingFields.push("End date");
        endInput.style.border = "2px solid red";
    }
    if (!keywordInput.value) {
        missingFields.push("Keyword");
        keywordInput.style.border = "2px solid red";
    }
    if (!manualLinkInput.value) {
        missingFields.push("Manual link");
        manualLinkInput.style.border = "2px solid red";
    }
    if (storeList.length === 0) {
        missingFields.push("Store");
        if (storeElement) storeElement.style.border = "2px solid red";
    }
    if (!reInput.value) {
        missingFields.push("Re");
        reInput.style.border = "2px solid red";
    }
    if (!taskNameInput.value) {
        missingFields.push("Task name");
        taskNameInput.style.border = "2px solid red";
    }
    if (!taskTypeSelect.value) {
        missingFields.push("Task type");
        taskTypeSelect.style.border = "2px solid red";
    }
    if (!responseTypeSelect.value) {
        missingFields.push("Response type");
        responseTypeSelect.style.border = "2px solid red";
    }

    if (missingFields.length > 0) {
        alert("Please fill in the following required fields:\n- " + missingFields.join("\n- "));
        return;
    }

    // Lấy dữ liệu task hiện tại
    const taskValue = {
        startDate: startInput.value,
        endDate: endInput.value,
        keyword: keywordInput.value,
        manualLink: manualLinkInput.value,
        storeList: storeList.map(store => store.name),
        re: reInput.value,
        taskName: taskNameInput.value,
        taskType: taskTypeSelect.value,
        responseType: responseTypeSelect.value,
        responseTypeNumber: responseTypeNumberInput.value || '',
        taskDetails: taskDetailsInput.value || ''
    };

    // Reset các trường sau khi tạo task thành công
    keywordInput.value = '';
    manualLinkInput.value = '';
    storeList = [];
    reInput.value = '';
    taskNameInput.value = '';
    taskTypeSelect.value = 'Thống kê';
    responseTypeSelect.value = 'Img';
    responseTypeNumberInput.value = '';
    taskDetailsInput.value = '';

    // Hiển thị taskValue thông qua popup
    let popupContent = `
        <table border="1" style="border-collapse:collapse;width:100%">
            <tr>
                <th>Start Date</th><th>End Date</th><th>Keyword</th><th>Manual Link</th>
                <th>Store</th><th>RE</th><th>Task Name</th><th>Task Type</th>
                <th>Response Type</th><th>Response Number</th><th>Task Detail</th>
            </tr>
            <tr>
                <td>${taskValue.startDate}</td>
                <td>${taskValue.endDate}</td>
                <td>${taskValue.keyword}</td>
                <td>${taskValue.manualLink}</td>
                <td>${taskValue.storeList.join(', ')}</td>
                <td>${taskValue.re}</td>
                <td>${taskValue.taskName}</td>
                <td>${taskValue.taskType}</td>
                <td>${taskValue.responseType}</td>
                <td>${taskValue.responseTypeNumber}</td>
                <td>${taskValue.taskDetails}</td>
            </tr>
        </table>
    `;

    // Xoá popup cũ nếu có
    let existingPopup = document.getElementById('repeat-task-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Tạo popup
    const popup = document.createElement('div');
    popup.id = 'repeat-task-popup';
    Object.assign(popup.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        border: '1px solid #ccc',
        padding: '16px',
        zIndex: '9999',
        maxHeight: '80vh',
        overflowY: 'auto'
    });

    popup.innerHTML = `
        <h3>Add Repeat Task</h3>
        ${popupContent}
        <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
            <button id="close-repeat-task-popup">Close</button>
            <button id="confirm-repeat-task">Confirm</button>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById('close-repeat-task-popup').onclick = function () {
        popup.remove();
    };

    document.getElementById('confirm-repeat-task').onclick = function () {
        // Lưu taskValue vào file repeat-task.json dùng Node.js API
        fetch("http://localhost:3000/repeat-task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskValue)
        })
        .then(res => res.json())
        .then(data => {
            alert("Task Repeat Added!");
        })
        .catch(err => {
            alert(
                "Lỗi lưu task: " + error.message + "\n\n" +
                "Hướng dẫn chạy server Node.js:\n" +
                '1. Run CMD: cd /d "D:\Project\Aura Web\public"\n' +
                "2. CMD: node server.js\n" +
                "   (Nếu thành công, CMD sẽ in ra: Server chạy tại http://localhost:3000)\n" +
                "3. Quan trọng: Giữ cửa sổ CMD luôn mở.\n" +
                "   Nếu đóng thì server tắt ngay → web gọi API sẽ báo ERR_CONNECTION_REFUSED"
            );
        });
        popup.remove();
    };
}   
);