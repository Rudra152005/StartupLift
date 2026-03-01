import Razorpay from 'razorpay';
import crypto from 'crypto';
import Funding from '../models/Funding.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order
export const createOrder = async (req, res) => {
    try {
        const { amount, founderId } = req.body;
        const mentorId = req.user.id;

        const options = {
            amount: amount * 100, // Amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: "Some error occured" });
        }

        // Create DB record
        const funding = new Funding({
            mentorId,
            founderId,
            amount,
            razorpayOrderId: order.id,
            status: 'created'
        });
        await funding.save();

        res.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Server error creating order" });
    }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        console.log("Verify Payment Request:", { razorpay_order_id, razorpay_payment_id, razorpay_signature });
        console.log("Secret Length:", process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.length : "MISSING");

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        console.log("Signatures:", { expected: expectedSignature, received: razorpay_signature });

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update DB
            const funding = await Funding.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    status: 'paid',
                    razorpayPaymentId: razorpay_payment_id
                },
                { new: true }
            );

            if (!funding) {
                console.error("Funding record not found for order:", razorpay_order_id);
            } else {
                console.log("Funding record updated:", funding._id);

                // Update Startup Funding History
                const startup = await import('../models/Startup.js').then(m => m.default.findOne({ userId: funding.founderId }));

                if (startup) {
                    startup.fundingHistory.push({
                        mentorId: funding.mentorId,
                        amount: `₹${funding.amount}`, // Store as string with symbol to match schema
                        date: new Date(),
                        transactionId: razorpay_payment_id
                    });

                    // Update Readiness Score (Bonus for getting funded)
                    if (startup.readinessScore < 90) {
                        startup.readinessScore += 10;
                    }

                    await startup.save();
                    console.log("Startup funding history updated");
                }

                // Update User Funding Stats (Legacy/Quick View)
                const user = await User.findById(funding.founderId);
                if (user) {
                    // Parse existing funding
                    let currentAmount = 0;
                    if (user.fundingRaised) {
                        const numStr = user.fundingRaised.replace(/[^0-9.]/g, '');
                        currentAmount = parseFloat(numStr) || 0;
                        if (user.fundingRaised.includes('Cr')) currentAmount *= 10000000;
                        if (user.fundingRaised.includes('Lakh')) currentAmount *= 100000;
                    }

                    const newTotal = currentAmount + funding.amount;

                    // Format back
                    let formatted = `₹${newTotal}`;
                    if (newTotal >= 10000000) formatted = `₹${(newTotal / 10000000).toFixed(2)} Cr`;
                    else if (newTotal >= 100000) formatted = `₹${(newTotal / 100000).toFixed(2)} Lakh`;

                    user.fundingRaised = formatted;
                    await user.save();
                }
            }

            res.json({
                success: true,
                message: "Payment verified successfully",
                data: funding
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid signature"
            });
        }

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Server error verifying payment" });
    }
};
