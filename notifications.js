// notifications.js

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
      .notification-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #ff4444;
        color: white;
        border-radius: 50%;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: bold;
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
  if (!currentUser || !userRole) return;

  const lastCheck = localStorage.getItem('lastNotificationCheck') || '0';
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  
  // Filter documents that are newer than last check
  const newDocs = documents.filter(doc => {
    const docDate = new Date(doc.date).getTime();
    return docDate > parseInt(lastCheck) && doc.recipient.toLowerCase() === currentUser.toLowerCase();
  });

  // Filter status changes
  const statusChanges = documents.filter(doc => {
    const statusChangeTime = doc.lastStatusChangeTime || 0;
    return statusChangeTime > parseInt(lastCheck) && 
           (doc.sender.toLowerCase() === currentUser.toLowerCase() || 
            doc.recipient.toLowerCase() === currentUser.toLowerCase());
  });
  
  // Show notifications for new documents
  newDocs.forEach(doc => {
    showNotification(`New document received from ${doc.sender}: ${doc.docName}`, 'info');
  });

  // Show notifications for status changes
  statusChanges.forEach(doc => {
    if (doc.sender.toLowerCase() === currentUser.toLowerCase()) {
      showNotification(`Your document "${doc.docName}" status changed to ${doc.status}`, 
        doc.status === 'Received' ? 'success' : 
        doc.status === 'Declined' ? 'error' : 
        doc.status === 'In Transit' ? 'warning' : 'info'
      );
    }
  });
  
  // Update notification badge
  updateNotificationBadge(newDocs.length + statusChanges.length);
  
  // Update last check time
  localStorage.setItem('lastNotificationCheck', Date.now().toString());
}

// Function to update notification badge
function updateNotificationBadge(count) {
  const buttonContainer = document.getElementById('buttonContainer');
  if (!buttonContainer) return;

  // Find all buttons that should show notifications
  const receiveButton = Array.from(buttonContainer.getElementsByTagName('button'))
    .find(btn => btn.textContent.includes('Receive Documents'));

  if (receiveButton && count > 0) {
    // Add or update badge
    let badge = receiveButton.querySelector('.notification-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'notification-badge';
      receiveButton.style.position = 'relative';
      receiveButton.appendChild(badge);
    }
    badge.textContent = count;
  }
}

// Initialize notifications
document.addEventListener('DOMContentLoaded', () => {
  checkNotifications();
  // Check for new notifications every 30 seconds
  setInterval(checkNotifications, 30000);
}); 