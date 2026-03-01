// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCej0uq9IkTm9VO5QsMBkfp21FpdSqBtP4",
    authDomain: "startuplift-6f9ca.firebaseapp.com",
    projectId: "startuplift-6f9ca",
    storageBucket: "startuplift-6f9ca.firebasestorage.app",
    messagingSenderId: "359558985680",
    appId: "1:359558985680:web:09b700a169c93ef5b56bd5",
    measurementId: "G-M9SG4DGK9N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);

export default app;
