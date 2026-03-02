import { NextResponse } from 'next/server';
import { fetchRecords } from '../../../firebase/utils';
import { requireRecordsAccess } from '../middleware/auth';
import { isValidProduct, DEFAULT_PRODUCT_ID } from '../../config/products';

export async function GET(request) {
  try {
    // Check if user has permission to access records
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

    const records = await fetchRecords(productId);
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}
