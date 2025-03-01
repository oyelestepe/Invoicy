import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';

const InvoicePreview = ({ invoice }) => {
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const generatePdfPreview = async () => {
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
      doc.text(`Adı: ${invoice.clientName || ''}`, startX, currentY);
      currentY += lineHeight;
      doc.text(`E-mail: ${invoice.clientEmail || ''}`, startX, currentY);

      currentY += lineHeight * 2;
      doc.setFont('helvetica', 'bold');
      doc.text('Hizmet Bilgileri:', startX, currentY);

      currentY += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(`Açıklama: ${invoice.serviceDescription || ''}`, startX, currentY);

      currentY += lineHeight;
      doc.text(`Tutar: ${invoice.amount || ''} ${invoice.currency || ''}`, startX, currentY);

      if (invoice.discount) {
        currentY += lineHeight;
        doc.text(`İndirim: ${invoice.discount || ''}%`, startX, currentY);
      }

      currentY += lineHeight;
      doc.text(
        `Oluşturulma Tarihi: ${
          invoice.createdAt
            ? invoice.createdAt.toDate().toLocaleString()
            : ''
        }`,
        startX,
        currentY
      );

      currentY += lineHeight * 2;
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Toplam Tutar: ${invoice.finalAmount || ''} ${invoice.currency || ''}`,
        startX,
        currentY
      );

      currentY += lineHeight * 2;
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(
        'Bu bir dijital faturadır. Islak imza gerekmez.',
        startX,
        currentY
      );

      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(margin, margin, 210 - margin, margin);
      doc.line(margin, currentY + 5, 210 - margin, currentY + 5);

      // Logo ekleme (eğer varsa)
      if (invoice.logoFile) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const logoImageBytes = new Uint8Array(event.target.result);
          const logo = await doc.embedJpg(logoImageBytes);
          doc.addImage(logo, 'JPEG', 450, 750, 100, 50);

          const pdfBlob = doc.output('blob');
          const newPdfUrl = URL.createObjectURL(pdfBlob);

          setPdfUrl((prevUrl) => {
            if (prevUrl) {
              URL.revokeObjectURL(prevUrl);
            }
            return newPdfUrl;
          });
        };
        reader.readAsArrayBuffer(invoice.logoFile);
      } else {
        const pdfBlob = doc.output('blob');
        const newPdfUrl = URL.createObjectURL(pdfBlob);

        setPdfUrl((prevUrl) => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return newPdfUrl;
        });
      }
    };

    if (invoice) {
      generatePdfPreview();
    }
  }, [invoice]);

  return (
    <div className="invoice-preview">
      <h3>Fatura Önizlemesi</h3>
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Fatura Önizlemesi"
          width="100%"
          height="600px"
          style={{ border: 'none' }}
        ></iframe>
      ) : (
        <p>Önizleme yükleniyor...</p>
      )}
    </div>
  );
};

export default InvoicePreview;