# EDIVIC Email Templates

Since this application uses Supabase Auth, you need to update the email templates in your Supabase Dashboard.

## Instructions

1. Go to your **Supabase Dashboard**.
2. Navigate to **Authentication** > **Email Templates**.
3. Select **Confirm Your Email**.
4. Update the **Subject**, **Message (HTML)**, and **Message (Text)** with the content below.

---

## Subject Line

```text
Confirm your email for EDIVIC
```

---

## Message (HTML)

Copy and paste this code into the HTML body section:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm your email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #111111; border: 1px solid #333333; border-radius: 16px; overflow: hidden; max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid #222222;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">EDIVIC</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #FFD700;">Welcome to EDIVIC!</h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">
                Hi there,
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #cccccc;">
                Thank you for joining the elite network of video professionals. To activate your account and start hiring or editing, please verify your email address.
              </p>
              
              <!-- Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #FFD700; color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">Confirm Email</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #888888; border-top: 1px solid #222222; padding-top: 20px;">
                This link will expire in 24 hours. If you did not create an account with EDIVIC, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #0a0a0a;">
              <p style="margin: 0; font-size: 12px; color: #555555;">
                &copy; 2026 EDIVIC. All rights reserved.<br>
                Need help? Contact <a href="mailto:support@edivic.com" style="color: #FFD700; text-decoration: none;">support@edivic.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Message (Text)

Copy and paste this code into the Text body section:

```text
Welcome to EDIVIC!

Hi there,

Thank you for joining the elite network of video professionals. To activate your account and start hiring or editing, please verify your email address by clicking the link below:

{{ .ConfirmationURL }}

If you did not create an account with EDIVIC, you can safely ignore this email.

© 2026 EDIVIC. All rights reserved.
```
