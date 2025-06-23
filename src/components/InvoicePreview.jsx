import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { FreeSerifBase64 } from './FreeSerifBase64'; // Adjust the import based on your file structure

// Add this function:
const formatAmount = (value) => {
  if (value === undefined || value === null) return '';
  const strValue = typeof value === 'number' ? value.toString() : value;
  return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const InvoicePreview = ({ invoice }) => {
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const generatePdfPreview = async () => {
      const doc = new jsPDF();
      doc.addFileToVFS('FreeSerif.ttf', FreeSerifBase64);
      doc.addFont('FreeSerif.ttf', 'FreeSerif', 'normal');
      doc.setFont('FreeSerif', 'normal'); // Specify style

      const margin = 20;
      const lineHeight = 10;
      const startX = margin;
      let currentY = margin;

      // Add the logo to the PDF
      const logoURL = '/logo.png'; // Path to your logo file
      const img = new Image();
      img.src = logoURL;
      img.onload = () => {
        doc.addImage(img, 'PNG', 150, 10, 50, 20); // Add the logo to the top-right corner

        // Title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', startX, currentY);

        currentY += lineHeight * 3;

        // Customer Information
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information:', startX, currentY);

        currentY += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${invoice.clientName}`, startX, currentY);
        currentY += lineHeight;
        doc.text(`Email: ${invoice.clientEmail}`, startX, currentY);

        currentY += lineHeight * 2;

        // Service Information
        doc.setFont('helvetica', 'bold');
        doc.text('Service Information:', startX, currentY);

        currentY += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.text(`Amount: ${formatAmount(invoice.amount)} ${invoice.currency}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Issue Date: ${invoice.issueDate}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Due Date: ${invoice.dueDate}`, startX, currentY);

        // Optional Fields
        if (invoice.serviceDescription) {
          currentY += lineHeight;
          doc.text(`Description: ${invoice.serviceDescription}`, startX, currentY);
        }

        if (invoice.invoiceNumber) {
          currentY += lineHeight;
          doc.text(`Invoice Number: ${invoice.invoiceNumber}`, startX, currentY);
        }

        if (invoice.taxInfo) {
          currentY += lineHeight;
          doc.text(`Tax Information: ${invoice.taxInfo}`, startX, currentY);
        }

        // Include discount and discounted amount only if discount > 0
        if (invoice.discount > 0) {
          currentY += lineHeight;
          doc.text(`Discount: ${invoice.discount}%`, startX, currentY);

          const discountedAmount = (invoice.amount - (invoice.amount * (invoice.discount / 100))).toFixed(2);
          currentY += lineHeight;
          doc.text(`Discounted Amount: ${formatAmount(discountedAmount)} ${invoice.currency}`, startX, currentY);
        }

        if (invoice.notes) {
          currentY += lineHeight;
          doc.text(`Notes: ${invoice.notes}`, startX, currentY);
        }

        currentY += lineHeight * 2;

        // Footer
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount: ${formatAmount(invoice.finalAmount || invoice.amount)} ${invoice.currency}`, startX, currentY);

        currentY += lineHeight * 2;
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('This is a digital invoice. No wet signature required.', startX, currentY);

        // Generate PDF URL
        const pdfBlob = doc.output('blob');
        const newPdfUrl = URL.createObjectURL(pdfBlob);

        setPdfUrl((prevUrl) => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return newPdfUrl;
        });
      };
    };

    if (invoice) {
      generatePdfPreview();
    }
  }, [invoice]);

  return (
    <div className="invoice-preview">
      <h3>Invoice Preview</h3>
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Invoice Preview"
          width="100%"
          height="600px"
          style={{ border: 'none' }}
        ></iframe>
      ) : (
        <p>Loading preview...</p>
      )}
    </div>
  );
};

export default InvoicePreview;