import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Loader } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const PaymentModal = ({ isOpen, onClose, recipient, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    if (!isOpen || !recipient) return null;

    const handlePayment = async () => {
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Create Order
            const { data: orderData } = await axios.post("http://localhost:5000/api/payment/create-order", {
                amount: amount,
                founderId: recipient.userId // Assuming recipient object has userId of the startup founder
            }, config);

            if (!orderData.success) throw new Error("Order creation failed");

            // 2. Open Razorpay Checkout
            const options = {
                key: orderData.key_id,
                amount: orderData.order.amount,
                currency: "INR",
                name: "Mentorship Funding",
                description: `Funding for ${recipient.name}`,
                order_id: orderData.order.id,
                handler: async function (response) {
                    console.log("Razorpay handler triggered", response);
                    try {
                        // 3. Verify Payment
                        const verifyRes = await axios.post("http://localhost:5000/api/payment/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, config);

                        console.log("Verification Response:", verifyRes.data);

                        if (verifyRes.data.success) {
                            toast.success("Payment successfully done");
                            onSuccess();
                            onClose();
                        } else {
                            console.error("Verification failed success=false", verifyRes.data);
                            toast.error("Payment verification failed: " + (verifyRes.data.message || "Unknown error"));
                            alert("Payment verification failed. Please check console for details.");
                        }
                    } catch (err) {
                        console.error("Verification Error:", err);
                        toast.error("Payment verification failed: " + (err.response?.data?.message || err.message));
                        alert("Payment verification error: " + (err.response?.data?.message || err.message));
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: {
                    color: "#3B82F6"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                toast.error(response.error.description || "Payment Failed");
            });
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            toast.error(error.response?.data?.message || "Payment initialization failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">Fund {recipient.name}</h3>
                        <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Amount (INR)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full bg-[var(--bg-primary)] px-10 py-3 rounded-xl border border-[var(--text-primary)]/10 focus:border-[var(--color-primary)] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-[var(--color-primary)]/10 rounded-xl text-sm text-[var(--color-primary)]">
                            <h4 className="font-bold mb-1">Test Mode Active ⚠️</h4>
                            <p>This is a simulated payment. No real money will be deducted.</p>
                            <p className="mt-2 font-semibold">• No OTP will be sent to your phone.</p>
                            <p>• On the next screen, select <span className="underline">"Success"</span> or enter any random number.</p>
                        </div>

                        {recipient.bankDetails && recipient.bankDetails.accountName && (
                            <div className="p-4 border border-[var(--text-primary)]/10 rounded-xl bg-[var(--bg-secondary)]/30">
                                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-2">Transferring to:</h4>
                                <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                                    <div className="flex justify-between">
                                        <span>Bank:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{recipient.bankDetails.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Account:</span>
                                        <span className="font-medium text-[var(--text-primary)]">XXXX{recipient.bankDetails.accountNumber.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Holder:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{recipient.bankDetails.accountName}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-secondary)] transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : "Proceed to Pay"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
