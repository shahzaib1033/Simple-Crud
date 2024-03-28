const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Employee = require('./Employee');
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.DATABASE)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/employees', (req, res) => {
    const { name, position, salary } = req.body;
    const employee = new Employee({
        name,
        position,
        salary
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
