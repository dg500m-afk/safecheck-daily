import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import emailjs from "https://esm.sh/@emailjs/browser@4";

const app = initializeApp({
    apiKey: "AIzaSyC9ntGWRG7jAoentLujaSOUceV9Rb-CUlY",
    authDomain: "safecheckkeytest.firebaseapp.com",
    projectId: "safecheckkeytest",
    storageBucket: "safecheckkeytest.firebasestorage.app",
    messagingSenderId: "811381429191",
    appId: "1:811381429191:web:1548ffdcc165089dce3fe2"
});

emailjs.init({ publicKey: "qmrTJcOPQE9Ficz8E" });

const db = getFirestore(app);
const auth = getAuth(app);
let isFetching = false;

if (window.monitorLoop) clearInterval(window.monitorLoop);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Backend monitor: Session active.");
        window.monitorLoop = setInterval(async () => {
            if (isFetching) return;
            isFetching = true;
            try {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) throw new Error("DocNotFound");
                
                const data = userDoc.data();
                if (!data.lastCheckIn) throw new Error("NoCheckInData");
                
                // Alerting logic
                const lastCheckInTime = data.lastCheckIn.toDate().getTime();
                const hoursSinceLastCheck = (Date.now() - lastCheckInTime) / 3600000;
                
                if (hoursSinceLastCheck > 2.9 && !data.alerted) {
                    await emailjs.send("service_53xjk7g", "e5pr97h", {
                        user_name: data.name,
                        nominee_email: data.nominee.email
                    });
                    await updateDoc(userRef, { alerted: true });
                    console.log("Emergency: Email sent.");
                } else {
                    console.log("Monitor running. Current lag (hrs): " + hoursSinceLastCheck.toFixed(2));
                }
            } catch (e) { 
                console.error("Monitor Detail Error:", e.message || e); 
            } finally {
                isFetching = false;
            }
        }, 60000);
    } else {
        if (window.monitorLoop) clearInterval(window.monitorLoop);
    }
});
