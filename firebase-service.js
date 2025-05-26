import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.x.x/firebase-storage.js';

// Your Firebase configuration
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
        
        const docRef = await addDoc(departmentsRef, {
            ...department,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
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

// Export the functions
export default {
    saveDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
    saveDocument,
    getDocuments,
    updateDocumentStatus,
    uploadFile
}; 