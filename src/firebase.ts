import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

const googleDriveProvider = new GoogleAuthProvider();
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleDriveProvider.setCustomParameters({
  prompt: 'consent select_account',
});

// Test connection to Firestore on boot as required
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithGoogleDrivePopup(): Promise<{
  user: User;
  accessToken?: string;
}> {
  const result = await signInWithPopup(auth, googleDriveProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  return {
    user: result.user,
    accessToken: credential?.accessToken || undefined,
  };
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function saveCloudBackupForUser(
  user: User,
  payloadObj: Record<string, unknown>,
  updatedAtLabel: string
): Promise<void> {
  const backupRef = doc(db, 'salonBackups', user.uid);
  await setDoc(backupRef, {
    ownerId: user.uid,
    ownerEmail: user.email || 'unknown@gmail.com',
    payloadJson: JSON.stringify(payloadObj),
    updatedAt: updatedAtLabel,
  });
}

export async function loadCloudBackupForUser(
  user: User
): Promise<{ data: any; updatedAt: string } | null> {
  const backupRef = doc(db, 'salonBackups', user.uid);
  const snap = await getDoc(backupRef);
  if (!snap.exists()) {
    return null;
  }
  const docData = snap.data();
  return {
    data: JSON.parse(docData.payloadJson),
    updatedAt: docData.updatedAt || '',
  };
}

export async function uploadBackupToGoogleDrive(
  accessToken: string,
  payloadObj: Record<string, unknown>
): Promise<boolean> {
  try {
    const fileName = 'LSA_Kuafor_Yedek.json';
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `name='${fileName}' and trashed=false`
      )}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!searchRes.ok) return false;
    const searchData = await searchRes.json();
    const existingFileId = searchData.files?.[0]?.id;

    const fileContent = JSON.stringify(payloadObj, null, 2);
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    const uploadUrl = existingFileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const uploadRes = await fetch(uploadUrl, {
      method: existingFileId ? 'PATCH' : 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });

    return uploadRes.ok;
  } catch {
    return false;
  }
}

export async function downloadBackupFromGoogleDrive(
  accessToken: string
): Promise<any | null> {
  try {
    const fileName = 'LSA_Kuafor_Yedek.json';
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `name='${fileName}' and trashed=false`
      )}&fields=files(id,name,modifiedTime)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const fileId = searchData.files?.[0]?.id;
    if (!fileId) return null;

    const fileRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!fileRes.ok) return null;
    return await fileRes.json();
  } catch {
    return null;
  }
}
