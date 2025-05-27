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

// Function to check for new documents
function checkNewDocuments() {
    const documents = JSON.parse(localStorage.getItem('documents')) || [];
    const lastCheck = localStorage.getItem('lastNotificationCheck');
    const currentTime = new Date().getTime();
    
    // If this is the first check, just store the current time
    if (!lastCheck) {
        localStorage.setItem('lastNotificationCheck', currentTime);
        return;
    }
    
    // Find new documents since last check
    const newDocuments = documents.filter(doc => {
        const docDate = new Date(doc.date).getTime();
        return docDate > parseInt(lastCheck);
    });
    
    // Update last check time
    localStorage.setItem('lastNotificationCheck', currentTime);
    
    // Return count of new documents
    return newDocuments.length;
}

// Function to update notification badge
function updateNotificationBadge() {
    const newDocCount = checkNewDocuments();
    const badge = document.getElementById('notificationBadge');
    
    if (badge) {
        if (newDocCount > 0) {
            badge.textContent = newDocCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Check for new documents every minute
setInterval(updateNotificationBadge, 60000);

// Initial check when page loads
document.addEventListener('DOMContentLoaded', updateNotificationBadge); 