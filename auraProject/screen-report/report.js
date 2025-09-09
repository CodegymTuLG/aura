document.addEventListener("DOMContentLoaded", function () {
    const storeData = [
        { store: "3002-Ecpark", data: [100, 100, 100, 95, 100, 100, 100, 100, 100, 100, 100, 100, 100], average: 100 },
        { store: "3003-Riverside", data: [91, 92, 93, 93, 94, 92, 93, 94, 95, 96, 94, 93, 95], average: 93 },
        { store: "3005-Horizon", data: [92, 93, 93, 92, 91, 80, 93, 91, 92, 92, 92, 92, 92], average: 92 },
        { store: "3008-Hyundai", data: [100, 100, 99, 99, 100, 100, 100, 99, 100, 99, 100, 99, 100], average: 99 },
        { store: "3011-Thăng Long", data: [90, 75, 92, 91, 90, 90, 92, 91, 92, 90, 92, 91, 91], average: 91 },
        // Add more stores as needed
    ];

    const taskTableBody = document.querySelector("#task-table tbody");
    // const storeSelect = document.getElementById("store-select");

    // Populate table with store data
    storeData.forEach(store => {
        const row = document.createElement("tr");
        const average = store.data.reduce((a, b) => a + b, 0) / store.data.length;

        row.innerHTML = `
            <td>${store.store}</td>
            ${store.data.map(d => `<td>${d}%</td>`).join("")}
            <td>${average.toFixed(2)}%</td>
        `;
        taskTableBody.appendChild(row);

        // // Populate store list
        // const option = document.createElement("option");
        // option.value = store.store;
        // option.textContent = store.store;
        // storeSelect.appendChild(option);
    });

    // Generate the chart
    const ctx = document.getElementById('taskCompletionChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['W22', 'W23', 'W24', 'W25', 'W26', 'W27', 'W28', 'W29', 'W30', 'W31', 'W32', 'W33', 'W34'],
            datasets: storeData.map(store => ({
                label: store.store,
                data: store.data,
                borderColor: getRandomColor(),
                fill: false,
                tension: 0.1
            }))
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });

    // Function to generate random colors for the chart
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    const taskData = [
        { dept: "Admin", planned: [1, 0, 2, 1, 2, 2, 1, 0, 0, 1, 0, 1, 0], unplanned: [0, 1, 0, 1, 0, 0, 1, 2, 2, 1, 1, 0, 0] },
        { dept: "Planning", planned: [1, 0, 0, 2, 1, 0, 0, 1, 1, 0, 0, 1, 0], unplanned: [0, 1, 2, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1] },
        { dept: "SPA/MKT", planned: [0, 0, 1, 2, 1, 1, 0, 0, 1, 1, 0, 1, 0], unplanned: [2, 1, 0, 1, 2, 2, 1, 1, 0, 0, 2, 0, 0] },
        { dept: "IMP", planned: [1, 1, 2, 1, 1, 2, 2, 0, 0, 0, 0, 0, 1], unplanned: [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0] },
        { dept: "HR/Control", planned: [0, 0, 1, 2, 0, 1, 1, 0, 1, 1, 1, 0, 0], unplanned: [2, 1, 0, 0, 1, 0, 1, 2, 1, 0, 0, 1, 0] },
        { dept: "Dry Food", planned: [0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0], unplanned: [2, 2, 1, 1, 2, 1, 2, 0, 0, 1, 1, 1, 0] },
        { dept: "Delica/D&D", planned: [0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0, 0, 0], unplanned: [2, 2, 1, 1, 0, 0, 0, 2, 2, 1, 1, 1, 0] },
        { dept: "Perish", planned: [0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0], unplanned: [2, 2, 3, 2, 1, 2, 0, 0, 1, 1, 1, 0, 1] },
        { dept: "Aeon CF", planned: [0, 1, 2, 0, 2, 1, 1, 1, 0, 0, 1, 0, 0], unplanned: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1] }
    ];

    const taskTableBody2 = document.querySelector("#task-table2 tbody");

    // Populate table with data
    taskData.forEach(department => {        const totalPlanned = department.planned.reduce((a, b) => a + b, 0);
        const totalUnplanned = department.unplanned.reduce((a, b) => a + b, 0);
        const totalTasks = totalPlanned + totalUnplanned;

        const plannedPercentage = ((totalPlanned / totalTasks) * 100).toFixed(2);
        const unplannedPercentage = ((totalUnplanned / totalTasks) * 100).toFixed(2);

        const row2 = document.createElement("tr");
        row2.innerHTML = `
            <td>${department.dept}</td>
            ${department.planned.map(task => `<td>${task}</td>`).join('')}
            ${department.unplanned.map(task => `<td>${task}</td>`).join('')}
            <td>${totalTasks}</td>
            <td>${plannedPercentage}%</td>
            <td>${unplannedPercentage}%</td>
        `;
        taskTableBody2.appendChild(row2);
    });

    // Chart Data for Task Review
    const weeks = ['W22', 'W23', 'W24', 'W25', 'W26', 'W27', 'W28', 'W29', 'W30', 'W31', 'W32', 'W33', 'W34'];
    const plannedData = taskData.map(department => department.planned);
    const unplannedData = taskData.map(department => department.unplanned);
    
    const ctxBar2 = document.getElementById('taskReviewBarChart').getContext('2d');
    new Chart(ctxBar2, {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [
                ...taskData.map((department, index) => ({
                    label: department.dept + ' Planned',
                    data: plannedData[index],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    stack: 'Stack 0',
                    barThickness: 20,
                    fill: true,
                })),
                ...taskData.map((department, index) => ({
                    label: department.dept + ' Unplanned',
                    data: unplannedData[index],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    stack: 'Stack 1',
                    barThickness: 20,
                    fill: true,
                }))
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
});

 