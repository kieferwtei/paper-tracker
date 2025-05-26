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

// Function to update document status
function updateDocumentStatus(transmitNumber, newStatus) {
  try {
    let documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = documents.findIndex(doc => doc.transmitNumber === transmitNumber);
    
    if (docIndex !== -1) {
      // Get current date and time
      const today = new Date().toISOString().split('T')[0];
      const originalDoc = documents[docIndex];
      
      // Update the document
      documents[docIndex] = {
        ...documents[docIndex],
        status: newStatus,
        dateReceived: newStatus === 'Received' ? today : '-',
        lastStatusChangeTime: Date.now() // Add timestamp for status change
      };

      // Save to localStorage
      localStorage.setItem('documents', JSON.stringify(documents));
      
      // Send notification to document sender
      const notificationMessage = `Document "${originalDoc.docName}" has been marked as ${newStatus} by ${localStorage.getItem('username')}`;
      showNotification(notificationMessage, newStatus === 'Received' ? 'success' : 
                                         newStatus === 'Declined' ? 'error' : 
                                         newStatus === 'In Transit' ? 'warning' : 'info');
      
      // Verify the save was successful
      const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      const savedDoc = savedDocs.find(doc => doc.transmitNumber === transmitNumber);
      
      if (savedDoc && savedDoc.status === newStatus) {
        // Refresh the display to show new documents
        loadDocuments();
        return true;
      }
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error updating status:', error);
    showNotification('Error updating document status', 'error');
    return false;
  }
}

// Function to handle document reception
function handleReceiveDocument(transmitNumber, statusCell, dateReceivedCell) {
  if (updateDocumentStatus(transmitNumber, 'Received')) {
    // Update status cell
    statusCell.innerHTML = 'Received';
    statusCell.style.color = '#2e7d32';
    statusCell.style.fontWeight = 'bold';
    
    // Update date received cell
    const today = new Date().toISOString().split('T')[0];
    dateReceivedCell.textContent = today;
    
    // Persist the changes immediately
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = documents.findIndex(doc => doc.transmitNumber === transmitNumber);
    if (docIndex !== -1) {
      documents[docIndex].status = 'Received';
      documents[docIndex].dateReceived = today;
      localStorage.setItem('documents', JSON.stringify(documents));
    }
    
    return true;
  }
  return false;
}

// Function to receive document
function receiveDocument(transmitNumber) {
  try {
    // Get documents from localStorage
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = documents.findIndex(doc => doc.transmitNumber === transmitNumber);
    
    if (docIndex !== -1) {
      // Update document
      const today = new Date().toISOString().split('T')[0];
      documents[docIndex].status = 'Received';
      documents[docIndex].dateReceived = today;
      
      // Save back to localStorage
      localStorage.setItem('documents', JSON.stringify(documents));
      
      // Refresh the display
      loadDocuments();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error receiving document:', error);
    return false;
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
    const filters = {
      recipient: localStorage.getItem('username')
    };
    
    const documents = await firebaseService.getDocuments(filters);
    displayDocuments(documents);
  } catch (error) {
    console.error('Error loading documents:', error);
    alert('Error loading documents. Please try again.');
  }
}

function displayDocuments(documents) {
  const documentsList = document.getElementById('documentsList');
  documentsList.innerHTML = '';

  documents.forEach(doc => {
    const docElement = document.createElement('div');
    docElement.className = 'document-item';
    docElement.innerHTML = `
      <h3>${doc.docName}</h3>
      <p>Transmit Number: ${doc.transmitNumber}</p>
      <p>Sender: ${doc.sender}</p>
      <p>Date: ${new Date(doc.date).toLocaleString()}</p>
      <p>Status: ${doc.status}</p>
      <a href="${doc.fileUrl}" target="_blank">View Document</a>
      ${doc.status === 'Pending' ? `
        <button onclick="updateDocumentStatus('${doc.id}', 'Received')">Mark as Received</button>
      ` : ''}
    `;
    documentsList.appendChild(docElement);
  });
}

async function updateDocumentStatus(docId, newStatus) {
  try {
    await firebaseService.updateDocumentStatus(docId, newStatus);
    loadDocuments(); // Reload documents after status update
  } catch (error) {
    console.error('Error updating document status:', error);
    alert('Error updating document status. Please try again.');
  }
}

// Function to view PDF
function viewPDF(content) {
  if (content) {
    const pdfWindow = window.open();
    pdfWindow.document.write(`<iframe width='100%' height='100%' src='${content}'></iframe>`);
  } else {
    alert('PDF content not available');
  }
}

// Function to download PDF
function downloadPDF(content, filename) {
  if (content) {
    const link = document.createElement('a');
    link.href = content;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert('PDF content not available');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadDocuments();
  checkNotifications();
  
  // Check for new notifications every 30 seconds
  setInterval(checkNotifications, 30000);
});