import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { MASTER_ADMIN_EMAIL, USER_ROLES } from '../../../../firebase/roles';

// POST /api/users/roles - Manage user roles
export async function POST(request) {
  try {
    const { email: targetEmail, role, action } = await request.json();
    const userEmail = request.headers.get('x-user-email');
    
    // Check if user is master admin
    if (userEmail !== MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized. Master admin access required.' },
        { status: 403 }
      );
    }

    if (!targetEmail || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Prevent master admin from changing their own role
    if (targetEmail === MASTER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Cannot modify master admin role' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const usersRef = collection(db, 'users');
    
    // Check if user exists (try email-based search for existing users)
    const userQuery = query(usersRef, where('email', '==', targetEmail));
    const querySnapshot = await getDocs(userQuery);
    
    const userData = {
      email: targetEmail,
      role: role,
      updatedBy: userEmail,
      updatedAt: new Date().toISOString()
    };

    if (querySnapshot.empty) {
      // Create new user record using addDoc (for backward compatibility)
      userData.createdAt = new Date().toISOString();
      const docRef = await addDoc(usersRef, userData);
      console.log('Created new user record with ID:', docRef.id);
    } else {
      // Update existing user
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), userData);
      console.log('Updated existing user record:', userDoc.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${targetEmail} role updated to ${role}`,
      user: userData
    });

  } catch (error) {
    console.error('Error managing user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}