-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    transmit_number VARCHAR(50) UNIQUE NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    sender_id INTEGER REFERENCES users(id),
    recipient_department_id INTEGER REFERENCES departments(id),
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    date_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_received TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document History table for tracking all status changes
CREATE TABLE document_history (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    status VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_transmit_number ON documents(transmit_number);
CREATE INDEX idx_documents_recipient_dept ON documents(recipient_department_id);
CREATE INDEX idx_document_history_document_id ON document_history(document_id);

-- Create view for document tracking
CREATE VIEW document_tracking AS
SELECT 
    d.transmit_number,
    d.document_name,
    u.username as sender,
    dept.name as recipient_department,
    d.status,
    d.date_sent,
    d.date_received,
    d.file_path
FROM documents d
JOIN users u ON d.sender_id = u.id
JOIN departments dept ON d.recipient_department_id = dept.id; 