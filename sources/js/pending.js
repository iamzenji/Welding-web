import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

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

const pendingTableBody = document.getElementById('pendingApprovalTable').getElementsByTagName('tbody')[0];
const entriesCount = document.getElementById('entriesCount');
const prevPagePending = document.getElementById('prevPagePending');
const nextPagePending = document.getElementById('nextPagePending');
const searchBoxPending = document.getElementById('searchBoxPending');

let currentPage = 1;
let entriesPerPage = 5;
let pendingStudents = [];

// Load pending students from Firebase
function loadPendingStudents() {
  onValue(ref(db, 'notification'), (snapshot) => {
    const students = [];
    snapshot.forEach((childSnapshot) => {
      const studentData = childSnapshot.val();
      students.push({ key: childSnapshot.key, ...studentData });
    });

    pendingStudents = students;
    displayPendingStudents(pendingStudents);
  });
}

// Display pending students in the table with pagination
function displayPendingStudents(students) {
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, students.length);
  const paginatedStudents = students.slice(startIndex, endIndex);

  pendingTableBody.innerHTML = '';

  paginatedStudents.forEach((student) => {
    const row = pendingTableBody.insertRow();
    row.insertCell(0).textContent = student.lrn;
    row.insertCell(1).textContent = student.firstName;
    row.insertCell(2).textContent = student.lastName;
    row.insertCell(3).textContent = student.section;
    row.insertCell(4).textContent = student.email;

    const actionCell = row.insertCell(5);

    const approveBtn = document.createElement('button');
    approveBtn.classList.add('btn', 'btn-success', 'btn-sm');
    approveBtn.innerHTML = '&#10004;';
    approveBtn.onclick = () => showApproveModal(student);

    const rejectBtn = document.createElement('button');
    rejectBtn.classList.add('btn', 'btn-danger', 'btn-sm');
    rejectBtn.innerHTML = '&#10008;';
    rejectBtn.onclick = () => showRejectModal(student);

    actionCell.appendChild(approveBtn);
    actionCell.appendChild(rejectBtn);
  });

  prevPagePending.disabled = currentPage === 1;
  nextPagePending.disabled = endIndex >= students.length;
}

// Approve student
function approveStudent(studentId, studentData) {
  const studentRef = ref(db, `students/${studentId}`);
  set(studentRef, {
    firstName: studentData.firstName,
    lastName: studentData.lastName,
    email: studentData.email,
    section: studentData.section,
    password: studentData.hashedPassword
  })
    .then(() => remove(ref(db, `notification/${studentId}`)))
    .catch(console.error);
}

// Reject student
function rejectStudent(studentId) {
  remove(ref(db, `notification/${studentId}`)).catch(console.error);
}

// Show approve modal
function showApproveModal(student) {
  document.getElementById('approveStudentId').value = student.key;
  $('#approveModal').modal('show');
}

// Show reject modal
function showRejectModal(student) {
  document.getElementById('rejectStudentId').value = student.key;
  $('#rejectModal').modal('show');
}

// Event listeners for modal actions
document.getElementById('confirmApproveButton').addEventListener('click', () => {
  const studentId = document.getElementById('approveStudentId').value;
  const student = pendingStudents.find(s => s.key === studentId);
  approveStudent(studentId, student);
  $('#approveModal').modal('hide');
});

document.getElementById('confirmRejectButton').addEventListener('click', () => {
  const studentId = document.getElementById('rejectStudentId').value;
  rejectStudent(studentId);
  $('#rejectModal').modal('hide');
});

// Pagination controls
nextPagePending.addEventListener('click', () => {
  currentPage++;
  displayPendingStudents(pendingStudents);
});

prevPagePending.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPendingStudents(pendingStudents);
  }
});

// Search functionality
searchBoxPending.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredStudents = pendingStudents.filter((student) =>
    student.firstName.toLowerCase().includes(searchTerm) ||
    student.lastName.toLowerCase().includes(searchTerm) ||
    student.section.toLowerCase().includes(searchTerm) ||
    student.email.toLowerCase().includes(searchTerm)
  );
  displayPendingStudents(filteredStudents);
});

// Change entries per page
entriesCount.addEventListener('change', (e) => {
  entriesPerPage = e.target.value === 'All' ? Number.MAX_SAFE_INTEGER : parseInt(e.target.value);
  currentPage = 1;
  displayPendingStudents(pendingStudents);
});

// Load pending students on page load
window.addEventListener('load', loadPendingStudents);
