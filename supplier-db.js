// supplier-db.js
import { auth, checkAuthState } from './firebase.mjs';
import { db, ref, onValue, update, runTransaction, set } from './firebase.mjs';

checkAuthState(auth);

const donationForm = document.querySelector('.donate-food form');
const totalDonationsEl = document.getElementById('supplierDonation');
const pendingPickupsEl = document.getElementById('supplierPickups');
const impactMealsEl = document.getElementById('supplierImpactMeals');
const donationHistoryTable = document.querySelector('.donation-history tbody');
const profileForm = document.querySelector('.manage-profile form');
const nameInput = document.getElementById('name');
const contactInput = document.getElementById('contact');
const addressInput = document.getElementById('address');
const businessTypeInput = document.getElementById('businessType');
const userNameEl = document.getElementById('userName');
const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

function loadSupplierData() {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const supplierRef = ref(db, `suppliers/${userId}`);
    const donationsRef = ref(db, 'donations');

    onValue(supplierRef, (snapshot) => {
        const data = snapshot.val() || {};
        totalDonationsEl.textContent = data.totalDonations || 0;
        pendingPickupsEl.textContent = data.pendingPickups || 0;
        impactMealsEl.textContent = data.impactMeals || 0;
        nameInput.value = data.name || '';
        contactInput.value = data.contact || '';
        addressInput.value = data.address || '';
        businessTypeInput.value = data.businessType || 'restaurant';
        userNameEl.textContent = data.name || 'Unknown';
        userEmailEl.textContent = auth.currentUser.email || 'Unknown';
    });

    onValue(donationsRef, (snapshot) => {
        const allDonations = snapshot.val() || {};
        const supplierDonations = {};
        Object.entries(allDonations).forEach(([id, donation]) => {
            if (donation.supplierId === userId) {
                supplierDonations[id] = donation;
            }
        });
        updateDonationHistory(supplierDonations);
    });
}

function updateDonationHistory(donations) {
    donationHistoryTable.innerHTML = '';
    Object.entries(donations).forEach(([id, donation]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donation.date}</td>
            <td>${donation.quantity}</td>
            <td>${donation.foodType}</td>
            <td><span class="badge ${donation.status.toLowerCase().replace(' ', '-')}">${donation.status}</span></td>
        `;
        donationHistoryTable.appendChild(row);
    });
}

donationForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = auth.currentUser?.uid;
    if (!userId) {
        alert('Please sign in to make a donation');
        return;
    }

    const foodType = document.getElementById('foodType').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const expiryTime = document.getElementById('expiryTime').value;
    const pickupTime = document.getElementById('pickupTime').value;
    const date = new Date().toISOString().split('T')[0];
    const donationId = Date.now().toString();

    const donationData = {
        supplierId: userId,
        date,
        foodType: foodType === 'veg' ? 'Vegetarian' : foodType === 'non-veg' ? 'Non-Vegetarian' : 'Mixed',
        quantity,
        expiryTime,
        pickupTime,
        status: 'In Transit',
        acceptedBy: null,
        createdAt: Date.now()
    };

    try {
        const supplierRef = ref(db, `suppliers/${userId}`);
        const donationRef = ref(db, `donations/${donationId}`);

        await set(donationRef, donationData);

        await runTransaction(supplierRef, (currentData) => {
            currentData = currentData || {};
            currentData.totalDonations = (currentData.totalDonations || 0) + 1;
            currentData.impactMeals = (currentData.impactMeals || 0) + quantity;
            currentData.pendingPickups = (currentData.pendingPickups || 0) + 1;
            currentData.donationIds = currentData.donationIds || {};
            currentData.donationIds[donationId] = true;
            return currentData;
        });

        alert('Donation offered successfully!');
        donationForm.reset();
    } catch (error) {
        console.error('Error adding donation:', error);
        alert('Error submitting donation: ' + error.message);
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
        businessType: businessTypeInput.value
    };

    try {
        await update(ref(db, `suppliers/${userId}`), profileData);
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
    }
});

logoutBtn?.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'supplierLogin.html';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out: ' + error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadSupplierData();
        } else {
            window.location.href = 'supplierLogin.html';
        }
    });
});

export { loadSupplierData };