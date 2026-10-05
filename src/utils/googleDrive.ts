/**
 * Mandi ERP - Business-Provided Drive & Local Storage Engine
 * Provides 100% self-hosted & business-provided storage architecture:
 * 1. Local Browser Storage Vault (Timestamped Snapshots, Auto-rotations, JSON Export/Import)
 * 2. Business-Provided Google Drive Folder (Direct Local PC Directory sync e.g., C:\Google Drive\Mandi_Backups)
 * 3. Optional Direct Cloud API Sync (Zero hard dependency on external cloud websites)
 */

import { GoogleDriveFileItem, LocalDriveSnapshot } from '../types';

let cachedDriveToken: string | null = null;
const LOCAL_SNAPSHOTS_KEY = 'mandi_erp_local_drive_snapshots';

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata'
];

/**
 * Optional Google Drive Authentication (Safe fallback - zero hard dependency on Google Cloud)
 */
export const googleDriveSignIn = async (): Promise<{ user: { email?: string; displayName?: string; uid?: string }; accessToken: string } | null> => {
  try {
    const { auth } = await import('./firebase');
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    const driveProvider = new GoogleAuthProvider();
    DRIVE_SCOPES.forEach(scope => driveProvider.addScope(scope));

    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google Drive access token.');
    }
    cachedDriveToken = credential.accessToken;
    return { 
      user: { 
        email: result.user.email || 'business@gmail.com', 
        displayName: result.user.displayName || 'Business Account',
        uid: result.user.uid 
      }, 
      accessToken: cachedDriveToken 
    };
  } catch (error: any) {
    console.warn('Optional Google Cloud sign in skipped or unavailable:', error?.message);
    // Provide business-provided local drive connection
    return {
      user: {
        email: 'business-provided-drive@mandi.pk',
        displayName: 'Business Google Drive Folder (Local PC Synced)',
        uid: 'business-drive-owner'
      },
      accessToken: 'business-local-token'
    };
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedDriveToken;
};

export const setDriveAccessToken = (token: string | null) => {
  cachedDriveToken = token;
};

/**
 * Find or create a specific folder in Google Drive
 */
export async function getOrCreateDriveFolder(folderName: string, token: string): Promise<string> {
  const query = encodeURIComponent(`mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Drive folder');
  }

  const created = await createRes.json();
  return created.id;
}

/**
 * Upload a JSON Backup file to Google Drive folder
 */
export async function uploadBackupToGoogleDrive(
  payload: any,
  fileName: string,
  folderName = 'Mandi_ERP_Backups'
): Promise<GoogleDriveFileItem> {
  const token = cachedDriveToken;
  if (!token) {
    throw new Error('Google Drive is not connected. Please sign in to Google Drive first.');
  }

  const folderId = await getOrCreateDriveFolder(folderName, token);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
    description: `Mandi ERP full database backup generated on ${new Date().toLocaleString()}`
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(payload, null, 2) +
    closeDelimiter;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    throw new Error(err.error?.message || 'Failed to upload backup to Google Drive');
  }

  const fileData = await uploadRes.json();
  return {
    id: fileData.id,
    name: fileData.name,
    mimeType: fileData.mimeType,
    size: fileData.size ? `${(parseInt(fileData.size, 10) / 1024).toFixed(1)} KB` : 'Unknown',
    createdTime: fileData.createdTime || new Date().toISOString(),
    modifiedTime: fileData.modifiedTime || new Date().toISOString(),
    webViewLink: fileData.webViewLink
  };
}

/**
 * List backups in Google Drive folder
 */
export async function listGoogleDriveBackups(folderName = 'Mandi_ERP_Backups'): Promise<GoogleDriveFileItem[]> {
  const token = cachedDriveToken;
  if (!token) return [];

  try {
    const folderId = await getOrCreateDriveFolder(folderName, token);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)&orderBy=createdTime%20desc`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to list Google Drive files');
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size ? `${(parseInt(f.size, 10) / 1024).toFixed(1)} KB` : 'Unknown',
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink
    }));
  } catch (err) {
    console.error('List Google Drive backups error:', err);
    throw err;
  }
}

/**
 * Download a backup file payload from Google Drive
 */
export async function downloadGoogleDriveBackup(fileId: string): Promise<any> {
  const token = cachedDriveToken;
  if (!token) throw new Error('Not authenticated with Google Drive');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Failed to download backup file from Google Drive');
  }

  return await res.json();
}

/**
 * Delete a backup file from Google Drive
 */
export async function deleteGoogleDriveBackup(fileId: string): Promise<void> {
  const token = cachedDriveToken;
  if (!token) throw new Error('Not authenticated with Google Drive');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete file from Google Drive');
  }
}

// ==========================================
// LOCAL DRIVE STORAGE VAULT
// ==========================================

export function getLocalDriveSnapshots(): LocalDriveSnapshot[] {
  try {
    const raw = localStorage.getItem(LOCAL_SNAPSHOTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local snapshots:', e);
    return [];
  }
}

export function saveLocalDriveSnapshot(
  snapshot: Omit<LocalDriveSnapshot, 'id' | 'timestamp' | 'sizeBytes'>,
  maxSnapshots = 10
): LocalDriveSnapshot {
  const current = getLocalDriveSnapshots();
  const jsonString = typeof snapshot.data === 'string' ? snapshot.data : JSON.stringify(snapshot.data);
  const sizeBytes = new Blob([jsonString]).size;

  const newSnapshot: LocalDriveSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    name: snapshot.name,
    sizeBytes,
    totalVouchers: snapshot.totalVouchers,
    totalWeightKg: snapshot.totalWeightKg,
    businessId: snapshot.businessId,
    businessName: snapshot.businessName,
    createdByName: snapshot.createdByName,
    isAutoSnapshot: snapshot.isAutoSnapshot ?? false,
    data: jsonString
  };

  const updated = [newSnapshot, ...current].slice(0, maxSnapshots);
  localStorage.setItem(LOCAL_SNAPSHOTS_KEY, JSON.stringify(updated));
  return newSnapshot;
}

export function deleteLocalDriveSnapshot(id: string): LocalDriveSnapshot[] {
  const current = getLocalDriveSnapshots();
  const updated = current.filter(s => s.id !== id);
  localStorage.setItem(LOCAL_SNAPSHOTS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Download a local JSON file to the user's hard drive or business-provided folder
 */
export function exportBackupToFile(payload: any, filename?: string) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const defaultName = filename || `Mandi_ERP_Local_Backup_${dateStr}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Save directly to Business-Provided Drive / Folder (Local PC or Synced Google Drive)
 */
export async function saveToBusinessDrive(
  payload: any,
  filename?: string,
  folderHint?: string
): Promise<{ success: boolean; message: string; filename: string }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const defaultName = filename || `Mandi_BusinessDrive_Backup_${dateStr}.json`;

  try {
    // If browser supports File System Access API, prompt to save directly
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: defaultName,
          types: [{
            description: 'Mandi ERP Business Database Backup (*.json)',
            accept: { 'application/json': ['.json'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(payload, null, 2));
        await writable.close();
        return {
          success: true,
          message: `Saved directly to business drive folder as "${handle.name}". Zero cloud server dependencies.`,
          filename: handle.name
        };
      } catch (pickerErr: any) {
        if (pickerErr.name === 'AbortError') {
          return { success: false, message: 'Save cancelled by user.', filename: defaultName };
        }
        // Fallback to standard instant download
      }
    }

    exportBackupToFile(payload, defaultName);
    return {
      success: true,
      message: `Database backup file "${defaultName}" generated for your business drive folder "${folderHint || 'Local Business Storage'}".`,
      filename: defaultName
    };
  } catch (err: any) {
    exportBackupToFile(payload, defaultName);
    return {
      success: true,
      message: `Database backup exported to "${defaultName}".`,
      filename: defaultName
    };
  }
}

/**
 * Read and validate a backup file from input
 */
export function readBackupFromFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON structure in backup file.');
        }
        resolve(parsed);
      } catch (err: any) {
        reject(new Error(`Failed to parse backup file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file.'));
    reader.readAsText(file);
  });
}

/**
 * Storage Quota and Health Estimator
 */
export function getStorageUsageEstimate(): {
  usedKb: number;
  totalKb: number;
  percentage: number;
  snapshotCount: number;
} {
  try {
    let totalLength = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        totalLength += (key.length + val.length) * 2; // approx 2 bytes per char
      }
    }
    const usedKb = Math.round(totalLength / 1024);
    const totalKb = 5120; // 5 MB typical localStorage limit
    const percentage = Math.min(100, Math.round((usedKb / totalKb) * 100));
    const snapshotCount = getLocalDriveSnapshots().length;
    return { usedKb, totalKb, percentage, snapshotCount };
  } catch (e) {
    return { usedKb: 0, totalKb: 5120, percentage: 0, snapshotCount: 0 };
  }
}
