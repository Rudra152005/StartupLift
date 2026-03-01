import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
// Uses serviceAccountKey.json file in the same directory
if (!admin.apps.length) {
    try {
        const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin Initialized with serviceAccountKey.json");
        } else {
            console.warn("⚠️ serviceAccountKey.json not found in config directory. Falling back to default credentials.");
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }
    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error);
    }
}

export default admin;
