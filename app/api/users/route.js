import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { MASTER_ADMIN_EMAIL, USER_ROLES, isMasterAdmin } from '../../../firebase/roles';
import { deleteFirebaseUser } from '../../../firebase/admin';

// Helper function to check if user has admin privileges
async function checkUserRole(userEmail) {
  if (isMasterAdmin(userEmail)) {
    return USER_ROLES.MASTER_ADMIN;
  }
  
  // Check if user exists in database and get their role
  const usersRef = collection(db, 'users');
  const userQuery = query(usersRef, where('email', '==', userEmail));
  const querySnapshot = await getDocs(userQuery);
  
  if (!querySnapshot.empty) {
    const userData = querySnapshot.docs[0].data();
    return userData.role || USER_ROLES.USER;
  }
  
  return USER_ROLES.USER;
}

// GET /api/users - Get all users (admin and master admin only)
export async function GET(request) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }
    
    // Check if user has admin privileges
    const userRole = await checkUserRole(userEmail);
    if (userRole !== USER_ROLES.ADMIN && userRole !== USER_ROLES.MASTER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all users from the users collection
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create or update user role
export async function POST(request) {
  try {
    const { targetUserEmail, role, action } = await request.json();
    const userEmail = request.headers.get('x-user-email');
    
    // Check if user is master admin
    if (userEmail !== MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized. Master admin access required.' },
        { status: 403 }
      );
    }

    if (!targetUserEmail || !role || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: targetUserEmail, role, action' },
        { status: 400 }
      );
    }

    // Prevent master admin from changing their own role
    if (targetUserEmail === MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Cannot modify master admin role' },
        { status: 400 }
      );
    }

    const usersRef = collection(db, 'users');
    
    if (action === 'promote' || action === 'demote' || action === 'update') {
      // Check if user exists
      const userQuery = query(usersRef, where('email', '==', targetUserEmail));
      const querySnapshot = await getDocs(userQuery);
      
      if (querySnapshot.empty) {
        // Create new user record
        await addDoc(usersRef, {
          email: targetUserEmail,
          role: role,
          updatedBy: userEmail,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing user
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          role: role,
          updatedBy: userEmail,
          updatedAt: new Date().toISOString()
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: `User ${targetUserEmail} ${action}d to ${role}` 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Delete user completely (master admin only)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserEmail = searchParams.get('email');
    const userEmail = request.headers.get('x-user-email');
    
    // Check if user is master admin
    if (userEmail !== MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized. Master admin access required.' },
        { status: 403 }
      );
    }

    if (!targetUserEmail) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
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

    const usersRef = collection(db, 'users');
    
    // Find and delete user from Firestore
    const userQuery = query(usersRef, where('email', '==', targetUserEmail));
    const querySnapshot = await getDocs(userQuery);
    
    let firestoreDeleted = false;
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, 'users', userDoc.id));
      firestoreDeleted = true;
    }

    // Attempt Firebase Auth user deletion
    const authDeletionResult = await deleteFirebaseUser(targetUserEmail);
    console.log(`User ${targetUserEmail} deletion result:`, authDeletionResult);

    return NextResponse.json({ 
      success: true, 
      message: `User ${targetUserEmail} has been deleted from the system`,
      details: {
        firestoreDeleted,
        authDeletionSuccess: authDeletionResult.success,
        authDeletionNote: authDeletionResult.success ? 'Firebase Auth user deleted' : authDeletionResult.error
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}