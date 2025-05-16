console.log("sender.js loaded");

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('senderForm');
  if (!form) {
    console.error("Form with id 'senderForm' not found!");
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const docName = document.getElementById('docName').value.trim();
    const transmitNumber = document.getElementById('transmitNumber').value.trim();
    const recipient = document.getElementById('recipient').value;
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    console.log("Submit clicked with values:", { docName, transmitNumber, recipient, file });

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
      const base64PDF = reader.result;

      const newDocument = {
        docName,
        transmitNumber,
        recipient,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        fileName: file.name,
        fileContent: base64PDF,
      };

      let storedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      storedDocs.push(newDocument);
      localStorage.setItem('documents', JSON.stringify(storedDocs));

      alert('Document sent successfully!');
      form.reset();
    };

    reader.onerror = function () {
      alert('Failed to read file.');
      console.error('FileReader error:', reader.error);
    };

    reader.readAsDataURL(file);
  });
});
