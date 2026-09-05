import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "YOUR_API_KEY",
    authDomain: "safecheckkeytest.firebaseapp.com",
    projectId: "safecheckkeytest",
    storageBucket: "safecheckkeytest.firebasestorage.app",
    messagingSenderId: "847055375730",
    appId: "1:847055375730:web:d93540c946277259160d5b"
});
const auth = getAuth(auth);
const db = getFirestore(app);

// Simple page switching
const showPage = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
};

// UI Listeners
document.getElementById('go-to-reg-btn').onclick = () => showPage('register-screen');
document.getElementById('back-to-login').onclick = () => showPage('landing-screen');
document.getElementById('logout-btn').onclick = async () => { 
    await signOut(auth); 
    showPage('landing-screen'); 
};

document.getElementById('submit-reg-btn').onclick = async () => {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: document.getElementById('reg-name').value,
            time: document.getElementById('reg-time').value,
            mobile: document.getElementById('reg-mobile').value,
            nomName: document.getElementById('reg-nom-name').value,
            nomMobile: document.getElementById('reg-nom-mobile').value,
            nomEmail: document.getElementById('reg-nom-email').value,
            lastCheckIn: new Date().toISOString()
        });
        alert("Registered successfully!");
        showPage('landing-screen');
    } catch (error) {
        alert(error.message);
    }
};

document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showPage('dashboard-screen');
    } catch (error) {
        alert(error.message);
    }
};

// Dashboard Button Logic
document.getElementById('ok-btn').onclick = async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            await setDoc(doc(db, "users", user.uid), { 
                lastCheckIn: new Date().toISOString() 
            }, { merge: true });
            alert("Checked in: Status Updated.");
        } catch (error) {
            alert("Error: " + error.message);
        }
    } else {
        alert("Please log in first!");
    }
};
