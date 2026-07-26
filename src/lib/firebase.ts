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
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const configObj = firebaseConfig as unknown as { firestoreDatabaseId?: string };

// Initialize Firestore with specific database ID if provided in config, or default
export const db = configObj.firestoreDatabaseId 
  ? getFirestore(app, configObj.firestoreDatabaseId)
  : getFirestore(app);

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
    await setDoc(userRef, {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || '',
      provider: user.provider,
      lastLogin: new Date().toISOString(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('User logged in & saved to Firestore:', user.email);
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
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
