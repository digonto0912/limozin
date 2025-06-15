import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const fetchRecords = async () => {
  const querySnapshot = await getDocs(collection(db, 'records'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
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
