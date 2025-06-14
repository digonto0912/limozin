import { NextResponse } from 'next/server';
import { fetchRecords } from '../../../firebase/utils';

export async function GET() {
  try {
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
