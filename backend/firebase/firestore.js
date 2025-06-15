import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Add error handling for Firebase initialization
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  console.error('Firebase Config:', {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  });
}

export const fetchRecords = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'records'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error;
  }
};

export const fetchRecord = async (id) => {
  const docRef = doc(db, 'records', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  return null;
};

export const addRecord = async (data) => {
  const docRef = await addDoc(collection(db, 'records'), data);
  return {
    id: docRef.id,
    ...data
  };
};

export const updateRecord = async (id, data) => {
  const docRef = doc(db, 'records', id);
  await updateDoc(docRef, data);
  return {
    id,
    ...data
  };
};

export const deleteRecord = async (id) => {
  const docRef = doc(db, 'records', id);
  await deleteDoc(docRef);
};

export default {
  fetchRecords,
  fetchRecord,
  addRecord,
  updateRecord,
  deleteRecord
};
