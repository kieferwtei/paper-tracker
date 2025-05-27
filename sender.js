import firebaseService from './firebase-service.js';

console.log("sender.js loaded");

// Function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles for notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        }
        .notification.success { background-color: #4CAF50; }
        .notification.error { background-color: #f44336; }
        .notification.info { background-color: #2196F3; }
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Function to convert file to base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Function to save documents to localStorage
function saveDocuments(documents) {
  try {
    // Sort documents by date before saving, newest first
    documents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Ensure all documents have required fields
    documents = documents.map(doc => ({
      ...doc,
      status: doc.status || 'Pending',
      dateSent: doc.dateSent || doc.date,
      dateReceived: doc.dateReceived || null,
      lastStatusChangeTime: doc.lastStatusChangeTime || Date.now(),
      lastUpdatedBy: doc.lastUpdatedBy || doc.sender
    }));
    
    // Save to localStorage
    localStorage.setItem('documents', JSON.stringify(documents));
    
    // Log document creation for debugging
    console.log('Document saved:', {
      docName: documents[documents.length - 1].docName,
      transmitNumber: documents[documents.length - 1].transmitNumber,
      sender: documents[documents.length - 1].sender,
      recipient: documents[documents.length - 1].recipient,
      status: documents[documents.length - 1].status,
      date: documents[documents.length - 1].date
    });
    
    return true;
  } catch (error) {
    console.error('Error saving documents:', error);
    return false;
  }
}

// Function to load documents from localStorage
function loadDocuments() {
  try {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const currentUser = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    // Filter documents based on user role
    const userDocuments = documents.filter(doc => {
      if (currentUser === 'wteiadmin' && userRole === 'admin') {
        return true; // Admin sees all documents
      }
      return doc.sender.toLowerCase() === currentUser.toLowerCase();
    });

    // Update document counts
    updateDocumentCounts();

    // Update sender filter options
    const senderFilter = document.getElementById('senderFilter');
    if (senderFilter) {
      const senders = [...new Set(userDocuments.map(doc => doc.sender))];
      senderFilter.innerHTML = '<option value="all">All Senders</option>';
      senders.forEach(sender => {
        const option = document.createElement('option');
        option.value = sender;
        option.textContent = sender;
        senderFilter.appendChild(option);
      });
    }

    // Display documents
    const tbody = document.getElementById('documentTableBody');
    if (tbody) {
      tbody.innerHTML = '';

      userDocuments.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${doc.docName}</td>
          <td>${doc.transmitNumber}</td>
          <td>${doc.sender}</td>
          <td>${doc.date}</td>
          <td>
            <span class="status-badge status-${doc.status.toLowerCase()}">${doc.status}</span>
          </td>
          <td>${doc.dateReceived || '-'}</td>
          <td>
            <div class="action-buttons">
              ${doc.fileContent ? `
                <button class="action-btn view-btn" onclick="viewPDF('${doc.transmitNumber}')">View</button>
                <button class="action-btn download-btn" onclick="downloadPDF('${doc.transmitNumber}')">Download</button>
              ` : ''}
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Save the current state of documents
    localStorage.setItem('documents', JSON.stringify(documents));
    
    return documents;
  } catch (error) {
    console.error('Error loading documents:', error);
    showNotification('Error loading documents. Please try again.', 'error');
    return [];
  }
}

// Function to generate transmit number
function generateTransmitNumber(sender, recipient) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const timestamp = String(Date.now()).slice(-4);

  // Get current count of documents for the day
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const todayDocs = documents.filter(doc => doc.date === `${year}-${month}-${day}`);
  const count = String(todayDocs.length + 1).padStart(3, '0');

  // Format: DEPT-SENDER-DEPT-RECIPIENT-YYYYMMDD-COUNT-XXXX
  return `${sender.toUpperCase()}-${recipient.toUpperCase()}-${year}${month}${day}-${count}-${timestamp}`;
}

// Function to update document counts
function updateDocumentCounts() {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const currentUser = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');

  // Filter documents based on user role
  const userDocuments = documents.filter(doc => {
    if (currentUser === 'wteiadmin' && userRole === 'admin') {
      return true; // Admin sees all documents
    }
    return doc.sender.toLowerCase() === currentUser.toLowerCase();
  });

  // Update counts
  const totalCount = userDocuments.length;
  const pendingCount = userDocuments.filter(doc => doc.status === 'Pending').length;
  const receivedCount = userDocuments.filter(doc => doc.status === 'Received').length;
  const declinedCount = userDocuments.filter(doc => doc.status === 'Declined').length;

  // Update the display
  const totalElement = document.getElementById('totalCount');
  const pendingElement = document.getElementById('pendingCount');
  const receivedElement = document.getElementById('receivedCount');
  const declinedElement = document.getElementById('declinedCount');

  if (totalElement) totalElement.textContent = totalCount;
  if (pendingElement) pendingElement.textContent = pendingCount;
  if (receivedElement) receivedElement.textContent = receivedCount;
  if (declinedElement) declinedElement.textContent = declinedCount;
}

// Update the form submission handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('senderForm');
  if (!form) {
    console.error("Form with id 'senderForm' not found!");
    return;
  }

  // Check if user is logged in
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');
  
  if (!username || !userRole) {
    window.location.href = 'index.html';
    return;
  }

  // Add back button functionality
  const backButton = document.querySelector('.back-btn');
  if (backButton) {
    backButton.onclick = () => {
      // Save necessary data before navigation
      const departments = localStorage.getItem('departments');
      const documents = localStorage.getItem('documents');
      
      // Clear only login-related items
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('lastNotificationCheck');
      
      // Restore the saved data
      if (departments) {
        localStorage.setItem('departments', departments);
      }
      if (documents) {
        localStorage.setItem('documents', documents);
      }
      
      // Navigate to index page (menu)
      window.location.href = 'index.html';
    };
  }

  // Load and display current documents count
  const currentDocs = loadDocuments();
  console.log('Current document count:', currentDocs.length);

  // Update recipient dropdown based on sender's department
  const recipientSelect = document.getElementById('recipient');
  if (recipientSelect) {
    // Clear existing options
    recipientSelect.innerHTML = '';

    // Get all departments from localStorage
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const defaultAccounts = {
      'sales': { password: 'sales2025', role: 'department' },
      'hr': { password: 'hr2025', role: 'department' },
      'cashier': { password: 'cashier2025', role: 'department' }
    };

    // Get the current user's department
    const currentDepartment = username.toLowerCase();

    // Add all departments as options
    const allDepartments = [
      ...departments.filter(dept => !dept.isDefault), // Custom departments
      ...Object.entries(defaultAccounts).map(([username, data]) => ({
        username,
        departmentName: username.charAt(0).toUpperCase() + username.slice(1) + ' Department',
        role: data.role
      }))
    ];

    // Add options for all departments except the sender's own department
    allDepartments.forEach(dept => {
      if (dept.username.toLowerCase() !== currentDepartment) {
        const option = document.createElement('option');
        option.value = dept.username;
        option.textContent = dept.departmentName;
        recipientSelect.appendChild(option);
      }
    });

    // Add admin option if not already admin
    if (currentDepartment !== 'wteiadmin') {
      const adminOption = document.createElement('option');
      adminOption.value = 'wteiadmin';
      adminOption.textContent = 'Admin';
      recipientSelect.appendChild(adminOption);
    }
  }

  // If user is department, show the pending documents
  if (userRole === 'department') {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const pendingDocs = documents.filter(doc => 
      doc.recipient.toLowerCase() === username.toLowerCase() &&
      doc.status === 'Pending'
    );

    if (pendingDocs.length > 0) {
      const pendingDocsDiv = document.createElement('div');
      pendingDocsDiv.className = 'pending-docs';
      pendingDocsDiv.innerHTML = `
        <h3>Pending Documents to Respond To:</h3>
        <div class="pending-list">
          ${pendingDocs.map(doc => `
            <div class="pending-item">
              <span>From: ${doc.sender}</span>
              <span>Document: ${doc.docName}</span>
              <span>Transmit #: ${doc.transmitNumber}</span>
              <span>Date: ${doc.date}</span>
            </div>
          `).join('')}
        </div>
      `;

      // Insert before the form
      form.parentElement.insertBefore(pendingDocsDiv, form);

      // Add styles for pending documents display
      const style = document.createElement('style');
      style.textContent = `
        .pending-docs {
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(255, 244, 229, 0.9);
          border-radius: 8px;
        }
        .pending-docs h3 {
          color: #f57c00;
          margin-top: 0;
        }
        .pending-list {
          display: grid;
          gap: 1rem;
        }
        .pending-item {
          background: white;
          padding: 1rem;
          border-radius: 4px;
          display: grid;
          gap: 0.5rem;
        }
        .pending-item span {
          color: #333;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Initial load of documents and counts
  loadDocuments();
  updateDocumentCounts();
  
  // Set up periodic updates
  setInterval(() => {
    loadDocuments();
    updateDocumentCounts();
  }, 30000); // Update every 30 seconds
});

// Helper function to get recipient's role
function getRecipientRole(recipientUsername) {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const recipient = accounts.find(acc => acc.username.toLowerCase() === recipientUsername.toLowerCase());
  return recipient ? recipient.role : 'unknown';
}
