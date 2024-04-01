const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: String,
    position: String,
    salary: Number,
    profilePic: String,
    phoneNumber: String,
    email: String,
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
