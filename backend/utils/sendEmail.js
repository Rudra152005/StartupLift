import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // smtp.gmail.com
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // TLS uses 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // App Password (strips spaces)
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully to", to);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};
