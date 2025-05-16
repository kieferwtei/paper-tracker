// tracker.js

// Function to display documents with dynamic status dropdown
function displayTrackerDocuments() {
    const uploadedDocuments = JSON.parse(localStorage.getItem("uploadedDocuments")) || [];

    const trackerListContainer = document.getElementById("tracker-list");
    trackerListContainer.innerHTML = ""; // Clear any existing content

    if (uploadedDocuments.length > 0) {
        uploadedDocuments.forEach(doc => {
            const docElement = document.createElement("tr");
            docElement.classList.add("tracker-item");
            docElement.innerHTML = `
                <td>${doc.name}</td>
                <td>${doc.fileName}</td>
                <td>
                    <select onchange="updateStatus('${doc.fileName}', this)">
                        <option value="In Transit" ${doc.status === "In Transit" ? "selected" : ""}>In Transit</option>
                        <option value="Received" ${doc.status === "Received" ? "selected" : ""}>Received</option>
                        <option value="Declined" ${doc.status === "Declined" ? "selected" : ""}>Declined</option>
                    </select>
                </td>
            `;

            trackerListContainer.appendChild(docElement);
        });
    } else {
        trackerListContainer.innerHTML = "<tr><td colspan='3'>No documents available.</td></tr>";
    }
}

// Function to handle the status change and update in localStorage
function updateStatus(fileName, selectElement) {
    const newStatus = selectElement.value;
    
    let uploadedDocuments = JSON.parse(localStorage.getItem("uploadedDocuments")) || [];
    const documentIndex = uploadedDocuments.findIndex(doc => doc.fileName === fileName);

    if (documentIndex !== -1) {
        uploadedDocuments[documentIndex].status = newStatus;
        localStorage.setItem("uploadedDocuments", JSON.stringify(uploadedDocuments));
    }
}

// Function to export documents to Excel (CSV format)
function exportToExcel() {
    const uploadedDocuments = JSON.parse(localStorage.getItem("uploadedDocuments")) || [];

    const header = ["Document Name", "File Name", "Status"];
    const rows = uploadedDocuments.map(doc => [doc.name, doc.fileName, doc.status]);

    let csvContent = "data:text/csv;charset=utf-8," + header.join(",") + "\n";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "documents.csv");
    document.body.appendChild(link);
    link.click();
}

// Go back to previous page or home page
function goBack() {
    window.history.back();
}

// Call the function to display documents when the page loads
window.onload = displayTrackerDocuments;
