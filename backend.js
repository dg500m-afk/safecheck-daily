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
let isFetching = false; // Add a safety lock

if (window.monitorLoop) clearInterval(window.monitorLoop);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Backend monitor: Session active. Initializing...");
        
        window.monitorLoop = setInterval(async () => {
            if (isFetching) return; // Skip if still working
            isFetching = true;
            
            try {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const now = new Date();
                    
                    const [h, m] = data.checkInTime.split(':').map(Number);
                    const targetTime = new Date();
                    targetTime.setHours(h, m, 0, 0);
                    
                    const diffToDue = (targetTime - now) / 60000;
                    if (diffToDue > 14 && diffToDue < 16) {
                        alert("REMINDER: Your check-in is due in 15 minutes.");
                    }

                    const lastCheckInTime = data.lastCheckIn.toDate().getTime();
                    const hoursSinceLastCheck = (Date.now() - lastCheckInTime) / 3600000;
                    
                    if (hoursSinceLastCheck > 2.9 && !data.alerted) {
                        await emailjs.send("service_53xjk7g", "e5pr97h", {
                            user_name: data.name,
                            nominee_email: data.nominee.email
                        });
                        await updateDoc(userRef, { alerted: true });
                        console.log("Emergency: Email triggered.");
                    } else {
                        console.log("System OK. Hours since check-in: " + hoursSinceLastCheck.toFixed(2));
                    }
                }
            } catch (e) { 
                console.error("Monitor loop error:", e.message); 
            } finally {
                isFetching = false; // Always release the lock
            }
        }, 60000);
    } else {
        if (window.monitorLoop) clearInterval(window.monitorLoop);
    }
});
