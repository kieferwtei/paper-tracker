// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZvA2cP5pJxzmM4TXdkwxXYj6_TqgfGo0",
  authDomain: "papertrackingsystem.firebaseapp.com",
  projectId: "papertrackingsystem",
  storageBucket: "papertrackingsystem.firebasestorage.app",
  messagingSenderId: "158222197299",
  appId: "1:158222197299:web:2e9547fa981d6dc4c73946",
  measurementId: "G-190L3DMR76"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export Firebase services
export { auth, db, storage }; 