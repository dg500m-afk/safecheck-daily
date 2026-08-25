import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import emailjs from "https://esm.sh/@emailjs/browser@4";

// Firebase Config
const app = initializeApp({
    // Make sure your config matches what you had previously
});
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize EmailJS
emailjs.init({ publicKey: "qmrTJcOPQE9Ficz8E" });

// Monitoring Logic
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User logged in, starting monitor...");
        window.monitorLoop = setInterval(async () => {
             // Logic to check status and send email via emailjs if threshold met
             console.log("Checking status...");
             // Replace with your service/template IDs from our inventory
             // await emailjs.send("service_53xjk7g", "e5pr97h", { ... }); 
        }, 60000); // 60 seconds interval
    } else {
        if (window.monitorLoop) clearInterval(window.monitorLoop);
    }
});
