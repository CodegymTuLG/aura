const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import the CORS package

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all requests

app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Endpoint to get tasks from data.json
app.get('/tasks', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data.json');
        }
        res.json(JSON.parse(data)); // Send tasks as response
    });
});

// Endpoint to update tasks in data.json (POST method)
app.post('/update-tasks', (req, res) => {
    const updatedTask = req.body; // The updated task data sent from the client

    // Path to the data.json file
    const filePath = path.join(__dirname, 'data.json');

    // Read the current data from data.json
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data.json');
        }

        let tasks = JSON.parse(data); // Parse the current task data

        // Update the task (you would typically search by ID or name)
        const taskIndex = tasks.findIndex(task => task.id === updatedTask.id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask; // Replace with updated task
        }

        // Write the updated tasks back to data.json
        fs.writeFile(filePath, JSON.stringify(tasks, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error writing to data.json');
            }
            res.status(200).send('Task updated successfully');
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
