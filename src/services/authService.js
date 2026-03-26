import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile } from './userService';
import { createLead } from './leadService';

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function registerWithEmail(email, password, profileData) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  await createUserProfile(user.uid, {
    email: user.email,
    ...profileData,
    role: 'owner',
    plan: 'basic',
    createdAt: new Date(),
  });

  // Automatically capture this signup as a Lead in the pipeline
  await createLead({
    name:         profileData.name || '',
    email:        user.email,
    businessName: profileData.business || '',
    phone:        profileData.phone || '',
    source:       'register',
    stage:        'NEW',
    planInterest: 'basic',
    userId:       user.uid,
  });

  return user;
}

export async function logout() {
  await signOut(auth);
}
