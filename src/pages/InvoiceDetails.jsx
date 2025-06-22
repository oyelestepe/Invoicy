import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import InvoicePreview from '../components/InvoicePreview';
import './css/invoiceDetails.css'; // Import CSS
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

// Base64 encoded FreeSerif font
const FreeSerifBase64 = '...'; // Add the Base64 encoded string here

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(''); // Allow user to type any currency
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState(''); 
  const [taxInfo, setTaxInfo] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [showSendEmailButton, setShowSendEmailButton] = useState(false); // State to manage the visibility of the "Send Email" button
  const [pdfBytes, setPdfBytes] = useState(null); // State to store the PDF bytes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();

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
          console.log('Invoice Data:', invoiceData);
          setInvoice(invoiceData);
          setClientName(invoiceData.clientName || '');
          setClientEmail(invoiceData.clientEmail || '');
          setServiceDescription(invoiceData.serviceDescription || '');
          setAmount(invoiceData.amount || '');
          setCurrency(invoiceData.currency || '');
          setInvoiceNumber(invoiceData.invoiceNumber || 'Unknown');
          setIssueDate(invoiceData.issueDate || '');
          setDueDate(invoiceData.dueDate || '');
          setTaxInfo(invoiceData.taxInfo || 'Unknown');
          setDiscount(invoiceData.discount || '');
          setNotes(invoiceData.notes || '');
          setFinalAmount(invoiceData.finalAmount || '');
          setShowSendEmailButton(true);
          generatePDF(invoiceData);
        } else {
          console.error('Invoice not found!');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
      }
    }
  };

  useEffect(() => {
    console.log('User ID:', userId);
    console.log('Invoice ID:', invoiceId);
    fetchInvoice();
  }, [userId, invoiceId]);

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

  const generatePDF = async (invoiceData) => {
    try {
      if (!invoiceData) throw new Error('Invoice data is missing');
      const doc = new jsPDF();
      doc.addFileToVFS('FreeSerif.ttf', FreeSerifBase64);
      doc.addFont('FreeSerif.ttf', 'FreeSerif', 'normal');
      doc.setFont('FreeSerif');

      const margin = 20;
      const lineHeight = 10;
      const startX = margin;
      let currentY = margin;

      // Add the logo to the PDF
      const logoURL = '/logo.png';
      const img = new Image();
      img.src = logoURL;
      img.onload = () => {
        doc.addImage(img, 'PNG', 150, 10, 50, 20);

        doc.setFontSize(24);
        doc.setFont('FreeSerif', 'bold');
        doc.text('INVOICE', startX, currentY);

        currentY += lineHeight * 3;

        doc.setFontSize(14);
        doc.setFont('FreeSerif', 'bold');
        doc.text('Customer Information:', startX, currentY);

        currentY += lineHeight;
        doc.setFont('FreeSerif', 'normal');
        doc.text(`Name: ${invoiceData.clientName || 'N/A'}`, startX, currentY);
        currentY += lineHeight;
        doc.text(`Email: ${invoiceData.clientEmail || 'N/A'}`, startX, currentY);

        currentY += lineHeight * 2;
        doc.setFont('FreeSerif', 'bold');
        doc.text('Service Information:', startX, currentY);

        currentY += lineHeight;
        doc.setFont('FreeSerif', 'normal');
        doc.text(`Amount: ${formatAmount(invoiceData.amount || 0)} ${invoiceData.currency || 'N/A'}`, startX, currentY);

        if (invoiceData.discount > 0) {
          currentY += lineHeight;
          doc.text(`Discount: ${invoiceData.discount}%`, startX, currentY);

          currentY += lineHeight;
          doc.text(`Discounted Amount: ${formatAmount(invoiceData.finalAmount || 0)} ${invoiceData.currency || 'N/A'}`, startX, currentY);
        }

        currentY += lineHeight * 2;
        doc.setFont('FreeSerif', 'bold');
        doc.text(`Total Amount: ${formatAmount(invoiceData.finalAmount || 0)} ${invoiceData.currency || 'N/A'}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Invoice Number: ${invoiceData.invoiceNumber || 'N/A'}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Issue Date: ${invoiceData.issueDate || 'N/A'}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Due Date: ${invoiceData.dueDate || 'N/A'}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Tax Information: ${invoiceData.taxInfo || 'N/A'}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Notes: ${invoiceData.notes || 'N/A'}`, startX, currentY);

        currentY += lineHeight * 2;
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('This is a digital invoice. No wet signature required.', startX, currentY);

        doc.save(`invoice-${invoiceData.invoiceNumber || 'unknown'}.pdf`);
        console.log('PDF generated successfully.');
      };
      img.onerror = () => {
        console.error('Failed to load logo image.');
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const sendInvoiceEmail = async () => {
    if (!pdfBytes) {
      setModalMessage('PDF generation failed. Please try again.');
      setModalOpen(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail,
          subject: `Invoice ${invoiceNumber}`,
          text: `Dear ${clientName},\n\nPlease find attached your invoice.\n\nBest regards,\nYour Company`,
          invoiceData: {
            invoiceNumber,
            clientName,
            clientEmail,
            serviceDescription,
            taxInfo,
            issueDate,
            dueDate,
            finalAmount: parseFloat(finalAmount), // Ensure finalAmount is a number
            currency,
            discount,
            notes,
            pdfBytes: pdfBytes ? btoa(String.fromCharCode(...new Uint8Array(pdfBytes))) : '', // Send PDF bytes as base64 string
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to send email');
      }

      setModalMessage('Email sent successfully!');
      setModalOpen(true);
    } catch (error) {
      console.error('Error sending email:', error);
      setModalMessage('An error occurred while sending the email.');
      setModalOpen(true);
    }
  };

  const formatAmount = (value) => {
    if (!value && value !== 0) return '';
    // If value is a number, convert to string
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
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Customer Email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Service Description"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Invoice Number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
                <input
                  type="date"
                  placeholder="Issue Date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
                <input
                  type="date"
                  placeholder="Due Date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Tax Information"
                  value={taxInfo}
                  onChange={(e) => setTaxInfo(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Discount (%)"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                  <button className="pdf-button" onClick={() => generatePDF(invoice)}>Download as PDF</button>
                  {showSendEmailButton && (
                    <button className="pdf-button" onClick={sendInvoiceEmail}>Send Email</button>
                  )}
                </div>
                <InvoicePreview invoice={invoice} />
              </div>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Notification"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {modalMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Invoice"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this invoice?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteInvoice} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceDetails;