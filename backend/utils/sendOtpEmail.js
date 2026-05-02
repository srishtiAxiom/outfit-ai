const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendOtpEmail = async (toEmail, otp) => {
  try {
    const email = new SibApiV3Sdk.SendSmtpEmail();
    email.sender = { name: "OutfitAI", email: process.env.BREVO_SENDER_EMAIL };
    email.to = [{ email: toEmail }];
    email.subject = "Your OutfitAI verification code";
    email.htmlContent = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="margin-bottom: 8px;">OutfitAI</h2>
        <p style="color: #555;">Your verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 24px 0; color: #111;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `;

    const result = await transactionalApi.sendTransacEmail(email);
    console.log("[sendOtpEmail] ✅ Sent to:", toEmail, "| messageId:", result.messageId);
  } catch (err) {
    console.error("[sendOtpEmail] ❌ Failed:", err.message);
    throw err;
  }
};

module.exports = sendOtpEmail;