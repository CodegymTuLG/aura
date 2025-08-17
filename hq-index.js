document.addEventListener("DOMContentLoaded", function() {
    const goToReceivingTaskButton = document.getElementById('go-to-task-list');
    const goToCreateTaskButton = document.getElementById('go-to-create-task');
    const goToStoreListButton = document.getElementById('go-to-store-list');
    const goToReportsButton = document.getElementById('go-to-reports');
    const goToStoreScreenButton = document.getElementById('store-screen');

    if(goToReceivingTaskButton)
    // Redirect to Task List page
    goToReceivingTaskButton.addEventListener('click', function() {
        window.location.href = `task-list.html`;
    });
    
    // Redirect to Create Task page
    if(goToCreateTaskButton)
    goToCreateTaskButton.addEventListener('click', function() {
        window.location.href = `create-task.html`;
    });
    
    // Redirect to Manage Stores page
    if(goToStoreListButton)
    goToStoreListButton.addEventListener('click', function() {
        window.location.href = `store-detail.html`;
    });
    
    // Redirect to Reports page
    if(goToReportsButton)
    goToReportsButton.addEventListener('click', function() {
        window.location.href = `report.html`;
    });

        // Redirect to Reports page
    if(goToStoreScreenButton)
    goToStoreScreenButton.addEventListener('click', function() {
        window.location.href = `index.html`;
    });
});

