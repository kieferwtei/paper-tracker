console.log("sender.js loaded");

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

  if (sender.toLowerCase().includes('wteistaff')) {
    // WTEI staff sending to department
    // Format: WTEI-STAFF-YYYYMMDD-COUNT-XXXX
    return `WTEI-STAFF-${year}${month}${day}-${count}-${timestamp}`;
  } else {
    // Department responding to WTEI staff
    // Find the most recent document sent to this department from the recipient (WTEI staff)
    const receivedDocs = documents.filter(doc => 
      doc.recipient.toLowerCase() === sender.toLowerCase() &&
      doc.sender.toLowerCase() === recipient.toLowerCase() &&
      doc.status === 'Pending'
    );

    if (receivedDocs.length > 0) {
      // Sort by date to get the most recent
      receivedDocs.sort((a, b) => new Date(b.date) - new Date(a.date));
      const originalDoc = receivedDocs[0];
      // Format: [Original Transmit Number]-R-COUNT
      // Example: WTEI-STAFF-20240315-001-1234-R-001
      return `${originalDoc.transmitNumber}-R-${count}`;
    } else {
      // Fallback if no original document found
      return `WTEI-${sender.toUpperCase()}-${year}${month}${day}-${count}-${timestamp}`;
    }
  }
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

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const docName = document.getElementById('docName').value.trim();
    const transmitNumber = document.getElementById('transmitNumber').value.trim();
    const recipient = document.getElementById('recipient').value.toLowerCase();
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    console.log("Submit clicked with values:", { docName, transmitNumber, recipient, file });

    // Validate recipient based on user role
    if (userRole === 'department') {
      if (!['wteistaff1', 'wteistaff2'].includes(recipient)) {
        alert('Departments can only send documents to WTEI staff members.');
        return;
      }
    } else if (userRole === 'staff' || userRole === 'admin') {
      if (!['sales', 'hr', 'cashier'].includes(recipient)) {
        alert('Staff can only send documents to departments.');
        return;
      }
    }

    if (!docName || !transmitNumber || !recipient) {
      alert('Please fill out all fields.');
      return;
    }
    if (!file) {
      alert('Please select a PDF file.');
      return;
    }
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      console.log("File read successfully");
      
      // Create new document object
      const newDocument = {
        docName,
        transmitNumber,
        recipient: recipient.toLowerCase(),
        sender: username,
        date: new Date().toISOString().split('T')[0],
        dateReceived: '-',
        status: 'Pending',
        fileName: file.name,
        fileContent: reader.result,
        senderRole: userRole
      };

      // Load existing documents
            const storedDocs = loadDocuments();            // Check for duplicate transmit number only from the same sender      if (storedDocs.some(doc => doc.transmitNumber === transmitNumber && doc.sender.toLowerCase() === username.toLowerCase())) {        alert('You have already used this transmit number. Please use a unique transmit number for your documents.');        return;      }      // Add new document
      storedDocs.push(newDocument);

      // Save updated documents
      if (saveDocuments(storedDocs)) {
        // Double verify the save was successful
        const verifyDocs = loadDocuments();
        const savedDoc = verifyDocs.find(doc => doc.transmitNumber === transmitNumber);
        
        if (savedDoc) {
          console.log('Document verified after save:', {
            docName: savedDoc.docName,
            transmitNumber: savedDoc.transmitNumber,
            sender: savedDoc.sender,
            recipient: savedDoc.recipient,
            senderRole: savedDoc.senderRole,
            status: savedDoc.status
          });
          
          alert('Document sent successfully!');
          form.reset();
          
          // Refresh the pending documents display if it exists
          if (userRole === 'department') {
            location.reload();
          }
        } else {
          alert('Warning: Document may not have been saved correctly. Please verify in the tracker.');
        }
      } else {
        alert('Failed to save document. Please try again.');
      }
    };

    reader.onerror = function () {
      alert('Failed to read file.');
      console.error('FileReader error:', reader.error);
    };

    reader.readAsDataURL(file);
  });
});
