document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.getElementById('back-to-home');
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
    const taskTypeSelect = document.getElementById("task-type");
    const responseTypeSelect = document.getElementById("response-type");
    const responseTypeNumberInput = document.getElementById("response-type-number");
    const taskDetailsInput = document.getElementById("task-details");
    const createTaskButton = document.getElementById("create-task");
    const addButton = document.getElementById('add-button');
    const storeListBody = storeListTable.getElementsByTagName('tbody')[0];
    const headerCheckbox = storeListTable.querySelector('thead input[type="checkbox"]');
    
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

    // Hàm để tải dữ liệu task từ file JSON
    async function loadTaskDatas() {
        try {
            const response = await fetch('create-task.json'); // Adjust the path to your JSON file
            return await response.json();
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
 
    // Back to Home
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.location.href = '../index.html'; // Adjust this to your home page
        });
    }

    // Xử lý sự kiện thay đổi giá trị của các radio buttons
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

    async function autofillFieldsByKeyword() {
        if (isRepeatValue === "Yes" && keywordInput.value.trim() !== "") {
            const taskDatas = await loadTaskDatas();
            const matchedTask = taskDatas.find(task => 
                task.keyword.toLowerCase() === keywordInput.value.toLowerCase()
            );

            if (matchedTask) {
                manualLinkInput.value = matchedTask.manualLink || '';
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
                    taskNameInput.value = matchedTask.taskName || '';
                    taskNameInput.disabled = true;
                }

                if (taskTypeSelect) {
                    taskTypeSelect.value = matchedTask.taskType || 'Thống kê';
                    taskTypeSelect.disabled = true;
                }

                if (responseTypeSelect) {
                    responseTypeSelect.value = matchedTask.responseType || 'Img';
                    responseTypeSelect.disabled = true;
                }

                if (responseTypeNumberInput) {
                    responseTypeNumberInput.value = matchedTask.responseTypeNumber || '';
                    // Nếu responseType là "Yes/No" hoặc "Check list" thì ẩn responseTypeNumberInput, nếu không thì hiển thị nhưng vô hiệu hoá
                    if (matchedTask.responseType === "Yes/No" || matchedTask.responseType === "Check list") {
                        responseTypeNumberInput.style.display = 'none';
                    } else {
                        responseTypeNumberInput.disabled = true;
                        responseTypeNumberInput.style.display = 'inline-block';                        
                    }
                }
            }

           // Reset boder cho các input
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
            taskTypeSelect.value = 'Thống kê';
            taskTypeSelect.disabled = false;
            responseTypeSelect.value = 'Img';
            responseTypeSelect.disabled = false;
            responseTypeNumberInput.style.display = 'inline-block';
            responseTypeNumberInput.disabled = false;
            responseTypeNumberInput.value = '';

            // Kiểm tra tính duy nhất của keywordInput
            const taskDatas = await loadTaskDatas();
            const existingTask = taskDatas.find(task => 
                task.keyword.toLowerCase() === keywordInput.value.toLowerCase()
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

    // Gán giá trị cho keywordInput mỗi khi người dùng nhập, đồng thời gọi hàm autofillFieldsByKeyword
    keywordInput.addEventListener("input", autofillFieldsByKeyword);

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

    // Thêm sự kiện focus, click và input cho keywordInput để hiển thị gợi ý
    ["focus", "click", "input"].forEach(evt => {
        keywordInput.addEventListener(evt, handleKeywordSuggestions);
    });
    
    // Xử lý sự kiện nhập vào manualLinkInput
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

    // Xử lý sự kiện click vào nút upload file
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

    // Thêm sự kiện input cho storeNameSearchInput và storeRegionSearchInput để lọc và hiển thị danh sách cửa hàng
    storeNameSearchInput.addEventListener("input", filterAndRenderStores);
    storeRegionSearchInput.addEventListener("input", filterAndRenderStores);

    // Hàm để lấy danh sách cửa hàng đã chọn hoặc tất cả cửa hàng
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

    // Hàm để lấy tất cả cửa hàng trong danh sách
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

    // Thêm sự kiện click cho nút "Add" để thêm cửa hàng vào danh sách storeList
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
            // Đăt lại giá trị của storeListTable
            storeListBody.innerHTML = '';
            storeNameSearchInput.value = '';
            storeRegionSearchInput.value = '';
            // Đặt lại checkbox ở header
            if (headerCheckbox) {
                headerCheckbox.checked = false;
            }
        });
    }

    // Thêm sự kiện change cho checkbox ở header để chọn/deselect tất cả cửa hàng
    if (headerCheckbox) {
        headerCheckbox.addEventListener('change', function () {
            const check = headerCheckbox.checked;
            storeListBody.querySelectorAll('.select-store').forEach(cb => {
                cb.checked = check;
            });
        });
    }

    // Thêm sự kiện click cho nút "Check" để hiển thị danh sách cửa hàng đã chọn
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

    responseTypeSelect.addEventListener("change", function () {
        const selectedType = responseTypeSelect.value;

        switch (selectedType) {
            case "Img":
                // Nếu chọn Img thì hiển thị ô nhập số lượng ảnh
                responseTypeNumberInput.style.display = "inline-block";
                // Kiểm tra nếu số lượng ảnh không nằm trong khoảng 1-20
                responseTypeNumberInput.addEventListener("input", function () {
                    const value = parseInt(responseTypeNumberInput.value, 10);
                    if (isNaN(value) || value < 1 || value > 20) {
                        responseTypeNumberInput.style.borderColor = "red";
                        responseTypeNumberInput.value = '10'; // Reset giá trị
                        alert("Please enter a number between 1 and 20.");
                    } else {
                        responseTypeNumberInput.style.borderColor = "";
                    }
                });                
                break;

            case "Comment":
                // Nếu chọn Img thì hiển thị ô nhập số lượng ký tự
                responseTypeNumberInput.style.display = "inline-block";
                // Kiểm tra nếu số lượng ký tự comment không nằm trong khoảng 1-1000
                responseTypeNumberInput.addEventListener("input", function () {
                    const value = parseInt(responseTypeNumberInput.value, 10);
                    if (isNaN(value) || value < 1 || value > 1000) {
                        responseTypeNumberInput.style.borderColor = "red";
                        responseTypeNumberInput.value = '500'; // Reset giá trị
                        alert("Please enter a number between 1 and 1000.");
                    } else {
                        responseTypeNumberInput.style.borderColor = "";
                    }
                });
                break;

            case "Check list":
                // Nếu chọn Check list thì không hiển thị ô nhập số lượng
                responseTypeNumberInput.style.display = "none";
                break;

            case "Yes/No":
                // Nếu chọn Yes/No thì không hiển thị ô nhập số lượng
                responseTypeNumberInput.style.display = "none";

            default:
                // Reset nếu chưa chọn hoặc không hợp lệ
                responseTypeNumberInput.style.display = "none";
                manualLinkInput.style.display = "inline-block";
                taskDetailsInput.style.display = "block";
                break;
        }
    });


    // Lấy giá trị cho taskDetailsInput mỗi khi người dùng thay đổi
    taskDetailsInput.addEventListener("input", function () {
        taskDetailsValue = taskDetailsInput.value.trim();
        // Kiểm tra nếu taskDetailsValue không rỗng thì hiển thị thông báo
        if (taskDetailsValue) {
            console.log(`Task Details: ${taskDetailsValue}`);
        }
    });

    // Mặc định addRepeatButton là ẩn nếu isRepeatValue là "Yes"
    if (addRepeatButton) {
        addRepeatButton.style.display = isRepeatValue === "Yes" ? "none" : "inline-block";
    }

    // Xử lý sự kiện click cho nút "Create Task"
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

        document.getElementById('confirm-create-task').onclick = function () {
            // Lưu taskValue vào file task-to-do.json dùng Node.js API
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
                    "1. Run CMD: cd \"C:\\Users\\WIN10\\Documents\\Aura Project\"\n" +
                    "2. CMD: node server.js\n" +
                    "   (Nếu thành công, CMD sẽ in ra: Server chạy tại http://localhost:3000)\n" +
                    "3. Quan trọng: Giữ cửa sổ CMD luôn mở.\n" +
                    "   Nếu đóng thì server tắt ngay → web gọi API sẽ báo ERR_CONNECTION_REFUSED"
                );
            });
            popup.remove();
        };
    });

    // Xử lý sự kiện click cho nút "Add Repeat"
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
                    "1. Run CMD: cd \"C:\\Users\\WIN10\\Documents\\Aura Project\"\n" +
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
});
