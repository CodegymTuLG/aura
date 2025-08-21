document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.getElementById('back-to-home');
    const createButton = document.getElementById('create-task');
    const addRepeatButton = document.getElementById('add-repeat-task');
    const searchButton = document.getElementById('search-store');
    const checkButton = document.getElementById('check-stores');
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

    // Handle search store
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            const storeListInput = document.getElementById('store-list').value;
            // Handle search store logic here
            console.log(`Searching stores with: ${storeListInput}`);
        });
    }

    // Handle check stores
    if (checkButton) {
        checkButton.addEventListener('click', function () {
            // Handle check store logic here
            console.log('Stores Checked');
        });
    }
});
document.addEventListener("DOMContentLoaded", async function() {
    const storeListContainer = document.getElementById('store-list').getElementsByTagName('tbody')[0];
    const searchButton = document.getElementById('search-button');
    const storeFilter = document.getElementById('store-filter');

    // Load stores from store.json
    let stores = [];
    try {
        const response = await fetch('store.json');
        stores = await response.json();
    } catch (error) {
        console.error('Error loading stores:', error);
    }

    // Function to render store list
    function renderStoreList(filteredStores) {
        storeListContainer.innerHTML = '';  // Clear the current list
        filteredStores.forEach(store => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="select-store"></td>
                <td>${store.code}</td>
                <td>${store.name}</td>
                <td>${store.region}</td>
            `;
            storeListContainer.appendChild(row);
        });
    }

    // Render initial store list
    renderStoreList(stores);

    // Search function
    searchButton.addEventListener('click', function() {
        const searchValue = storeFilter.value.toLowerCase();
        const filteredStores = stores.filter(store =>
            store.code.toLowerCase().includes(searchValue) || 
            store.name.toLowerCase().includes(searchValue) ||
            store.region.toLowerCase().includes(searchValue)
        );
        renderStoreList(filteredStores);
    });

    // Optional: Add functionality for "Add Repeat Task" and "Create Task" buttons
    document.getElementById('add-repeat-task').addEventListener('click', function() {
        alert('Add repeat task clicked!');
    });

    document.getElementById('create-task').addEventListener('click', function() {
        alert('Create task clicked!');
    });
});
