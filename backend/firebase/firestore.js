const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } = require('firebase/firestore');

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

const fetchRecords = async () => {
  const querySnapshot = await getDocs(collection(db, 'records'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const addRecord = async (record) => {
  return await addDoc(collection(db, 'records'), record);
};

const updateRecord = async (id, record) => {
  const docRef = doc(db, 'records', id);
  await updateDoc(docRef, record);
};

const deleteRecord = async (id) => {
  const docRef = doc(db, 'records', id);
  await deleteDoc(docRef);
};

module.exports = {
  db,
  fetchRecords,
  addRecord,
  updateRecord,
  deleteRecord
};
