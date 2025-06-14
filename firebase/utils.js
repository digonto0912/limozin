import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Convert Firestore timestamps to ISO strings
const convertTimestamps = (data) => {
  const result = { ...data };
  for (let key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate().toISOString();
    }
  }
  return result;
};

// Fetch all records
export const fetchRecords = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'records'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    }));
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error;
  }
};

// Fetch a single record by ID
export const fetchRecord = async (id) => {
  try {
    const docRef = doc(db, 'records', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...convertTimestamps(docSnap.data())
      };
    } else {
      throw new Error('Record not found');
    }
  } catch (error) {
    console.error('Error fetching record:', error);
    throw error;
  }
};

// Add a new record
export const addRecord = async (record) => {
  try {
    const recordWithTimestamp = {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'records'), recordWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error adding record:', error);
    throw error;
  }
};

// Update an existing record
export const updateRecord = async (id, record) => {
  try {
    const docRef = doc(db, 'records', id);
    const recordWithTimestamp = {
      ...record,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, recordWithTimestamp);
    return id;
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
};

// Delete a record
export const deleteRecord = async (id) => {
  try {
    const docRef = doc(db, 'records', id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};
