// ngo-auth.js
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './firebase.mjs';
import { db, ref, set, onValue } from './firebase.mjs';

document.getElementById("signup").addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("emailSignup").value;
    const password = document.getElementById("passwordSignup").value;
    const ngoName = document.getElementById("ngoName").value;
    const city = document.querySelector('#sign-up-form input[placeholder="Enter City"]').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user role and initial NGO profile
        await set(ref(db, `users/${user.uid}`), {
            role: "ngo",
            profileRef: `ngos/${user.uid}`
        });

        await set(ref(db, `ngos/${user.uid}`), {
            name: ngoName,
            contact: email,
            address: city,
            mission: "Our mission is to help those in need.",
            foodRequests: 0,
            acceptedDonations: 0,
            pendingDeliveries: 0,
            requests: {}
        });

        alert("NGO registered: " + user.email);
        window.location.href = "NGOProfile.html";
    } catch (error) {
        alert("Error: " + error.message);
    }
});

document.getElementById("sign-in-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("emailSignin").value;
    const password = document.getElementById("passwordSignin").value;
    const captchaInput = document.getElementById("captcha-input").value;
    const captcha = document.getElementById("captcha").textContent;

    if (captchaInput !== captcha) {
        alert("Invalid CAPTCHA");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check user role
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await new Promise((resolve) => onValue(userRef, resolve, { onlyOnce: true }));
        const userData = snapshot.val();

        if (userData && userData.role === "ngo") {
            window.location.href = "NGOProfile.html";
        } else {
            alert("This account is not registered as an NGO.");
            auth.signOut();
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
});