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

// Global variables
let currentTeacherPage = 1;
let currentStudentPage = 1;
let currentQuestionPage = 1;
let entriesPerPage = 5; // Default entries per page

// Load Teachers Data
function loadTeachers() {
  onValue(ref(db, 'teachers'), (snapshot) => {
    const data = [];
    snapshot.forEach((childSnapshot) => {
      data.push({ key: childSnapshot.key, ...childSnapshot.val() });
    });
    displayTeachers(data);
  });
}

// Display Teachers Data
function displayTeachers(data) {
  const totalEntries = data.length;
  const startIndex = (currentTeacherPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const tableBody = document.getElementById('teachersTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';

  paginatedData.forEach((item) => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = item.firstName;
    row.insertCell(1).textContent = item.lastName;
    row.insertCell(2).textContent = item.email;

    const actionsCell = row.insertCell(3);
    // Add edit and delete buttons here (omitted for brevity)
  });

  updateTeacherPagination(totalEntries);
}

// Update Teacher Pagination
function updateTeacherPagination(totalEntries) {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  
  document.getElementById('previousPage').disabled = currentTeacherPage === 1;
  document.getElementById('nextPage').disabled = currentTeacherPage === totalPages;
}

// Load Students Data
function loadStudents() {
  onValue(ref(db, 'students'), (snapshot) => {
    const data = [];
    snapshot.forEach((childSnapshot) => {
      data.push({ key: childSnapshot.key, ...childSnapshot.val() });
    });
    displayStudents(data);
    
  });
}

// Display Students Data
function displayStudents(data) {
  const totalEntries = data.length;
  const startIndex = (currentStudentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const tableBody = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';

  paginatedData.forEach((item) => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = item.firstName;
    row.insertCell(1).textContent = item.lastName;
    row.insertCell(2).textContent = item.section;
    row.insertCell(3).textContent = item.email;

    const actionsCell = row.insertCell(4);
    // Add edit and delete buttons here (omitted for brevity)
  });

  updateStudentPagination(totalEntries);
}

// Update Student Pagination
function updateStudentPagination(totalEntries) {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  
  document.getElementById('prevPage').disabled = currentStudentPage === 1;
  document.getElementById('nextPage').disabled = currentStudentPage === totalPages;
}

// Load Questions Data
function loadQuestions() {
  onValue(ref(db, 'questions'), (snapshot) => {
    const data = [];
    snapshot.forEach((childSnapshot) => {
      data.push({ key: childSnapshot.key, ...childSnapshot.val() });
    });
    displayQuestions(data);
  });
}

// Display Questions Data
function displayQuestions(data) {
  const totalEntries = data.length;
  const startIndex = (currentQuestionPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const tableBody = document.getElementById('questionsTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';

  paginatedData.forEach((item, index) => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = startIndex + index + 1; // Adjust index for display
    row.insertCell(1).textContent = item.question;
    row.insertCell(2).textContent = item.optionA;
    row.insertCell(3).textContent = item.optionB;
    row.insertCell(4).textContent = item.optionC;
    row.insertCell(5).textContent = item.optionD;
    row.insertCell(6).textContent = item.correctAnswer;

    const actionsCell = row.insertCell(7);
    // Add edit and delete buttons here (omitted for brevity)
  });

  updateQuestionPagination(totalEntries);
}

// Update Question Pagination
function updateQuestionPagination(totalEntries) {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  
  document.getElementById('previousQuestionPage').disabled = currentQuestionPage === 1;
  document.getElementById('nextQuestionPage').disabled = currentQuestionPage === totalPages;
}

// Event listeners for entries dropdown
document.getElementById('entriesTeachersCount').addEventListener('change', (e) => {
  entriesPerPage = parseInt(e.target.value);
  currentTeacherPage = 1; // Reset to first page
  loadTeachers(); // Reload data
});

document.getElementById('entriesStudentCount').addEventListener('change', (e) => {
  entriesPerPage = parseInt(e.target.value);
  currentStudentPage = 1; // Reset to first page
  loadStudents(); // Reload data
});

document.getElementById('entriesQuizCount').addEventListener('change', (e) => {
  entriesPerPage = parseInt(e.target.value);
  currentQuestionPage = 1; // Reset to first page
  loadQuestions(); // Reload data
});

// Pagination button listeners
document.getElementById('previousPage').addEventListener('click', () => {
  if (currentTeacherPage > 1) {
    currentTeacherPage--;
    loadTeachers();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  currentTeacherPage++;
  loadTeachers();
});

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentStudentPage > 1) {
    currentStudentPage--;
    loadStudents();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  currentStudentPage++;
  loadStudents();
});

document.getElementById('previousQuestionPage').addEventListener('click', () => {
  if (currentQuestionPage > 1) {
    currentQuestionPage--;
    loadQuestions();
  }
});

document.getElementById('nextQuestionPage').addEventListener('click', () => {
  currentQuestionPage++;
  loadQuestions();
});

// Initialize the page
window.addEventListener('load', () => {
  loadTeachers();
  loadStudents();
  loadQuestions();
});
