const nodemailer = require("nodemailer");

// Create reusable transporter with better configuration
const createTransporter = () => {
  // Log email configuration (without exposing the full password)
  console.log("📧 Email config:", {
    user: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
    pass: process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing",
  });

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add timeout and connection settings
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

// @desc    Send contact email
// @route   POST /api/contact/send
// @access  Public
const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log("📧 Contact form received:", { name, email, subject });

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured");
    return res.status(500).json({
      success: false,
      message: "Email service is not configured. Please contact administrator.",
    });
  }

  try {
    const transporter = createTransporter();

    // Verify connection with timeout
    console.log("⏳ Verifying email transporter...");
    await transporter.verify();
    console.log("✅ Email transporter is ready");

    // 1. Send email to YOU (the owner)
    const ownerMailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Your email
      subject: `New Message from ${name}: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #7C3AED, #5B21B6); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
            .label { font-weight: bold; color: #7C3AED; display: block; margin-bottom: 5px; }
            .value { color: #333; }
            .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📩 New Contact Form Submission</h2>
              <p>You have received a new message from your portfolio</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">👤 Name</span>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <span class="label">📧 Email</span>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <span class="label">📝 Subject</span>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <span class="label">💬 Message</span>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>Reply directly to: <strong>${email}</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // 2. Send auto-reply to the user
    const userMailOptions = {
      from: `"SAHEL Oumaima" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting me!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #7C3AED, #5B21B6); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; line-height: 1.6; }
            .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #7C3AED; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #eee; }
            .signature { color: #7C3AED; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>👋 Thank You for Contacting Me!</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Thank you for reaching out to me. I have received your message and will get back to you as soon as possible (usually within 24 hours).</p>
              
              <div class="message-box">
                <p><strong>📝 Your message:</strong></p>
                <p style="color: #333;">"${message.substring(0, 300)}${message.length > 300 ? "..." : ""}"</p>
              </div>
              
              <p>I look forward to connecting with you!</p>
              
              <p>Best regards,<br>
              <span class="signature">SAHEL Oumaima</span><br>
              Full Stack Developer</p>
            </div>
            <div class="footer">
              <p>This is an automated reply. Please don't reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send both emails sequentially
    console.log("📤 Sending email to owner...");
    await transporter.sendMail(ownerMailOptions);
    console.log("✅ Email sent to owner: sahelhanan17@gmail.com");

    console.log("📤 Sending auto-reply to user...");
    await transporter.sendMail(userMailOptions);
    console.log("✅ Auto-reply sent to user:", email);

    res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully! I'll get back to you soon.",
    });
  } catch (error) {
    console.error("❌ Email error:", error.message);
    console.error("Full error:", error);

    // More detailed error response
    let errorMessage = "Failed to send email. Please try again later.";

    if (
      error.message.includes("Invalid login") ||
      error.message.includes("535")
    ) {
      errorMessage =
        "Email configuration error. Please check your credentials and make sure you're using an App Password.";
    } else if (error.message.includes("ECONNREFUSED")) {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Connection timeout. Please try again.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

module.exports = { sendContactEmail };
