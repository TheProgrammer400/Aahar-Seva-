import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getDatabase, ref, onValue, update, runTransaction, set, get } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js';


const firebaseConfig = {
  // your firebase object
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
export { db, ref, onValue, update, set, get};
export { getDatabase, runTransaction }