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
    let isRepeatValue = document.querySelector('input[name="is-repeat"]:checked')?.value || 'No';
    startInput.value = today; // Mặc định startInput là ngày hôm nay
    endInput.value = today; // Mặc định endInput là ngày hôm nay
    let startDate = today; // Mặc định là ngày hôm nay
    let endDate = today; // Mặc định là ngày hôm nay
    let keywordValue = keywordInput.value || '';
    let manualLinkValue = manualLinkInput.value || '';
    let storeList = []; // Biến lưu trữ danh sách cửa hàng

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

    // Gán giá trị Yes hoặc No cho biến isRepeatValue mỗi khi người dùng chọn radio
    radios.forEach(radio => {
        radio.addEventListener("change", function(event) {
            isRepeatValue = event.target.value;
            if (event.target.value === "Yes") {
                addRepeatButton.style.display = "none"; // Ẩn nút "Add Repeat Task" nếu isRepeatValue là "Yes"
            } else {
                addRepeatButton.style.display = "inline-block"; // Hiển thị nút "Add Repeat Task" nếu isRepeatValue là "Yes"
            }
        });
    });
    
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

    // Nếu isRepeatValue là "Yes", keywordInput sẽ hiển thị danh sách đề xuất từ data để gợi ý
    keywordInput.addEventListener("input", async function () {
        const suggestionList = document.getElementById('suggestion-list');
        suggestionList.innerHTML = ''; // Clear previous suggestions

        const inputValue = keywordInput.value.toLowerCase().trim();

        if (isRepeatValue === "Yes" && inputValue !== "") {
            const taskDatas = await loadTaskDatas();
            // Lấy danh sách keyword duy nhất
            const keywordSuggest = taskDatas
                .map(task => task.keyword)
                .filter((value, index, self) => self.indexOf(value) === index);

            // Tìm kiếm tương đối (giống %XXX%)
            const filteredSuggest = keywordSuggest.filter(keyword =>
                keyword.toLowerCase().includes(inputValue)
            );

            console.log('Keyword suggestions:', filteredSuggest);

            if (filteredSuggest.length > 0) {
                suggestionList.style.display = "block";

                filteredSuggest.forEach(suggestion => {
                    const suggestionItem = document.createElement('li');
                    suggestionItem.textContent = suggestion;

                    suggestionItem.addEventListener('click', function () {
                        keywordInput.value = suggestion; 
                        suggestionList.innerHTML = ''; 
                        suggestionList.style.display = "none";
                    });

                    suggestionList.appendChild(suggestionItem);
                });
            } else {
                suggestionList.style.display = "none";
            }
        } else {
            suggestionList.style.display = "none";
        }

        keywordValue = keywordInput.value;
        console.log('Keyword value:', keywordValue);
    });

    // Nếu isRepeatValue là "Yes", tự động điền manualLinkInput, RE Input, Task Name dựa trên keywordValue
    async function autofillFieldsByKeyword() {
        if (isRepeatValue === "Yes" && keywordValue.trim() !== "") {
            const taskDatas = await loadTaskDatas();
            const matchedTask = taskDatas.find(task => task.keyword.toLowerCase() === keywordValue.toLowerCase());
            if (matchedTask) {
                // Gán giá trị cho manualLinkInput
                manualLinkInput.value = matchedTask.manualLink || '';
                manualLinkValue = manualLinkInput.value;

                // Gán giá trị cho RE Input
                const reInput = document.getElementById('re-input');
                if (reInput) {
                    reInput.value = matchedTask.re || '';
                }

                // Gán giá trị cho Task Name
                const taskNameInput = document.getElementById('task-name');
                if (taskNameInput) {
                    taskNameInput.value = matchedTask.taskName || '';
                }
            }
        }
    }

    // Gọi autofillFieldsByKeyword mỗi khi keywordInput thay đổi nếu isRepeatValue là Yes
    keywordInput.addEventListener("input", autofillFieldsByKeyword);
    radios.forEach(radio => {
        radio.addEventListener("change", autofillFieldsByKeyword);
    });
    
    manualLinkInput.addEventListener("input", function () {
        manualLinkValue = manualLinkInput.value.trim();
        console.log('Manual link value:', manualLinkValue);

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
        // Tải lên file PDF, Img, png từ máy tính, mở một popup để người dùng chọn file
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/pdf,image/png,image/jpeg'; // Accept PDF, PNG, JPEG files
        fileInput.onchange = function () { 
            const file = fileInput.files[0];
            if (file) {
                // Kiểm tra định dạng file
                if (file.type === 'application/pdf' || file.type === 'image/png' || file.type === 'image/jpeg') {
                    // Hiển thị tên file đã tải lên dưới button upload
                    let fileDisplay = document.getElementById('uploaded-file-display');
                    if (!fileDisplay) {
                        fileDisplay = document.createElement('div');
                        fileDisplay.id = 'uploaded-file-display';
                        fileDisplay.style.marginTop = '8px';
                        fileUploadButton.parentNode.insertBefore(fileDisplay, fileUploadButton.nextSibling);
                    }
                    fileDisplay.innerHTML = `
                        <span>${file.name}</span>
                        <button type="button" id="remove-uploaded-file" style="margin-left:8px;">x</button>
                    `;
                    // Không đặt giá trị manualLinkInput thành tên file

                    // Xử lý nút x để huỷ bỏ file đã upload
                    document.getElementById('remove-uploaded-file').onclick = function() {
                        fileDisplay.remove();
                    };
                } else {
                    alert("Please upload a valid PDF, PNG, or JPEG file.");
                }
            }
        }
        fileInput.click(); // Mở hộp thoại chọn file
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
        const selectedStores = [];
        rows.forEach(row => {
            const checkbox = row.querySelector('.select-store');
            if (checkbox && checkbox.checked) {
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
            console.log('Current storeList:', storeList);
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
