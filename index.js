const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const app = express();
const dataFilePath = path.join(__dirname, 'data.json');
app.use(express.json());


//InitializeData===========================================================================================================================
function generateInitialData() {
    const data = {};

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    months.forEach(month => {
        data[month] = [];
        const daysInMonth = new Date(new Date().getFullYear(), months.indexOf(month) + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayNumber = new Date(new Date().getFullYear(), months.indexOf(month), day).getDay();
            data[month].push({ [day]: { dayName: dayNames[dayNumber], tasks: [] } });
        }
    });
    return data
};

async function createJSONfile() {
    try {
        const exists = await fs.pathExists(dataFilePath);
        if (!exists) {
            const initialData = generateInitialData();
            await fs.writeJson(dataFilePath, initialData);
        }
    } catch (err) {
        console.error('Error initializing data file:', err);
    }
};
createJSONfile();

//getTask===========================================================================================================================
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readJson(dataFilePath);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});


//ADD,Delete & Modify Task ===========================================================================================================================

app.post("/api/tasks", async (req, res) => {
    try {
        const { month, day, task, id, action } = req.body;

        if
            (!month || !day || !task, !id) {
            return res.status(400).json({ error: 'Month, day, and task are required' });
        }

        const modifiedTask = { taskid: id, task: task, status: "pending" };
        const data = await fs.readJson(dataFilePath);
        const checkIndex = data[month].findIndex((val) => { return day in val });
        const dayTasks = data[month][checkIndex][day].tasks;
        const check = dayTasks.find((val) => val.taskid === id);

        if
            (!check && action === "addTask") {
            dayTasks.push(modifiedTask);
            await fs.writeJson(dataFilePath, data);
            res.status(201).json("File saved");
        }
        else if
            (check && action === "deleteTask") {
            const delteIndex = dayTasks.findIndex((val) => val.taskid === id);
            dayTasks.splice(delteIndex, 1);
            await fs.writeJson(dataFilePath, data);
            res.status(201).json("File deleted");
        }
        else if
            (check && action === "markComplete") {
            const markCompleteIndex = dayTasks.findIndex((val) => val.taskid === id);
            dayTasks[markCompleteIndex].status = "completed";
            await fs.writeJson(dataFilePath, data);
            res.status(201).json("markedCompleted");
        }
        else {
            res.status(400).json("Task already exist");
        }
    }
    catch (error) {
        console.log(error)
    }
})

app.listen(8080, () => console.log(`Server Started`));
