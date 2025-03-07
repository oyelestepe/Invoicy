import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import './css/invoiceCreation.css';
import { jsPDF } from 'jspdf';

const InvoiceCreation = () => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TL'); // Varsayılan olarak TL
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [taxInfo, setTaxInfo] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [logoURL, setLogoURL] = useState('');
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
      const docRef = await addDoc(collection(db, 'customers', userId, 'invoices'), {
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
      const pdfBytes = await createInvoicePDF({ clientName, clientEmail, serviceDescription, amount, discount: discountValue, currency, finalAmountCalculated, invoiceNumber, paymentDate, taxInfo, notes, logoURL });
      setPdfBytes(pdfBytes);

      alert('Invoice successfully saved!');
      setShowSendEmailButton(true); // Show the "Send Email" button

      // Redirect to invoice details page
      navigate(`/invoice/${docRef.id}`);
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert('An error occurred while adding the invoice.');
    }
  };

  const createInvoicePDF = async (invoiceData) => {
    const { clientName, clientEmail, serviceDescription, amount, discount, currency, finalAmountCalculated, invoiceNumber, paymentDate, taxInfo, notes, logoURL } = invoiceData;

    try {
      const doc = new jsPDF();
      const margin = 20;
      const lineHeight = 10;
      const startX = margin;
      let currentY = margin;

      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FATURA', startX, currentY);

      currentY += lineHeight * 3;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Müşteri Bilgileri:', startX, currentY);

      currentY += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(`Adı: ${clientName}`, startX, currentY);
      currentY += lineHeight;
      doc.text(`E-mail: ${clientEmail}`, startX, currentY);

      currentY += lineHeight * 2;
      doc.setFont('helvetica', 'bold');
      doc.text('Hizmet Bilgileri:', startX, currentY);

      currentY += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(`Açıklama: ${serviceDescription}`, startX, currentY);

      currentY += lineHeight;
      doc.text(`Tutar: ${amount} ${currency}`, startX, currentY);

      currentY += lineHeight;
      doc.text(`Fatura Numarası: ${invoiceNumber}`, startX, currentY);

      currentY += lineHeight;
      doc.text(`Ödeme Tarihi: ${paymentDate}`, startX, currentY);

      currentY += lineHeight;
      doc.text(`Vergi Bilgileri: ${taxInfo}`, startX, currentY);

      currentY += lineHeight;
      doc.text(`İndirim: ${discount}%`, startX, currentY);

      currentY += lineHeight;
      doc.text(`İndirimli Tutar: ${finalAmountCalculated} ${currency}`, startX, currentY);

      currentY += lineHeight;
      doc.text(`Notlar: ${notes}`, startX, currentY);

      if (logoURL) {
        currentY += lineHeight;
        doc.text(`Logo URL: ${logoURL}`, startX, currentY);
      }

      currentY += lineHeight;
      doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleString()}`, startX, currentY);

      currentY += lineHeight * 2;
      doc.setFont('helvetica', 'bold');
      doc.text(`Toplam Tutar: ${finalAmountCalculated} ${currency}`, startX, currentY);

      currentY += lineHeight * 2;
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('Bu bir dijital faturadır. Islak imza gerekmez.', startX, currentY);

      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(margin, margin, 210 - margin, margin);
      doc.line(margin, currentY + 5, 210 - margin, currentY + 5);

      const pdfBytes = doc.output('arraybuffer');
      setPdfBytes(pdfBytes);

      console.log('PDF generated successfully on client side.');
      return pdfBytes;
    } catch (error) {
      console.error('Error generating PDF on client side:', error);
      alert('PDF generation failed. Please try again.');
      return null;
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

      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('An error occurred while sending the email.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="invoice-creation-container">
        <h2>Fatura Oluştur</h2>
        <form className="invoice-creation-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Müşteri İsmi"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Müşteri E-posta"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Hizmet Açıklaması"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Tutar"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
            <option value="TL">TL</option>
            <option value="USD">USD</option>
            <option value="Euro">Euro</option>
          </select>
          <input
            type="text"
            placeholder="Fatura Numarası"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Ödeme Tarihi"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Vergi Bilgileri"
            value={taxInfo}
            onChange={(e) => setTaxInfo(e.target.value)}
          />
          <input
            type="number"
            placeholder="İndirim (%)"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
          <p>Total Amount: {finalAmount} {currency}</p> {/* Discounted total amount shown here */}
          <textarea
            placeholder="Notlar ve Açıklamalar"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <input
            type="text"
            placeholder="Logo URL"
            value={logoURL}
            onChange={(e) => setLogoURL(e.target.value)}
          />
          <button type="submit">Fatura Oluştur</button>
        </form>
        {showSendEmailButton && (
          <button onClick={sendInvoiceEmail}>Send Email</button>
        )}
      </div>
    </>
  );
};

export default InvoiceCreation;