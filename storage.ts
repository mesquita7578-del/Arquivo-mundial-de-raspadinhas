
import { ArchiveImage, Album } from './types';

const DB_NAME = 'VisionaryArchiveDB';
const STORE_IMAGES = 'images';
const STORE_ALBUMS = 'albums';

export class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_ALBUMS)) {
          db.createObjectStore(STORE_ALBUMS, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onerror = () => reject('Erro ao abrir DB');
    });
  }

  async saveImage(img: ArchiveImage): Promise<void> {
    const tx = this.db!.transaction(STORE_IMAGES, 'readwrite');
    tx.objectStore(STORE_IMAGES).put(img);
    return new Promise((res) => tx.oncomplete = () => res());
  }

  async getAllImages(): Promise<ArchiveImage[]> {
    const tx = this.db!.transaction(STORE_IMAGES, 'readonly');
    const request = tx.objectStore(STORE_IMAGES).getAll();
    return new Promise((res) => request.onsuccess = () => res(request.result));
  }

  async deleteImage(id: string): Promise<void> {
    const tx = this.db!.transaction(STORE_IMAGES, 'readwrite');
    tx.objectStore(STORE_IMAGES).delete(id);
    return new Promise((res) => tx.oncomplete = () => res());
  }
}

export const storage = new StorageService();
