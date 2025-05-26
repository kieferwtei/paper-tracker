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

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });

// Set up security rules
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Export Firebase services
export { auth, db, storage };

// Security rules for Firestore
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users
    match /documents/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Department access rules
    match /departments/{departmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.departmentId == departmentId);
    }
  }
}
*/

// Security rules for Storage
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
*/ 