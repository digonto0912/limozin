import { NextResponse } from 'next/server';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { MASTER_ADMIN_EMAIL } from '../../../../firebase/roles';
import { deleteFirebaseUser } from '../../../../firebase/admin';

// DELETE /api/users/[uid] - Delete user completely including Firebase Auth
export async function DELETE(request, { params }) {
  try {
    const { uid } = params;
    const userEmail = request.headers.get('x-user-email');
    const targetUserEmail = request.headers.get('x-target-email');
    
    // Check if user is master admin
    if (userEmail !== MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized. Master admin access required.' },
        { status: 403 }
      );
    }

    if (!targetUserEmail) {
      return NextResponse.json(
        { error: 'Target user email is required in headers' },
        { status: 400 }
      );
    }

    // Prevent master admin from deleting their own account
    if (targetUserEmail === MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Cannot delete master admin account' },
        { status: 400 }
      );
    }

    // Delete user from Firestore users collection
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', targetUserEmail));
    const querySnapshot = await getDocs(userQuery);
    
    let firestoreDeleted = false;
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, 'users', userDoc.id));
      firestoreDeleted = true;
    }

    // Delete related user records (if any)
    const recordsRef = collection(db, 'records');
    const recordsQuery = query(recordsRef, where('createdBy', '==', targetUserEmail));
    const recordsSnapshot = await getDocs(recordsQuery);
    
    let recordsDeleted = 0;
    for (const recordDoc of recordsSnapshot.docs) {
      await deleteDoc(doc(db, 'records', recordDoc.id));
      recordsDeleted++;
    }

    // Delete payment history related to this user
    const paymentRef = collection(db, 'paymentHistory');
    const paymentQuery = query(paymentRef, where('personName', '==', targetUserEmail));
    const paymentSnapshot = await getDocs(paymentQuery);
    
    let paymentsDeleted = 0;
    for (const paymentDoc of paymentSnapshot.docs) {
      await deleteDoc(doc(db, 'paymentHistory', paymentDoc.id));
      paymentsDeleted++;
    }

    // Attempt Firebase Auth user deletion
    const authDeletionResult = await deleteFirebaseUser(targetUserEmail);
    console.log(`Complete deletion requested for user: ${targetUserEmail}`);
    console.log(`Auth deletion result:`, authDeletionResult);

    return NextResponse.json({ 
      success: true, 
      message: `User ${targetUserEmail} and all associated data has been deleted`,
      details: {
        firestoreUserDeleted: firestoreDeleted,
        recordsDeleted,
        paymentsDeleted,
        authDeletionStatus: authDeletionResult.success ? 'Completed' : authDeletionResult.error,
        authDeletionSuccess: authDeletionResult.success
      }
    });

  } catch (error) {
    console.error('Error during complete user deletion:', error);
    return NextResponse.json(
      { error: 'Failed to completely delete user', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/users/[uid] - Get specific user details
export async function GET(request, { params }) {
  try {
    const { uid } = params;
    const userEmail = request.headers.get('x-user-email');
    
    // Check if user is master admin
    if (userEmail !== MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized. Master admin access required.' },
        { status: 403 }
      );
    }

    // Get user from Firestore
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', uid));
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}