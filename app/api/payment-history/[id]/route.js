import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { getCollectionName, isValidProduct, DEFAULT_PRODUCT_ID } from '../../../config/products';

// Helper to extract ID from URL path: /api/payment-history/[id]
function getPersonId(request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  // segments: ['api', 'payment-history', '<id>']
  return segments[2] || null;
}

// API route for fetching payment history by person ID
export async function GET(request) {
  try {
    const id = getPersonId(request);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;

    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const colName = getCollectionName(productId, 'paymentHistory');
    console.log(`Payment history API called with ID: ${id}, product: ${productId}, collection: ${colName}`);
    
    // Query the paymentHistory collection for this person
    const q = query(
      collection(db, colName), 
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
