require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const { getInvoiceEmailHtml } = require('./templates/emailTemplate');
const { getWelcomeEmailHtml } = require('./templates/welcomeEmailTemplate');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

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

    // Generate HTML email body
    const emailHtml = getInvoiceEmailHtml({
      invoiceNumber: invoiceData.invoiceNumber,
      finalAmount: finalAmount,
      amount: invoiceData.amount, // Original amount
      clientName: invoiceData.clientName || 'Müşterimiz',
      currency: invoiceData.currency || '₺',
      issueDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate,
      taxInfo: invoiceData.taxInfo,
      discount: invoiceData.discount,
      notes: invoiceData.notes,
      serviceDescription: invoiceData.serviceDescription
    });

    let mailOptions = {
      from: process.env.EMAIL,
      to: clientEmail,
      subject: subject || "Fatura Bilgisi",
      text: text || "Faturanız ektedir.",
      html: emailHtml, // Add HTML content
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

app.post('/send-welcome-email', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }

  try {
    // Create email transporter
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      }
    });

    // Generate welcome email HTML
    const emailHtml = getWelcomeEmailHtml({
      name: name,
      email: email
    });

    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Welcome to Invoicy! 🎉",
      html: emailHtml
    };

    console.log('Sending welcome email to:', email);
    let info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent: " + info.response);

    res.json({ success: true, message: "Welcome email sent successfully" });

  } catch (error) {
    console.error("Welcome email error:", error.message);
    res.status(500).json({ error: "Failed to send welcome email", details: error.message });
  }
});

app.post('/preview-email', (req, res) => {
  try {
    const { invoiceData } = req.body;
    
    if (!invoiceData) {
      return res.status(400).json({ error: "Invoice data is required" });
    }

    const html = getInvoiceEmailHtml({
      invoiceNumber: invoiceData.invoiceNumber,
      finalAmount: invoiceData.finalAmount,
      amount: invoiceData.amount,
      clientName: invoiceData.clientName || 'Müşterimiz',
      currency: invoiceData.currency || '₺',
      issueDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate,
      taxInfo: invoiceData.taxInfo,
      discount: invoiceData.discount,
      notes: invoiceData.notes,
      serviceDescription: invoiceData.serviceDescription
    });

    res.json({ html });
  } catch (error) {
    console.error("Preview error:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor...`));