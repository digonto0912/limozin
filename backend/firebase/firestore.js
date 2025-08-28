import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';

// Load environment variables first
dotenv.config({ path: '.env.local' });

// Logger function
const log = (action, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Firebase ${action}:`, details);
};

// Error logger
const logError = (action, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Firebase Error (${action}):`, {
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Log Firebase initialization attempt
log('Initialization', {
  hasConfig: {
    apiKey: !!firebaseConfig.apiKey,
    projectId: !!firebaseConfig.projectId,
    environment: process.env.NODE_ENV
  }
});

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  log('Success', { projectId: firebaseConfig.projectId });
} catch (error) {
  logError('Initialization', error);
  throw error;
}

export const fetchRecords = async () => {
  try {
    log('fetchRecords', 'Starting fetch');
    const querySnapshot = await getDocs(collection(db, 'records'));
    const records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    log('fetchRecords', { count: records.length });
    return records;
  } catch (error) {
    logError('fetchRecords', error);
    throw error;
  }
};

export const fetchRecord = async (id) => {
  try {
    log('fetchRecord', { id });
    const docRef = doc(db, 'records', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const record = {
        id: docSnap.id,
        ...docSnap.data()
      };
      log('fetchRecord', { found: true, id });
      return record;
    }
    
    log('fetchRecord', { found: false, id });
    return null;
  } catch (error) {
    logError('fetchRecord', error);
    throw error;
  }
};

export const addRecord = async (data) => {
  try {
    log('addRecord', { data });
    const docRef = await addDoc(collection(db, 'records'), data);
    const newRecord = {
      id: docRef.id,
      ...data
    };
    log('addRecord', { success: true, id: docRef.id });
    return newRecord;
  } catch (error) {
    logError('addRecord', error);
    throw error;
  }
};

export const updateRecord = async (id, data) => {
  try {
    log('updateRecord', { id, data });
    const docRef = doc(db, 'records', id);
    await updateDoc(docRef, data);
    const updatedRecord = {
      id,
      ...data
    };
    log('updateRecord', { success: true, id });
    return updatedRecord;
  } catch (error) {
    logError('updateRecord', error);
    throw error;
  }
};

export const deleteRecord = async (id) => {
  try {
    log('deleteRecord', { id });
    const docRef = doc(db, 'records', id);
    await deleteDoc(docRef);
    log('deleteRecord', { success: true, id });
  } catch (error) {
    logError('deleteRecord', error);
    throw error;
  }
};

// Get payment history for a specific person
export const getPaymentHistory = async (personId) => {
  try {
    log('getPaymentHistory', { personId });
    const q = query(
      collection(db, 'paymentHistory'), 
      where('personId', '==', personId)
    );
    const querySnapshot = await getDocs(q);
    const paymentHistory = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    log('getPaymentHistory', { count: paymentHistory.length, personId });
    return paymentHistory;
  } catch (error) {
    logError('getPaymentHistory', error);
    throw error;
  }
};

// Add a payment record
export const addPaymentRecord = async (paymentData) => {
  try {
    log('addPaymentRecord', { paymentData });
    const paymentWithTimestamp = {
      ...paymentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'paymentHistory'), paymentWithTimestamp);
    const newPaymentRecord = {
      id: docRef.id,
      ...paymentWithTimestamp
    };
    log('addPaymentRecord', { success: true, id: docRef.id });
    return newPaymentRecord;
  } catch (error) {
    logError('addPaymentRecord', error);
    throw error;
  }
};

export default {
  fetchRecords,
  fetchRecord,
  addRecord,
  updateRecord,
  deleteRecord,
  getPaymentHistory,
  addPaymentRecord
};
