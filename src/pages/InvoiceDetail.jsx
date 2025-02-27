import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import './css/invoiceDetails.css'; 

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      navigate('/login');
    }
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      if (userId && invoiceId) {
        const docRef = doc(db, 'customers', userId, 'invoices', invoiceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInvoice(docSnap.data());
        } else {
          console.log('No such document!');
        }
      }
    };
    fetchInvoice();
  }, [userId, invoiceId]);

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
  
    // PDF İçeriği
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
  
    // Kenarlıklar ve Çizgiler
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
        <div>
          <p><strong>Müşteri Adı:</strong> {invoice.clientName}</p>
          <p><strong>Müşteri E-mail:</strong> {invoice.clientEmail}</p>
          <p><strong>Hizmet Açıklaması:</strong> {invoice.serviceDescription}</p>
          <p><strong>Tutar:</strong> {invoice.amount} {invoice.currency}</p>
          <p><strong>Oluşturulma Tarihi:</strong> {invoice.createdAt?.toDate().toLocaleString()}</p>
          <div className="button-group">
            <button className="download-pdf-button" onClick={generatePDF}>PDF İndir</button>
            <button className="delete-invoice-button" onClick={deleteInvoice}>Faturayı Sil</button>
          </div>
        </div>
      ) : (
        <p>Yükleniyor...</p>
      )}
    </div>
  </>
  );
};

export default InvoiceDetails;
