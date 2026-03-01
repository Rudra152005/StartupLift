
import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

// Load env from current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api/auth`;
const HEALTH_URL = `http://localhost:${PORT}/`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
    try {
        console.log(`Checking Server Health at ${HEALTH_URL}...`);
        try {
            const health = await axios.get(HEALTH_URL);
            console.log("✅ Server Health Check:", health.data);
        } catch (e) {
            console.error("❌ Server Health Check Failed:", e.message);
            console.log("Is the server running?");
            process.exit(1);
        }

        console.log("Connecting to MongoDB:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for verification");

        const testEmail = `test_otp_${Date.now()}@example.com`;
        const testPassword = "password123";

        console.log(`\n1. Registering user: ${testEmail} at ${BASE_URL}/register`);
        try {
            const regRes = await axios.post(`${BASE_URL}/register`, {
                name: "OTP Tester",
                email: testEmail,
                password: testPassword,
                confirmPassword: testPassword,
                role: "User",
                phone: "1234567890" // Provide phone just in case
            });
            console.log("✅ Registration response:", regRes.data.message);
        } catch (e) {
            console.error("❌ Registration Failed Status:", e.response?.status);
            console.error("❌ Registration Failed Data:", JSON.stringify(e.response?.data, null, 2));
            if (!e.response) console.error("❌ Network Error:", e.message);
            process.exit(1);
        }

        // Wait a bit for DB update
        await sleep(2000);

        // Fetch OTP from DB
        const user = await User.findOne({ email: testEmail });
        if (!user) {
            console.error("❌ User not found in DB");
            process.exit(1);
        }

        if (!user.otp) {
            console.error("❌ OTP not generated in DB. User:", user);
            process.exit(1);
        }

        console.log(`✅ OTP found in DB: ${user.otp}`);

        console.log(`\n2. Verifying OTP...`);
        try {
            const verifyRes = await axios.post(`${BASE_URL}/verify-account`, {
                email: testEmail,
                otp: user.otp
            });
            console.log("✅ Verification response:", verifyRes.data.message);
        } catch (e) {
            console.error("❌ Verification Failed:", JSON.stringify(e.response?.data, null, 2));
            process.exit(1);
        }

        // Check if verified
        const verifiedUser = await User.findOne({ email: testEmail });
        if (verifiedUser.isVerified) {
            console.log("✅ User isVerified is TRUE in DB");
        } else {
            console.error("❌ User isVerified is FALSE in DB");
        }

        if (!verifiedUser.otp) {
            console.log("✅ OTP cleared from DB");
        } else {
            console.error("❌ OTP NOT cleared from DB");
        }

        console.log(`\n3. Attempts login...`);
        try {
            const loginRes = await axios.post(`${BASE_URL}/login`, {
                email: testEmail,
                password: testPassword
            });
            console.log("✅ Login successful, token received");
        } catch (e) {
            console.error("❌ Login Failed:", JSON.stringify(e.response?.data, null, 2));
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });
        console.log("\nCleanup: Test user deleted.");

        mongoose.connection.close();

    } catch (error) {
        console.error("Test Error:", error);
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }
    }
}

runTest();
