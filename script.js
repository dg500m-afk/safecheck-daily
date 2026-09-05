import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

// Firebase Configuration Constants
const firebaseConfig = {
    apiKey: "AIzaSyC9ntGWRG7jAoentLujaSOUceV9Rb-CUlY",
    authDomain: "safecheckkeytest.firebaseapp.com",
    projectId: "safecheckkeytest",
    storageBucket: "safecheckkeytest.firebasestorage.app",
    messagingSenderId: "811381429191",
    appId: "1:811381429191:web:1548ffdcc165089dce3fe2"
};

// Initialize Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Navigation Logic
const showPage = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
};

// UI Element Event Listeners
document.getElementById('go-to-reg-btn').onclick = () => showPage('register-screen');
document.getElementById('back-to-login').onclick = () => showPage('landing-screen');
document.getElementById('logout-btn').onclick = async () => { 
    await signOut(auth); 
    showPage('landing-screen'); 
};
// Registration Logic
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
        alert("Registration Error: " + error.message);
    }
};

// Login Logic
document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Login Error: " + error.message);
    }
};

// Authentication State & Dashboard Data Load
onAuthStateChanged(auth, async (user) => {
    if (user) {
        showPage('dashboard-screen');
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            const userData = docSnap.data();
            document.getElementById('display-time').textContent = userData.time || "--:--";
            document.getElementById('system-status').textContent = `System Status: Active - Monitoring ${userData.time}`;
        }
    } else {
        showPage('landing-screen');
    }
});

// Dashboard "I'm OK" Button
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
