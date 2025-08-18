document.addEventListener("DOMContentLoaded", function () {
    const goToReceivingTaskButton = document.getElementById('go-receiving-task');
    // const receivingTaskScreen = document.getElementById('receiving-task-screen');
    const homeScreen = document.querySelector('.home-screen');
    const calendarButtons = document.querySelectorAll('#calendar .day');
    const taskStatusButtons = document.querySelectorAll('.status');
    const taskList = document.getElementById('task-list');
    const hqScreen = document.getElementById('hq-screen');
    const previousWeek = document.getElementById('previous-week');
    const nextWeek = document.getElementById('next-week');
    let chooseDate = document.getElementById('choose-date').innerHTML = '30/06'; 
    // Ensure the popup exists
    const registerTaskPopupParent = document.getElementById('register-task-popup_parent');
    const registerTaskPopup = document.getElementById('register-task-popup');
    const registerTaskForm = document.getElementById('register-task-form');
    const departments = ["#8ecae6", "#219ebc", "#ffafcc", "#bde0fe", "#ffc8dd"];
    const assignees = ["#ffb703", "#fb8500", "#9b5de5", "#00b4d8", "#d00000"];
    let selectedDay = '30/06';   
    // go to hq-index
    previousWeek.addEventListener('click', () => {
        alert('show previous week task');
    });
    nextWeek.addEventListener('click', () => {
        alert('show next week task');
    });
    if (hqScreen) {
        hqScreen.addEventListener('click', function () {
        window.location.href = `../screen-hq/hq-index.html`; 
        });
    } 
    if (!registerTaskPopup || !registerTaskForm) {
        console.error("Register Task Popup or Form element is missing!");
    }
    
    // Fetch task data from data.json
async function loadTasks() {
    try {
        const response = await fetch('common/data.json'); // đường dẫn tương đối
        const tasks = await response.json();
        return tasks;
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}



    // Show the Receiving Task screen when button is clicked
    // goToReceivingTaskButton.addEventListener('click', function () {
    //     homeScreen.style.display = 'none'; // Hide the home screen
    //     receivingTaskScreen.style.display = 'block'; // Show the receiving task screen
        renderTasks(selectedDay); // Default to "30 Jun"
    // });

    // Render tasks for a specific day and status
    async function renderTasks(day, status = '') {
        taskList.innerHTML = ''; // Clear existing task list
        const tasks = await loadTasks();

        // Filter tasks based on the selected day and status
        const filteredTasks = tasks.filter(task => task.date.includes(day) && (status ? task.status === status : true));

        // Update task stats
        updateTaskStats(tasks, day);
        // Check if there are filtered tasks to display
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p>No tasks found for this day/status.</p>';
        }

        filteredTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            const depColor = departments[index % departments.length];
            const userColor = assignees[index % assignees.length];
            const statusColor = task.status === 'Completed' ? 'green' : 'red';
            taskDiv.classList.add('task');
            taskDiv.innerHTML = `
                    <div class="task-left>
                        <div class="task-number">${index + 1}.</div>
                        <div class="task-icon">
                            <div class="square" style="background-color:${depColor}"></div>
                            <div class="circle" style="background-color:${userColor}"></div>
                        </div>
                        <div class="task-details"> ${task.name}<br>
                        <small>RE ${task.re} ・ ${task.deadline}</small></div>
                            <div class="task-status" style="color:${statusColor};">${task.status}</div>
                    </div>
            `;

            // Add click event listener to show task details or registration form
            taskDiv.addEventListener('click', () => {
                handleTaskClick(task); // Show task details or registration form
            });

            taskList.appendChild(taskDiv);
        });
    }

    // Update task statistics dynamically
    function updateTaskStats(tasks, day) {
        const activeCount = tasks.filter(task => task.date.includes(day)).length  ;
        const notYetCount = tasks.filter(task => task.date.includes(day) && (task.status === 'Not yet')).length;
        const overdueCount = tasks.filter(task => task.date.includes(day) && (task.status === 'Overdue')).length;
        const onProgressCount = tasks.filter(task => task.date.includes(day) && (task.status === 'On Progress')).length;
        const completedCount = tasks.filter(task => task.date.includes(day) && (task.status === 'Completed')).length;

        // Update task stats buttons with dynamic counts
        document.querySelector('.status[data-status="Active"]').textContent = `Active tasks: ${activeCount}`;
        document.querySelector('.status[data-status="Not yet"]').textContent = `Not yet: ${notYetCount}`;
        document.querySelector('.status[data-status="Overdue"]').textContent = `Overdue: ${overdueCount}`;
        document.querySelector('.status[data-status="On Progress"]').textContent = `On Progress: ${onProgressCount}`;
        document.querySelector('.status[data-status="Completed"]').textContent = `Completed: ${completedCount}`;


    }

    // Handle task click (open task details or registration form)
    function handleTaskClick(task) {
        if (task.status === 'Not yet') {
            // Show the Register Task Popup if status is "Not yet"
            showRegisterTaskPopup(task);
        } else {
            showTaskDetailPopup(task);
        }
    }

    // Show Register Task Popup
    function showRegisterTaskPopup(task) {
        // Ensure the registerTaskPopup exists
        if (registerTaskPopup) {            
            const popup = document.getElementById('register-task-popup');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';  // This centers the popup on the screen
            popup.style.width = '550px';
            popup.style.height = '600px';
            popup.style.padding = '20px';
            popup.style.backgroundColor = 'white';
            popup.style.borderRadius = '10px';
            popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            popup.style.overflowY = 'auto'; // Add overflow for scrolling if content exceeds the height
            // Fill popup with task data
            registerTaskPopupParent.style.display = 'block'; // Show the popup
            registerTaskPopup.style.display = 'flex!importan'; // Show the popup
            registerTaskForm.innerHTML = `
                <h3>Register Task: ${task.name}</h3>
                <a href="https://www.youtube.com/watch?v=8KkX71WBpFE&themeRefresh=1&theme=dark" target="_blank" 
                style="text-decoration: none; color: #007bff;">Manual</a>
                <p>Deadline: ${task.deadline}</p>
                <p>Re: ${task.re}</p>
                <textarea id="task-comment" name="task-comment" placeholder="Add your comment..." 
                        style="width: 100%; height: 200px; margin-bottom: 10px; padding: 10px; font-size: 14px;"></textarea>
                <div class="camera-section">
                    <input id="task-photos" type="file" name="task-photos" accept="image/*" capture="camera" multiple 
                        style="margin-bottom: 10px;"/>
                </div>
                <button id="submit-task" style="padding: 10px 20px; background-color: #28a745; color: white; border: none; 
                        cursor: pointer; border-radius: 5px; font-size: 16px; margin-right: 10px; width: 48%;">Submit</button>
                <button id="close-popup" style="padding: 10px 20px; background-color: #dc3545; color: white; border: none; 
                        cursor: pointer; border-radius: 5px; font-size: 16px; width: 48%;">Close</button>
            `;




document.getElementById('submit-task').addEventListener('click', function () {
    //
    const comment = document.getElementById('task-comment').value; // Get comment value
    const taskId = task.id; // Assuming `task` is the current task being edited

    // Prepare the updated task data
    const updatedTask = {
        id: taskId,
        name: task.name,
        status: 'Completed', // Example status change
        deadline: task.deadline,
        date: task.date,
        re: task.re,
        comment: comment // Add the new comment
    };

    // Send the updated task to the backend (Node.js server at port 3000)
    fetch('http://localhost:3000/update-tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask) // Send the updated task
    })
    .then(response => response.json())
    .then(data => {
        alert('Task updated successfully!');
        closePopup(); // Close the popup after successful submission
    })
    .catch(error => {
        console.error('Error updating task:', error);
       // alert('Failed to update task.');
    });
    //
                registerTaskPopupParent.style.display = 'none'; // Close the popup after submission
            });
            // Handle form close
            document.getElementById('close-popup').addEventListener('click', function () {
                registerTaskPopupParent.style.display = 'none'; 
				});
        } else {
            console.error("Popup is missing, can't show it.");
        }
    }

    // Show Task Detail Popup (view only)
    function showTaskDetailPopup(task) {
    //  //   alert(`View details for: ${task.name}`);
	// 	        if (registerTaskPopup) {
    //         // Fill popup with task data
    //         registerTaskPopupParent.style.display = 'block'; // Show the popup
    //         registerTaskPopup.style.display = 'flex!importan'; // Show the popup
    //         registerTaskForm.innerHTML = `
    //             <h3>Register Task: ${task.name}</h3>
    //             <p>Deadline: ${task.deadline}</p>
    //             <p>Re: ${task.re}</p>
    //             <p>Comment ${task.comment}</p>
    //             <div > Image
    //             </div>
	// 			<button id="close-popup">Close</button>
    //         `;

    //         // Handle form close
    //         document.getElementById('close-popup').addEventListener('click', function () {
    //             registerTaskPopupParent.style.display = 'none'; 
	// 			});
    //     } else {
    //         console.error("Popup is missing, can't show it.");
    //     }
    // Serialize the task object (you can also pass the ID only if you want to fetch from a database or JSON file)
    const taskData = encodeURIComponent(JSON.stringify(task)); // Serialize the task object

    // Redirect to the task details page with the task data in the URL
    window.location.href = `../document/Detailtask.html?task=${taskData}`;

    }
 
    // Event listeners for calendar buttons
    calendarButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedDay = button.dataset.day; // Store the selected day
            renderTasks(selectedDay); // Render tasks based on the day clicked
 
            const chooseDate = document.getElementById('choose-date');
            chooseDate.innerHTML = selectedDay == null?'30/06':selectedDay;
        });
    });

    // Event listeners for task status buttons
    taskStatusButtons.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.dataset.status;
            renderTasks(selectedDay, status); // Default to "30 Jun" when selecting status
        });
    });
});
