require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/send-invoice', async (req, res) => {
  const { clientEmail, subject, text, invoiceData } = req.body;

  if (!clientEmail) {
    return res.status(400).json({ error: "Müşteri e-posta adresi gereklidir" });
  }

  try {
    // Parse finalAmount as a number
    const finalAmount = parseFloat(invoiceData.finalAmount);
    if (isNaN(finalAmount)) {
      throw new Error('finalAmount must be a number');
    }

    // Load a font that supports Turkish characters
    const fontBytes = fs.readFileSync(path.join(__dirname, 'fonts', 'FreeSerif.ttf'));

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage([600, 800]);

    page.drawText(`Fatura Numarası: ${invoiceData.invoiceNumber}`, { x: 50, y: 750, size: 12, font });
    page.drawText(`Müşteri Adı: ${invoiceData.clientName}`, { x: 50, y: 730, size: 12, font });
    page.drawText(`E-posta: ${invoiceData.clientEmail}`, { x: 50, y: 710, size: 12, font });
    page.drawText(`Hizmet: ${invoiceData.serviceDescription}`, { x: 50, y: 690, size: 12, font });
    page.drawText(`Vergi Bilgisi: ${invoiceData.taxInfo}`, { x: 50, y: 670, size: 12, font });
    page.drawText(`Ödeme Tarihi: ${invoiceData.paymentDate}`, { x: 50, y: 650, size: 12, font });
    page.drawText(`Toplam Tutar: ${finalAmount.toFixed(2)} ${invoiceData.currency}`, { x: 50, y: 630, size: 12, font });
    if (invoiceData.discount) {
      page.drawText(`İndirim: ${invoiceData.discount}%`, { x: 50, y: 610, size: 12, font });
    }
    page.drawText(`Notlar: ${invoiceData.notes}`, { x: 50, y: 590, size: 12, font });

    if (invoiceData.logoFile) {
      const logoImageBytes = new Uint8Array(invoiceData.logoFile);
      const logo = await pdfDoc.embedJpg(logoImageBytes);
      page.drawImage(logo, { x: 450, y: 750, width: 100, height: 50 });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // Send email with PDF attachment
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      }
    });

    let mailOptions = {
      from: process.env.EMAIL,
      to: clientEmail,
      subject: subject || "Fatura Bilgisi",
      text: text || "Faturanız ektedir.",
      attachments: [
        {
          filename: `invoice_${invoiceData.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("E-posta gönderildi: " + info.response);

    res.json({ success: true, message: "E-posta başarıyla gönderildi" });

  } catch (error) {
    console.error("E-posta gönderme hatası:", error.message);
    console.error(error.stack); // Add this line to log the stack trace
    res.status(500).json({ error: "E-posta gönderme başarısız", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor...`));