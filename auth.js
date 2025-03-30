import {auth, signInWithEmailAndPassword, createUserWithEmailAndPassword} from "./firebase.js"

document.getElementById("signup").addEventListener("click", function (event) {
    const email = document.getElementById("emailSignup").value;
    const password = document.getElementById("passwordSignup").value;

    console.log(email + password)

    createUserWithEmailAndPassword(auth, email, password)

    .then(userCredential => {
        alert("User registered: " + userCredential.user.email);
    })
    .catch(error => {
        console.error(error.message);
    });

    event.preventDefault()
});

document.getElementById("sign-in-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from submitting normally
  
    const email = document.getElementById("emailSignin").value;
    const password = document.getElementById("passwordSignin").value;
  
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (user) {
        // alert("Login successful!");
        // Redirect to stock management page
        window.location.href = "./supplierProfile.html";
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
});