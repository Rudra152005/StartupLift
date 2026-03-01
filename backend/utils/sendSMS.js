import twilio from 'twilio';

/**
 * Send SMS using Twilio API or mock in development
 * @param {Object} options - SMS options
 * @param {string} options.to - Phone number (with country code, e.g., +919876543210)
 * @param {string} options.message - SMS message content
 * @returns {Promise<Object>} - Response from Twilio API
 */
export const sendSMS = async ({ to, message }) => {
    try {
        // Validate inputs
        if (!to || !message) {
            throw new Error('Phone number and message are required');
        }

        // Get Twilio credentials from environment
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        const isDevelopment = process.env.NODE_ENV !== 'production';

        // Development mode: Log OTP to console instead of sending SMS
        if (isDevelopment && (!accountSid || !authToken || !fromNumber)) {
            console.log('\n' + '='.repeat(60));
            console.log('📱 DEVELOPMENT MODE - SMS NOT SENT');
            console.log('='.repeat(60));
            console.log(`📞 To: ${to}`);
            console.log(`💬 Message: ${message}`);
            console.log('='.repeat(60) + '\n');

            return {
                success: true,
                message: 'SMS logged to console (development mode)',
                data: { mock: true }
            };
        }

        // Validate Twilio credentials
        if (!accountSid || !authToken || !fromNumber) {
            throw new Error('Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment variables');
        }

        // Ensure phone number has country code
        let phoneNumber = to.trim();
        if (!phoneNumber.startsWith('+')) {
            // Assume Indian number if no country code
            phoneNumber = `+91${phoneNumber}`;
        }

        console.log(`📱 Sending SMS via Twilio to ${phoneNumber}...`);

        // Initialize Twilio client
        const client = twilio(accountSid, authToken);

        // Send SMS using Twilio
        const twilioMessage = await client.messages.create({
            body: message,
            from: fromNumber,
            to: phoneNumber
        });

        console.log('✅ SMS sent successfully via Twilio');
        console.log(`📧 Message SID: ${twilioMessage.sid}`);

        return {
            success: true,
            message: 'SMS sent successfully',
            data: {
                sid: twilioMessage.sid,
                status: twilioMessage.status,
                to: twilioMessage.to,
                from: twilioMessage.from
            }
        };

    } catch (error) {
        console.error('❌ Send SMS Error:', error.message);

        // In development, fall back to console logging if Twilio fails
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (isDevelopment) {
            console.log('\n' + '⚠'.repeat(30));
            console.log('⚠️  Twilio unavailable - Using development mode');
            console.log('⚠'.repeat(30));
            console.log(`📞 To: ${to}`);
            console.log(`💬 Message: ${message}`);
            console.log(`❌ Error: ${error.message}`);
            console.log('⚠'.repeat(30) + '\n');

            return {
                success: true,
                message: 'SMS logged to console (Twilio unavailable)',
                data: { mock: true, reason: error.message }
            };
        }

        // Handle specific Twilio error cases
        if (error.code === 21211) {
            throw new Error('Invalid phone number format. Please include country code (e.g., +919876543210)');
        } else if (error.code === 21608) {
            throw new Error('This phone number is not verified. In trial mode, you can only send to verified numbers.');
        } else if (error.code === 20003) {
            throw new Error('Twilio authentication failed. Please check your credentials.');
        } else {
            throw new Error(error.message || 'Failed to send SMS via Twilio');
        }
    }
};

export default sendSMS;
