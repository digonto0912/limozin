import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../firebase/config';

// API route for fetching payment history by person ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log('Payment history API called with ID:', id);
    
    // Query the paymentHistory collection for this person
    const q = query(
      collection(db, 'paymentHistory'), 
      where('personId', '==', id)
    );
    
    const querySnapshot = await getDocs(q);
    const paymentHistory = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`Found ${paymentHistory.length} payment records for person ${id}`);
    return NextResponse.json(paymentHistory);
    
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history', details: error.message },
      { status: 500 }
    );
  }
}
