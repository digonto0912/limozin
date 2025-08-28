import { NextResponse } from 'next/server';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export async function POST(request) {
  try {
    const paymentData = await request.json();
    console.log('Adding payment record:', paymentData);
    
    const record = {
      ...paymentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'paymentHistory'), record);
    console.log('Payment record added with ID:', docRef.id);
    
    return NextResponse.json({ id: docRef.id, ...record }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment record:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment record', 
      details: error.message 
    }, { status: 500 });
  }
}
