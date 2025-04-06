// auth.js
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "./firebase.mjs";
import { db, ref, set, onValue } from "./firebase.mjs";

document.getElementById("signup").addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("emailSignup").value;
    const password = document.getElementById("passwordSignup").value;
    const orgName = document.querySelector('#sign-up-form input[placeholder="Enter the Name of Organisation"]').value;
    const city = document.querySelector('#sign-up-form input[placeholder="Enter the City of Location"]').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user role and initial supplier profile
        await set(ref(db, `users/${user.uid}`), {
            role: "supplier",
            profileRef: `suppliers/${user.uid}`
        });

        await set(ref(db, `suppliers/${user.uid}`), {
            name: orgName,
            contact: email,
            address: city,
            businessType: "restaurant",
            totalDonations: 0,
            pendingPickups: 0,
            impactMeals: 0,
            donations: {}
        });

        alert("Supplier registered: " + user.email);
        window.location.href = "supplierProfile.html";
    } catch (error) {
        console.error(error.message);
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

        // check user role
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await new Promise((resolve) => onValue(userRef, resolve, { onlyOnce: true }));
        const userData = snapshot.val();

        if (userData && userData.role === "supplier") {
            window.location.href = "supplierProfile.html";
        } else {
            alert("This account is not registered as a supplier.");
            auth.signOut();
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
});