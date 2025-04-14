// ngo-db.js
import { auth, checkAuthState } from './firebase.mjs';
import { db, ref, onValue, update, runTransaction, set, get } from './firebase.mjs';

checkAuthState(auth);

const requestForm = document.querySelector('.request-food form');
const foodRequestsEl = document.getElementById('foodRequests');
const acceptedDonationsEl = document.getElementById('acceptedDonations');
const pendingDeliveriesEl = document.getElementById('pendingDeliveries');
const availableDonationsTable = document.querySelector('.available-donations tbody');
const profileForm = document.querySelector('.manage-profile form');
const nameInput = document.getElementById('name');
const contactInput = document.getElementById('contact');
const addressInput = document.getElementById('address');
const missionInput = document.getElementById('mission');
const userNameEl = document.getElementById('userName');
const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

function loadNGOData() {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ngoRef = ref(db, `ngos/${userId}`);
    const donationsRef = ref(db, 'donations');

    onValue(ngoRef, (snapshot) => {
        const data = snapshot.val() || {};
        foodRequestsEl.textContent = data.foodRequests || 0;
        acceptedDonationsEl.textContent = data.acceptedDonations || 0;
        pendingDeliveriesEl.textContent = data.pendingDeliveries || 0;
        nameInput.value = data.name || '';
        contactInput.value = data.contact || '';
        addressInput.value = data.address || '';
        missionInput.value = data.mission || '';
        userNameEl.textContent = data.name || 'Unknown';
        userEmailEl.textContent = auth.currentUser.email || 'Unknown';
    });

    onValue(donationsRef, (snapshot) => {
        const allDonations = snapshot.val() || {};
        const availableDonations = {};
        Object.entries(allDonations).forEach(([id, donation]) => {
            if (donation.status === 'In Transit' && !donation.acceptedBy) {
                availableDonations[id] = donation;
            }
        });
        updateAvailableDonations(availableDonations, userId);
    });
}

function updateAvailableDonations(donations, userId) {
    availableDonationsTable.innerHTML = '';
    Object.entries(donations).forEach(([id, donation]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donation.date}</td>
            <td>${donation.quantity}</td>
            <td>${donation.foodType}</td>
            <td>${donation.pickupTime}</td>
            <td><button class="accept-btn" data-donation-id="${id}">Accept</button></td>
        `;
        availableDonationsTable.appendChild(row);
    });

    document.querySelectorAll('.accept-btn').forEach(button => {
        button.addEventListener('click', () => acceptDonation(button.dataset.donationId, userId));
    });
}

async function acceptDonation(donationId, ngoId) {
    try {
        const donationRef = ref(db, `donations/${donationId}`);
        const donationSnapshot = await get(donationRef);
        const donationData = donationSnapshot.val();

        if (!donationData || donationData.status !== 'In Transit' || donationData.acceptedBy) {
            alert('This donation is no longer available.');
            return;
        }

        const supplierId = donationData.supplierId;
        const supplierRef = ref(db, `suppliers/${supplierId}`);
        const ngoRef = ref(db, `ngos/${ngoId}`);

        await update(donationRef, {
            status: 'Pending Pickup',
            acceptedBy: ngoId
        });

        await runTransaction(ngoRef, (currentData) => {
            currentData = currentData || {};
            currentData.acceptedDonations = (currentData.acceptedDonations || 0) + 1;
            currentData.pendingDeliveries = (currentData.pendingDeliveries || 0) + 1;
            return currentData;
        });

        alert('Donation accepted successfully!');
    } catch (error) {
        console.error('Error accepting donation:', error);
        alert('Error accepting donation: ' + error.message);
    }
}

requestForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = auth.currentUser?.uid;
    if (!userId) {
        alert('Please sign in to request food');
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value);
    const foodType = document.getElementById('foodType').value;
    const urgency = document.getElementById('urgency').value;
    const date = new Date().toISOString().split('T')[0];

    const requestData = {
        date,
        quantity,
        foodType: foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian',
        urgency,
        status: 'Pending',
        createdAt: Date.now()
    };

    try {
        const ngoRef = ref(db, `ngos/${userId}`);
        const requestId = Date.now().toString();

        await runTransaction(ngoRef, (currentData) => {
            currentData = currentData || {};
            currentData.foodRequests = (currentData.foodRequests || 0) + 1;
            currentData.requests = currentData.requests || {};
            currentData.requests[requestId] = requestData;
            return currentData;
        });

        alert('Food request submitted successfully!');
        requestForm.reset();
    } catch (error) {
        console.error('Error adding request:', error);
        alert('Error submitting request: ' + error.message);
    }
});

profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const profileData = {
        name: nameInput.value,
        contact: contactInput.value,
        address: addressInput.value,
        mission: missionInput.value
    };

    try {
        await update(ref(db, `ngos/${userId}`), profileData);
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
    }
});

logoutBtn?.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'NGOlogin.html';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out: ' + error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadNGOData();
        } else {
            window.location.href = 'NGOlogin.html';
        }
    });
});

export { loadNGOData };