/**
 * IndexedDB Offline Storage for Sikhi Vidhya
 * ============================================================================
 * Persistent offline storage for Gurbani data, Nitnem Banis, and Hukamnama.
 * Uses IndexedDB directly (no dependencies) for maximum reliability.
 * 
 * Stores:
 * - gurbani-angs: Cached Ang pages from BaniDB
 * - nitnem-banis: Full Nitnem Bani content
 * - hukamnama: Daily Hukamnama (cached by date)
 * - user-preferences: Reading position, settings
 * ============================================================================
 */

const DB_NAME = 'sikhi-vidhya-offline';
const DB_VERSION = 2;

// Store names
const STORES = {
  ANGS: 'gurbani-angs',
  BANIS: 'nitnem-banis',
  HUKAMNAMA: 'hukamnama',
  PREFERENCES: 'user-preferences',
  SEARCH_CACHE: 'search-cache',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Gurbani Angs store - keyed by ang number
      if (!db.objectStoreNames.contains(STORES.ANGS)) {
        const angStore = db.createObjectStore(STORES.ANGS, { keyPath: 'angNumber' });
        angStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Nitnem Banis store - keyed by baniId
      if (!db.objectStoreNames.contains(STORES.BANIS)) {
        const baniStore = db.createObjectStore(STORES.BANIS, { keyPath: 'baniId' });
        baniStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Hukamnama store - keyed by date string
      if (!db.objectStoreNames.contains(STORES.HUKAMNAMA)) {
        db.createObjectStore(STORES.HUKAMNAMA, { keyPath: 'date' });
      }

      // User preferences store - key-value pairs
      if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
        db.createObjectStore(STORES.PREFERENCES, { keyPath: 'key' });
      }

      // Search cache store
      if (!db.objectStoreNames.contains(STORES.SEARCH_CACHE)) {
        const searchStore = db.createObjectStore(STORES.SEARCH_CACHE, { keyPath: 'query' });
        searchStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// ============================================================================
// Gurbani Ang Storage
// ============================================================================

export async function saveAng(angNumber: number, data: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.ANGS, 'readwrite');
    const store = tx.objectStore(STORES.ANGS);
    store.put({
      angNumber,
      data,
      timestamp: Date.now(),
    });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to save Ang to IndexedDB:', error);
  }
}

export async function getAng(angNumber: number): Promise<unknown | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.ANGS, 'readonly');
    const store = tx.objectStore(STORES.ANGS);
    const request = store.get(angNumber);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function getCachedAngCount(): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.ANGS, 'readonly');
    const store = tx.objectStore(STORES.ANGS);
    const request = store.count();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return 0;
  }
}

export async function getAllCachedAngNumbers(): Promise<number[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.ANGS, 'readonly');
    const store = tx.objectStore(STORES.ANGS);
    const request = store.getAllKeys();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as number[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

// ============================================================================
// Nitnem Bani Storage
// ============================================================================

export async function saveBani(baniId: number, data: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.BANIS, 'readwrite');
    const store = tx.objectStore(STORES.BANIS);
    store.put({
      baniId,
      data,
      timestamp: Date.now(),
    });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to save Bani to IndexedDB:', error);
  }
}

export async function getBani(baniId: number): Promise<unknown | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.BANIS, 'readonly');
    const store = tx.objectStore(STORES.BANIS);
    const request = store.get(baniId);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function getAllCachedBaniIds(): Promise<number[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.BANIS, 'readonly');
    const store = tx.objectStore(STORES.BANIS);
    const request = store.getAllKeys();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as number[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

// ============================================================================
// Hukamnama Storage
// ============================================================================

export async function saveHukamnama(date: string, data: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.HUKAMNAMA, 'readwrite');
    const store = tx.objectStore(STORES.HUKAMNAMA);
    store.put({ date, data, timestamp: Date.now() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to save Hukamnama to IndexedDB:', error);
  }
}

export async function getHukamnama(date: string): Promise<unknown | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.HUKAMNAMA, 'readonly');
    const store = tx.objectStore(STORES.HUKAMNAMA);
    const request = store.get(date);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

// ============================================================================
// User Preferences Storage
// ============================================================================

export async function savePreference(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.PREFERENCES, 'readwrite');
    const store = tx.objectStore(STORES.PREFERENCES);
    store.put({ key, value, timestamp: Date.now() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to save preference:', error);
  }
}

export async function getPreference(key: string): Promise<unknown | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.PREFERENCES, 'readonly');
    const store = tx.objectStore(STORES.PREFERENCES);
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

// ============================================================================
// Search Cache Storage
// ============================================================================

export async function saveSearchResults(query: string, data: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SEARCH_CACHE, 'readwrite');
    const store = tx.objectStore(STORES.SEARCH_CACHE);
    store.put({ query, data, timestamp: Date.now() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to save search results:', error);
  }
}

export async function getSearchResults(query: string): Promise<unknown | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SEARCH_CACHE, 'readonly');
    const store = tx.objectStore(STORES.SEARCH_CACHE);
    const request = store.get(query);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        // Search cache expires after 1 hour
        if (result && Date.now() - result.timestamp < 3600000) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

// ============================================================================
// Cache Management
// ============================================================================

export async function getOfflineStats(): Promise<{
  angsCached: number;
  banisCached: number;
  hasHukamnama: boolean;
  estimatedSizeMB: number;
}> {
  try {
    const angCount = await getCachedAngCount();
    const baniIds = await getAllCachedBaniIds();
    const today = new Date().toISOString().split('T')[0];
    const hukamnama = await getHukamnama(today);

    // Rough estimate: ~50KB per ang, ~100KB per bani
    const estimatedSizeMB = (angCount * 50 + baniIds.length * 100) / 1024;

    return {
      angsCached: angCount,
      banisCached: baniIds.length,
      hasHukamnama: !!hukamnama,
      estimatedSizeMB: Math.round(estimatedSizeMB * 10) / 10,
    };
  } catch {
    return { angsCached: 0, banisCached: 0, hasHukamnama: false, estimatedSizeMB: 0 };
  }
}

export async function clearAllOfflineData(): Promise<void> {
  try {
    const db = await openDB();
    const storeNames = [STORES.ANGS, STORES.BANIS, STORES.HUKAMNAMA, STORES.SEARCH_CACHE];
    
    for (const storeName of storeNames) {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch (error) {
    console.error('Failed to clear offline data:', error);
  }
}
