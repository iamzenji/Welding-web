import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

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

const questionForm = document.getElementById('questionForm');
const questionText = document.getElementById('questionText');
const optionA = document.getElementById('optionA');
const optionB = document.getElementById('optionB');
const optionC = document.getElementById('optionC');
const optionD = document.getElementById('optionD');
const correctAnswer = document.getElementById('correctAnswer');
const questionsTable = document.getElementById('questionsTable').getElementsByTagName('tbody')[0];
const deleteQuestionModal = document.getElementById('deleteQuestion');
const confirmDeleteButton = document.getElementById('confirmDeleteButtonQuestion');
const entriesQuizCount = document.getElementById('entriesQuizCount');
const previousQuestionPage = document.getElementById('previousQuestionPage');
const nextQuestionPage = document.getElementById('nextQuestionPage');

let editMode = false;
let editKey = null;
let deleteKey = null;
let currentPage = 1;
let entriesPerPage = 5;

// Open question modal
document.getElementById('openQuestionModalButton').addEventListener('click', () => {
  editMode = false;
  questionForm.reset();
  $('#questionModal').modal('show');
});

// Submit question form
questionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const questionData = {
    question: questionText.value,
    optionA: optionA.value,
    optionB: optionB.value,
    optionC: optionC.value,
    optionD: optionD.value,
    correctAnswer: correctAnswer.value
  };

  if (editMode) {
    const updates = {};
    updates['/questions/' + editKey] = questionData;
    update(ref(db), updates)
      .then(() => {
        $('#questionModal').modal('hide');
        questionForm.reset();
        editMode = false;
        editKey = null;
        loadQuestions();
      })
      .catch((error) => {
        console.error('Error updating question:', error);
      });
  } else {
    const newQuestionRef = push(ref(db, 'questions'));
    set(newQuestionRef, questionData)
      .then(() => {
        $('#questionModal').modal('hide');
        questionForm.reset();
        loadQuestions();
      })
      .catch((error) => {
        console.error('Error adding question:', error);
      });
  }
});

// Load questions from Firebase
function loadQuestions() {
  onValue(ref(db, 'questions'), (snapshot) => {
    const questions = [];
    snapshot.forEach((childSnapshot) => {
      const questionData = childSnapshot.val();
      questions.push({ key: childSnapshot.key, ...questionData });
    });

    displayQuestions(questions);
  });
}

// Display questions in the table with pagination
function displayQuestions(questions) {
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, questions.length);
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  questionsTable.innerHTML = '';
  let questionIndex = startIndex + 1;

  paginatedQuestions.forEach((question) => {
    const row = questionsTable.insertRow();
    row.insertCell(0).textContent = questionIndex++;
    row.insertCell(1).textContent = question.question;
    row.insertCell(2).textContent = question.optionA;
    row.insertCell(3).textContent = question.optionB;
    row.insertCell(4).textContent = question.optionC;
    row.insertCell(5).textContent = question.optionD;
    row.insertCell(6).textContent = question.correctAnswer;

    const actionsCell = row.insertCell(7);

    // Edit button
    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.classList.add('btn', 'btn-warning', 'mr-2');
    editButton.addEventListener('click', () => {
      editMode = true;
      editKey = question.key;
      questionText.value = question.question;
      optionA.value = question.optionA;
      optionB.value = question.optionB;
      optionC.value = question.optionC;
      optionD.value = question.optionD;
      correctAnswer.value = question.correctAnswer;
      $('#questionModal').modal('show');
    });
    actionsCell.appendChild(editButton);

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.addEventListener('click', () => {
      deleteKey = question.key;
      $('#deleteQuestion').modal('show');
    });
    actionsCell.appendChild(deleteButton);
  });

  // Update pagination buttons
  previousQuestionPage.disabled = currentPage === 1;
  nextQuestionPage.disabled = endIndex >= questions.length;
}

// Delete question
confirmDeleteButton.addEventListener('click', () => {
  if (deleteKey) {
    remove(ref(db, 'questions/' + deleteKey))
      .then(() => {
        $('#deleteQuestion').modal('hide');
        loadQuestions();
      })
      .catch((error) => {
        console.error('Error deleting question:', error);
      });
  }
});

// Change entries per page
entriesQuizCount.addEventListener('change', (e) => {
  entriesPerPage = e.target.value === 'All' ? Number.MAX_SAFE_INTEGER : parseInt(e.target.value);
  currentPage = 1; 
  loadQuestions();
});

// Pagination controls
nextQuestionPage.addEventListener('click', () => {
  currentPage++;
  loadQuestions();
});

previousQuestionPage.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadQuestions();
  }
});

// Load questions on page load
window.addEventListener('load', loadQuestions);
