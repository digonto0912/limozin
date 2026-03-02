import { NextResponse } from 'next/server';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { getCollectionName, isValidProduct, DEFAULT_PRODUCT_ID } from '../../../config/products';

// Helper to extract record ID from URL path: /api/records/[id]
function getRecordId(request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  // segments: ['api', 'records', '<id>']
  return segments[2] || null;
}

export async function PUT(request) {
  try {
    const id = getRecordId(request);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;
    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const colName = getCollectionName(productId, 'records');
    const recordData = await request.json();
    const record = {
      ...recordData,
      updatedAt: new Date().toISOString()
    };
    const docRef = doc(db, colName, id);
    await updateDoc(docRef, record);
    return NextResponse.json({ id, ...record });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = getRecordId(request);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;
    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const colName = getCollectionName(productId, 'records');
    const docRef = doc(db, colName, id);
    await deleteDoc(docRef);
    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
