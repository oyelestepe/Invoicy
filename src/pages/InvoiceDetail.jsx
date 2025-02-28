import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import InvoicePreview from '../components/InvoicePreview';
import './css/invoiceDetails.css'; 

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [amount, setAmount] = useState('');
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
        setInvoice(docSnap.data());
        setClientName(docSnap.data().clientName);
        setClientEmail(docSnap.data().clientEmail);
        setServiceDescription(docSnap.data().serviceDescription);
        setAmount(docSnap.data().amount);
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
      const docRef = doc(db, 'customers', userId, 'invoices', invoiceId);
      await updateDoc(docRef, {
        clientName,
        clientEmail,
        serviceDescription,
        amount: parseFloat(amount)
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
    doc.text(`Oluşturulma Tarihi: ${invoice.createdAt?.toDate().toLocaleString()}`, startX, currentY);

    currentY += lineHeight * 2;
    doc.setFont('helvetica', 'bold');
    doc.text(`Toplam Tutar: ${invoice.amount} ${invoice.currency}`, startX, currentY);

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
                />
                <input
                  type="email"
                  placeholder="Müşteri E-posta"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Hizmet Açıklaması"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Tutar"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button onClick={updateInvoice}>Kaydet</button>
                <button onClick={() => setIsEditing(false)}>Vazgeç</button>
              </div>
            ) : (
              <div>
                <p><strong>Müşteri Adı:</strong> {invoice.clientName}</p>
                <p><strong>Müşteri E-mail:</strong> {invoice.clientEmail}</p>
                <p><strong>Hizmet Açıklaması:</strong> {invoice.serviceDescription}</p>
                <p><strong>Tutar:</strong> {invoice.amount} {invoice.currency}</p>
                <p><strong>Oluşturulma Tarihi:</strong> {invoice.createdAt?.toDate().toLocaleString()}</p>
                <div className="button-group">
                  <button onClick={generatePDF}>PDF İndir</button>
                  <button onClick={deleteInvoice}>Faturayı Sil</button>
                  <button onClick={() => setIsEditing(true)}>Düzenle</button>
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
