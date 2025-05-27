import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';

// Your Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Department operations
async function saveDepartment(department) {
    try {
        const departmentsRef = collection(db, 'departments');
        
        // Check if this is the WTEI admin account
        if (department.username === 'wteiadmin') {
            // Ensure role is set to admin
            department.role = 'admin';
            department.isDefault = true;
            department.status = 'Active';
        }
        
        // Ensure no restricted permissions are set
        const departmentData = {
            ...department,
            allowedRecipients: [], // Empty array means no restrictions
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(departmentsRef, departmentData);
        return docRef.id;
    } catch (error) {
        console.error('Error saving department:', error);
        throw error;
    }
}

async function getDepartments() {
    try {
        const departmentsRef = collection(db, 'departments');
        const querySnapshot = await getDocs(departmentsRef);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting departments:', error);
        throw error;
    }
}

async function updateDepartment(username, updates) {
    try {
        const departmentsRef = collection(db, 'departments');
        const q = query(departmentsRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('Department not found');
        }

        // Prevent modifying WTEI admin account properties
        if (username === 'wteiadmin') {
            const { role, isDefault, status, ...safeUpdates } = updates;
            updates = safeUpdates;
        }

        const docRef = doc(db, 'departments', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating department:', error);
        throw error;
    }
}

async function deleteDepartment(username) {
    try {
        // Prevent deleting WTEI admin account
        if (username === 'wteiadmin') {
            throw new Error('Cannot delete WTEI admin account');
        }

        const departmentsRef = collection(db, 'departments');
        const q = query(departmentsRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('Department not found');
        }

        const docRef = doc(db, 'departments', querySnapshot.docs[0].id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting department:', error);
        throw error;
    }
}

// Document operations
async function saveDocument(document) {
    try {
        const documentsRef = collection(db, 'documents');
        const docRef = await addDoc(documentsRef, {
            ...document,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving document:', error);
        throw error;
    }
}

async function getDocuments(filters = {}) {
    try {
        const documentsRef = collection(db, 'documents');
        let q = documentsRef;

        // Apply filters
        if (filters.sender) {
            q = query(q, where('sender', '==', filters.sender));
        }
        if (filters.recipient) {
            q = query(q, where('recipient', '==', filters.recipient));
        }
        if (filters.status) {
            q = query(q, where('status', '==', filters.status));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting documents:', error);
        throw error;
    }
}

async function updateDocumentStatus(docId, newStatus) {
    try {
        const docRef = doc(db, 'documents', docId);
        await updateDoc(docRef, {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating document status:', error);
        throw error;
    }
}

// File operations
async function uploadFile(file, path) {
    try {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Authentication
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// Real-time listeners
function setupRealtimeListeners() {
    // Listen for document changes
    const documentsRef = collection(db, 'documents');
    onSnapshot(documentsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                console.log('New document:', change.doc.data());
                // Trigger UI update for new document
                window.dispatchEvent(new CustomEvent('documentAdded', { 
                    detail: { document: change.doc.data() }
                }));
            }
            if (change.type === 'modified') {
                console.log('Modified document:', change.doc.data());
                // Trigger UI update for modified document
                window.dispatchEvent(new CustomEvent('documentModified', { 
                    detail: { document: change.doc.data() }
                }));
            }
            if (change.type === 'removed') {
                console.log('Removed document:', change.doc.data());
                // Trigger UI update for removed document
                window.dispatchEvent(new CustomEvent('documentRemoved', { 
                    detail: { document: change.doc.data() }
                }));
            }
        });
    });

    // Listen for department changes
    const departmentsRef = collection(db, 'departments');
    onSnapshot(departmentsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                console.log('New department:', change.doc.data());
                // Trigger UI update for new department
                window.dispatchEvent(new CustomEvent('departmentAdded', { 
                    detail: { department: change.doc.data() }
                }));
            }
            if (change.type === 'modified') {
                console.log('Modified department:', change.doc.data());
                // Trigger UI update for modified department
                window.dispatchEvent(new CustomEvent('departmentModified', { 
                    detail: { department: change.doc.data() }
                }));
            }
            if (change.type === 'removed') {
                console.log('Removed department:', change.doc.data());
                // Trigger UI update for removed department
                window.dispatchEvent(new CustomEvent('departmentRemoved', { 
                    detail: { department: change.doc.data() }
                }));
            }
        });
    });
}

// Initialize real-time listeners when the app starts
document.addEventListener('DOMContentLoaded', () => {
    setupRealtimeListeners();
});

// Export the functions
const firebaseService = {
    saveDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
    saveDocument,
    getDocuments,
    updateDocumentStatus,
    uploadFile,
    login,
    logout
};

export default firebaseService; 