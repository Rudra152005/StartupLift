import { sendEmail } from "../utils/sendEmail.js";

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, objective, message } = req.body;

        // Validate required fields
        if (!name || !email || !objective || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Prepare email content
        const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .content {
              background: #f8fafc;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .field {
              margin-bottom: 20px;
              background: white;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #06b6d4;
            }
            .field-label {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #64748b;
              margin-bottom: 5px;
            }
            .field-value {
              font-size: 15px;
              color: #1e293b;
              font-weight: 500;
            }
            .message-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              margin-top: 10px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #64748b;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 New Contact Form Submission</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">StartupLift Platform</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Full Name</div>
              <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Email Address</div>
              <div class="field-value">${email}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Strategic Objective</div>
              <div class="field-value">${objective}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Message</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="footer">
              <p>This message was sent from the StartupLift contact form</p>
              <p>Received on ${new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        })}</p>
            </div>
          </div>
        </body>
      </html>
    `;

        // Send email to your address
        await sendEmail({
            to: "rudratiwari152005@gmail.com",
            subject: `New Contact Form: ${objective} - ${name}`,
            html: emailHtml
        });

        res.status(200).json({
            success: true,
            message: "Message sent successfully! We'll get back to you soon."
        });

    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message. Please try again later."
        });
    }
};
