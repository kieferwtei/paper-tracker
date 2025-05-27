// Check if user is admin
function checkAdminAccess() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = 'index.html';
    }
}

// Update statistics
function updateStats() {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    
    // Update document counts
    const totalDocs = documents.length;
    const pendingDocs = documents.filter(doc => doc.status === 'Pending').length;
    const receivedDocs = documents.filter(doc => doc.status === 'Received').length;
    
    // Update department counts
    const totalDepts = departments.length;
    const activeDepts = departments.filter(dept => dept.status === 'Active').length;
}

// Load departments
function loadDepartments() {
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const tbody = document.getElementById('departmentsTable');
    tbody.innerHTML = '';

    departments.forEach(dept => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dept.departmentName}</td>
            <td>${dept.username}</td>
            <td>${dept.password}</td>
            <td>
                <span class="status-badge status-${dept.status.toLowerCase()}">
                    ${dept.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="editDepartment('${dept.username}')">Edit</button>
                    <button class="action-btn btn-danger" onclick="deleteDepartment('${dept.username}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load documents
function loadDocuments() {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const tbody = document.getElementById('documentsTable');
    tbody.innerHTML = '';

    documents.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doc.transmitNumber}</td>
            <td>${doc.docName}</td>
            <td>${doc.sender}</td>
            <td>${doc.recipient}</td>
            <td>${doc.date}</td>
            <td>
                <span class="status-badge status-${doc.status.toLowerCase()}">
                    ${doc.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${doc.fileContent ? `
                        <button class="action-btn" onclick="viewPDF('${doc.transmitNumber}')">View</button>
                        <button class="action-btn" onclick="downloadPDF('${doc.transmitNumber}')">Download</button>
                    ` : ''}
                    <button class="action-btn btn-danger" onclick="deleteDocument('${doc.transmitNumber}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete department
function deleteDepartment(username) {
    if (confirm('Are you sure you want to delete this department?')) {
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');
        const updatedDepartments = departments.filter(dept => dept.username !== username);
        localStorage.setItem('departments', JSON.stringify(updatedDepartments));
        loadDepartments();
        showMessage('Department deleted successfully', 'success');
    }
}

// Delete document
function deleteDocument(transmitNumber) {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        const updatedDocuments = documents.filter(doc => doc.transmitNumber !== transmitNumber);
        localStorage.setItem('documents', JSON.stringify(updatedDocuments));
        loadDocuments();
        showMessage('Document deleted successfully', 'success');
    }
}

// View PDF
function viewPDF(transmitNumber) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = documents.find(d => d.transmitNumber === transmitNumber);
    if (doc && doc.fileContent) {
        window.open(doc.fileContent, '_blank');
    }
}

// Download PDF
function downloadPDF(transmitNumber) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = documents.find(d => d.transmitNumber === transmitNumber);
    if (doc && doc.fileContent) {
        const link = document.createElement('a');
        link.href = doc.fileContent;
        link.download = `${doc.docName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Show message
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Logout
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Add department
function addDepartment() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex'; // Ensure modal is displayed as flex
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Department</h2>
            <form id="addDepartmentForm">
                <div class="form-group">
                    <label for="departmentName">Department Name:</label>
                    <input type="text" id="departmentName" placeholder="Enter department name" required>
                </div>
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" placeholder="Enter username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" placeholder="Enter password" required>
                    <div class="password-toggle">
                        <label>
                            <input type="checkbox" id="showPassword" onchange="togglePassword()">
                            Show Password
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="status">Status:</label>
                    <select id="status" required>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn">Save Department</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Add escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    document.getElementById('addDepartmentForm').onsubmit = function(e) {
        e.preventDefault();
        saveNewDepartment();
    };
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPassword');
    passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
}

// Save new department
function saveNewDepartment() {
    const departmentName = document.getElementById('departmentName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const status = document.getElementById('status').value;

    // Validate inputs
    if (!departmentName || !username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    // Get existing departments and default accounts
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const defaultAccounts = {
        'wteiadmin': { password: 'wtei_2025#', role: 'admin' },
        'sales': { password: 'sales2025', role: 'department' },
        'hr': { password: 'hr2025', role: 'department' },
        'cashier': { password: 'cashier2025', role: 'department' }
    };
    
    // Check if username already exists in departments or default accounts
    if (departments.some(dept => dept.username.toLowerCase() === username.toLowerCase()) ||
        defaultAccounts[username.toLowerCase()]) {
        showMessage('Username already exists', 'error');
        return;
    }

    // Create new department with same structure as default accounts
    const newDepartment = {
        departmentName,
        username: username.toLowerCase(), // Store username in lowercase for consistency
        password,
        status,
        isDefault: false,
        role: 'department',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        allowedRecipients: [], // Empty array means no restrictions
        lastLogin: null,
        loginAttempts: 0
    };

    // Add to departments array
    departments.push(newDepartment);
    localStorage.setItem('departments', JSON.stringify(departments));

    // Also add to default accounts for login functionality
    defaultAccounts[username.toLowerCase()] = {
        password: password,
        role: 'department'
    };

    // Update the default accounts in localStorage
    localStorage.setItem('defaultAccounts', JSON.stringify(defaultAccounts));
    
    closeModal();
    loadDepartments();
    showMessage('Department added successfully', 'success');

    // Log the new account details for verification
    console.log('New department account created:', {
        username: username.toLowerCase(),
        password: password,
        role: 'department',
        status: status
    });
}

// Edit department
function editDepartment(username) {
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const department = departments.find(dept => dept.username === username);
    
    if (!department) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Department</h2>
            <form id="editDepartmentForm">
                <div class="form-group">
                    <label for="departmentName">Department Name:</label>
                    <input type="text" id="departmentName" value="${department.departmentName}" required>
                </div>
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" value="${department.username}" readonly>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" value="${department.password}" required>
                </div>
                <div class="form-group">
                    <label for="status">Status:</label>
                    <select id="status" required>
                        <option value="Active" ${department.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${department.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn">Save</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    document.getElementById('editDepartmentForm').onsubmit = function(e) {
        e.preventDefault();
        saveDepartmentEdit(username);
    };
}

// Save department edit
function saveDepartmentEdit(username) {
    const departmentName = document.getElementById('departmentName').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('status').value;

    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const departmentIndex = departments.findIndex(dept => dept.username === username);
    
    if (departmentIndex === -1) return;

    departments[departmentIndex] = {
        ...departments[departmentIndex],
        departmentName,
        password,
        status,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('departments', JSON.stringify(departments));
    
    closeModal();
    loadDepartments();
    showMessage('Department updated successfully', 'success');
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    loadDepartments();
    loadDocuments();
    updateStats();
}); 