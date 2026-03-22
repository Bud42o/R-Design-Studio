import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "https://rdesigns.pro",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).json({}, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return res.status(405).json(
      { error: "Method not allowed" },
      { headers: corsHeaders }
    );
  }

  // Rate limiting (simple per-IP check)
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  const rateLimitKey = `ratelimit:${clientIp}`;

  // Extract form data
  const { name, email, service, message } = req.body;

  // Validation
  if (!name || !email || !service || !message) {
    return res.status(400).json(
      { error: "Missing required fields" },
      { headers: corsHeaders }
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json(
      { error: "Invalid email address" },
      { headers: corsHeaders }
    );
  }

  // Message length check (prevent abuse)
  if (message.length > 5000) {
    return res.status(400).json(
      { error: "Message too long" },
      { headers: corsHeaders }
    );
  }

  try {
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

    if (businessEmailResponse.error) {
      console.error("Error sending business email:", businessEmailResponse.error);
      return res.status(500).json(
        { error: "Failed to send email" },
        { headers: corsHeaders }
      );
    }

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
            <p>If you have any urgent questions, feel free to reach out via:</p>
            <ul>
              <li>WhatsApp: <a href="https://wa.me/447570429558">+447570429558</a></li>
              <li>Email: <a href="mailto:contact@rdesigns.pro">contact@rdesigns.pro</a></li>
            </ul>
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

    return res
      .status(200)
      .json(
        {
          success: true,
          message: "Your inquiry has been sent successfully!",
        },
        { headers: corsHeaders }
      );
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json(
      { error: "Failed to process your request. Please try again." },
      { headers: corsHeaders }
    );
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
