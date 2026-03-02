import { NextResponse } from 'next/server';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { requireRecordsAccess } from '../middleware/auth';
import { getCollectionName, isValidProduct, DEFAULT_PRODUCT_ID } from '../../config/products';

export async function POST(request) {
  try {
    // Check if user has permission to manage records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    // Extract product from query params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;
    
    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const colName = getCollectionName(productId, 'records');
    const recordData = await request.json();
    const record = {
      ...recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, colName), record);
    return NextResponse.json({ id: docRef.id, ...record }, { status: 201 });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
