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
    console.log('Starting PDF generation...');
    // Parse finalAmount as a number
    const finalAmount = parseFloat(invoiceData.finalAmount);
    if (isNaN(finalAmount)) {
      throw new Error('finalAmount must be a number');
    }

    // Decode base64 PDF bytes
    const pdfBytes = Uint8Array.from(atob(invoiceData.pdfBytes), c => c.charCodeAt(0));

    console.log('PDF generated successfully.');

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
          content: pdfBytes,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log('Sending email...');
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