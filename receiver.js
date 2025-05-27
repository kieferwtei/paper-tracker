// receiver.js

import firebaseService from './firebase-service.js';

// Notification functions
function showNotification(message, type = 'info') {
  // Create notification container if it doesn't exist
  let notifContainer = document.getElementById('notification-container');
  if (!notifContainer) {
    notifContainer = document.createElement('div');
    notifContainer.id = 'notification-container';
    document.body.appendChild(notifContainer);
    
    // Add styles for notification container
    const style = document.createElement('style');
    style.textContent = `
      #notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
      }
      .notification {
        padding: 15px 25px;
        margin-bottom: 10px;
        border-radius: 4px;
        color: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        animation: slideIn 0.5s ease;
      }
      .notification.info {
        background-color: #1976d2;
      }
      .notification.success {
        background-color: #2e7d32;
      }
      .notification.warning {
        background-color: #f57c00;
      }
      .notification.error {
        background-color: #d32f2f;
      }
      .close-notification {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        margin-left: 10px;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Create message text
  const messageText = document.createElement('span');
  messageText.textContent = message;
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'close-notification';
  closeButton.innerHTML = '×';
  closeButton.onclick = () => notification.remove();
  
  // Assemble notification
  notification.appendChild(messageText);
  notification.appendChild(closeButton);
  
  // Add to container
  notifContainer.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Function to check for new notifications
function checkNotifications() {
  const currentUser = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');
  const lastCheck = localStorage.getItem('lastNotificationCheck') || '0';
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  
  // Filter documents that are newer than last check
  const newDocs = documents.filter(doc => {
    const docDate = new Date(doc.date).getTime();
    return docDate > parseInt(lastCheck) && doc.recipient.toLowerCase() === currentUser.toLowerCase();
  });
  
  // Show notifications for new documents
  newDocs.forEach(doc => {
    showNotification(`New document received from ${doc.sender}: ${doc.docName}`, 'info');
  });
  
  // Update last check time
  localStorage.setItem('lastNotificationCheck', Date.now().toString());
}

function goBack() {
  window.history.back();
}

// Function to handle document reception
function handleReceiveDocument(transmitNumber) {
  try {
    console.log('Handling document reception:', { transmitNumber });
    
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = documents.findIndex(doc => doc.transmitNumber === transmitNumber);
    const currentUser = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Document reception details:', {
      docIndex,
      currentUser,
      userRole,
      documentFound: docIndex !== -1,
      document: docIndex !== -1 ? documents[docIndex] : null
    });
    
    if (docIndex !== -1) {
      const doc = documents[docIndex];
      
      // Verify the current user is the intended recipient or admin
      const isAdmin = currentUser === 'wteiadmin' && userRole === 'admin';
      const isRecipient = doc.recipient && doc.recipient.toLowerCase() === currentUser.toLowerCase();
      
      if (!isRecipient && !isAdmin) {
        console.log('Permission denied - user is not the intended recipient or admin');
        showNotification('You are not authorized to receive this document', 'error');
        return false;
      }
      
      // Update document status
      documents[docIndex] = {
        ...doc,
        status: 'Received',
        dateReceived: new Date().toISOString().split('T')[0],
        lastStatusChangeTime: Date.now(),
        lastUpdatedBy: currentUser
      };
      
      // Save updated documents
      localStorage.setItem('documents', JSON.stringify(documents));
      console.log('Document marked as received:', documents[docIndex]);
      
      // Show success notification
      showNotification(`Document "${doc.docName}" has been marked as received`, 'success');
      
      // Refresh the document list
      loadDocuments();
      return true;
    } else {
      console.log('Document not found for reception');
      showNotification('Document not found', 'error');
      return false;
    }
  } catch (error) {
    console.error('Error receiving document:', error);
    showNotification('Error receiving document. Please try again.', 'error');
    return false;
  }
}

// Function to update document status
function updateDocumentStatus(transmitNumber, newStatus) {
  try {
    console.log('Updating document status:', { transmitNumber, newStatus });
    
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = documents.findIndex(doc => doc.transmitNumber === transmitNumber);
    const currentUser = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Document update details:', {
      docIndex,
      currentUser,
      userRole,
      documentFound: docIndex !== -1
    });
    
    if (docIndex !== -1) {
      const doc = documents[docIndex];
      
      // Verify the current user is the intended recipient or admin
      if (doc.recipient.toLowerCase() !== currentUser.toLowerCase() && 
          !(currentUser === 'wteiadmin' && userRole === 'admin')) {
        console.log('Permission denied for document update');
        showNotification('You do not have permission to update this document\'s status', 'error');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      documents[docIndex].status = newStatus;
      documents[docIndex].dateReceived = newStatus === 'Received' ? today : '-';
      documents[docIndex].lastStatusChangeTime = Date.now();
      documents[docIndex].lastUpdatedBy = currentUser;
      
      // Save the updated documents
      localStorage.setItem('documents', JSON.stringify(documents));
      console.log('Document updated successfully:', documents[docIndex]);
      
      // Show success notification
      const statusMessage = newStatus === 'Received' ? 'received' : 
                           newStatus === 'Declined' ? 'declined' : 
                           'pending';
      showNotification(`Document "${doc.docName}" has been ${statusMessage}`, 
        newStatus === 'Received' ? 'success' : 
        newStatus === 'Declined' ? 'error' : 
        'warning'
      );
      
      // Refresh the display
      loadDocuments();
    } else {
      console.log('Document not found for update');
      showNotification('Document not found', 'error');
    }
  } catch (error) {
    console.error('Error updating document status:', error);
    showNotification('Error updating document status. Please try again.', 'error');
  }
}

// Function to receive document
function receiveDocument(transmitNumber) {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const docIndex = documents.findIndex(doc => doc.transmitNumber === transmitNumber);
  
  if (docIndex !== -1) {
    documents[docIndex].status = 'Received';
    documents[docIndex].receivedDate = new Date().toLocaleString();
    localStorage.setItem('documents', JSON.stringify(documents));
    
    // Show success message
    showNotification('Document received successfully!', 'success');
    
    // Reload documents
    loadDocuments();
    
    // Update notification count in index page
    const currentUser = localStorage.getItem('currentUser');
    const pendingCount = documents.filter(doc => 
      doc.recipient.toLowerCase() === currentUser.toLowerCase() && 
      doc.status === 'Pending'
    ).length;
    
    // Update notification badge
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
      notificationBadge.textContent = pendingCount;
      notificationBadge.style.display = pendingCount > 0 ? 'block' : 'none';
    }
  }
}

// Function to send response to WTEI staff
function sendResponse(originalDoc) {
  try {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const currentUser = localStorage.getItem('username');
    const today = new Date().toISOString().split('T')[0];

    // Create response document
    const responseDoc = {
      docName: `Response to ${originalDoc.docName}`,
      transmitNumber: `${originalDoc.transmitNumber}-R-${Date.now().toString().slice(-4)}`,
      sender: currentUser,
      recipient: originalDoc.sender,
      date: today,
      dateReceived: today, // Auto-receive for WTEI staff
      status: 'Received', // Auto-receive for WTEI staff
      fileContent: originalDoc.fileContent, // Reuse the same file content
      senderRole: 'department'
    };

    // Add response document
    documents.push(responseDoc);
    localStorage.setItem('documents', JSON.stringify(documents));

    // Refresh display
    loadDocuments();
    alert('Response sent successfully to ' + originalDoc.sender);
    return true;
  } catch (error) {
    console.error('Error sending response:', error);
    alert('Failed to send response. Please try again.');
    return false;
  }
}

// Function to load and display documents
async function loadDocuments() {
  try {
    console.log('Loading documents...');
    
    // Get documents from localStorage
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    console.log('All documents from localStorage:', documents);
    
    const currentUser = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    console.log('Current user:', currentUser, 'Role:', userRole);
    
    const documentTableBody = document.getElementById('documentTableBody');
    if (!documentTableBody) {
      console.error('Document table body element not found!');
      return;
    }
    
    // Filter documents for the current user
    const userDocuments = documents.filter(doc => {
      // For admin, show all documents
      if (currentUser === 'wteiadmin' && userRole === 'admin') {
        console.log('Admin user - showing all documents');
        return true;
      }
      
      // For department users, show documents where they are the recipient
      const isRecipient = doc.recipient && doc.recipient.toLowerCase() === currentUser.toLowerCase();
      console.log('Document:', {
        transmitNumber: doc.transmitNumber,
        recipient: doc.recipient,
        currentUser: currentUser,
        isRecipient: isRecipient,
        status: doc.status
      });
      return isRecipient;
    });
    console.log('Filtered documents for user:', userDocuments);

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

    // Apply filters
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('dateFilter')?.value || 'all';
    const selectedSender = document.getElementById('senderFilter')?.value || 'all';

    let filteredDocs = userDocuments;

    if (statusFilter !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.status === statusFilter);
    }

    if (selectedSender !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.sender === selectedSender);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);

      filteredDocs = filteredDocs.filter(doc => {
        const docDate = new Date(doc.date);
        docDate.setHours(0, 0, 0, 0);

        switch(dateFilter) {
          case 'today':
            return docDate.getTime() === today.getTime();
          case 'week':
            return docDate >= weekAgo;
          case 'month':
            return docDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort documents by date, newest first
    filteredDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update stats
    const totalCount = document.getElementById('totalCount');
    const pendingCount = document.getElementById('pendingCount');
    const receivedCount = document.getElementById('receivedCount');

    if (totalCount) totalCount.textContent = userDocuments.length;
    if (pendingCount) pendingCount.textContent = userDocuments.filter(doc => doc.status === 'Pending').length;
    if (receivedCount) receivedCount.textContent = userDocuments.filter(doc => doc.status === 'Received').length;

    // Clear existing table content
    documentTableBody.innerHTML = '';

    if (filteredDocs.length === 0) {
      documentTableBody.innerHTML = '<tr><td colspan="7" class="no-documents">No documents found</td></tr>';
      return;
    }

    // Display documents
    filteredDocs.forEach(doc => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${doc.docName || 'Unnamed Document'}</td>
        <td>${doc.transmitNumber || 'N/A'}</td>
        <td>${doc.sender || 'Unknown'}</td>
        <td>${doc.date || 'N/A'}</td>
        <td>
          <span class="status-badge status-${(doc.status || 'Pending').toLowerCase()}">${doc.status || 'Pending'}</span>
        </td>
        <td>${doc.dateReceived || '-'}</td>
        <td>
          <div class="action-buttons">
            ${(doc.status === 'Pending' || !doc.status) ? `
              <button class="action-btn receive-btn" onclick="handleReceiveDocument('${doc.transmitNumber}')">Receive</button>
              <button class="action-btn decline-btn" onclick="updateDocumentStatus('${doc.transmitNumber}', 'Declined')">Decline</button>
            ` : ''}
            ${doc.fileContent ? `
              <button class="action-btn view-btn" onclick="viewPDF('${doc.transmitNumber}')">View</button>
              <button class="action-btn download-btn" onclick="downloadPDF('${doc.transmitNumber}')">Download</button>
            ` : ''}
          </div>
        </td>
      `;
      documentTableBody.appendChild(row);
    });

    console.log('Documents loaded successfully');

  } catch (error) {
    console.error('Error loading documents:', error);
    showNotification('Error loading documents. Please try again.', 'error');
  }
}

// Initialize the interface
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  // Check if user is logged in
  const currentUser = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');
  
  console.log('Login check - Username:', currentUser, 'Role:', userRole);
  
  if (!currentUser || !userRole) {
    console.log('No user logged in, redirecting to index');
    window.location.href = 'index.html';
    return;
  }

  // Set welcome message
  const welcomeMsg = document.getElementById('welcomeMessage');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome, ${currentUser}! (${userRole.charAt(0).toUpperCase() + userRole.slice(1)})`;
  }

  // Load documents immediately
  loadDocuments();
  
  // Set up periodic updates
  setInterval(() => {
    loadDocuments();
    checkNotifications();
  }, 30000); // Update every 30 seconds
});

// Navigation functions
function goToIndex() {
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
  
  // Navigate to index page
  window.location.href = 'index.html';
}

function logout() {
  // Save necessary data before logout
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
  
  // Navigate to login page
  window.location.href = 'index.html';
}

// Function to view PDF
function viewPDF(transmitNumber) {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const doc = documents.find(d => d.transmitNumber === transmitNumber);
  
  if (doc && doc.fileContent) {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>${doc.docName}</title>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${doc.fileContent}" type="application/pdf"></iframe>
        </body>
      </html>
    `);
  } else {
    showNotification('Document not found or no file content available', 'error');
  }
}

// Function to download PDF
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
  } else {
    showNotification('Document not found or no file content available', 'error');
  }
}

// Export the functions that need to be accessed from HTML
export {
  handleReceiveDocument,
  updateDocumentStatus,
  viewPDF,
  downloadPDF,
  showNotification,
  checkNotifications,
  loadDocuments
};

// Make functions available globally for onclick handlers
window.handleReceiveDocument = handleReceiveDocument;
window.updateDocumentStatus = updateDocumentStatus;
window.viewPDF = viewPDF;
window.downloadPDF = downloadPDF;
window.showNotification = showNotification;
window.checkNotifications = checkNotifications;
window.loadDocuments = loadDocuments;