import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const sendTestEmail = async () => {
    console.log('Test script started...');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('Port:', process.env.EMAIL_PORT);
    console.log('User:', process.env.EMAIL_USER);

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
            },
            debug: true,
            logger: true
        });

        console.log('Verifying transporter connection...');
        await transporter.verify();
        console.log('Transporter verification successful!');

        console.log('Sending email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Send to self
            subject: "Test Email from Debug Script",
            text: "If you receive this, email sending is working.",
        });

        console.log("Email sent successfully properly!", info.messageId);
    } catch (err) {
        console.error("Error in test script:", err); // Log the full error object
    }
};

sendTestEmail();
