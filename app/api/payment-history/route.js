import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { requireRecordsAccess } from '../middleware/auth';
import { getCollectionName, isValidProduct, DEFAULT_PRODUCT_ID } from '../../config/products';

// GET /api/payment-history?personId=xxx&product=xxx
export async function GET(request) {
  try {
    // Check if user has permission to access payment data
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;
    
    if (!personId) {
      return NextResponse.json({ error: 'personId is required' }, { status: 400 });
    }

    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    
    const colName = getCollectionName(productId, 'paymentHistory');
    console.log(`Payment history API called with personId: ${personId}, product: ${productId}, collection: ${colName}`);
    
    // Query the paymentHistory collection for this person
    const q = query(
      collection(db, colName), 
      where('personId', '==', personId)
    );
    
    const querySnapshot = await getDocs(q);
    const paymentHistory = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`Found ${paymentHistory.length} payment records for person ${personId}`);
    return NextResponse.json(paymentHistory);
    
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/payment-history?product=xxx
export async function POST(request) {
  try {
    // Check if user has permission to manage payment records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;
    
    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const colName = getCollectionName(productId, 'paymentHistory');
    const paymentData = await request.json();
    console.log(`Adding payment record to ${colName}:`, paymentData);
    
    const record = {
      ...paymentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, colName), record);
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
