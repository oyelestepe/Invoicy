import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import InvoicePreview from '../components/InvoicePreview';
import './css/invoiceDetails.css'; // CSS dosyasını import et

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
  const [finalAmount, setFinalAmount] = useState('');

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
      const docRef = doc(db, 'customers', userId, 'invoices', invoiceId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const invoiceData = docSnap.data();
        setInvoice(invoiceData);
        setClientName(invoiceData.clientName || '');
        setClientEmail(invoiceData.clientEmail || '');
        setServiceDescription(invoiceData.serviceDescription || '');
        setAmount(invoiceData.amount || '');
        setCurrency(invoiceData.currency || 'TL');
        setInvoiceNumber(invoiceData.invoiceNumber || 'Bilinmiyor');
        setPaymentDate(invoiceData.paymentDate || '');
        setTaxInfo(invoiceData.taxInfo || 'Bilinmiyor');
        setDiscount(invoiceData.discount || '');
        setNotes(invoiceData.notes || '');
        setLogoURL(invoiceData.logoURL || 'https://example.com/default-logo.png');
        setFinalAmount(invoiceData.finalAmount || '');
      } else {
        console.log('Belge bulunamadı!');
      }
    }
  };

  useEffect(() => {
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
        paymentDate,
        taxInfo,
        discount: parseFloat(discount) || 0,
        notes,
        logoURL,
        finalAmount: finalAmountCalculated.toFixed(2),
      });
      alert('Fatura başarıyla güncellendi.');
      setIsEditing(false);
      await fetchInvoice();
    } catch (error) {
      console.error('Fatura güncellenirken hata:', error);
      alert('Fatura güncellenirken bir hata oluştu.');
    }
  };

  const deleteInvoice = async () => {
    const confirmDelete = window.confirm('Bu faturayı silmek istediğinizden emin misiniz?');
    if (confirmDelete) {
      try {
        const docRef = doc(db, 'customers', userId, 'invoices', invoiceId);
        await deleteDoc(docRef);
        alert('Fatura başarıyla silindi.');
        navigate('/dashboard');
      } catch (error) {
        console.error('Fatura silinirken hata:', error);
        alert('Fatura silinirken bir hata oluştu.');
      }
    }
  };

  const generatePDF = () => {
    if (!invoice) return;

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
    doc.text(`Adı: ${invoice.clientName}`, startX, currentY);
    currentY += lineHeight;
    doc.text(`E-mail: ${invoice.clientEmail}`, startX, currentY);

    currentY += lineHeight * 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Hizmet Bilgileri:', startX, currentY);

    currentY += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`Açıklama: ${invoice.serviceDescription}`, startX, currentY);

    currentY += lineHeight;
    doc.text(`Tutar: ${invoice.amount} ${invoice.currency}`, startX, currentY);

    currentY += lineHeight;
    doc.text(`Fatura Numarası: ${invoice.invoiceNumber}`, startX, currentY);

    currentY += lineHeight;
    doc.text(`Ödeme Tarihi: ${invoice.paymentDate}`, startX, currentY);

    currentY += lineHeight;
    doc.text(`Vergi Bilgileri: ${invoice.taxInfo}`, startX, currentY);

    currentY += lineHeight;
    doc.text(`İndirim: ${invoice.discount}%`, startX, currentY);

    currentY += lineHeight;
    doc.text(`İndirimli Tutar: ${invoice.finalAmount} ${invoice.currency}`, startX, currentY);

    currentY += lineHeight;
    doc.text(`Notlar: ${invoice.notes}`, startX, currentY);

    if (invoice.logoURL) {
      currentY += lineHeight;
      doc.text(`Logo URL: ${invoice.logoURL}`, startX, currentY);
    }

    currentY += lineHeight;
    doc.text(`Oluşturulma Tarihi: ${invoice.createdAt?.toDate().toLocaleString() || 'Tarih bulunamadı'}`, startX, currentY);

    currentY += lineHeight * 2;
    doc.setFont('helvetica', 'bold');
    doc.text(`Toplam Tutar: ${invoice.finalAmount} ${invoice.currency}`, startX, currentY);

    currentY += lineHeight * 2;
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Bu bir dijital faturadır. Islak imza gerekmez.', startX, currentY);

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, margin, 210 - margin, margin);
    doc.line(margin, currentY + 5, 210 - margin, currentY + 5);

    doc.save(`fatura-${invoiceId}.pdf`);
  };

  return (
    <>
      <Navbar />
      <div className="invoice-details-container">
        <h2>Fatura Detayları</h2>
        {invoice ? (
          <>
            {isEditing ? (
              <div>
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
                  required
                />
                <input
                  type="number"
                  placeholder="İndirim (%)"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Notlar ve Açıklamalar"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Logo URL"
                  value={logoURL}
                  onChange={(e) => setLogoURL(e.target.value)}
                  required
                />
                <div className="button-group">
                  <button className="edit-button" onClick={updateInvoice}>Kaydet</button>
                  <button className="cancel-button" onClick={() => setIsEditing(false)}>Vazgeç</button>
                </div>
              </div>
            ) : (
              <div>
                <p><strong>Müşteri Adı:</strong> {invoice.clientName}</p>
                <p><strong>Müşteri E-mail:</strong> {invoice.clientEmail}</p>
                <p><strong>Hizmet Açıklaması:</strong> {invoice.serviceDescription}</p>
                <p><strong>Tutar:</strong> {invoice.amount} {invoice.currency}</p>
                <p><strong>Fatura Numarası:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Ödeme Tarihi:</strong> {invoice.paymentDate}</p>
                <p><strong>Vergi Bilgileri:</strong> {invoice.taxInfo}</p>
                <p><strong>İndirim:</strong> {invoice.discount}%</p>
                <p><strong>İndirimli Tutar:</strong> {invoice.finalAmount} {invoice.currency}</p>
                <p><strong>Notlar:</strong> {invoice.notes}</p>
                {invoice.logoURL && <img src={invoice.logoURL} alt="Logo" className="invoice-logo" />}
                <p><strong>Oluşturulma Tarihi:</strong> {invoice.createdAt?.toDate().toLocaleString() || 'Tarih bulunamadı'}</p>
                <div className="button-group">
                  <button className="edit-button" onClick={() => setIsEditing(true)}>Düzenle</button>
                  <button className="delete-button" onClick={deleteInvoice}>Sil</button>
                  <button className="pdf-button" onClick={generatePDF}>PDF Olarak İndir</button>
                </div>
                <InvoicePreview invoice={invoice} />
              </div>
            )}
          </>
        ) : (
          <p>Yükleniyor...</p>
        )}
      </div>
    </>
  );
};

export default InvoiceDetails;