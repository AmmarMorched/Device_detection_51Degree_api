const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Device')

// Define a schema for the device data
const deviceSchema = new mongoose.Schema({
    isMobile: Boolean,
    hardwareVendor: String,
    hardwareName: [String],
    hardwareModel: String,
    fullscreen: Boolean,
    screenPixelsWidth: Number,
    screenPixelsHeight: Number,
}, { timestamps: true });

// Create a model from the schema
const Device = mongoose.model('dev', deviceSchema);

const db = mongoose.connection;

db.on('error', (err) => {
    console.log(err);
});

db.once('open', () => {
    console.log('Database Connection Established!');
});

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the index.html file on the root route
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/', (req, res) => {
    console.log('Received request body:', req.body); // Log the request body to verify the data
    
    const deviceData = req.body;
    
    // Create a new device document using the model
    const device = new Device(deviceData);
    
    // Save the document to the database
    device.save()
        .then(savedDevice => {
            console.log('Device data saved:', savedDevice); // Log the saved document
            res.json({ message: 'Device data saved successfully', data: savedDevice });
        })
        .catch(err => {
            console.error('Failed to save device data:', err); // Log any errors
            res.status(500).json({ error: 'Failed to save device data', details: err });
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
