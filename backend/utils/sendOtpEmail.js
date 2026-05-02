const nodemailer = require("nodemailer");

// ✅ Startup check — will print to Render logs immediately on boot
console.log("[sendOtpEmail] GMAIL_USER:", process.env.GMAIL_USER || "❌ MISSING");
console.log("[sendOtpEmail] GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD ? "✅ set" : "❌ MISSING");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"OutfitAI" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your OutfitAI verification code",
    text: `Your OTP is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="margin-bottom: 8px;">OutfitAI</h2>
        <p style="color: #555;">Your verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 24px 0; color: #111;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[sendOtpEmail] ✅ Sent to:", toEmail, "| messageId:", info.messageId);
  } catch (err) {
    console.error("[sendOtpEmail] ❌ Failed to send to:", toEmail);
    console.error("[sendOtpEmail] Error:", err.message);
    throw err; // re-throw so the route returns a 500 instead of silently succeeding
  }
};

module.exports = sendOtpEmail;