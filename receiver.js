// receiver.js

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
function loadDocuments() {
  try {
    // Add styling for the PDF buttons
    const style = document.createElement('style');
    style.textContent = `
      .view-pdf-btn, .download-pdf-btn {
        padding: 5px 10px;
        margin: 2px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .view-pdf-btn {
        background-color: #1976d2;
        color: white;
      }
      .download-pdf-btn {
        background-color: #2e7d32;
        color: white;
      }
      .view-pdf-btn:hover {
        background-color: #1565c0;
      }
      .download-pdf-btn:hover {
        background-color: #2e6b32;
      }
    `;
    document.head.appendChild(style);

    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const tbody = document.getElementById('documentTableBody');
    const currentUser = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    if (!currentUser || !tbody) return;
    
    tbody.innerHTML = '';
    
    // Filter and process documents for current user
    const filteredDocs = documents.filter(doc => {
      if (userRole === 'department') {
        // Department users see documents where they are the recipient
        return doc.recipient.toLowerCase() === currentUser.toLowerCase();
      } else if (userRole === 'staff' || userRole === 'admin') {
        // WTEI staff see documents they sent or received
        return doc.sender.toLowerCase() === currentUser.toLowerCase() || 
               doc.recipient.toLowerCase() === currentUser.toLowerCase();
      }
      return false;
    });
    
    // Update localStorage with auto-received documents
    const allDocs = documents.map(doc => doc);
    localStorage.setItem('documents', JSON.stringify(allDocs));
    
    // Display message if no documents
    if (filteredDocs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No documents available</td></tr>';
      return;
    }
    
    // Sort by date, newest first
    filteredDocs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create table rows
    filteredDocs.forEach(doc => {
      const tr = document.createElement('tr');
      
      // Set row color based on status
      if (doc.status === 'Received') {
        tr.style.backgroundColor = 'rgba(232, 245, 233, 0.9)';
      } else if (doc.status === 'Pending') {
        tr.style.backgroundColor = 'rgba(255, 244, 229, 0.9)';
      }
      
      // Add document info cells
      tr.innerHTML = `
        <td>${doc.docName || 'N/A'}</td>
        <td>${doc.sender || 'N/A'}</td>
        <td style="font-weight: bold; color: #1976d2;">${doc.recipient || 'N/A'}</td>
        <td>${doc.date || 'N/A'}</td>
        <td>${doc.transmitNumber || 'N/A'}</td>
        <td class="status-column"></td>
        <td class="date-received">${doc.dateReceived || '-'}</td>
        <td>
          <button class="view-pdf-btn" onclick="viewPDF('${doc.fileContent || ''}')">View PDF</button>
          <button class="download-pdf-btn" onclick="downloadPDF('${doc.fileContent || ''}', '${doc.docName || 'document.pdf'}')">Download PDF</button>
        </td>
        <td class="action-column"></td>
      `;
      
      // Handle status column
      const statusCell = tr.querySelector('.status-column');
      const dateReceivedCell = tr.querySelector('.date-received');
      const actionCell = tr.querySelector('.action-column');
      
      if (userRole === 'department' && doc.recipient.toLowerCase() === currentUser.toLowerCase()) {
        // Department users can change status of documents sent to them
        if (doc.status === 'Pending') {
          const statusSelect = document.createElement('select');
          statusSelect.className = 'status-select';
          statusSelect.innerHTML = `
            <option value="Pending" ${doc.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Received" ${doc.status === 'Received' ? 'selected' : ''}>Received</option>
            <option value="Declined" ${doc.status === 'Declined' ? 'selected' : ''}>Declined</option>
            <option value="In Transit" ${doc.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
          `;
          
          statusSelect.onchange = function() {
            const newStatus = this.value;
            if (updateDocumentStatus(doc.transmitNumber, newStatus)) {
              // Update status immediately
              doc.status = newStatus;
              if (newStatus === 'Received') {
                const today = new Date().toISOString().split('T')[0];
                dateReceivedCell.textContent = today;
                doc.dateReceived = today;
              } else {
                dateReceivedCell.textContent = '-';
                doc.dateReceived = '-';
              }
              
              // Update localStorage
              localStorage.setItem('documents', JSON.stringify(documents));
              
              // Update row color
              if (newStatus === 'Received') {
                tr.style.backgroundColor = 'rgba(232, 245, 233, 0.9)';
              } else if (newStatus === 'Pending') {
                tr.style.backgroundColor = 'rgba(255, 244, 229, 0.9)';
              }
            }
          };
          
          statusCell.appendChild(statusSelect);
        } else {
          // Show status text for non-pending documents
          statusCell.textContent = doc.status;
          statusCell.style.fontWeight = 'bold';
          statusCell.style.color = doc.status === 'Received' ? '#2e7d32' : '#f57c00';
        }
      } else if ((userRole === 'staff' || userRole === 'admin') && 
                 doc.recipient.toLowerCase() === currentUser.toLowerCase()) {
        // WTEI staff can change status of documents sent to them
        const statusSelect = document.createElement('select');
        statusSelect.className = 'status-select';
        statusSelect.innerHTML = `
          <option value="Pending" ${doc.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Received" ${doc.status === 'Received' ? 'selected' : ''}>Received</option>
          <option value="Declined" ${doc.status === 'Declined' ? 'selected' : ''}>Declined</option>
          <option value="In Transit" ${doc.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
        `;
        
        statusSelect.onchange = function() {
          const newStatus = this.value;
          if (updateDocumentStatus(doc.transmitNumber, newStatus)) {
            // Update status immediately
            doc.status = newStatus;
            if (newStatus === 'Received') {
              const today = new Date().toISOString().split('T')[0];
              dateReceivedCell.textContent = today;
              doc.dateReceived = today;
            } else {
              dateReceivedCell.textContent = '-';
              doc.dateReceived = '-';
            }
            
            // Update localStorage
            localStorage.setItem('documents', JSON.stringify(documents));
            
            // Update row color
            if (newStatus === 'Received') {
              tr.style.backgroundColor = 'rgba(232, 245, 233, 0.9)';
            } else if (newStatus === 'Pending') {
              tr.style.backgroundColor = 'rgba(255, 244, 229, 0.9)';
            }
          }
        };
        
        statusCell.appendChild(statusSelect);
      } else {
        // Show status text for other cases
        statusCell.textContent = doc.status;
        statusCell.style.fontWeight = 'bold';
        statusCell.style.color = doc.status === 'Received' ? '#2e7d32' : '#f57c00';
      }
      
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading documents:', error);
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