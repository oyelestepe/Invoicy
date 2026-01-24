import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import './css/invoiceCreation.css';
import { jsPDF } from 'jspdf';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const InvoiceCreation = () => {
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
  const [userId, setUserId] = useState(null);
  const [finalAmount, setFinalAmount] = useState(''); // Discounted total amount
  const [showSendEmailButton, setShowSendEmailButton] = useState(false); // State to manage the visibility of the "Send Email" button
  const [pdfBytes, setPdfBytes] = useState(null); // State to store the PDF bytes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
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

  // Calculate Discounted Total Amount
  useEffect(() => {
    const discountValue = discount ? parseFloat(discount) : 0;
    const discountedAmount = amount ? amount - (amount * (discountValue / 100)) : amount;
    setFinalAmount(discountedAmount ? discountedAmount.toFixed(2) : ''); // Show with 2 decimals
  }, [amount, discount]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\./g, ''); // Remove existing dots
    if (!isNaN(value)) { // Ensure the value is a valid number
      setAmount(value);
    } else {
      setAmount(''); // Clear the amount if the input is invalid
    }
  };

  const formatAmount = (value) => {
    if (!value) return ''; // Return an empty string if the value is empty
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Add dots every three digits
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure mandatory fields are filled
    if (!clientName || !clientEmail || !amount || !currency || !issueDate || !dueDate) {
      setModalMessage('Please fill in all mandatory fields.');
      setModalOpen(true);
      return;
    }

    // Calculate discounted total amount
    const discountValue = discount ? parseFloat(discount) : 0;
    const finalAmountCalculated = amount ? amount - (amount * (discountValue / 100)) : amount;

    try {
      // Save invoice to Firebase
      const docRef = await addDoc(collection(db, 'customers', userId, 'invoices'), {
        clientName,
        clientEmail,
        serviceDescription,
        amount: parseFloat(amount) || 0, // User entered amount
        currency,
        invoiceNumber,
        issueDate,
        dueDate,
        taxInfo,
        discount: discountValue,
        notes,
        createdAt: serverTimestamp(),
        finalAmount: finalAmountCalculated ? finalAmountCalculated.toFixed(2) : '', // Discounted amount saved here
      });

      // Create PDF
      const pdfBytes = await createInvoicePDF({
        clientName,
        clientEmail,
        serviceDescription,
        amount,
        discount: discountValue,
        currency,
        finalAmountCalculated,
        invoiceNumber,
        issueDate,
        dueDate,
        taxInfo,
        notes,
      });
      setPdfBytes(pdfBytes);

      setModalMessage('Invoice successfully saved!');
      setModalOpen(true);
      setShowSendEmailButton(true); // Show the "Send Email" button

      // Redirect to invoice details page
      navigate(`/invoice/${docRef.id}`);
    } catch (error) {
      console.error('Error adding invoice:', error);
      setModalMessage('An error occurred while adding the invoice.');
      setModalOpen(true);
    }
  };

  const createInvoicePDF = async (invoiceData) => {
    const {
      clientName,
      clientEmail,
      serviceDescription,
      amount,
      discount,
      currency,
      finalAmountCalculated,
      invoiceNumber,
      issueDate,
      dueDate,
      taxInfo,
      notes,
    } = invoiceData;

    try {
      const doc = new jsPDF();
      doc.addFileToVFS('FreeSerif.ttf', FreeSerifBase64);
      doc.addFont('FreeSerif.ttf', 'FreeSerif', 'normal', 'normal');
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
        doc.setFont('FreeSerif', 'normal');
        doc.text('Invoice', startX, currentY);

        currentY += lineHeight * 3;

        doc.setFontSize(14);
        doc.setFont('FreeSerif', 'normal');
        doc.text('Customer Information:', startX, currentY);

        currentY += lineHeight;
        doc.setFont('FreeSerif', 'normal');
        doc.text(`Name: ${clientName}`, startX, currentY);
        currentY += lineHeight;
        doc.text(`E-mail: ${clientEmail}`, startX, currentY);

        currentY += lineHeight * 2;
        doc.setFont('FreeSerif', 'normal');
        doc.text('Service Information:', startX, currentY);

        currentY += lineHeight;
        doc.setFont('FreeSerif', 'normal');
        doc.text(`Amount: ${formatAmount(amount)} ${currency}`, startX, currentY);

        if (discount) {
          currentY += lineHeight;
          doc.text(`Discount: ${discount}%`, startX, currentY);

          // Include discounted amount only if discount is provided
          currentY += lineHeight;
          doc.text(`Discounted Amount: ${formatAmount(finalAmountCalculated)} ${currency}`, startX, currentY);
        }

        currentY += lineHeight * 2;
        doc.setFont('FreeSerif', 'normal');
        doc.text(`Final Amount: ${formatAmount(finalAmountCalculated)} ${currency}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Issue Date: ${issueDate}`, startX, currentY);

        currentY += lineHeight;
        doc.text(`Due Date: ${dueDate}`, startX, currentY);

        if (serviceDescription) {
          currentY += lineHeight;
          doc.text(`Description: ${serviceDescription}`, startX, currentY);
        }

        if (invoiceNumber) {
          currentY += lineHeight;
          doc.text(`Invoice Number: ${invoiceNumber}`, startX, currentY);
        }

        if (taxInfo) {
          currentY += lineHeight;
          doc.text(`Tax Information: ${taxInfo}`, startX, currentY);
        }

        if (notes) {
          currentY += lineHeight;
          doc.text(`Notes: ${notes}`, startX, currentY);
        }

        currentY += lineHeight * 2;
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('This is a digital invoice. No wet signature required.', startX, currentY);

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(margin, margin, 210 - margin, margin);
        doc.line(margin, currentY + 5, 210 - margin, currentY + 5);

        const pdfBytes = doc.output('arraybuffer');
        setPdfBytes(pdfBytes);

        console.log('PDF generated successfully on client side.');
        return pdfBytes;
      };
    } catch (error) {
      console.error('Error generating PDF on client side:', error);
      setModalMessage('PDF generation failed. Please try again.');
      setModalOpen(true);
      return null;
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
            amount: parseFloat(amount) || 0,
            taxInfo,
            issueDate,
            dueDate,
            finalAmount: parseFloat(finalAmount),
            currency,
            discount,
            notes,
            logoFile: null,
            pdfBytes: pdfBytes ? btoa(String.fromCharCode(...new Uint8Array(pdfBytes))) : '',
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

  return (
    <>
      <Navbar />
      <div className="invoice-creation-container">
        <h2>Create Invoice</h2>
        <form className="invoice-creation-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              placeholder="Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Client E-mail</label>
            <input
              type="email"
              placeholder="Client E-mail"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Service Description</label>
            <input
              type="text"
              placeholder="Service Description"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
            />
          </div>

          <div className="row">
            <div className="column">
              <label>Amount</label>
              <input
                type="text"
                placeholder="Amount"
                value={formatAmount(amount)} // Format the amount with dots
                onChange={handleAmountChange} // Handle changes to the amount
                required
              />
            </div>
            <div className="column">
              <label>Currency</label>
              <input
                type="text"
                placeholder="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Invoice Number</label>
            <input
              type="text"
              placeholder="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>

          <div className="row">
            <div className="column">
              <label>Issue Date</label>
              <input
                type="date"
                placeholder="Issue Date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
            <div className="column">
              <label>Due Date</label>
              <input
                type="date"
                placeholder="Due Date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tax Information</label>
            <input
              type="text"
              placeholder="Tax Information"
              value={taxInfo}
              onChange={(e) => setTaxInfo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Discount (%)</label>
            <input
              type="number"
              placeholder="Discount (%)"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          <p>Total Amount: {formatAmount(finalAmount)} {currency}</p>

          <div className="form-group">
            <label>Notes and Explanations</label>
            <textarea
              placeholder="Notes and explanations"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit">Create Invoice</button>
        </form>

        {showSendEmailButton && (
          <button onClick={sendInvoiceEmail}>Send Email</button>
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
    </>
  );
};

export default InvoiceCreation;