import { NextResponse } from 'next/server';
import { fetchRecord, updateRecord, deleteRecord } from '../../../../firebase/utils';
import { requireRecordsAccess } from '../../middleware/auth';
import { isValidProduct, DEFAULT_PRODUCT_ID } from '../../../config/products';

// Helper to extract record ID from URL path: /api/record/[id]
function getRecordId(request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  // segments: ['api', 'record', '<id>']
  return segments[2] || null;
}

export async function GET(request) {
  try {
    const id = getRecordId(request);
    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    // Check if user has permission to view records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;
    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const record = await fetchRecord(id, productId);
    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch record', details: error.message }, 
      { status: error.message === 'Record not found' ? 404 : 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const id = getRecordId(request);
    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    // Check if user has permission to manage records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;
    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const data = await request.json();
    // Remove id from data to avoid storing it as a field in Firestore
    const { id: _id, ...recordData } = data;
    await updateRecord(id, recordData, productId);
    return NextResponse.json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json(
      { error: 'Failed to update record', details: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const id = getRecordId(request);
    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    // Check if user has permission to manage records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product') || DEFAULT_PRODUCT_ID;
    if (!isValidProduct(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await deleteRecord(id, productId);
    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record', details: error.message }, 
      { status: 500 }
    );
  }
}
