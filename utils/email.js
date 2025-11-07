// utils/email.js
const nodemailer = require("nodemailer");

// Create a reusable transporter object using SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // Mail server host
  port: process.env.SMTP_PORT || 587, // Default Gmail port for TLS
  secure: false, // true for port 465, false for others
  auth: {
    user: process.env.SMTP_USER, // Your email address (the sender)
    pass: process.env.SMTP_PASS, // Your email password or app-specific password
  },
});

/**
 * Sends an email using the configured transporter
 * @param {Object} options - Mail options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text version of the message
 * @param {string} [options.html] - HTML version of the message
 */

const sendMail = async (options) => {
  try {
    await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      ...options,
    });
    loggers.info("✅ Email sent successfully to:", options.to);
  } catch (error) {
    loggers.error("❌ Error sending email:", error);
  }
};

// Export the function so it can be used anywhere
module.exports = { sendMail };
