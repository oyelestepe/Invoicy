import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import './css/invoiceCreation.css';
import { PDFDocument } from 'pdf-lib';

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
  const [logoFile, setLogoFile] = useState(null); // Updated to handle file upload
  const [userId, setUserId] = useState(null);
  const [finalAmount, setFinalAmount] = useState(''); // İndirimli toplam tutar
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

  // İndirimli Toplam Tutarı Hesapla
  useEffect(() => {
    const discountValue = discount ? parseFloat(discount) : 0;
    const discountedAmount = amount ? amount - (amount * (discountValue / 100)) : amount;
    setFinalAmount(discountedAmount ? discountedAmount.toFixed(2) : ''); // 2 ondalıklı göster
  }, [amount, discount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // İndirimli toplam tutarı hesapla
    const discountValue = discount ? parseFloat(discount) : 0;
    const finalAmountCalculated = amount ? amount - (amount * (discountValue / 100)) : amount;

    try {
      // Firebase'e fatura kaydetme
      await addDoc(collection(db, 'customers', userId, 'invoices'), {
        clientName,
        clientEmail,
        serviceDescription,
        amount: parseFloat(amount) || 0, // Kullanıcının girdiği tutar
        currency,
        invoiceNumber,
        paymentDate,
        taxInfo,
        discount: discountValue,
        notes,
        createdAt: serverTimestamp(),
        finalAmount: finalAmountCalculated ? finalAmountCalculated.toFixed(2) : '', // İndirimli tutar burada kaydediliyor
      });

      // PDF oluşturulması
      createInvoicePDF({ clientName, clientEmail, serviceDescription, amount, discount: discountValue, currency, finalAmountCalculated, invoiceNumber, paymentDate, taxInfo, notes, logoFile });

      alert('Fatura başarıyla kaydedildi!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Fatura eklenirken hata:', error);
      alert('Fatura eklenirken bir hata oluştu.');
    }
  };

  const createInvoicePDF = async (invoiceData) => {
    const { clientName, clientEmail, serviceDescription, amount, discount, currency, finalAmountCalculated, invoiceNumber, paymentDate, taxInfo, notes, logoFile } = invoiceData;

    // PDF oluşturuluyor
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // Font yükleme
    const font = await pdfDoc.embedFont(PDFDocument.Font.Helvetica);

    // Metin ekleme
    page.drawText(`Fatura Numarası: ${invoiceNumber}`, { x: 50, y: 750, size: 12, font });
    page.drawText(`Müşteri Adı: ${clientName}`, { x: 50, y: 730, size: 12, font });
    page.drawText(`E-posta: ${clientEmail}`, { x: 50, y: 710, size: 12, font });
    page.drawText(`Hizmet: ${serviceDescription}`, { x: 50, y: 690, size: 12, font });
    page.drawText(`Vergi Bilgisi: ${taxInfo}`, { x: 50, y: 670, size: 12, font });
    page.drawText(`Ödeme Tarihi: ${paymentDate}`, { x: 50, y: 650, size: 12, font });
    page.drawText(`Toplam Tutar: ${finalAmountCalculated.toFixed(2)} ${currency}`, { x: 50, y: 630, size: 12, font });
    if (discount) {
      page.drawText(`İndirim: ${discount}%`, { x: 50, y: 610, size: 12, font });
    }
    page.drawText(`Notlar: ${notes}`, { x: 50, y: 590, size: 12, font });

    // Logo ekleme (eğer varsa)
    if (logoFile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const logoImageBytes = new Uint8Array(event.target.result);
        const logo = await pdfDoc.embedJpg(logoImageBytes);
        page.drawImage(logo, { x: 450, y: 750, width: 100, height: 50 });

        // PDF'yi blob olarak kaydetme
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${invoiceNumber}.pdf`;
        link.click();
      };
      reader.readAsArrayBuffer(logoFile);
    } else {
      // PDF'yi blob olarak kaydetme
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoiceNumber}.pdf`;
      link.click();
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
          <p>Toplam Tutar: {finalAmount} {currency}</p> {/* İndirimli toplam tutar burada gösteriliyor */}
          <textarea
            placeholder="Notlar ve Açıklamalar"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          <button type="submit">Fatura Oluştur</button>
        </form>
      </div>
    </>
  );
};

export default InvoiceCreation;