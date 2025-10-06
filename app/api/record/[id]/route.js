import { NextResponse } from 'next/server';
import { fetchRecord, updateRecord, deleteRecord } from '../../../../firebase/utils';
import { requireRecordsAccess } from '../../middleware/auth';

export async function GET(request, { params }) {
  try {
    // Check if user has permission to view records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const record = await fetchRecord(params.id);
    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch record' }, 
      { status: error.message === 'Record not found' ? 404 : 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Check if user has permission to manage records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    const data = await request.json();
    await updateRecord(params.id, data);
    return NextResponse.json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json(
      { error: 'Failed to update record' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check if user has permission to manage records
    const authCheck = await requireRecordsAccess(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck.error, { status: authCheck.status });
    }

    await deleteRecord(params.id);
    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' }, 
      { status: 500 }
    );
  }
}
