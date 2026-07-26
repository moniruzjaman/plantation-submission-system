/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Configuration fetched from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyA3E8bB_FhajESmOi0IQcpW7wzLQne11qs",
  authDomain: "divine-builder-492605-j7.firebaseapp.com",
  projectId: "divine-builder-492605-j7",
  storageBucket: "divine-builder-492605-j7.firebasestorage.app",
  messagingSenderId: "1073841706415",
  appId: "1:1073841706415:web:4a5df8347a147175eacb5a"
};

const DATABASE_ID = "ai-studio-plantationsubmis-f16dc9c2-0fd4-4b94-be3b-53597b63aebd";

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, DATABASE_ID);

// Core test connection validate function matching the firebase-integration skill constraint
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await getDocFromServer(testDocRef);
    console.log("Firebase connection verified successfully.");
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Please check your Firebase configuration or internet connection. Client is offline.");
    } else {
      console.log("Firebase connection initialized. Read-check resolved safely.");
    }
    return false;
  }
}

// Run connectivity check on module load
testFirebaseConnection();
