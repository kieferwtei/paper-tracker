// Import Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZvA2cP5pJxzmM4TXdkwxXYj6_TqgfGo0",
  authDomain: "papertrackingsystem.firebaseapp.com",
  databaseURL: "https://papertrackingsystem-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "papertrackingsystem",
  storageBucket: "papertrackingsystem.firebasestorage.app",
  messagingSenderId: "158222197299",
  appId: "1:158222197299:web:2e9547fa981d6dc4c73946",
  measurementId: "G-190L3DMR76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services
export { auth, db, storage }; 