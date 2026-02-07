import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sanitize = (str) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message, _gotcha } = req.body;

    if (_gotcha) {
      return res.status(200).json({ success: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const safeName = sanitize(name);
    const safeEmail = sanitize(email);
    const safeMessage = sanitize(message);

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "mhdfayas464@gmail.com",
      reply_to: safeEmail,
      subject: `New Inquiry from ${safeName}`,
      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2>New Contact Message</h2>
          <p><b>Name:</b> ${safeName}</p>
          <p><b>Email:</b> ${safeEmail}</p>
          <p><b>Message:</b></p>
          <p>${safeMessage}</p>
        </div>
      `,
    });

    if (data.error) {
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("CONTACT ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}