import nodemailer from "nodemailer";
import env_config from "../core/env_config";

// Use env_config or process.env for mail credentials
const transporter = nodemailer.createTransport({
    host: env_config.MAILER_HOST,
    port: env_config.MAILER_PORT,
    secure: env_config.MAILER_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env_config.MAILER_USERNAME,
        pass: env_config.MAILER_PASSWORD,
    },
});

// Utility to inject variables in HTML template
function fillTemplate(html: string, variables: Record<string, string>) {
    let output = html;
    Object.entries(variables).forEach(([key, value]) => {
        output = output.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    return output;
}

const verificationEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Your Account</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0; }
    .container { max-width: 480px; background: #fff; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.07);}
    .header { background: #1976d2; color: #fff; padding: 24px; text-align: center; }
    .content { padding: 32px; text-align: center; }
    .btn { display: inline-block; background: #1976d2; color: #fff; padding: 14px 32px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 18px;}
    .footer { font-size: 12px; color: #888; text-align: center; padding: 16px;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Verify your account</h2>
    </div>
    <div class="content">
      <p>Hi, "{{USER_EMAIL}}"</p>
      <p>Thank you for registering! Please confirm your email address to complete your registration:</p>
      <a href="{{VERIFICATION_URL}}" class="btn">Verify Email</a>
      <p style="margin-top:32px;font-size:14px;color:#999;">If you did not request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; {{YEAR}} My Tax Consultants Team. All rights reserved.
    </div>
  </div>
</body>
</html>
`

const passwordRecoveryEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0; }
    .container { max-width: 480px; background: #fff; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.07);}
    .header { background: #1976d2; color: #fff; padding: 24px; text-align: center; }
    .content { padding: 32px; text-align: center; }
    .btn { display: inline-block; background: #1976d2; color: #fff; padding: 14px 32px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 18px;}
    .footer { font-size: 12px; color: #888; text-align: center; padding: 16px;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Password Reset</h2>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>You requested to reset your password. Click the button below to set a new password:</p>
      <a href="{{RESET_URL}}" class="btn">Reset Password</a>
      <p style="margin-top:32px;font-size:14px;color:#999;">If you did not request a password reset, you can ignore this email.</p>
    </div>
    <div class="footer">
      &copy; {{YEAR}} My Tax Consultants Team. All rights reserved.
    </div>
  </div>
</body>
</html>
`

const unlockAccountEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0; }
    .container { max-width: 480px; background: #fff; margin: 30px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.07);}
    .header { background: #1976d2; color: #fff; padding: 24px; text-align: center; }
    .content { padding: 32px; text-align: center; }
    .btn { display: inline-block; background: #1976d2; color: #fff; padding: 14px 32px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 18px;}
    .footer { font-size: 12px; color: #888; text-align: center; padding: 16px;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Unlock Account</h2>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>You requested to unlock your account. Click the button below to enable your account again:</p>
      <a href="{{UNLOCK_URL}}" class="btn">Unlock Account</a>
      <p style="margin-top:32px;font-size:14px;color:#999;">If you did not request an activation of your account, you can ignore this email.</p>
    </div>
    <div class="footer">
      &copy; {{YEAR}} My Tax Consultants Team. All rights reserved.
    </div>
  </div>
</body>
</html>
`

// -------------- SENDING FUNCTIONS --------------

async function sendVerificationEmail(to: string, verificationUrl: string) {
    const html = fillTemplate(verificationEmailHtml, {
        VERIFICATION_URL: verificationUrl,
        YEAR: new Date().getFullYear().toString(),
        USER_EMAIL: to
    });
    return transporter.sendMail({
        from: `"Support" <${env_config.MAILER_USERNAME}>`,
        to,
        subject: "Verify your account",
        html,
    });
}

async function sendPasswordResetEmail(to: string, resetUrl: string) {
    const html = fillTemplate(passwordRecoveryEmailHtml, {
        RESET_URL: resetUrl,
        YEAR: new Date().getFullYear().toString(),
    });
    return transporter.sendMail({
        from: `"Support" <${env_config.MAILER_USERNAME}>`,
        to,
        subject: "Password Recovery Request",
        html,
    });
}

async function sendUnlockAccountEmail(to: string, unlockUrl: string) {
    const html = fillTemplate(unlockAccountEmailHtml, {
        UNLOCK_URL: unlockUrl,
        YEAR: new Date().getFullYear().toString(),
    });
    return transporter.sendMail({
        from: `"Support" <${env_config.MAILER_USERNAME}>`,
        to,
        subject: "Unlock Account Request",
        html,
    });
}

export default { transporter, sendUnlockAccountEmail, sendVerificationEmail, sendPasswordResetEmail };