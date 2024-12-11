// admin.js

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

// References for teachers
const teachersRef = ref(db, 'teachers');

// Show the modal when the "Register Teacher" button is clicked
document.getElementById('openRegisterTeacherModalButton').addEventListener('click', function() {
  $('#registerTeacherModal').modal('show');
});

// Function to register a teacher
document.getElementById('registerTeacherForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const firstName = document.getElementById('teacherFirstName').value.trim();
  const lastName = document.getElementById('teacherLastName').value.trim();
  const email = document.getElementById('teacherEmail').value.trim();
  const password = document.getElementById('teacherPassword').value.trim();
  
  if (firstName && lastName && email && password) {
    const hashedPassword = await hashPassword(password); // Hash the password

    push(teachersRef, { firstName, lastName, email, password: hashedPassword })
      .then(() => {
        $('#registerTeacherModal').modal('hide');
        document.getElementById('registerTeacherForm').reset();
        loadTeachers(); // Refresh the teacher list
      })
      .catch(error => {
        console.error('Error registering teacher:', error);
      });
  }
});

// Function to load teachers and populate the table
function loadTeachers() {
  onValue(teachersRef, (snapshot) => {
    const teachersTableBody = document.getElementById('teachersTable').getElementsByTagName('tbody')[0];
    teachersTableBody.innerHTML = ''; // Clear existing rows

    snapshot.forEach((childSnapshot) => {
      const teacher = childSnapshot.val();
      const teacherId = childSnapshot.key;

      const row = teachersTableBody.insertRow();
      row.insertCell(0).textContent = teacher.firstName;
      row.insertCell(1).textContent = teacher.lastName;
      row.insertCell(2).textContent = teacher.email;

      // Actions column
      const actionsCell = row.insertCell(3);
      actionsCell.innerHTML = `
        <button class="btn btn-warning btn-sm edit-teacher-btn" data-id="${teacherId}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm delete-teacher-btn" data-id="${teacherId}">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
    });

    // Attach event listeners to Edit and Delete buttons
    document.querySelectorAll('.edit-teacher-btn').forEach(button => {
      button.addEventListener('click', handleEditTeacherClick);
    });

    document.querySelectorAll('.delete-teacher-btn').forEach(button => {
      button.addEventListener('click', handleDeleteTeacherClick);
    });
  });
}

// Function to handle Edit button click for teachers
function handleEditTeacherClick(event) {
  const teacherId = event.currentTarget.getAttribute('data-id');
  const teacherRef = ref(db, `teachers/${teacherId}`);

  onValue(teacherRef, (snapshot) => {
    const teacher = snapshot.val();
    
    document.getElementById('editTeacherFirstName').value = teacher.firstName;
    document.getElementById('editTeacherLastName').value = teacher.lastName;
    document.getElementById('editTeacherEmail').value = teacher.email;
    document.getElementById('editTeacherPassword').value = ''; // Don't show hashed password
    document.getElementById('editTeacherId').value = teacherId;

    $('#editTeacherModal').modal('show');
  });
}

// Function to handle Edit form submission for teachers
document.getElementById('editTeacherForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const teacherId = document.getElementById('editTeacherId').value;
  const updatedPassword = document.getElementById('editTeacherPassword').value.trim();

  let updatedTeacher = {
    firstName: document.getElementById('editTeacherFirstName').value.trim(),
    lastName: document.getElementById('editTeacherLastName').value.trim(),
    email: document.getElementById('editTeacherEmail').value.trim(),
  };

  if (updatedPassword) {
    updatedTeacher.password = await hashPassword(updatedPassword); // Update hashed password
  }

  update(ref(db, `teachers/${teacherId}`), updatedTeacher)
    .then(() => {
      $('#editTeacherModal').modal('hide');
      document.getElementById('editTeacherForm').reset();
      loadTeachers(); // Refresh the teacher list
    })
    .catch(error => {
      console.error('Error updating teacher:', error);
    });
});

// Function to handle Delete button click for teachers
function handleDeleteTeacherClick(event) {
  const teacherId = event.currentTarget.getAttribute('data-id');
  document.getElementById('deleteTeacherId').value = teacherId;
  $('#deleteTeacherModal').modal('show');
}

// Function to handle Delete confirmation for teachers
document.getElementById('confirmDeleteTeacherButton').addEventListener('click', function() {
  const teacherId = document.getElementById('deleteTeacherId').value;

  remove(ref(db, `teachers/${teacherId}`))
    .then(() => {
      $('#deleteTeacherModal').modal('hide');
      loadTeachers(); // Refresh the teacher list
    })
    .catch(error => {
      console.error('Error deleting teacher:', error);
    });
});

// Load teachers initially
loadTeachers();
