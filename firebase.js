import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getDatabase, ref, onValue, update, runTransaction } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import {firebaseConfig} from ".env"

const firebaseConfig = {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId
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
export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword};
export { db, ref, onValue, update};
export { getDatabase, runTransaction }