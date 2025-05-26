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
    
    localStorage.setItem('documents', JSON.stringify(documents));
    
    // Log specific information about sales department documents
    const salesDocs = documents.filter(doc => doc.recipient.toLowerCase() === 'sales');
    console.log('Sales department documents:', salesDocs.map(doc => ({
      docName: doc.docName,
      transmitNumber: doc.transmitNumber,
      sender: doc.sender,
      date: doc.date,
      status: doc.status
    })));
    
    return true;
  } catch (error) {
    console.error('Error saving documents:', error);
    return false;
  }
}

// Function to load documents from localStorage
function loadDocuments() {
  try {
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    
    // Log specific information about sales department documents
    const salesDocs = docs.filter(doc => doc.recipient.toLowerCase() === 'sales');
    console.log('Currently stored sales documents:', salesDocs.map(doc => ({
      docName: doc.docName,
      transmitNumber: doc.transmitNumber,
      sender: doc.sender,
      date: doc.date,
      status: doc.status
    })));
    
    return docs;
  } catch (error) {
    console.error('Error loading documents:', error);
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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('senderForm');
  if (!form) {
    console.error("Form with id 'senderForm' not found!");
    return;
  }

  // Check if user is logged in
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');
  
  if (!username || (userRole !== 'staff' && userRole !== 'admin' && userRole !== 'department')) {
    window.location.href = 'index.html';
    return;
  }

  // Load and display current documents count
  const currentDocs = loadDocuments();
  console.log('Current document count:', currentDocs.length);

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const docName = document.getElementById('docName').value;
    const transmitNumber = document.getElementById('transmitNumber').value;
    const recipient = document.getElementById('recipient').value;
    const fileInput = document.getElementById('file');
    
    if (!fileInput.files.length) {
      alert('Please select a PDF file');
      return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    // Check if user has permission to send to selected recipient
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const currentDept = departments.find(d => d.username.toLowerCase() === username.toLowerCase());
    
    if (userRole === 'department' && currentDept) {
      if (!currentDept.allowedRecipients.includes(recipient.toLowerCase())) {
        alert('You do not have permission to send documents to this recipient');
        return;
      }
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target.result;
        const today = new Date().toISOString().split('T')[0];
        
        const newDoc = {
          docName,
          transmitNumber,
          sender: username,
          recipient,
          date: today,
          status: 'Pending',
          fileContent,
          senderRole: userRole
        };

        const documents = loadDocuments();
        documents.push(newDoc);
        
        if (saveDocuments(documents)) {
          alert('Document sent successfully!');
          form.reset();
        } else {
          alert('Failed to send document. Please try again.');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error sending document:', error);
      alert('Failed to send document. Please try again.');
    }
  });
});

document.getElementById('documentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const docName = document.getElementById('docName').value;
  const transmitNumber = document.getElementById('transmitNumber').value;
  const recipient = document.getElementById('recipient').value;
  const file = document.getElementById('file').files[0];
  
  if (!file) {
    alert('Please select a file to upload');
    return;
  }

  if (file.type !== 'application/pdf') {
    alert('Please upload a PDF file');
    return;
  }

  try {
    // Upload file to Firebase Storage
    const filePath = `documents/${Date.now()}_${file.name}`;
    const fileUrl = await firebaseService.uploadFile(file, filePath);

    // Create document object
    const document = {
      docName,
      transmitNumber,
      sender: currentUser.username,
      recipient,
      date: new Date().toISOString(),
      status: 'Pending',
      fileUrl,
      filePath,
      senderRole: currentUser.role
    };

    // Save document to Firestore
    await firebaseService.saveDocument(document);
    
    alert('Document sent successfully!');
    document.getElementById('documentForm').reset();
  } catch (error) {
    console.error('Error sending document:', error);
    alert('Error sending document. Please try again.');
  }
});

// Update loadDocuments function
async function loadDocuments() {
  try {
    const filters = {
      sender: currentUser.username
    };
    
    const documents = await firebaseService.getDocuments(filters);
    displayDocuments(documents);
  } catch (error) {
    console.error('Error loading documents:', error);
    alert('Error loading documents. Please try again.');
  }
}

// Update displayDocuments function
function displayDocuments(documents) {
  const documentsList = document.getElementById('documentsList');
  documentsList.innerHTML = '';

  documents.forEach(doc => {
    const docElement = document.createElement('div');
    docElement.className = 'document-item';
    docElement.innerHTML = `
      <h3>${doc.docName}</h3>
      <p>Transmit Number: ${doc.transmitNumber}</p>
      <p>Recipient: ${doc.recipient}</p>
      <p>Date: ${new Date(doc.date).toLocaleString()}</p>
      <p>Status: ${doc.status}</p>
      <a href="${doc.fileUrl}" target="_blank">View Document</a>
    `;
    documentsList.appendChild(docElement);
  });
}
