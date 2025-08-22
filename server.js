const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3000; // cổng chạy server

app.use(cors()); // cho phép frontend gọi API
app.use(express.json()); // để đọc JSON body

// API: thêm task
app.post("/add-task", (req, res) => {
    const newTask = req.body;

    // Đường dẫn file JSON
    const filePath = __dirname + "/screen-create-task/task-to-do.json";

    // Đọc file cũ
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Lỗi đọc file" });

        let tasks = [];
        if (data) {
            try {
                tasks = JSON.parse(data);
            } catch (e) {
                return res.status(500).json({ error: "File JSON bị lỗi" });
            }
        }

        // Thêm task mới
        tasks.push(newTask);

        // Ghi lại file
        fs.writeFile(filePath, JSON.stringify(tasks, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Lỗi ghi file" });
            res.json({ message: "Lưu task thành công", task: newTask });
        });
    });
});

// Chạy server
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
