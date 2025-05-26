import { auth, db, storage } from './firebase-config.js';

class FirebaseService {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.storage = storage;
  }

  // Authentication methods
  async login(username, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(username, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Document methods
  async saveDocument(document) {
    try {
      const docRef = await this.db.collection('documents').add({
        ...document,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  async getDocuments(filters = {}) {
    try {
      let query = this.db.collection('documents');

      // Apply filters
      if (filters.sender) {
        query = query.where('sender', '==', filters.sender);
      }
      if (filters.recipient) {
        query = query.where('recipient', '==', filters.recipient);
      }
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  async updateDocumentStatus(docId, newStatus) {
    try {
      await this.db.collection('documents').doc(docId).update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  }

  // Department methods
  async getDepartments() {
    try {
      const snapshot = await this.db.collection('departments').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting departments:', error);
      throw error;
    }
  }

  async saveDepartment(department) {
    try {
      const docRef = await this.db.collection('departments').add({
        ...department,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving department:', error);
      throw error;
    }
  }

  async updateDepartment(departmentId, updates) {
    try {
      await this.db.collection('departments').doc(departmentId).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  // File storage methods
  async uploadFile(file, path) {
    try {
      const storageRef = this.storage.ref();
      const fileRef = storageRef.child(path);
      await fileRef.put(file);
      return await fileRef.getDownloadURL();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(path) {
    try {
      const storageRef = this.storage.ref();
      const fileRef = storageRef.child(path);
      await fileRef.delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService; 