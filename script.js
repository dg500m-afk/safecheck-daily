import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, updatePassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const app = initializeApp({
    apiKey: "AIzaSyC9ntGWRG7jAoentLujaSOUceV9Rb-CUlY",
    authDomain: "safecheckkeytest.firebaseapp.com",
    projectId: "safecheckkeytest",
    storageBucket: "safecheckkeytest.firebasestorage.app",
    messagingSenderId: "811381429191",
    appId: "1:811381429191:web:1548ffdcc165089dce3fe2"
});
const auth = getAuth(app);
const db = getFirestore(app);

// New Audio object
const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

const showPage = (id) => {
    ['landing-screen', 'register-screen', 'dashboard-screen', 'amend-nominee-screen', 'amend-user-screen', 'subscription-screen'].forEach(s => 
        document.getElementById(s).style.display = (s === id) ? 'block' : 'none');
};

const checkStatus = (userData) => {
    const statusEl = document.getElementById('system-status');
    if (statusEl) {
        statusEl.innerText = "System Status: Active - Monitoring " + userData.checkInTime;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    showPage('landing-screen');

    document.getElementById('forgot-password-link').onclick = async () => {
        const email = document.getElementById('login-email').value;
        if (!email) { alert("Please enter your email in the Login box first."); return; }
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent! Check your inbox.");
        } catch(e) { alert("Error: " + e.message); }
    };

    document.getElementById('go-to-reg-btn').onclick = () => showPage('register-screen');
    document.getElementById('back-to-login').onclick = () => showPage('landing-screen');
    document.getElementById('back-to-dash-nom-btn').onclick = () => showPage('dashboard-screen');
    document.getElementById('back-to-dash-user-btn').onclick = () => showPage('dashboard-screen');
    document.getElementById('logout-from-sub-btn').onclick = async () => { await signOut(auth); location.reload(); };

    document.getElementById('login-btn').onclick = async () => {
        try {
            const c = await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
            const d = await getDoc(doc(db, "users", c.user.uid));
            const userData = d.data();
            const now = new Date().getTime();
            const trialEnd = new Date(userData.trialEndDate).getTime();

            if (now > trialEnd) {
                showPage('subscription-screen');
            } else {
                document.getElementById('display-time').innerText = userData.checkInTime;
                checkStatus(userData);
                showPage('dashboard-screen');
                // Auto-enable audio on login
                alarmSound.play().catch(() => console.log("Waiting for user interaction"));
            }
        } catch(e) { alert(e.message); }
    };
    document.getElementById('submit-reg-btn').onclick = async () => {
        if (!document.getElementById('terms-consent').checked) {
            alert("You must agree to the Terms & Conditions to register.");
            return;
        }

        try {
            const c = await createUserWithEmailAndPassword(auth, document.getElementById('reg-email').value, document.getElementById('reg-password').value);
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 30);
            
            await setDoc(doc(db, "users", c.user.uid), {
                name: document.getElementById('reg-name').value,
                checkInTime: document.getElementById('reg-time').value,
                mobile: document.getElementById('reg-mobile').value,
                nominee: { name: document.getElementById('reg-nom-name').value, mobile: document.getElementById('reg-nom-mobile').value, email: document.getElementById('reg-nom-email').value },
                lastCheckIn: serverTimestamp(),
                termsAgreedAt: serverTimestamp(),
                trialEndDate: trialEnd.toISOString(),
                alerted: false
            });
            showPage('dashboard-screen');
        } catch(e) { alert(e.message); }
    };

    document.getElementById('ok-btn').onclick = async () => {
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { 
                lastCheckIn: serverTimestamp(),
                alerted: false 
            });
            alert("Check-in successful!");
        } catch(e) { alert("Error: " + e.message); }
    };

    // Auditor Check Loop
    setInterval(async () => {
        if (!auth.currentUser) return;
        const d = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (!d.exists()) return;
        const userData = d.data();
        
        const now = new Date();
        const [hours, minutes] = userData.checkInTime.split(':');
        const checkInDate = new Date();
        checkInDate.setHours(hours, minutes, 0, 0);

        // Calculate time 15 minutes before deadline
        const reminderTime = new Date(checkInDate.getTime() - 15 * 60000);

        if (now.getHours() === reminderTime.getHours() && now.getMinutes() === reminderTime.getMinutes()) {
            alarmSound.play().catch(e => console.log("Alert muted until interaction."));
        }
    }, 60000);

    document.getElementById('go-to-amend-nom-btn').onclick = async () => {
        const d = await getDoc(doc(db, "users", auth.currentUser.uid));
        const n = d.data().nominee;
        document.getElementById('edit-nom-name').value = n.name;
        document.getElementById('edit-nom-mobile').value = n.mobile;
        document.getElementById('edit-nom-email').value = n.email;
        showPage('amend-nominee-screen');
    };

    document.getElementById('save-nominee-btn').onclick = async () => {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            nominee: { name: document.getElementById('edit-nom-name').value, mobile: document.getElementById('edit-nom-mobile').value, email: document.getElementById('edit-nom-email').value }
        });
        alert("Nominee updated!");
        showPage('dashboard-screen');
    };

    document.getElementById('go-to-amend-user-btn').onclick = async () => {
        const d = await getDoc(doc(db, "users", auth.currentUser.uid));
        const u = d.data();
        document.getElementById('edit-user-name').value = u.name;
        document.getElementById('edit-user-email').value = auth.currentUser.email;
        document.getElementById('edit-user-mobile').value = u.mobile;
        document.getElementById('edit-user-time').value = u.checkInTime;
        showPage('amend-user-screen');
    };

    document.getElementById('save-user-btn').onclick = async () => {
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                name: document.getElementById('edit-user-name').value,
                mobile: document.getElementById('edit-user-mobile').value,
                checkInTime: document.getElementById('edit-user-time').value
            });
            const newPass = document.getElementById('new-password').value;
            if (newPass.length >= 6) {
                await updatePassword(auth.currentUser, newPass);
                alert("Profile and password updated!");
            } else { alert("Profile updated!"); }
            showPage('dashboard-screen');
        } catch(e) { alert("Error: " + e.message); }
    };

    document.getElementById('delete-account-btn').onclick = async () => {
        if (confirm("Are you sure? This permanently deletes your account and data.")) {
            await deleteDoc(doc(db, "users", auth.currentUser.uid));
            await deleteUser(auth.currentUser);
            location.reload();
        }
    };

    document.getElementById('logout-btn').onclick = async () => { await signOut(auth); location.reload(); };
});
