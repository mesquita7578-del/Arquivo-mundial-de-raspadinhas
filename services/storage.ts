import { ScratchcardData } from "../types";

const DB_NAME = 'raspadinhas-archive-db';
const DB_VERSION = 2; // Increment version to trigger upgrade
const STORE_NAME = 'items';

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Database error:", event);
        reject("Erro ao abrir base de dados");
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        let store: IDBObjectStore;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Create object store with 'id' as key path
          store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        } else {
          store = (event.target as IDBOpenDBRequest).transaction!.objectStore(STORE_NAME);
        }

        // Create index for sorting by Date
        if (!store.indexNames.contains('createdAt')) {
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async getAll(): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject("Erro ao buscar items");
      };
    });
  }

  // New method for Pagination
  async getRecent(limit: number, offset: number = 0): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      // Use index if available, otherwise fallback to store
      const source = store.indexNames.contains('createdAt') 
        ? store.index('createdAt') 
        : store;
      
      const request = source.openCursor(null, 'prev'); // 'prev' for descending order (newest first)
      const results: ScratchcardData[] = [];
      let hasSkipped = false;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (!cursor) {
          resolve(results);
          return;
        }

        // Handle Offset
        if (offset > 0 && !hasSkipped) {
          hasSkipped = true;
          cursor.advance(offset);
          return;
        }

        results.push(cursor.value);

        if (results.length < limit) {
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject("Erro ao buscar items recentes");
    });
  }

  // New method for Search/Filter
  async search(term: string, continent: string | 'Mundo'): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor(); // Iterate all for search (IndexedDB lacks full-text search)
      
      const results: ScratchcardData[] = [];
      const lowerTerm = term.toLowerCase().trim();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          const img = cursor.value as ScratchcardData;
          
          let matchesContinent = true;
          if (continent !== 'Mundo') {
            matchesContinent = img.continent === continent;
          }

          let matchesTerm = true;
          if (lowerTerm) {
            matchesTerm = 
              img.gameName.toLowerCase().includes(lowerTerm) ||
              img.customId.toLowerCase().includes(lowerTerm) ||
              img.gameNumber.toLowerCase().includes(lowerTerm) ||
              img.state.toLowerCase().includes(lowerTerm) ||
              img.country.toLowerCase().includes(lowerTerm);
          }

          if (matchesContinent && matchesTerm) {
            results.push(img);
          }

          // Safety Limit for search results to avoid UI freeze if result set is huge
          if (results.length < 1000) {
            cursor.continue();
          } else {
            // Sort by Game Number Ascending (1, 2, 3...)
            resolve(results.sort((a, b) => {
              const numA = parseInt(a.gameNumber.replace(/\D/g, '')) || 0;
              const numB = parseInt(b.gameNumber.replace(/\D/g, '')) || 0;
              return numA - numB;
            }));
          }
        } else {
          // Finished cursor iteration
          // Sort by Game Number Ascending (1, 2, 3...)
          resolve(results.sort((a, b) => {
            const numA = parseInt(a.gameNumber.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.gameNumber.replace(/\D/g, '')) || 0;
            return numA - numB;
          }));
        }
      };

      request.onerror = () => reject("Erro na pesquisa");
    });
  }

  async getStats(): Promise<{ stats: Record<string, number>, total: number }> {
     if (!this.db) await this.init();

     return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");
      
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();

      const stats: Record<string, number> = {
        'Europa': 0, 'América': 0, 'Ásia': 0, 'África': 0, 'Oceania': 0
      };
      let total = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          const img = cursor.value as ScratchcardData;
          total++;
          if (stats[img.continent] !== undefined) {
            stats[img.continent]++;
          }
          cursor.continue();
        } else {
          resolve({ stats, total });
        }
      };
      request.onerror = () => reject("Erro stats");
     });
  }

  async save(item: ScratchcardData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item); // .put updates if exists, adds if not

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao salvar item");
    });
  }

  async delete(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao deletar item");
    });
  }

  async exportData(): Promise<string> {
    const items = await this.getAll();
    return JSON.stringify(items, null, 2);
  }
}

export const storageService = new StorageService();