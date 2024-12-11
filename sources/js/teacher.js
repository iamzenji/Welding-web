// Import the functions you need from the SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getDatabase, ref, push, onValue, update, remove } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js';

// Your web app's Firebase configuration
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

// Helper function to hash passwords
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// References for students
const studentsRef = ref(db, 'students');

// Show the modal when the "Register Student" button is clicked
document.getElementById('openModalButton').addEventListener('click', function() {
  $('#registerModal').modal('show');
});

// Function to register a student
document.getElementById('registerForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const section = document.getElementById('section').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (firstName && lastName && section && email && password) {
    const hashedPassword = await hashPassword(password);

    push(studentsRef, { firstName, lastName, section, email, password: hashedPassword })
      .then(() => {
        $('#registerModal').modal('hide');
        document.getElementById('registerForm').reset();
        loadStudents();
      })
      .catch(error => {
        console.error('Error registering student:', error);
      });
  }
});

// Pagination and entry count for students
let studentCurrentPage = 1;
let studentEntriesPerPage = 5;

document.getElementById('entriesStudentCount').addEventListener('change', function() {
  studentEntriesPerPage = parseInt(this.value) || 5;
  studentCurrentPage = 1;
  loadStudents();
});

// Load students
function loadStudents() {
  onValue(studentsRef, (snapshot) => {
    const students = [];
    snapshot.forEach((childSnapshot) => {
      students.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    displayStudents(students);
  });
}

// Display students in the table
function displayStudents(students) {
  const startIndex = (studentCurrentPage - 1) * studentEntriesPerPage;
  const endIndex = startIndex + studentEntriesPerPage;
  const studentsToDisplay = students.slice(startIndex, endIndex);

  const studentsTableBody = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
  studentsTableBody.innerHTML = '';

  studentsToDisplay.forEach(student => {
    const row = studentsTableBody.insertRow();
    row.insertCell(0).textContent = student.firstName;
    row.insertCell(1).textContent = student.lastName;
    row.insertCell(2).textContent = student.section;
    row.insertCell(3).textContent = student.email;

    const actionsCell = row.insertCell(4);
    actionsCell.innerHTML = `
      <button class="btn btn-warning btn-sm edit-btn" data-id="${student.id}">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-danger btn-sm delete-btn" data-id="${student.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
  });

  // Pagination handling
  document.getElementById('prevPage').disabled = studentCurrentPage === 1;
  document.getElementById('nextPage').disabled = endIndex >= students.length;

  // Attach event listeners to Edit and Delete buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', handleEditClick);
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', handleDeleteClick);
  });
}

// Handle next and previous page navigation for students
document.getElementById('nextPage').addEventListener('click', function() {
  studentCurrentPage++;
  loadStudents();
});

document.getElementById('prevPage').addEventListener('click', function() {
  if (studentCurrentPage > 1) {
    studentCurrentPage--;
    loadStudents();
  }
});

// Handle Edit button click for students
function handleEditClick(event) {
  const studentId = event.currentTarget.getAttribute('data-id');
  const studentRef = ref(db, `students/${studentId}`);

  onValue(studentRef, (snapshot) => {
    const student = snapshot.val();
    
    document.getElementById('editFirstName').value = student.firstName;
    document.getElementById('editLastName').value = student.lastName;
    document.getElementById('editSection').value = student.section;
    document.getElementById('editEmail').value = student.email;
    document.getElementById('editStudentId').value = studentId;

    $('#editModal').modal('show');
  });
}

// Handle Edit form submission for students
document.getElementById('editForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const studentId = document.getElementById('editStudentId').value;
  let updatedStudent = {
    firstName: document.getElementById('editFirstName').value.trim(),
    lastName: document.getElementById('editLastName').value.trim(),
    section: document.getElementById('editSection').value.trim(),
    email: document.getElementById('editEmail').value.trim(),
  };

  update(ref(db, `students/${studentId}`), updatedStudent)
    .then(() => {
      $('#editModal').modal('hide');
      document.getElementById('editForm').reset();
      loadStudents();
    })
    .catch(error => {
      console.error('Error updating student:', error);
    });
});

// Handle Delete button click for students
function handleDeleteClick(event) {
  const studentId = event.currentTarget.getAttribute('data-id');
  document.getElementById('deleteStudentId').value = studentId;
  $('#deleteModal').modal('show');
}

// Handle Delete confirmation for students
document.getElementById('confirmDeleteButton').addEventListener('click', function() {
  const studentId = document.getElementById('deleteStudentId').value;

  remove(ref(db, `students/${studentId}`))
    .then(() => {
      $('#deleteModal').modal('hide');
      loadStudents();
    })
    .catch(error => {
      console.error('Error deleting student:', error);
    });
});

// Load initial data
loadStudents();
