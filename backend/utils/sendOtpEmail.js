const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Gmail App Password, NOT your real password
  }
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"OutfitAI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your OutfitAI Verification Code',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 24px;
                  border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #7c3aed;">OutfitAI 👗</h2>
        <p>Your email verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                    color: #7c3aed; margin: 16px 0;">${otp}</div>
        <p style="color: #6b7280; font-size: 14px;">
          This code expires in <strong>5 minutes</strong>.<br/>
          If you didn't request this, ignore this email.
        </p>
      </div>
    `
  });
};

module.exports = sendOtpEmail;