import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const resultsTableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
const entriesCount = document.getElementById('entriesCount');
const prevPageResults = document.getElementById('prevPageResults');
const nextPageResults = document.getElementById('nextPageResults');
const searchBoxResults = document.getElementById('searchBoxResults');

let currentPage = 1;
let entriesPerPage = 5;
let studentResults = [];

// Load results from Firebase
function loadResults() {
  onValue(ref(db, 'scores'), (snapshot) => {
    const results = [];
    snapshot.forEach((childSnapshot) => {
      const resultData = childSnapshot.val();
      results.push({ key: childSnapshot.key, ...resultData });
    });

    studentResults = results;
    displayResults(studentResults);
  });
}

// Display results in the table with pagination
function displayResults(results) {
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, results.length);
  const paginatedResults = results.slice(startIndex, endIndex);

  resultsTableBody.innerHTML = '';

  paginatedResults.forEach((result) => {
    const row = resultsTableBody.insertRow();
    row.insertCell(0).textContent = result.name;
    row.insertCell(1).textContent = result.section;
    row.insertCell(2).textContent = result.score;
  });

  // Update pagination buttons
  prevPageResults.disabled = currentPage === 1;
  nextPageResults.disabled = endIndex >= results.length;
}

// Change entries per page
entriesCount.addEventListener('change', (e) => {
  entriesPerPage = e.target.value === 'All' ? Number.MAX_SAFE_INTEGER : parseInt(e.target.value);
  currentPage = 1; // Reset to the first page
  displayResults(studentResults);
});

// Pagination controls
nextPageResults.addEventListener('click', () => {
  currentPage++;
  displayResults(studentResults);
});

prevPageResults.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayResults(studentResults);
  }
});

// Search functionality
searchBoxResults.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredResults = studentResults.filter((result) =>
    result.name.toLowerCase().includes(searchTerm) ||
    result.section.toLowerCase().includes(searchTerm) ||
    result.score.toString().includes(searchTerm)
  );
  displayResults(filteredResults);
});

// Load results on page load
window.addEventListener('load', loadResults);
