// @ts-nocheck
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { RoundResult } from './store';

export interface AttemptRecord {
  userId: string;
  skillId: string;
  round: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: number[];
  createdAt: Timestamp;
  completedAt: Timestamp;
}

export interface CredentialRecord {
  userId: string;
  skillId: string;
  skillTitle: string;
  blockchainHash: string;
  rounds: Array<{
    round: number;
    score: number;
    percentage: number;
  }>;
  issuedAt: Timestamp;
  expiresAt: Timestamp;
  isVerified: boolean;
  views: number;
  shareCount: number;
  publicShareUrl?: string;
}

/**
 * Save quiz attempt to Firestore
 */
export async function saveAttempt(attempt: Omit<AttemptRecord, 'createdAt' | 'completedAt'>) {
  try {
    const attemptRef = collection(db, 'attempts');
    const docRef = await addDoc(attemptRef, {
      ...attempt,
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving attempt:', error);
    throw error;
  }
}

/**
 * Get attempts for a user and skill
 */
export async function getAttempts(userId: string, skillId: string) {
  try {
    const attemptsRef = collection(db, 'attempts');
    const q = query(
      attemptsRef,
      where('userId', '==', userId),
      where('skillId', '==', skillId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AttemptRecord & { id: string }));
  } catch (error) {
    console.error('Error getting attempts:', error);
    throw error;
  }
}

/**
 * Create credential after completing all rounds
 */
export async function createCredential(credential: CredentialRecord) {
  try {
    const credentialsRef = collection(db, 'credentials');
    const docRef = await addDoc(credentialsRef, {
      ...credential,
      issuedAt: Timestamp.now(),
      expiresAt: new Timestamp(credential.expiresAt.seconds, credential.expiresAt.nanoseconds),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating credential:', error);
    throw error;
  }
}

/**
 * Get credentials for a user
 */
export async function getUserCredentials(userId: string) {
  try {
    const credentialsRef = collection(db, 'credentials');
    const q = query(credentialsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CredentialRecord & { id: string }));
  } catch (error) {
    console.error('Error getting credentials:', error);
    throw error;
  }
}

/**
 * Get credential by blockchain hash
 */
export async function getCredentialByHash(blockchainHash: string) {
  try {
    const credentialsRef = collection(db, 'credentials');
    const q = query(credentialsRef, where('blockchainHash', '==', blockchainHash));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as CredentialRecord & { id: string };
  } catch (error) {
    console.error('Error getting credential by hash:', error);
    throw error;
  }
}

/**
 * Increment credential views
 */
export async function incrementCredentialViews(credentialId: string) {
  try {
    const credentialRef = doc(db, 'credentials', credentialId);
    const credentialDoc = await getDoc(credentialRef);
    if (credentialDoc.exists()) {
      const currentViews = credentialDoc.data().views || 0;
      await updateDoc(credentialRef, { views: currentViews + 1 });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
    throw error;
  }
}

/**
 * Check if user passed all rounds for a skill
 */
export async function hasPassedAllRounds(userId: string, skillId: string): Promise<boolean> {
  try {
    const attempts = await getAttempts(userId, skillId);
    const passedRounds = new Set();
    
    attempts.forEach((attempt) => {
      if (attempt.passed) {
        passedRounds.add(attempt.round);
      }
    });
    
    // Check if all 3 rounds passed
    return passedRounds.has(1) && passedRounds.has(2) && passedRounds.has(3);
  } catch (error) {
    console.error('Error checking rounds:', error);
    return false;
  }
}
