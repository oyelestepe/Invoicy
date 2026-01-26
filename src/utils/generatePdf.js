import PDFDocument from "pdfkit/js/pdfkit.standalone";
import blobStream from "blob-stream";

// Polyfill for the global object in the browser
if (typeof window !== "undefined") {
  window.global = window;
}

const generatePdf = (invoice) => {
  return new Promise((resolve, reject) => {
    // Yeni bir PDF belgesi oluştur
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // PDF'i blob-stream ile işle
    const stream = doc.pipe(blobStream());

    // Logo ekle
    doc.image("/logo.png", 50, 45, { width: 50 });

    // Başlık
    doc.fontSize(25).text("Fatura", { align: "center" });
    doc.moveDown();

    // Müşteri Bilgileri
    doc.fontSize(14).text("Müşteri Bilgileri:", { underline: true });
    doc.text(`Adı: ${invoice.customerInfo.name}`);
    doc.text(`E-posta: ${invoice.customerInfo.email}`);
    doc.text(`Adres: ${invoice.customerInfo.address}`);
    doc.moveDown();

    // Hizmet Detayları
    doc.fontSize(14).text("Hizmet Detayları:", { underline: true });
    invoice.services.forEach((service, index) => {
      doc.text(
        `${index + 1}. ${service.description} - ${service.quantity} x ${
          service.price
        } TL = ${service.quantity * service.price} TL`
      );
    });
    doc.moveDown();

    // Toplam Tutar
    doc.fontSize(16).text(`Toplam Tutar: ${invoice.totalAmount} TL`, {
      align: "right",
    });

    // PDF'i bitir
    doc.end();

    // PDF'i blob olarak döndür
    stream.on("finish", () => {
      const blob = stream.toBlob("application/pdf");
      resolve(blob);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
};

export default generatePdf;