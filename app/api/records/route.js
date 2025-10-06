import { NextResponse } from 'next/server';
import { fetchRecords } from '../../../firebase/utils';
import { requireRecordsAccess } from '../middleware/auth';

export async function GET(request) {
  try {
    // Check if user has permission to access records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const records = await fetchRecords();
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}
