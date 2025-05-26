const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paper-tracking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Models
const User = mongoose.model('User', {
    username: String,
    password: String,
    role: String,
    departmentName: String
});

const Document = mongoose.model('Document', {
    transmitNumber: String,
    docName: String,
    sender: String,
    recipient: String,
    date: String,
    status: String,
    history: Array
});

// API Routes
// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/users/:username', async (req, res) => {
    try {
        await User.deleteOne({ username: req.params.username });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Documents
app.get('/api/documents', async (req, res) => {
    try {
        const documents = await Document.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/documents', async (req, res) => {
    try {
        const document = new Document(req.body);
        await document.save();
        res.status(201).json(document);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/documents/:transmitNumber', async (req, res) => {
    try {
        const document = await Document.findOneAndUpdate(
            { transmitNumber: req.params.transmitNumber },
            req.body,
            { new: true }
        );
        res.json(document);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 