import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC9ntGWRG7jAoentLujaSOUceV9Rb-CUlY",
    authDomain: "safecheckkeytest.firebaseapp.com",
    projectId: "safecheckkeytest",
    storageBucket: "safecheckkeytest.firebasestorage.app",
    messagingSenderId: "811381429191",
    appId: "1:811381429191:web:1548ffdcc165089dce3fe2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const showPage = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
};

// Navigation Links
document.getElementById('go-to-reg-btn').onclick = () => showPage('register-screen');
document.getElementById('back-to-login').onclick = () => showPage('landing-screen');
document.getElementById('back-to-dashboard-1').onclick = () => showPage('dashboard-screen');
document.getElementById('back-to-dashboard-2').onclick = () => showPage('dashboard-screen');
document.getElementById('go-to-amend-user-btn').onclick = () => showPage('amend-user-screen');
document.getElementById('go-to-amend-nom-btn').onclick = () => showPage('amend-nom-screen');

document.getElementById('logout-btn').onclick = async () => { 
    await signOut(auth); 
    document.getElementById('login-email').value = "";
    document.getElementById('login-password').value = "";
    showPage('landing-screen'); 
};
// Registration
document.getElementById('submit-reg-btn').onclick = async () => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, document.getElementById('reg-email').value, document.getElementById('reg-password').value);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: document.getElementById('reg-name').value,
            time: document.getElementById('reg-time').value,
            mobile: document.getElementById('reg-mobile').value,
            nomName: document.getElementById('reg-nom-name').value,
            nomMobile: document.getElementById('reg-nom-mobile').value,
            nomEmail: document.getElementById('reg-nom-email').value,
            lastCheckIn: new Date().toISOString()
        });
        alert("Registered!");
        showPage('landing-screen');
    } catch (e) { alert(e.message); }
};

// Save Amendments
document.getElementById('save-user-btn').onclick = async () => {
    const user = auth.currentUser;
    if (user) {
        await setDoc(doc(db, "users", user.uid), {
            name: document.getElementById('edit-name').value,
            time: document.getElementById('edit-time').value,
            mobile: document.getElementById('edit-mobile').value
        }, { merge: true });
        alert("User details updated!");
    }
};

document.getElementById('save-nom-btn').onclick = async () => {
    const user = auth.currentUser;
    if (user) {
        await setDoc(doc(db, "users", user.uid), {
            nomName: document.getElementById('edit-nom-name').value,
            nomMobile: document.getElementById('edit-nom-mobile').value,
            nomEmail: document.getElementById('edit-nom-email').value
        }, { merge: true });
        alert("Nominee details updated!");
    }
};

document.getElementById('login-btn').onclick = async () => {
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
    } catch (e) { alert(e.message); }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            const d = docSnap.data();
            document.getElementById('display-time').textContent = d.time;
            document.getElementById('system-status').textContent = `System Status: Monitoring ${d.time}`;
        }
        showPage('dashboard-screen');
    } else { showPage('landing-screen'); }
});

document.getElementById('ok-btn').onclick = async () => {
    await setDoc(doc(db, "users", auth.currentUser.uid), { lastCheckIn: new Date().toISOString() }, { merge: true });
    alert("Checked in!");
};
