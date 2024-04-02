const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const Employee = require('./Employee');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');


const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uploads = async (req, res, next) => {
    try {

        var fileName
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const publicDir = path.join("", 'public');
                const imagesDir = path.join(publicDir, 'images');
                // create the directories if they don't exist
                if (!fs.existsSync(publicDir)) {
                    fs.mkdirSync(publicDir);
                }
                if (!fs.existsSync(imagesDir)) {
                    fs.mkdirSync(imagesDir);
                }
                console.log('i am here to upload');

                cb(null, imagesDir);
            },
            filename: async (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                fileName = file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop();
                console.log(fileName);
                console.log('i am here to upload');


                // req.imagePath = fileName;
                cb(null, fileName);
            },
        });
        const upload = multer({ storage }).single('file');
        upload(req, res, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log(fileName)
                let imagePath =  fileName;


                req.imagePath = imagePath,

                    next();
            }
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('error')

    }
}


// Serve uploaded images statically
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/", express.static(path.join("", "public/images")))

// API endpoint for file upload
app.post('/upload', uploads, (req, res) => {
    const imagePath = req.imagePath;
    if (!imagePath) {
        return useSuccessResponse(res, 'empty feild', 404)
    }
    const host = process.env.HOST

    console.log(host)
    const ImagePath = host + "" + imagePath;
    console.log(`Uploading ${ImagePath}`);
    if (!req.imagePath) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ filename: imagePath });
});

// CRUD operations
app.post('/employees',uploads, (req, res) => {
    const { name, position, salary, phoneNumber, email,profilePic1 } = req.body;
    const profilePic = profilePic1 || req.imagePath||""; 
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
    const { name, position, salary, phoneNumber, email,profilePic } = req.body;
    const profilePic1 =profilePic|| req.file ? req.file.filename : ''; 
    Employee.findByIdAndUpdate(req.params.id, {
        name,
        position,
        salary,
        profilePic: profilePic1,
        phoneNumber,
        email
    }, { new: true })
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

