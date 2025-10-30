import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';
import { USER_ROLES, isMasterAdmin } from './roles';

/**
 * Creates or updates user record in Firestore when they authenticate
 * @param {Object} user - Firebase Auth user object
 */
export const ensureUserInFirestore = async (user) => {
  if (!user) {
    console.log('No user provided to ensureUserInFirestore');
    return null;
  }

  console.log('Ensuring user in Firestore:', { uid: user.uid, email: user.email });

  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timeout')), 5000);
    });

    const operation = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      console.log('Getting user document from Firestore...');
      
      const userDoc = await getDoc(userDocRef);
      console.log('User document exists:', userDoc.exists());

      // Determine user role
      let role = USER_ROLES.USER;
      if (isMasterAdmin(user.email)) {
        role = USER_ROLES.MASTER_ADMIN;
        console.log('User is master admin');
      }

      const userData = {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: role,
        lastSignIn: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (userDoc.exists()) {
        // User exists, update last sign in and other info
        const existingData = userDoc.data();
        console.log('Updating existing user in Firestore...');
        
        await setDoc(userDocRef, {
          ...existingData,
          email: user.email, // Ensure email is up to date
          displayName: user.displayName || existingData.displayName || '',
          photoURL: user.photoURL || existingData.photoURL || '',
          lastSignIn: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log('Updated existing user in Firestore:', user.email);
        return { ...existingData, ...userData };
      } else {
        // New user, create record
        console.log('Creating new user in Firestore...');
        userData.createdAt = new Date().toISOString();
        await setDoc(userDocRef, userData);
        
        console.log('Created new user in Firestore:', user.email);
        return userData;
      }
    };

    return await Promise.race([operation(), timeoutPromise]);
  } catch (error) {
    console.error('Error ensuring user in Firestore:', error);
    
    // In production, we should still allow the user to proceed
    if (process.env.NODE_ENV === 'production') {
      console.warn('Firestore operation failed in production - continuing with auth flow');
    }
    
    return null;
  }
};

/**
 * Gets user data from Firestore
 * @param {string} uid - User UID
 */
export const getUserFromFirestore = async (uid) => {
  if (!uid) return null;

  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
};