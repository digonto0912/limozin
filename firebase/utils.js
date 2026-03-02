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
import { getCollectionName, DEFAULT_PRODUCT_ID } from '../app/config/products';

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

/**
 * Resolve the Firestore collection name for a product
 * @param {string} baseCollection - 'records' or 'paymentHistory'
 * @param {string} productId - Product slug
 * @returns {string} Firestore collection name
 */
const resolveCollection = (baseCollection, productId) => {
  return getCollectionName(productId || DEFAULT_PRODUCT_ID, baseCollection);
};

// Fetch all records for a product
export const fetchRecords = async (productId) => {
  const col = resolveCollection('records', productId);
  try {
    const querySnapshot = await getDocs(collection(db, col));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    }));
  } catch (error) {
    console.error(`Error fetching records from ${col}:`, error);
    throw error;
  }
};

// Fetch a single record by ID
export const fetchRecord = async (id, productId) => {
  const col = resolveCollection('records', productId);
  try {
    const docRef = doc(db, col, id);
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
    console.error(`Error fetching record from ${col}:`, error);
    throw error;
  }
};

// Add a new record
export const addRecord = async (record, productId) => {
  const col = resolveCollection('records', productId);
  try {
    const recordWithTimestamp = {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, col), recordWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding record to ${col}:`, error);
    throw error;
  }
};

// Update an existing record
export const updateRecord = async (id, record, productId) => {
  const col = resolveCollection('records', productId);
  try {
    const docRef = doc(db, col, id);
    const recordWithTimestamp = {
      ...record,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, recordWithTimestamp);
    return id;
  } catch (error) {
    console.error(`Error updating record in ${col}:`, error);
    throw error;
  }
};

// Delete a record
export const deleteRecord = async (id, productId) => {
  const col = resolveCollection('records', productId);
  try {
    const docRef = doc(db, col, id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error(`Error deleting record from ${col}:`, error);
    throw error;
  }
};

// Get payment history for a specific person
export const getPaymentHistory = async (personId, productId) => {
  const col = resolveCollection('paymentHistory', productId);
  try {
    const q = query(
      collection(db, col), 
      where('personId', '==', personId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error(`Error fetching payment history from ${col}:`, error);
    throw error;
  }
};

// Add a payment record
export const addPaymentRecord = async (paymentData, productId) => {
  const col = resolveCollection('paymentHistory', productId);
  try {
    const paymentWithTimestamp = {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, col), paymentWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding payment record to ${col}:`, error);
    throw error;
  }
};
