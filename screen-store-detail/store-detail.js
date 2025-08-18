document.addEventListener("DOMContentLoaded", function() {
    const taskListContainer = document.querySelector("#task-list tbody");
    const paginationContainer = document.getElementById("pagination");

    // Sample data
    const tasks = [
        { no: 1, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Not yet' },
        { no: 2, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Not yet' },
        { no: 3, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Not yet' },
        { no: 4, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Not yet' },
        { no: 5, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Done' },
        { no: 6, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Not yet' },
        { no: 7, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Done' },
        { no: 8, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Not yet' },
        { no: 9, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Not yet' },
        { no: 10, storeName: 'Task', area: 'A_LV', start: '6/30', end: '6/30', rStart: '-', rEnd: '-', status: 'Done' },
    ];

    // Function to render task list dynamically
    function renderTaskList(tasks) {
        taskListContainer.innerHTML = ''; // Clear previous content

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.no}</td>
                <td>${task.storeName}</td>
                <td>${task.area}</td>
                <td>${task.start}</td>
                <td>${task.end}</td>
                <td>${task.rStart}</td>
                <td>${task.rEnd}</td>
                <td>${task.status}</td>
            `;
            taskListContainer.appendChild(row);
        });
    }

    // Function to export the task list to CSV
    document.getElementById("export-csv").addEventListener("click", function() {
        const csvContent = tasks.map(task => 
            `${task.no},${task.storeName},${task.area},${task.start},${task.end},${task.rStart},${task.rEnd},${task.status}`
        ).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'task-list.csv';
        link.click();
    });

    // Function to handle pagination (for now, we just show all tasks in one page)
    function updatePagination() {
        paginationContainer.innerHTML = `
            <span><<</span> 
            <span>2/51</span> 
            <span>>></span>
        `;
    }

    // Initial render of tasks and pagination
    renderTaskList(tasks);
    updatePagination();
});
