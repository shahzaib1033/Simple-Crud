const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const Employee = require('./Employee');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multer Configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ filename: req.file.filename });
});

// CRUD operations
app.post('/employees', (req, res) => {
    const { name, position, salary, profilePic, phoneNumber, email } = req.body;
    const employee = new Employee({
        name,
        position,
        salary,
        profilePic,
        phoneNumber,
        email
    });
    employee.save()
        .then(() => res.status(201).json(employee))
        .catch(err => res.status(400).json({ error: err.message }));
});

app.get('/employees', (req, res) => {
    Employee.find()
        .then(employees => res.json(employees))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/employees/:id', (req, res) => {
    Employee.findById(req.params.id)
        .then(employee => {
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            res.json(employee);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/employees/:id', (req, res) => {
    Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(employee => {
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            res.json(employee);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/employees/:id', (req, res) => {
    Employee.findByIdAndDelete(req.params.id)
        .then(employee => {
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            res.json({ message: 'Employee deleted successfully' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
