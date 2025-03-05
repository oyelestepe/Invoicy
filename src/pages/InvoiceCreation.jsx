import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import './css/invoiceCreation.css';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const InvoiceCreation = () => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(''); // Allow user to choose any currency
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [taxInfo, setTaxInfo] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [logoFile, setLogoFile] = useState(null); // Updated to handle file upload
  const [userId, setUserId] = useState(null);
  const [finalAmount, setFinalAmount] = useState(''); // Discounted total amount
  const [showSendEmailButton, setShowSendEmailButton] = useState(false); // State to manage the visibility of the "Send Email" button
  const [pdfBytes, setPdfBytes] = useState(null); // State to store the PDF bytes
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate discounted total amount
    const discountValue = discount ? parseFloat(discount) : 0;
    const finalAmountCalculated = amount ? amount - (amount * (discountValue / 100)) : amount;

    try {
      // Save invoice to Firebase
      await addDoc(collection(db, 'customers', userId, 'invoices'), {
        clientName,
        clientEmail,
        serviceDescription,
        amount: parseFloat(amount) || 0, // User entered amount
        currency,
        invoiceNumber,
        paymentDate,
        taxInfo,
        discount: discountValue,
        notes,
        createdAt: serverTimestamp(),
        finalAmount: finalAmountCalculated ? finalAmountCalculated.toFixed(2) : '', // Discounted amount saved here
      });

      // Create PDF
      const pdfBytes = await createInvoicePDF({ clientName, clientEmail, serviceDescription, amount, discount: discountValue, currency, finalAmountCalculated, invoiceNumber, paymentDate, taxInfo, notes, logoFile });
      setPdfBytes(pdfBytes);

      alert('Invoice successfully saved!');
      setShowSendEmailButton(true); // Show the "Send Email" button
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert('An error occurred while adding the invoice.');
    }
  };

  const createInvoicePDF = async (invoiceData) => {
    const { clientName, clientEmail, serviceDescription, amount, discount, currency, finalAmountCalculated, invoiceNumber, paymentDate, taxInfo, notes, logoFile } = invoiceData;
  
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
    const page = pdfDoc.addPage([600, 800]);
  
    // Add text
    page.drawText(`Invoice Number: ${invoiceNumber}`, { x: 50, y: 750, size: 12, font });
    page.drawText(`Client Name: ${clientName}`, { x: 50, y: 730, size: 12, font });
    page.drawText(`Email: ${clientEmail}`, { x: 50, y: 710, size: 12, font });
    page.drawText(`Service: ${serviceDescription}`, { x: 50, y: 690, size: 12, font });
    page.drawText(`Tax Info: ${taxInfo}`, { x: 50, y: 670, size: 12, font });
    page.drawText(`Payment Date: ${paymentDate}`, { x: 50, y: 650, size: 12, font });
    page.drawText(`Total Amount: ${finalAmountCalculated.toFixed(2)} ${currency}`, { x: 50, y: 630, size: 12, font });
    if (discount) {
      page.drawText(`Discount: ${discount}%`, { x: 50, y: 610, size: 12, font });
    }
    page.drawText(`Notes: ${notes}`, { x: 50, y: 590, size: 12, font });
  
    // Add logo (if any)
    if (logoFile) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
          try {
            const logoImageBytes = new Uint8Array(event.target.result);
            const logo = await pdfDoc.embedJpg(logoImageBytes);
            page.drawImage(logo, { x: 450, y: 750, width: 100, height: 50 });
  
            // Save PDF as bytes
            const pdfBytes = await pdfDoc.save();
            resolve(pdfBytes);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(logoFile);
      });
    } else {
      // Save PDF as bytes
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    }
  };

  const sendInvoiceEmail = async () => {
    if (!pdfBytes) {
      alert('PDF generation failed. Please try again.');
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
            paymentDate,
            finalAmount: parseFloat(finalAmount), // Ensure finalAmount is a number
            currency,
            discount,
            notes,
            logoFile: null, // Set logoFile to null if not defined
            pdfBytes: pdfBytes.toString('base64'), // Send PDF bytes as base64 string
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
  
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('An error occurred while sending the email.');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  return (
    <>
      <Navbar />
      <div className="invoice-creation-container">
        <h2>Create Invoice</h2>
        <form className="invoice-creation-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Client Email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Service Description"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            required
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
            placeholder="Payment Date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Tax Info"
            value={taxInfo}
            onChange={(e) => setTaxInfo(e.target.value)}
          />
          <input
            type="number"
            placeholder="Discount (%)"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
          <p>Total Amount: {finalAmount} {currency}</p> {/* Discounted total amount shown here */}
          <textarea
            placeholder="Notes and Explanations"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          <button type="submit">Create Invoice</button>
        </form>
        {showSendEmailButton && (
          <button onClick={sendInvoiceEmail}>Send Email</button>
        )}
      </div>
    </>
  );
};

export default InvoiceCreation;