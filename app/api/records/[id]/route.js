import { NextResponse } from 'next/server';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/config';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const recordData = await request.json();
    const record = {
      ...recordData,
      updatedAt: new Date().toISOString()
    };
    const docRef = doc(db, 'records', id);
    await updateDoc(docRef, record);
    return NextResponse.json({ id, ...record });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const docRef = doc(db, 'records', id);
    await deleteDoc(docRef);
    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
