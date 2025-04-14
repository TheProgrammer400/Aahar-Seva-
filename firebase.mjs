import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getDatabase, ref, onValue, update, runTransaction, set, get } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js';
import { firebaseData } from "./config.js";

const firebaseConfig = {
    apiKey: firebaseData.apiKey,
    authDomain: firebaseData.authDomain,
    databaseURL: firebaseData.databaseURL,
    projectId: firebaseData.projectId,
    storageBucket: firebaseData.storageBucket,
    messagingSenderId: firebaseData.messagingSenderId,
    appId: firebaseData.appId,
    measurementId: firebaseData.measurementId
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const checkAuthState = (auth) => {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // If user is not authenticated, redirect to login page
            window.location.href = "/";
        }
    });
};

export { checkAuthState };
export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword };
export { db, ref, onValue, update, set, get };
export { getDatabase, runTransaction }