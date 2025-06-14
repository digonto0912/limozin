import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './config';

export const fetchRecords = async () => {
  const querySnapshot = await getDocs(collection(db, 'records'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addRecord = async (record) => {
  return await addDoc(collection(db, 'records'), record);
};

export const updateRecord = async (id, record) => {
  const docRef = doc(db, 'records', id);
  await updateDoc(docRef, record);
};

export const deleteRecord = async (id) => {
  const docRef = doc(db, 'records', id);
  await deleteDoc(docRef);
};
