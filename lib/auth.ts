import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'user' | 'admin' | 'guest';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
  skills: Record<string, SkillProgress>;
}

export interface SkillProgress {
  roundsCompleted: number[];
  credentials: string[];
  scores: Record<number, number>;
}

const googleProvider = new GoogleAuthProvider();

// Create or update user document in Firestore
export async function createUserDocument(
  firebaseUser: FirebaseUser,
  additionalData?: { role?: UserRole; displayName?: string }
): Promise<AppUser> {
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: Omit<AppUser, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: additionalData?.displayName || firebaseUser.displayName || 'Anonymous',
      photoURL: firebaseUser.photoURL,
      role: additionalData?.role || 'user',
      createdAt: serverTimestamp(),
      skills: {},
    };

    await setDoc(userRef, userData);

    return {
      ...userData,
      createdAt: new Date(),
    } as AppUser;
  }

  const existingData = userSnap.data();
  return {
    uid: existingData.uid,
    email: existingData.email,
    displayName: existingData.displayName,
    photoURL: existingData.photoURL,
    role: existingData.role || 'user',
    createdAt: existingData.createdAt?.toDate() || new Date(),
    skills: existingData.skills || {},
  } as AppUser;
}

// Get user from Firestore
export async function getUserDocument(uid: string): Promise<AppUser | null> {
  if (!db) return null;

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    role: data.role || 'user',
    createdAt: data.createdAt?.toDate() || new Date(),
    skills: data.skills || {},
  } as AppUser;
}

// Update user skill progress
export async function updateSkillProgress(
  uid: string,
  skillId: string,
  roundNumber: number,
  score: number,
  passed: boolean
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) throw new Error('User not found');

  const userData = userSnap.data();
  const skills = userData.skills || {};
  const skillProgress = skills[skillId] || { roundsCompleted: [], credentials: [], scores: {} };

  if (passed && !skillProgress.roundsCompleted.includes(roundNumber)) {
    skillProgress.roundsCompleted.push(roundNumber);
    skillProgress.roundsCompleted.sort((a: number, b: number) => a - b);
  }

  skillProgress.scores[roundNumber] = score;

  await setDoc(userRef, {
    ...userData,
    skills: {
      ...skills,
      [skillId]: skillProgress,
    },
  });
}

// Sign in with Google
export async function signInWithGoogle(): Promise<AppUser> {
  if (!auth) throw new Error('Auth not initialized');

  const result = await signInWithPopup(auth, googleProvider);
  return createUserDocument(result.user);
}

// Sign in with email/password
export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  if (!auth) throw new Error('Auth not initialized');

  const result = await signInWithEmailAndPassword(auth, email, password);
  return createUserDocument(result.user);
}

// Sign up with email/password
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<AppUser> {
  if (!auth) throw new Error('Auth not initialized');

  const result = await createUserWithEmailAndPassword(auth, email, password);

  // Update the user's display name
  await updateProfile(result.user, { displayName });

  return createUserDocument(result.user, { displayName });
}

// Sign out
export async function signOut(): Promise<void> {
  if (!auth) throw new Error('Auth not initialized');
  await firebaseSignOut(auth);
}

// Subscribe to auth state changes
export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}
