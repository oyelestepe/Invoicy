const getInvoiceEmailHtml = (data) => {
  const { invoiceNumber, finalAmount, amount, clientName, currency = '₺', issueDate, dueDate, taxInfo, discount, notes, serviceDescription } = data;

  const formatMoney = (val) => Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
  const formatDate = (date) => new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: Arial, sans-serif;">
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 0;">
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; width: 600px;">
          
          <tr style="background-color: #1e293b; background-image: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
            <td style="padding: 40px;">
              <table width="100%">
                <tr>
                  <td style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Ödenecek Tutar</td>
                  <td align="right" style="color: #ffffff; font-size: 20px; font-weight: bold;">INVOICY</td>
                </tr>
                <tr>
                  <td style="color: #ffffff; font-size: 36px; font-weight: bold; padding-top: 10px;">${formatMoney(finalAmount)}</td>
                  <td align="right" valign="bottom" style="color: #94a3b8; font-size: 14px;">#${invoiceNumber}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
             <td style="padding: 20px 40px;">
               <table width="100%">
                 <tr>
                    <td width="33%">
                      <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Müşteri</div>
                      <div style="font-size: 14px; color: #334155; font-weight: 600;">${clientName}</div>
                    </td>
                    <td width="33%" align="center">
                      <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Fatura Tarihi</div>
                      <div style="font-size: 14px; color: #334155; font-weight: 600;">${formatDate(issueDate)}</div>
                    </td>
                    <td width="33%" align="right">
                      <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Vade</div>
                      <div style="font-size: 14px; color: #334155; font-weight: 600;">${formatDate(dueDate)}</div>
                    </td>
                 </tr>
               </table>
             </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellspacing="0" cellpadding="0">
                 <tr>
                    <td style="padding-bottom: 10px; font-size: 12px; color: #94a3b8; border-bottom: 2px solid #f1f5f9;">AÇIKLAMA</td>
                    <td align="right" style="padding-bottom: 10px; font-size: 12px; color: #94a3b8; border-bottom: 2px solid #f1f5f9;">TUTAR</td>
                 </tr>
                 <tr>
                    <td style="padding: 20px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 15px;">${serviceDescription}</td>
                    <td align="right" style="padding: 20px 0; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 15px; font-weight: bold;">${formatMoney(amount)}</td>
                 </tr>
                 <tr>
                    <td style="padding-top: 20px;"></td>
                    <td style="padding-top: 20px;">
                       <table width="100%">
                          <tr>
                             <td style="color: #64748b; font-size: 14px;">Ara Toplam</td>
                             <td align="right" style="color: #334155; font-size: 14px;">${formatMoney(amount)}</td>
                          </tr>
                          ${taxInfo ? `
                          <tr>
                             <td style="color: #64748b; font-size: 14px; padding-top: 5px;">KDV</td>
                             <td align="right" style="color: #334155; font-size: 14px; padding-top: 5px;">${taxInfo}</td>
                          </tr>` : ''}
                          <tr>
                             <td style="color: #1e293b; font-size: 16px; font-weight: bold; padding-top: 10px; border-top: 1px solid #e2e8f0; margin-top: 10px;">Genel Toplam</td>
                             <td align="right" style="color: #1e293b; font-size: 16px; font-weight: bold; padding-top: 10px; border-top: 1px solid #e2e8f0; margin-top: 10px;">${formatMoney(finalAmount)}</td>
                          </tr>
                       </table>
                    </td>
                 </tr>
              </table>
              
              ${notes ? `
              <div style="margin-top: 30px; padding: 15px; background-color: #fff1f2; border-left: 4px solid #e11d48; color: #881337; font-size: 13px;">
                ${notes}
              </div>` : ''}

            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
               Bu e-posta otomatik olarak gönderilmiştir. &copy; 2026 Invoicy.
            </td>
          </tr>
        
        </table>
      </td>
    </tr>
  </table>

  `;
};

module.exports = { getInvoiceEmailHtml };