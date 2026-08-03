import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  sendSignInLinkToEmail
} from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigData.appId
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const configObj = firebaseConfigData as unknown as { firestoreDatabaseId?: string };

// Initialize Firestore with fallback to getFirestore if already initialized
const firestoreSettings = { experimentalForceLongPolling: true };
export const db = (() => {
  try {
    return configObj.firestoreDatabaseId 
      ? initializeFirestore(app, firestoreSettings, configObj.firestoreDatabaseId)
      : initializeFirestore(app, firestoreSettings);
  } catch (e) {
    return configObj.firestoreDatabaseId 
      ? getFirestore(app, configObj.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces Google to display account chooser with all device accounts
});

// Real Google Auth Function
export async function loginWithGoogleReal() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      user: {
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        email: user.email || '',
        avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email || 'user')}&backgroundColor=dc2626&textColor=ffffff`,
        provider: 'google' as const,
        loggedInAt: new Date().toISOString()
      }
    };
  } catch (error: any) {
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: false, isRedirecting: true };
      } catch (redirectErr: any) {
        return {
          success: false,
          error: redirectErr?.message || 'Google Auth Redirect failed',
          code: redirectErr?.code
        };
      }
    }

    if (error?.code !== 'auth/popup-closed-by-user') {
      console.warn('Google Auth Notice:', error?.code, error?.message);
    }

    return {
      success: false,
      error: error?.code === 'auth/popup-closed-by-user' 
        ? 'Sign-in popup was closed.' 
        : (error?.message || 'Google Auth failed'),
      code: error?.code
    };
  }
}

export { getRedirectResult };

// Helper to strictly validate if an email is real and has a legitimate domain
export function validateRealEmail(email: string): { isValid: boolean; message: string; isGmail: boolean } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { isValid: false, message: 'Please enter an email address.', isGmail: false };
  }

  // Basic email structure regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, message: 'Invalid email format (e.g. name@gmail.com).', isGmail: false };
  }

  const [localPart, domain] = cleanEmail.split('@');

  // Disallowed fake or throwaway dummy domains
  const blockedDomains = [
    'test.com', 'abc.com', 'example.com', 'fake.com', 'asdf.com', 
    'foo.com', 'xyz.com', '123.com', 'tempmail.com', 'mailinator.com', 
    'dispostable.com', '10minutemail.com', 'guerrillamail.com', 'a.com', 'b.com', 
    'c.com', 'aaa.com', 'bbb.com', 'ccc.com', 'sample.com', 'demo.com'
  ];

  if (blockedDomains.includes(domain)) {
    return { 
      isValid: false, 
      message: 'Dummy or fake email domains are not allowed. Please enter your real email address!', 
      isGmail: false 
    };
  }

  if (localPart.length < 3) {
    return { isValid: false, message: 'Email username is too short (minimum 3 characters).', isGmail: false };
  }

  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';

  if (isGmail) {
    // Gmail username rules: 5-30 characters, letters, numbers, dots, no consecutive dots
    if (localPart.length < 5 || localPart.length > 30) {
      return { 
        isValid: false, 
        message: 'Gmail username must be between 5 and 30 characters long.', 
        isGmail: true 
      };
    }
    if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
      return { 
        isValid: false, 
        message: 'Gmail username cannot contain consecutive dots or start/end with a dot.', 
        isGmail: true 
      };
    }
    return { isValid: true, message: 'Valid Google Gmail address', isGmail: true };
  }

  return { isValid: true, message: 'Valid email format detected', isGmail: false };
}

// Check if an email is already registered in Firebase Authentication
export async function checkFirebaseEmailExists(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { exists: false, methods: [], isGoogle: false };
    }
    const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
    return {
      exists: methods.length > 0,
      methods,
      isGoogle: methods.includes('google.com')
    };
  } catch (err: any) {
    console.warn('Email check notice:', err?.code, err?.message);
    return { exists: false, methods: [], isGoogle: false };
  }
}

// Real Email Auth Function (Registers & Authenticates in Firebase Authentication + Firestore)
export async function authenticateWithEmailReal(email: string, pass: string, isSignUp: boolean, name?: string) {
  // Validate email format strictly
  const validation = validateRealEmail(email);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.message
    };
  }

  try {
    let userCredential;
    if (isSignUp) {
      // Direct Sign Up Flow
      userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      // Send real Firebase verification email to user's Gmail inbox
      try {
        await sendEmailVerification(userCredential.user);
        console.log('Firebase Verification Email dispatched to:', email);
      } catch (verifyErr) {
        console.warn('Notice sending Firebase verification email:', verifyErr);
      }
    } else {
      // Direct Sign In Flow - Strict authentication
      userCredential = await signInWithEmailAndPassword(auth, email, pass);
    }

    const firebaseUser = userCredential.user;
    const resolvedName = firebaseUser.displayName || name || email.split('@')[0];

    // Save/Sync user profile to Firestore `users` collection
    await saveUserToFirestore({
      name: resolvedName,
      email: firebaseUser.email || email,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=dc2626&textColor=ffffff`,
      provider: 'email'
    }).catch(err => console.warn('Notice saving user to Firestore:', err));

    return {
      success: true,
      user: {
        name: resolvedName,
        email: firebaseUser.email || email,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=dc2626&textColor=ffffff`,
        provider: 'email' as const,
        loggedInAt: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.warn('Firebase Email Auth Notice:', error?.code, error?.message);
    let friendlyMessage = error?.message || 'Authentication error';

    if (error?.code === 'auth/email-already-in-use') {
      friendlyMessage = '⚠️ An account already exists with this email address. Please click Sign In below!';
    } else if (error?.code === 'auth/user-not-found') {
      friendlyMessage = '⚠️ No account found with this email. Please click Sign Up below to create an account!';
    } else if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
      friendlyMessage = '⚠️ Incorrect password or credentials. If you do not have an account, please click Sign Up below!';
    } else if (error?.code === 'auth/invalid-email') {
      friendlyMessage = '⚠️ Invalid email address. Please enter a real active Gmail address.';
    } else if (error?.code === 'auth/weak-password') {
      friendlyMessage = '⚠️ Password is too weak. Please use at least 6 characters.';
    }

    return {
      success: false,
      error: friendlyMessage,
      code: error?.code
    };
  }
}

// Types
export interface FirestoreProject {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  videoType: 'youtube' | 'direct';
  thumbnail: string;
  views: string;
  likes: string;
  description: string;
  createdAt?: string;
}

export interface FirestoreUser {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: string;
  lastLogin: string;
}

export interface FirestoreLead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  budget: string;
  message: string;
  status: string;
  createdAt: string;
}

// User Sign-In Storage in Firestore
export async function saveUserToFirestore(user: { name: string; email: string; avatarUrl?: string; provider: string }) {
  try {
    const userDocId = user.email.replace(/[^a-zA-Z0-9]/g, '_');
    const userRef = doc(db, 'users', userDocId);
    
    // 3 second timeout guard
    const savePromise = setDoc(userRef, {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
      provider: user.provider,
      lastLogin: new Date().toISOString(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore operation timed out')), 3500)
    );

    await Promise.race([savePromise, timeoutPromise]);
    console.log('User logged in & saved to Firestore:', user.email);
  } catch (err) {
    console.warn('Notice saving user to Firestore (non-blocking):', err);
  }
}

// Projects Firestore Operations
export async function fetchProjectsFromFirestore(): Promise<FirestoreProject[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projectsList: FirestoreProject[] = [];
    querySnapshot.forEach((docSnap) => {
      projectsList.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FirestoreProject);
    });
    return projectsList;
  } catch (err) {
    console.warn('Notice fetching projects from Firestore:', err);
    return [];
  }
}

export function subscribeProjectsFromFirestore(callback: (projects: FirestoreProject[]) => void) {
  try {
    const q = collection(db, 'projects');
    return onSnapshot(q, (snapshot) => {
      const list: FirestoreProject[] = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        } as FirestoreProject);
      });
      callback(list);
    }, (err) => {
      console.warn('Real-time projects listener notice:', err);
    });
  } catch (err) {
    console.warn('Notice subscribing to projects:', err);
    return () => {};
  }
}

export async function saveProjectToFirestore(project: Omit<FirestoreProject, 'id'> & { id?: string }): Promise<string | null> {
  try {
    if (project.id) {
      const docRef = doc(db, 'projects', project.id);
      await setDoc(docRef, { ...project, createdAt: project.createdAt || new Date().toISOString() }, { merge: true });
      return project.id;
    } else {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...project,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (err) {
    console.warn('Notice saving project to Firestore:', err);
    return null;
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
    return true;
  } catch (err) {
    console.warn('Notice deleting project from Firestore:', err);
    return false;
  }
}

// Leads Firestore Operations
export async function saveLeadToFirestore(lead: Omit<FirestoreLead, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...lead,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    console.warn('Notice saving lead to Firestore:', err);
    return null;
  }
}

export async function fetchLeadsFromFirestore(): Promise<FirestoreLead[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'leads'));
    const leadsList: FirestoreLead[] = [];
    querySnapshot.forEach((docSnap) => {
      leadsList.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FirestoreLead);
    });
    return leadsList;
  } catch (err) {
    console.warn('Notice fetching leads from Firestore:', err);
    return [];
  }
}

export async function deleteLeadFromFirestore(leadId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'leads', leadId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Notice deleting lead from Firestore:', err);
    return false;
  }
}

