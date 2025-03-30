import { getDatabase, ref, update, db, onValue } from './firebase.js';
import { auth } from "./firebase.js";

document.getElementById("supplierOfferBtn").addEventListener("click", function (event) {
    const userId = auth.currentUser ? auth.currentUser.uid : "guest";
    const donations = parseInt(document.getElementById("supplierDonation").value) || 0;
    const pickups = parseInt(document.getElementById("supplierPickups").value) || 0;
    const impactMeals = parseInt(document.getElementById("supplierImpactMeals").value) || 0;

    console.log(typeof (donations));

    const userRef = ref(db, "users/" + userId);

    // First, fetch the existing data
    onValue(userRef, (snapshot) => {
        const userData = snapshot.val() || { donations: 0, pickups: 0, impactMeals: 0 };
        console.log("Fetched Data:", userData);

        // Prepare updated values
        const updatedData = {
            donations: (userData.donations || 0) + donations,
            pickups: (userData.pickups || 0) + pickups,
            impactMeals: (userData.impactMeals || 0) + impactMeals
        };

        // Update the database
        update(userRef, updatedData)
            .then(() => {
                console.log("Update successful!");
            })
            .catch((error) => {
                console.error("Update failed: ", error);
            });
    }, {
        onlyOnce: true // Ensures it fetches data only once
    });

    event.preventDefault();
});
