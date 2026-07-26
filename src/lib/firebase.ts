import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
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
  signInWithPopup 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const configObj = firebaseConfig as unknown as { firestoreDatabaseId?: string };

// Initialize Firestore with specific database ID if provided in config, or default
export const db = configObj.firestoreDatabaseId 
  ? getFirestore(app, configObj.firestoreDatabaseId)
  : getFirestore(app);

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
    console.error('Google Auth Error:', error);
    return {
      success: false,
      error: error?.message || 'Google Auth failed',
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
    console.error('Error fetching projects from Firestore:', err);
    return [];
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
    console.error('Error saving project to Firestore:', err);
    return null;
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
    return true;
  } catch (err) {
    console.error('Error deleting project from Firestore:', err);
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
    console.error('Error saving lead to Firestore:', err);
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
    console.error('Error fetching leads from Firestore:', err);
    return [];
  }
}
