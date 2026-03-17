import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile } from './userService';

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
  return user;
}

export async function logout() {
  await signOut(auth);
}
