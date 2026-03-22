import { Resend } from "resend";

const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://rdesigns.pro";

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Server email configuration is missing" });
  }

  // Extract form data
  const { name, email, service, message } = req.body;

  // Validation
  if (!name || !email || !service || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // Message length check (prevent abuse)
  if (message.length > 5000) {
    return res.status(400).json({ error: "Message too long" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email to business inbox
    const businessEmailResponse = await resend.emails.send({
      from: "noreply@rdesigns.pro", // Must be a verified domain in Resend
      to: "contact@rdesigns.pro", // Your business email
      subject: `New Website Inquiry: ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <p><strong>Service:</strong> ${escapeHtml(service)}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2563eb;">
            ${escapeHtml(message).replace(/\n/g, "<br />")}
          </blockquote>
          <hr />
          <p style="font-size: 12px; color: #666;">
            Received at: ${new Date().toISOString()}
          </p>
        </div>
      `,
      replyTo: email,
    });

    if (businessEmailResponse.error || !businessEmailResponse?.data?.id) {
      console.error("Error sending business email:", businessEmailResponse.error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    console.log("Business email queued", { id: businessEmailResponse.data.id });

    // Send auto-reply to customer
    try {
      await resend.emails.send({
        from: "noreply@rdesigns.pro",
        to: email,
        subject: "We received your inquiry - R Design Studio",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Hi ${escapeHtml(name)},</p>
            <p>Thank you for reaching out to <strong>R Design Studio</strong>!</p>
            <p>We've received your inquiry about <strong>${escapeHtml(service)}</strong> and will review your message carefully.</p>
            <p>Our team typically responds within <strong>24 hours</strong> during business hours (Monday-Friday, 09:00-18:00 GMT).</p>
            <p>Best regards,<br /><strong>R Design Studio Team</strong></p>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
            <p style="font-size: 12px; color: #666;">
              <em>This is an automated response. Please do not reply to this email.</em>
            </p>
          </div>
        `,
      });
    } catch (autoReplyError) {
      // Log but don't fail if auto-reply fails
      console.warn("Auto-reply failed:", autoReplyError);
    }

    return res.status(200).json({
      success: true,
      message: "Your inquiry has been sent successfully!",
    });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({ error: "Failed to process your request. Please try again." });
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
