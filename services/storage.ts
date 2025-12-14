import { ScratchcardData, DocumentItem } from "../types";

const DB_NAME = 'raspadinhas-archive-db';
const DB_VERSION = 3; // Incremented for Documents Store
const STORE_ITEMS = 'items';
const STORE_DOCS = 'documents';

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
        
        // Store for Scratchcards
        if (!db.objectStoreNames.contains(STORE_ITEMS)) {
          const store = db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        } else {
           // Ensure index exists if upgrading from v1
           const store = (event.target as IDBOpenDBRequest).transaction!.objectStore(STORE_ITEMS);
           if (!store.indexNames.contains('createdAt')) {
             store.createIndex('createdAt', 'createdAt', { unique: false });
           }
        }

        // Store for PDF Documents
        if (!db.objectStoreNames.contains(STORE_DOCS)) {
          const docStore = db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
          docStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  // --- IMAGES / SCRATCHCARDS METHODS ---

  async getAll(): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject("Erro ao buscar items");
      };
    });
  }

  async getRecent(limit: number, offset: number = 0): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
      
      const source = store.indexNames.contains('createdAt') 
        ? store.index('createdAt') 
        : store;
      
      const request = source.openCursor(null, 'prev');
      const results: ScratchcardData[] = [];
      let hasSkipped = false;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (!cursor) {
          resolve(results);
          return;
        }

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

  async search(term: string, continent: string | 'Mundo'): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.openCursor();
      
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

          if (results.length < 1000) {
            cursor.continue();
          } else {
            resolve(results.sort((a, b) => {
              const numA = parseInt(a.gameNumber.replace(/\D/g, '')) || 0;
              const numB = parseInt(b.gameNumber.replace(/\D/g, '')) || 0;
              return numA - numB;
            }));
          }
        } else {
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
      
      const transaction = this.db.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
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

      const transaction = this.db.transaction([STORE_ITEMS], 'readwrite');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao salvar item");
    });
  }

  async delete(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_ITEMS], 'readwrite');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao deletar item");
    });
  }

  async exportData(): Promise<string> {
    const items = await this.getAll();
    return JSON.stringify(items, null, 2);
  }

  // --- DOCUMENTS / PDF METHODS ---

  async getDocuments(): Promise<DocumentItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");
      
      const transaction = this.db.transaction([STORE_DOCS], 'readonly');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort manually by createdAt desc
        const docs = (request.result || []) as DocumentItem[];
        docs.sort((a, b) => b.createdAt - a.createdAt);
        resolve(docs);
      };
      request.onerror = () => reject("Erro ao buscar documentos");
    });
  }

  async saveDocument(doc: DocumentItem): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_DOCS], 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.put(doc);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao salvar documento");
    });
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_DOCS], 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao deletar documento");
    });
  }
}

export const storageService = new StorageService();
