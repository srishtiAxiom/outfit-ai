const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (toEmail, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "OutfitAI <onboarding@resend.dev>", // use this until you verify a domain
      to: toEmail,
      subject: "Your OutfitAI verification code",
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
    });

    if (error) {
      console.error("[sendOtpEmail] ❌ Resend error:", error);
      throw new Error(error.message);
    }

    console.log("[sendOtpEmail] ✅ Sent to:", toEmail, "| id:", data.id);
  } catch (err) {
    console.error("[sendOtpEmail] ❌ Failed to send to:", toEmail);
    console.error("[sendOtpEmail] Error:", err.message);
    throw err;
  }
};

module.exports = sendOtpEmail;