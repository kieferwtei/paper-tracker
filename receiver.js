// receiver.js
// receiver.js

function goBack() {
  window.history.back();
}

// Load documents from localStorage and render them
function loadDocuments() {
  const documents = JSON.parse(localStorage.getItem('documents')) || [];
  const tbody = document.getElementById('documentTableBody');
  tbody.innerHTML = ''; // Clear existing rows

  documents.forEach((doc, index) => {
    const tr = document.createElement('tr');

    // Document Name
    const tdName = document.createElement('td');
    tdName.textContent = doc.docName || doc.name || 'N/A';
    tr.appendChild(tdName);

    // Recipient
    const tdRecipient = document.createElement('td');
    tdRecipient.textContent = doc.recipient || 'N/A';
    tr.appendChild(tdRecipient);

    // Date
    const tdDate = document.createElement('td');
    tdDate.textContent = doc.date || 'N/A';
    tr.appendChild(tdDate);

    // Transmit Number
    const tdTransmit = document.createElement('td');
    tdTransmit.textContent = doc.transmitNumber || 'N/A';
    tr.appendChild(tdTransmit);

    // Status with dropdown to update
    const tdStatus = document.createElement('td');
    const selectStatus = document.createElement('select');
    ['Pending', 'In Transit', 'Received', 'Declined'].forEach(statusOption => {
      const option = document.createElement('option');
      option.value = statusOption;
      option.textContent = statusOption;
      if (doc.status === statusOption) option.selected = true;
      selectStatus.appendChild(option);
    });
    selectStatus.addEventListener('change', () => {
      doc.status = selectStatus.value;
      saveDocuments(documents);
      alert(`Status updated to "${doc.status}"`);
      // Optionally, you can refresh the table or update UI here
    });
    tdStatus.appendChild(selectStatus);
    tr.appendChild(tdStatus);

    // PDF link cell
    const tdPdf = document.createElement('td');
    if (doc.fileContent) {
      const pdfLink = document.createElement('a');
      pdfLink.textContent = 'View PDF';
      pdfLink.href = doc.fileContent;  // Base64 data URL
      pdfLink.target = '_blank';        // open in new tab
      pdfLink.rel = 'noopener noreferrer';
      tdPdf.appendChild(pdfLink);
    } else {
      tdPdf.textContent = 'No file';
    }
    tr.appendChild(tdPdf);

    // Update Status button cell (optional if you want separate button)
    // You can remove this if using dropdown above
    // const tdUpdate = document.createElement('td');
    // const btnUpdate = document.createElement('button');
    // btnUpdate.textContent = 'Update';
    // btnUpdate.addEventListener('click', () => {
    //   doc.status = selectStatus.value;
    //   saveDocuments(documents);
    //   alert('Status updated');
    // });
    // tdUpdate.appendChild(btnUpdate);
    // tr.appendChild(tdUpdate);

    tbody.appendChild(tr);
  });
}

// Save updated documents array back to localStorage
function saveDocuments(docs) {
  localStorage.setItem('documents', JSON.stringify(docs));
}

// Initial load when page loads
window.onload = loadDocuments;

  window.history.back();


function loadDocuments() {
  const tableBody = document.querySelector("#documentsTable tbody");
  const departmentFilter = document.getElementById("departmentFilter").value;

  const documents = JSON.parse(localStorage.getItem("documents") || "[]");

  tableBody.innerHTML = "";

  documents.forEach((doc, index) => {
    if (!departmentFilter || doc.recipient === departmentFilter) {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${doc.docName}</td>
        <td>${doc.transmitNumber}</td>
        <td>${doc.sender || "User"}</td>
        <td>${doc.recipient}</td>
        <td><a class="preview-link" href="${doc.fileUrl}" target="_blank">Preview</a></td>
        <td>
          <select class="status-select" data-index="${index}">
            <option value="Pending" ${doc.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Received" ${doc.status === "Received" ? "selected" : ""}>Received</option>
            <option value="Declined" ${doc.status === "Declined" ? "selected" : ""}>Declined</option>
            <option value="In Transit" ${doc.status === "In Transit" ? "selected" : ""}>In Transit</option>
          </select>
        </td>
      `;
      tableBody.appendChild(row);
    }
  });

  // Add listener after loading
  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const index = e.target.dataset.index;
      documents[index].status = e.target.value;
      localStorage.setItem("documents", JSON.stringify(documents));
    });
  });
}

document.getElementById("departmentFilter").addEventListener("change", loadDocuments);

window.onload = loadDocuments;
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("documentTableBody");
  const documents = JSON.parse(localStorage.getItem("documents") || "[]");

  tableBody.innerHTML = "";

  documents.forEach((doc, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${doc.docName}</td>
      <td>${doc.recipient}</td>
      <td>${doc.date}</td>
      <td>${doc.transmitNumber}</td>
      <td>${doc.status}</td>
      <td><button class="pdf-link" data-index="${index}">View PDF</button></td>
      <td>
        <select data-index="${index}" class="status-select">
          <option value="Pending" ${doc.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Received" ${doc.status === "Received" ? "selected" : ""}>Received</option>
          <option value="Declined" ${doc.status === "Declined" ? "selected" : ""}>Declined</option>
          <option value="In Transit" ${doc.status === "In Transit" ? "selected" : ""}>In Transit</option>
        </select>
      </td>
    `;

    tableBody.appendChild(row);
  });
  // Handle PDF view
  document.querySelectorAll(".pdf-link").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      const doc = documents[index];
      if (doc.fileContent) {
        const pdfWindow = window.open();
        pdfWindow.document.write(
          `<iframe width='100%' height='100%' src='${doc.fileContent}'></iframe>`
        );
      } else {
        alert("PDF content not available.");
      }
    });
  });
  // Handle status change
  document.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const index = e.target.getAttribute("data-index");
      documents[index].status = e.target.value;
      localStorage.setItem("documents", JSON.stringify(documents));
    });
  });
});
  documentTable.addEventListener("change", function (e) {
    if (e.target.tagName === "SELECT") {
      const index = e.target.getAttribute("data-index");
      storedDocuments[index].status = e.target.value;
      localStorage.setItem("documents", JSON.stringify(storedDocuments));
    }
    document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.getElementById("documentTableBody");

  function loadDocuments() {
   const documents = JSON.parse(localStorage.getItem("documents") || "[]");

const filtered = documents.filter(doc => doc.recipient === selectedDepartment);


    if (documents.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='7'>No documents found.</td></tr>";
      return;
    }

    documents.forEach((doc, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${doc.docName}</td>
        <td>${doc.recipient}</td>
        <td>${doc.date}</td>
        <td>${doc.transmitNumber}</td>
        <td>${doc.status}</td>
        <td>${doc.fileName ? `<span class="pdf-link">${doc.fileName}</span>` : 'N/A'}</td>
        <td>
          <select data-index="${index}">
            <option value="Pending" ${doc.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="In Transit" ${doc.status === "In Transit" ? "selected" : ""}>In Transit</option>
            <option value="Received" ${doc.status === "Received" ? "selected" : ""}>Received</option>
            <option value="Declined" ${doc.status === "Declined" ? "selected" : ""}>Declined</option>
          </select>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // Update status in localStorage
  tableBody.addEventListener("change", function (e) {
    if (e.target.tagName === "SELECT") {
      const index = e.target.getAttribute("data-index");
      const updatedDocuments = JSON.parse(localStorage.getItem("documents")) || [];
      updatedDocuments[index].status = e.target.value;
      localStorage.setItem("documents", JSON.stringify(updatedDocuments));
      loadDocuments(); // Refresh table
    }
  });

  loadDocuments();
});

  loadDocuments();
});

// View PDF file from base64
function viewPDF(base64Content) {
  if (!base64Content) {
    alert("No PDF content available");
    return;
  }
  const newWindow = window.open();
  const html = `
    <html>
      <head><title>View PDF</title></head>
      <body style="margin:0">
        <iframe 
          src="${base64Content}" 
          style="border:none; width:100vw; height:100vh;"
          frameborder="0">
        </iframe>
      </body>
    </html>`;
  newWindow.document.write(html);
  newWindow.document.close();
}


  // If base64Content doesn't start with "data:application/pdf"
  if (!base64Content.startsWith("data:application/pdf")) {
    base64Content = "data:application/pdf;base64," + base64Content;
  }

  const newWindow = window.open();
  newWindow.document.write(`
    <iframe 
      width="100%" 
      height="100%" 
      style="border:none;" 
      src="${base64Content}">
    </iframe>
  `);
  newWindow.document.close();

console.log(JSON.parse(localStorage.getItem('documents')));


// Update the status and save to localStorage
function updateStatus(index, newStatus) {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  documents[index].status = newStatus;
  localStorage.setItem('documents', JSON.stringify(documents));
  alert(`Status updated to ${newStatus}`);
  loadDocuments(); // Refresh table
}

// Delete document from localStorage
function deleteDocument(index) {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  if (confirm("Are you sure you want to delete this document?")) {
    documents.splice(index, 1);
    localStorage.setItem('documents', JSON.stringify(documents));
    loadDocuments(); // Refresh table
  }
}

// Load and render the document table
function loadDocuments() {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const tbody = document.getElementById('documentTableBody');
  tbody.innerHTML = '';

  if (documents.length === 0) {
    tbody.innerHTML = "<tr><td colspan='8'>No documents found.</td></tr>";
    return;
  }
document.addEventListener("DOMContentLoaded", () => {
  renderTable();
});

  documents.forEach((doc, index) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${doc.docName}</td>
    <td>${doc.recipient}</td>
    <td>${doc.date}</td>
    <td>${doc.transmitNumber}</td>
    <td>${doc.status}</td>
    <td>${doc.dateReceived || '-'}</td>
    <td><a href="#" onclick="viewPDF('${doc.fileContent || ''}')">View PDF</a></td>
    <td>
      <select onchange="updateStatus(${index}, this.value)">
        <option value="Pending" ${doc.status === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="In Transit" ${doc.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
        <option value="Received" ${doc.status === 'Received' ? 'selected' : ''}>Received</option>
        <option value="Declined" ${doc.status === 'Declined' ? 'selected' : ''}>Declined</option>
      </select>
    </td>
    <td><button onclick="deleteDocument(${index})">Delete</button></td>
  `;
  tableBody.appendChild(row);
});

}

// Initial load
window.onload = loadDocuments;