import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './css/invoiceDetails.css';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { FreeSerifBase64 } from '../components/FreeSerifBase64';

const FreeSerifBase = FreeSerifBase64;

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxInfo, setTaxInfo] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [showSendEmailButton, setShowSendEmailButton] = useState(false);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState(null);

  const navigate = useNavigate();

  const fetchEmailPreview = async () => {
    try {
      if (!invoice) return;

      const response = await fetch('http://localhost:5000/preview-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceData: {
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            serviceDescription: invoice.serviceDescription,
            finalAmount: invoice.finalAmount || invoice.amount, // fallback
            amount: invoice.amount, // Subtotal
            currency: invoice.currency,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            taxInfo: invoice.taxInfo,
            discount: invoice.discount,
            notes: invoice.notes
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preview');
      }

      const data = await response.json();
      setEmailPreviewHtml(data.html);
    } catch (error) {
      console.error('Error fetching email preview:', error);
      // Silently continue without email preview (for production environments)
      // This allows the page to still function even if the backend is not available
      setEmailPreviewHtml(null);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  const fetchInvoice = async () => {
    if (userId && invoiceId) {
      try {
        const docRef = doc(db, 'customers', userId, 'invoices', invoiceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const invoiceData = docSnap.data();
          setInvoice(invoiceData);
          setClientName(invoiceData.clientName || '');
          setClientEmail(invoiceData.clientEmail || '');
          setServiceDescription(invoiceData.serviceDescription || '');
          setAmount(invoiceData.amount || '');
          setCurrency(invoiceData.currency || '');
          setInvoiceNumber(invoiceData.invoiceNumber || '');
          setIssueDate(invoiceData.issueDate || '');
          setDueDate(invoiceData.dueDate || '');
          setTaxInfo(invoiceData.taxInfo || '');
          setDiscount(invoiceData.discount || '');
          setNotes(invoiceData.notes || '');
          setFinalAmount(invoiceData.finalAmount || '');
          setShowSendEmailButton(true);
        } else {
          console.error('Invoice not found!');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
      }
    }
  };

  useEffect(() => {
    if (userId && invoiceId) {
      fetchInvoice();
    }
  }, [userId, invoiceId]);

  useEffect(() => {
    if (invoice) {
        fetchEmailPreview();
        // PDF generation removed from here - user can click 'Download as PDF' button instead
    }
  }, [invoice]);

  const updateInvoice = async () => {
    try {
      const finalAmountCalculated = amount - (amount * (discount / 100));
      const docRef = doc(db, 'customers', userId, 'invoices', invoiceId);
      await updateDoc(docRef, {
        clientName,
        clientEmail,
        serviceDescription,
        amount: parseFloat(amount) || 0,
        currency,
        invoiceNumber,
        issueDate,
        dueDate,
        taxInfo,
        discount: parseFloat(discount) || 0,
        notes,
        finalAmount: finalAmountCalculated.toFixed(2),
      });
      setModalMessage('Invoice updated successfully.');
      setModalOpen(true);
      setIsEditing(false);
      await fetchInvoice();
    } catch (error) {
      console.error('Error updating invoice:', error);
      setModalMessage('An error occurred while updating the invoice.');
      setModalOpen(true);
    }
  };

  const deleteInvoice = async () => {
    try {
      const docRef = doc(db, 'customers', userId, 'invoices', invoiceId);
      await deleteDoc(docRef);
      setModalMessage('Invoice deleted successfully.');
      setModalOpen(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setModalMessage('An error occurred while deleting the invoice.');
      setModalOpen(true);
    }
  };

  const generatePDF = async (shouldDownload = false) => {
    try {
      if (!emailPreviewHtml) {
        console.warn('Email preview HTML not ready yet.');
        return;
      }

      const doc = new jsPDF('p', 'pt', 'a4');
      const a4Width = 595.28;
      const a4Height = 841.89;  // Not strictly used for single page scaling logic but good to know
      const margin = 20;

      // Create a temporary iframe to properly render the full HTML document
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      // Set width to a standard email width (e.g., 600px - 800px) to ensure correct reflow
      iframe.style.width = '800px'; 
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);

      // Write the HTML content to the iframe
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(emailPreviewHtml);
      iframeDoc.close();

      // Wait for images and styles to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        setTimeout(resolve, 1000); // Extended timeout for safety
      });
      // Small delay for rendering
      await new Promise(r => setTimeout(r, 500));

      // Capture the iframe body as an image
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2, // Improve quality
        useCORS: true,
        logging: false,
        width: 800, // Force capture width
        windowWidth: 800
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgProps = doc.getImageProperties(imgData);
      
      const pdfWidth = a4Width - (margin * 2);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, 'JPEG', margin, margin, pdfWidth, pdfHeight);

      const pdfArrayBuffer = doc.output('arraybuffer');
      setPdfBytes(pdfArrayBuffer);

      if (shouldDownload) {
        doc.save(`invoice-${invoiceNumber || 'unknown'}.pdf`);
      }
      
      document.body.removeChild(iframe);
      console.log('PDF generated successfully as image.');

    } catch (error) {
      console.error('Error generating PDF:', error);
      setModalMessage('PDF generation failed. Please try again.');
      setModalOpen(true);
      const existingIframe = document.querySelector('iframe[style*="-9999px"]');
      if (existingIframe) document.body.removeChild(existingIframe);
    }
  };

  const generatePDFDirectly = async (shouldDownload = false) => {
    try {
      if (!invoice) {
        console.warn('Invoice data not ready yet.');
        return;
      }

      const doc = new jsPDF('p', 'pt', 'a4');
      const a4Width = 595.28;
      const margin = 20;
      let yPosition = margin;
      const lineHeight = 20;
      const pageHeight = doc.internal.pageSize.getHeight();

      // Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('INVOICE', margin, yPosition);
      yPosition += lineHeight * 1.5;

      // Invoice details
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Invoice Number: ${invoiceNumber}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Issue Date: ${issueDate}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Due Date: ${dueDate}`, margin, yPosition);
      yPosition += lineHeight * 1.5;

      // Client details
      doc.setFont('Helvetica', 'bold');
      doc.text('Bill To:', margin, yPosition);
      yPosition += lineHeight;
      doc.setFont('Helvetica', 'normal');
      doc.text(`${clientName}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`${clientEmail}`, margin, yPosition);
      yPosition += lineHeight * 1.5;

      // Service description
      doc.setFont('Helvetica', 'bold');
      doc.text('Description:', margin, yPosition);
      yPosition += lineHeight;
      doc.setFont('Helvetica', 'normal');
      doc.text(serviceDescription, margin, yPosition, { maxWidth: a4Width - margin * 2 });
      yPosition += lineHeight * 2;

      // Amount details
      doc.setFont('Helvetica', 'bold');
      doc.text(`Subtotal: ${currency} ${amount}`, margin, yPosition);
      yPosition += lineHeight;
      if (discount > 0) {
        doc.text(`Discount: -${discount}%`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (taxInfo) {
        doc.text(`Tax: ${taxInfo}`, margin, yPosition);
        yPosition += lineHeight;
      }
      doc.setFontSize(12);
      doc.text(`Total: ${currency} ${finalAmount || amount}`, margin, yPosition);
      yPosition += lineHeight * 1.5;

      // Notes
      if (notes) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Notes:', margin, yPosition);
        yPosition += lineHeight;
        doc.setFont('Helvetica', 'normal');
        doc.text(notes, margin, yPosition, { maxWidth: a4Width - margin * 2 });
      }

      const pdfArrayBuffer = doc.output('arraybuffer');
      setPdfBytes(pdfArrayBuffer);

      if (shouldDownload) {
        doc.save(`invoice-${invoiceNumber || 'unknown'}.pdf`);
      }

      console.log('PDF generated successfully.');
    } catch (error) {
      console.error('Error generating PDF directly:', error);
      setModalMessage('PDF generation failed. Please try again.');
      setModalOpen(true);
    }
  };

  const sendInvoiceEmail = async () => {
  if (!pdfBytes) {
    setModalMessage('PDF generation failed. Please try again.');
    setModalOpen(true);
    return;
  }

  try {
    // Notların string olduğundan emin ol
    const safeNotes = typeof notes === 'string' ? notes : JSON.stringify(notes);

    // Use FileReader to convert PDF bytes to Base64 safely (avoids stack overflow)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    await new Promise((resolve) => { 
        reader.onloadend = resolve; 
    });
    const pdfBase64 = reader.result.split(',')[1];

    const payload = {
      clientEmail,
      subject: `Invoice ${invoiceNumber}`,
      text: `Dear ${clientName},\n\nPlease find attached your invoice.\n\nBest regards,\nYour Company`,
      invoiceData: {
        invoiceNumber,
        clientName,
        clientEmail,
        serviceDescription,
        amount: parseFloat(amount) || 0, // Add amount (subtotal) - CRITICAL for email template
        taxInfo,
        issueDate,
        dueDate,
        finalAmount: parseFloat(finalAmount),
        currency,
        discount,
        notes: safeNotes,
        pdfBytes: pdfBase64,
      },
    };

    console.log('Email payload:', payload);

    const response = await fetch('http://localhost:5000/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to send email');

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to send email');

    setModalMessage('Email sent successfully!');
    setModalOpen(true);
  } catch (error) {
    console.error('Error sending email:', error);
    setModalMessage('Email service is currently unavailable. The backend server is not running. Please ensure your backend server is running on http://localhost:5000');
    setModalOpen(true);
  }
};


  const formatAmount = (value) => {
    if (!value && value !== 0) return '';
    const strValue = typeof value === 'number' ? value.toString() : value;
    return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <>
      <Navbar />
      <div className="invoice-details-container">
        <h2>Invoice Details</h2>
        {invoice ? (
          <>
            {isEditing ? (
              <div>
                <input type="text" placeholder="Customer Name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                <input type="email" placeholder="Customer Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
                <input type="text" placeholder="Service Description" value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} />
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                <input type="text" placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required />
                <input type="text" placeholder="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
                <input type="date" placeholder="Issue Date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
                <input type="date" placeholder="Due Date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                <input type="text" placeholder="Tax Information" value={taxInfo} onChange={(e) => setTaxInfo(e.target.value)} />
                <input type="number" placeholder="Discount (%)" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
                <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <div className="button-group">
                  <button className="edit-button" onClick={updateInvoice}>Save</button>
                  <button className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p><strong>Customer Name:</strong> {invoice.clientName}</p>
                <p><strong>Customer Email:</strong> {invoice.clientEmail}</p>
                <p><strong>Service Description:</strong> {invoice.serviceDescription}</p>
                <p><strong>Amount:</strong> {formatAmount(invoice.amount)} {invoice.currency}</p>
                <p><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Payment Date:</strong> {invoice.paymentDate}</p>
                <p><strong>Tax Information:</strong> {invoice.taxInfo}</p>
                <p><strong>Discount:</strong> {invoice.discount}%</p>
                <p><strong>Discounted Amount:</strong> {formatAmount(invoice.finalAmount)} {invoice.currency}</p>
                <p><strong>Notes:</strong> {invoice.notes}</p>
                <p><strong>Creation Date:</strong> {invoice.createdAt?.toDate().toLocaleString() || 'Date not found'}</p>
                <div className="button-group">
                  <button className="edit-button" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className="delete-button" onClick={() => setDeleteDialogOpen(true)}>Delete</button>
                  <button className="pdf-button" onClick={() => generatePDFDirectly(true)}>Download as PDF</button>
                  {showSendEmailButton && <button className="pdf-button" onClick={sendInvoiceEmail}>Send Email</button>}
                </div>
                
                <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                  <h3>Invoice Preview</h3>
                  {emailPreviewHtml ? (
                    <div style={{ 
                      border: '1px solid #ddd', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      marginTop: '15px' 
                    }}>
                      <iframe 
                        srcDoc={emailPreviewHtml}
                        title="Invoice Preview"
                        width="100%"
                        height="600px"
                        style={{ border: 'none', display: 'block' }}
                      />
                    </div>
                  ) : (
                    <p>Loading preview...</p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>{"Notification"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{modalMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="primary">OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{"Delete Invoice"}</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this invoice?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={deleteInvoice} color="primary" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceDetails;