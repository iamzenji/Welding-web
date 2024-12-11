// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

// Import Admin Email Config
import { adminConfig } from './config.js';

// Firebase Configuration
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
const auth = getAuth(app);

// Helper function to hash passwords
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

//for teachers
const teachersRef = ref(db, 'teachers');


const LogIn = document.getElementById("Login");
const Loader = document.getElementById("loading");

// Login function
LogIn.addEventListener("click", async function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    Loader.style.display = "block";


    if (email === adminConfig.email) {
        try {
            // Admin login using Firebase Auth
            await signInWithEmailAndPassword(auth, email, password);
            sessionStorage.setItem("adminEmail", email);
            window.location.assign("./admin.html#dashboard");
        } catch (error) {
            document.getElementById("error").innerHTML = "Invalid email or password.";
            Loader.style.display = "none";
        }
    } else {
        // Hash the input password to compare with Firebase database
        const hashedPassword = await hashPassword(password);

        // Check if the user is a teacher in the Firebase Realtime Database
        onValue(teachersRef, (snapshot) => {
            let teacherFound = false;

            snapshot.forEach((childSnapshot) => {
                const teacher = childSnapshot.val();
                if (teacher.email === email && teacher.password === hashedPassword) {
                    teacherFound = true;
                    localStorage.setItem("teacherEmail", email);
                }
            });

            if (teacherFound) {
                window.location.assign("./teacher.html#dashboard");
            } else {
                document.getElementById("error").innerHTML = "Invalid email or password.";
            }

            Loader.style.display = "none";
        });
    }
});

// Disable
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});
document.addEventListener('keydown', function(event) {
    if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && event.keyCode === 73)) {
        event.preventDefault(); 
    }
});
