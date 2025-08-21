document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.getElementById('back-to-home');
    const createButton = document.getElementById('create-task');
    const addRepeatButton = document.getElementById('add-repeat-task');
    const checkButton = document.getElementById('check-button');
    const radios = document.querySelectorAll('input[name="is-repeat"]');
    const startInput = document.getElementById("start-day");
    const endInput = document.getElementById("end-day");
    const today = new Date().toISOString().split("T")[0];
    const keywordInput = document.getElementById("keyword");
    const manualLinkInput = document.getElementById("manual-link");
    const fileUploadButton = document.getElementById("upload-file");
    const storeNameSearchInput = document.getElementById("store-filter");
    const storeRegionSearchInput = document.getElementById("region-filter");
    const storeListTable = document.getElementById("store-list");
    const reInput = document.getElementById("re");
    const taskNameInput = document.getElementById("task-name");
    let isRepeatValue = document.querySelector('input[name="is-repeat"]:checked')?.value || 'No';
    startInput.value = today; // Mặc định startInput là ngày hôm nay
    endInput.value = today; // Mặc định endInput là ngày hôm nay
    let startDate = today; // Mặc định là ngày hôm nay
    let endDate = today; // Mặc định là ngày hôm nay
    let keywordValue = keywordInput.value || '';
    let manualLinkValue = manualLinkInput.value || '';
    let storeList = []; // Biến lưu trữ danh sách cửa hàng
    let reValue = 0;
    let taskNameValue = "";

    // Đặt danh sách ban đầu của table store list là trống
    storeListTable.querySelector('tbody').innerHTML = '';

    // Begin Function Load tasks
    async function loadTaskDatas() {
        try {
            const response = await fetch('create-task.json'); // Adjust the path to your JSON file
            return await response.json();
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
    // End Function Load tasks
 
    // Back to Home
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.location.href = '../index.html'; // Adjust this to your home page
        });
    }

    radios.forEach(radio => {
    radio.addEventListener("change", function(event) {
        const val = event.target.value;
        isRepeatValue = val;

        if (val === "Yes") {
        addRepeatButton.style.display = "none";
        } else {
        addRepeatButton.style.display = "inline-block";
        }

        if (document.activeElement === keywordInput) {
        handleKeywordSuggestions({ type: "focus" });
        }

        autofillFieldsByKeyword(event);
    });
    });

    keywordInput.addEventListener("input", autofillFieldsByKeyword);
    console.log('keywordValue', keywordValue)

    async function autofillFieldsByKeyword() {
        if (isRepeatValue === "Yes" && keywordInput.value.trim() !== "") {
            const taskDatas = await loadTaskDatas();
            const matchedTask = taskDatas.find(task => task.keyword.toLowerCase() === keywordInput.value.toLowerCase());
            if (matchedTask) {
                manualLinkInput.value = matchedTask.manualLink || '';
                manualLinkValue = manualLinkInput.value;

                if (reInput) {
                    reInput.value = matchedTask.re || '';
                }

                if (taskNameInput) {
                    taskNameInput.value = matchedTask.taskName || '';
                }
            }
        }
    }

    // Gán giá trị cho startInput mỗi khi người dùng thay đổi ngày, đồng thời kiểm tra ngày bắt đầu và kết thúc
    startInput.addEventListener("change", () => {
        startDate = startInput.value;
        // Kiểm tra nếu startDate lớn hơn endDate thì hiển thị cảnh báo
        if (new Date(startDate) > new Date(endDate)) {
            alert("Start date cannot be later than end date.");
            startInput.value = endDate; // Reset start date to end date
        }
    });

    // Gán giá trị cho endInput mỗi khi người dùng thay đổi ngày, đồng thời kiểm tra ngày bắt đầu và kết thúc
    endInput.addEventListener("change", () => {
        endDate = endInput.value;
        // Kiểm tra nếu endDate nhỏ hơn startDate thì hiển thị cảnh báo
        if (new Date(endDate) < new Date(startDate)) {
            alert("End date cannot be earlier than start date.");
            endInput.value = startDate; // Reset end date to start date
        }
    });

    // Hiển thị suggestion khi focus/click/input vào keywordInput chỉ khi isRepeatValue là "Yes"
    async function handleKeywordSuggestions(event) {
        const suggestionList = document.getElementById('suggestion-list');
        suggestionList.innerHTML = ''; // Clear previous suggestions

        if (isRepeatValue !== "Yes") {
            suggestionList.style.display = "none";
            return;
        }

        const inputValue = keywordInput.value.toLowerCase().trim();
        const taskDatas = await loadTaskDatas();
        // Lấy danh sách keyword duy nhất
        const keywordSuggest = taskDatas
            .map(task => task.keyword)
            .filter((value, index, self) => self.indexOf(value) === index);

        let filteredSuggest = keywordSuggest;
        // Nếu là sự kiện input thì lọc theo giá trị nhập
        if (event.type === "input" && inputValue !== "") {
            filteredSuggest = keywordSuggest.filter(keyword =>
                keyword.toLowerCase().includes(inputValue)
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
                    autofillFieldsByKeyword();
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

    // Kết hợp các sự kiện focus, click, input
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
        // Cho phép chọn nhiều file, tối đa 5 file
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

    // Tìm kiếm cửa hàng theo giá trị nhập vào storeNameSearchInput và storeRegionSearchInput (tương đối %XXX%)
    async function filterAndRenderStores() {
        const nameValue = storeNameSearchInput.value.toLowerCase().trim();
        const regionValue = storeRegionSearchInput.value.toLowerCase().trim();
        const storeListBody = storeListTable.getElementsByTagName('tbody')[0];

        // Lấy danh sách cửa hàng từ file store.json
        let stores = [];
        try {
            const response = await fetch('store.json');
            stores = await response.json();
        } catch (error) {
            console.error('Error loading stores:', error);
        }

        // Lọc danh sách theo cả name và region
        const filteredStores = stores.filter(store =>
            (store.id.toLowerCase().includes(nameValue) ||
             store.name.toLowerCase().includes(nameValue)) &&
            store.region.toLowerCase().includes(regionValue)
        );

        // Hiển thị danh sách đã lọc (chỉ id, name, region)
        storeListBody.innerHTML = '';
        filteredStores.forEach(store => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="select-store"></td>
                <td style="text-align:center;">${store.id}</td>
                <td>${store.name}</td>
                <td style="text-align:center;">${store.region}</td>
            `;
            storeListBody.appendChild(row);
        });
    }

    storeNameSearchInput.addEventListener("input", filterAndRenderStores);
    storeRegionSearchInput.addEventListener("input", filterAndRenderStores);

    const addButton = document.getElementById('add-button');
    const storeListBody = storeListTable.getElementsByTagName('tbody')[0];
    const headerCheckbox = storeListTable.querySelector('thead input[type="checkbox"]');

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
            // Hiển thị danh sách storeList với tất cả giá trị của mỗi phần tử thông qua popup
            if (storeList.length === 0) {
                alert('No stores selected.');
                return;
            }
            let popupContent = '<table border="1" style="border-collapse:collapse;width:100%">';
            popupContent += '<tr><th>ID</th><th>Name</th><th>Region</th></tr>';
            storeList.forEach(store => {
                popupContent += `<tr>
                    <td>${store.id}</td>
                    <td>${store.name}</td>
                    <td>${store.region}</td>
                </tr>`;
            });
            popupContent += '</table>';

            // Kiểm tra xem popup đã tồn tại chưa, nếu có thì xoá trước khi tạo mới
            let existingPopup = document.getElementById('store-popup');
            if (existingPopup) {
                existingPopup.remove();
            }

            // Tạo popup
            const popup = document.createElement('div');
            popup.id = 'store-popup';
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.background = '#fff';
            popup.style.border = '1px solid #ccc';
            popup.style.padding = '16px';
            popup.style.zIndex = '9999';
            popup.style.maxHeight = '80vh';
            popup.style.overflowY = 'auto';
            popup.innerHTML = `
                <h3>Selected Stores</h3>
                ${popupContent}
                <button id="close-store-popup" style="margin-top:12px;">Close</button>
            `;
            document.body.appendChild(popup);

            document.getElementById('close-store-popup').onclick = function () {
                popup.remove();
            };
        });
    }



    // Handle create task action
    if (createButton) {
        createButton.addEventListener('click', function () {
            // Add your task creation logic here
            console.log('Task Created');
        });
    }

    // Handle add repeat task action
    if (addRepeatButton) {
        addRepeatButton.addEventListener('click', function () {
            // Add your repeat task logic here
            console.log('Repeat Task Added');
        });
    }
});
/* Removed duplicate DOMContentLoaded block and unused variables to fix errors and ensure proper popup display. */
