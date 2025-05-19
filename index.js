const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const { DocumentService } = require('./services/documentService');
const { dbConfig } = require('./config');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Multer configuration for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

const documentService = new DocumentService();

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// API Routes

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await documentService.validateUser(username, password);
        if (user) {
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            res.json({ 
                username: user.username, 
                role: user.role 
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

// Get documents
app.get('/api/documents', requireAuth, async (req, res) => {
    try {
        const { status, dateFilter, sender, recipient, transmitNumber } = req.query;
        const documents = await documentService.getDocuments({
            userId: req.session.user.id,
            userRole: req.session.user.role,
            filters: { status, dateFilter, sender, recipient, transmitNumber }
        });
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create document
app.post('/api/documents', requireAuth, upload.single('file'), async (req, res) => {
    try {
        const { docName, recipient, transmitNumber } = req.body;
        const documentId = await documentService.createDocument({
            documentName: docName,
            senderId: req.session.user.id,
            recipientDepartmentId: recipient,
            transmitNumber
        }, req.file);
        res.json({ id: documentId, message: 'Document created successfully' });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update document status
app.patch('/api/documents/:id/status', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await documentService.updateDocumentStatus(id, status, req.session.user.id);
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get document file
app.get('/api/documents/:id/file', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const file = await documentService.getDocumentFile(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        res.send(file.data);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export documents
app.get('/api/documents/export', requireAuth, async (req, res) => {
    try {
        const { status, dateFilter } = req.query;
        const csv = await documentService.exportDocuments({
            userId: req.session.user.id,
            userRole: req.session.user.role,
            filters: { status, dateFilter }
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=documents.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting documents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 