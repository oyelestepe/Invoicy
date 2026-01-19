const getWelcomeEmailHtml = (data) => {
  const { name, email } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Invoicy</title>
</head>

<body style="margin:0; padding:0; background-color:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial, Helvetica, sans-serif;">
<tr>
<td align="center" style="padding:40px 20px;">

<!-- CONTAINER -->
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;">

  <!-- TOP BAR -->
  <tr>
    <td style="height:6px; background-color:#2563EB;"></td>
  </tr>

  <!-- HEADER -->
  <tr>
    <td align="center" style="padding:40px 40px 30px;">
      <h1 style="margin:0 0 10px; font-size:30px; color:#0F172A;">
        Welcome to Invoicy
      </h1>
      <p style="margin:0; font-size:16px; color:#475569;">
        Simple, professional invoicing for modern businesses
      </p>
    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td style="padding:0 40px 30px; color:#334155; font-size:15px; line-height:1.6;">
      <p style="margin:0 0 16px;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="margin:0 0 16px;">
        Thanks for joining <strong>Invoicy</strong> 👋  
        You now have everything you need to create, send, and manage invoices — all in one place.
      </p>

      <p style="margin:0;">
        Here’s what you can do right away:
      </p>
    </td>
  </tr>

  <!-- FEATURES -->
  <tr>
    <td style="padding:0 40px 30px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8FAFC; border-left:4px solid #2563EB;">
        <tr>
          <td style="padding:20px;">
            <ul style="margin:0; padding-left:18px; font-size:14px; line-height:1.8; color:#334155;">
              <li>Create professional invoices in minutes</li>
              <li>Send invoices directly to clients</li>
              <li>Track payments and invoice status</li>
              <li>Customize invoices with your brand</li>
              <li>Download instant PDF invoices</li>
            </ul>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td align="center" style="padding:10px 40px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background-color:#2563EB;">
            <a href="http://localhost:5173/"
               style="display:block; padding:16px 42px;
               font-size:16px; font-weight:bold;
               color:#ffffff; text-decoration:none;">
              Create Your First Invoice
            </a>
          </td>
        </tr>
      </table>
      <p style="margin-top:12px; font-size:13px; color:#64748B;">
        It only takes a minute to get started.
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background-color:#F8FAFC; padding:25px 40px; text-align:center; border-top:1px solid #E5E7EB;">
      <p style="margin:0 0 6px; font-size:12px; color:#64748B;">
        This email was sent to ${email}
      </p>
      <p style="margin:0; font-size:12px; color:#64748B;">
        © 2026 Invoicy. All rights reserved.
      </p>
    </td>
  </tr>

</table>
<!-- /CONTAINER -->

</td>
</tr>
</table>
</body>
</html>
`;
};

module.exports = { getWelcomeEmailHtml };
