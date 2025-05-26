// Function to view PDF
function viewPDF(fileContent) {
  try {
    if (!fileContent) {
      showNotification('No PDF content available', 'error');
      return;
    }

    // Create a new window for the PDF
    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      showNotification('Please allow popups to view PDFs', 'warning');
      return;
    }

    // Write the PDF viewer HTML
    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PDF Viewer</title>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
              background-color: #f5f5f5;
            }
            .pdf-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            embed {
              width: 100%;
              height: 100%;
              border: none;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .error-message {
              color: #d32f2f;
              text-align: center;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            <embed src="${fileContent}" type="application/pdf" />
          </div>
        </body>
      </html>
    `);
    pdfWindow.document.close();

    // Show success notification
    showNotification('PDF viewer opened in new window', 'success');
  } catch (error) {
    console.error('Error viewing PDF:', error);
    showNotification('Error viewing PDF. Please try again.', 'error');
  }
}

// Function to download PDF
function downloadPDF(fileContent, filename) {
  try {
    if (!fileContent) {
      showNotification('No PDF content available', 'error');
      return;
    }

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = fileContent;
    link.download = filename || 'document.pdf';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success notification
    showNotification('PDF download started', 'success');
  } catch (error) {
    console.error('Error downloading PDF:', error);
    showNotification('Error downloading PDF. Please try again.', 'error');
  }
} 