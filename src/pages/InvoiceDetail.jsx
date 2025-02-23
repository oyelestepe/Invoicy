import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import PDFDocument from 'pdfkit/js/pdfkit.standalone';
import blobStream from 'blob-stream';

// Polyfill for the global object in the browser
if (typeof window !== "undefined") {
  window.global = window;
}


const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      const docRef = doc(db, 'invoices', invoiceId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setInvoice(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const generatePDF = () => {
    const doc = new PDFDocument();
    const stream = doc.pipe(blobStream());

    doc.font('Helvetica-Bold').fontSize(18).text('FATURA', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(14).text(`Müşteri İsmi: ${invoice.clientName}`);
    doc.text(`Müşteri E-posta: ${invoice.clientEmail}`);
    doc.text(`Hizmet Açıklaması: ${invoice.serviceDescription}`);
    doc.text(`Tutar: ${invoice.amount} TL`);
    doc.moveDown();
    doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString()}`);


    stream.on('finish', () => {
      const url = stream.toBlobURL('application/pdf');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fatura.pdf';
      link.click();
    });

    doc.end();
  };

  return (
    <div>
      <h1>Fatura Detayı</h1>
      {invoice ? (
        <div>
          <p><strong>Müşteri İsmi:</strong> {invoice.clientName}</p>
          <p><strong>Müşteri E-posta:</strong> {invoice.clientEmail}</p>
          <p><strong>Hizmet:</strong> {invoice.serviceDescription}</p>
          <p><strong>Tutar:</strong> {invoice.amount} TL</p>
          <button onClick={generatePDF}>PDF İndir</button>
        </div>
      ) : (
        <p>Fatura yükleniyor...</p>
      )}
    </div>
  );
};

export default InvoiceDetail;