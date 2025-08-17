document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.getElementById('back-to-home');
    const createButton = document.getElementById('create-task');
    const addRepeatButton = document.getElementById('add-repeat-task');
    const searchButton = document.getElementById('search-store');
    const checkButton = document.getElementById('check-stores');

    // Navigate back to home
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.location.href = 'index.html'; // Adjust this to your home page
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
document.addEventListener("DOMContentLoaded", function() {
    const storeListContainer = document.getElementById('store-list').getElementsByTagName('tbody')[0];
    const searchButton = document.getElementById('search-button');
    const storeFilter = document.getElementById('store-filter');

    // Default store data
    const stores = [
        { code: '001A', name: 'Eco park1', region: 'Eco park' },
        { code: '001B', name: 'Eco park2', region: 'Eco park' },
        { code: '001C', name: 'Eco park3', region: 'Eco park' },
        { code: '002A', name: 'Eco park4', region: 'Eco park' },
        { code: '002B', name: 'Eco park5', region: 'Eco park' },
        { code: '003A', name: 'Eco park6', region: 'Eco park' }
    ];

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
