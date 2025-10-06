import { NextResponse } from 'next/server';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { requireRecordsAccess } from '../middleware/auth';

export async function POST(request) {
  try {
    // Check if user has permission to manage records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const recordData = await request.json();
    const record = {
      ...recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'records'), record);
    return NextResponse.json({ id: docRef.id, ...record }, { status: 201 });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
