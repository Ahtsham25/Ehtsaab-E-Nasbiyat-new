/**
 * IndexedDB storage for offline & uploaded PDF files
 */

const DB_NAME = 'IhtisabNasbiyatDB';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_books';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save PDF Blob/File into IndexedDB for a given volume ID
 */
export async function savePdfToStorage(volumeId: number, file: Blob | File): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const key = `volume_${volumeId}`;
    const request = store.put(file, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve stored PDF Blob for a given volume ID
 */
export async function getPdfFromStorage(volumeId: number): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const key = `volume_${volumeId}`;
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

/**
 * Check if a volume has a stored local PDF
 */
export async function hasStoredPdf(volumeId: number): Promise<boolean> {
  const blob = await getPdfFromStorage(volumeId);
  return !!blob;
}

/**
 * Delete stored PDF for a given volume ID
 */
export async function deletePdfFromStorage(volumeId: number): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const key = `volume_${volumeId}`;
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // ignore
  }
}
