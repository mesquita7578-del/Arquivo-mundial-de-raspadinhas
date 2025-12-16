import { ScratchcardData, DocumentItem, WebsiteLink } from "../types";

const DB_NAME = 'raspadinhas-archive-db';
const DB_VERSION = 4; // Incremented for Websites Store
const STORE_ITEMS = 'items';
const STORE_DOCS = 'documents';
const STORE_SITES = 'websites';

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

        // Store for Official Websites
        if (!db.objectStoreNames.contains(STORE_SITES)) {
          db.createObjectStore(STORE_SITES, { keyPath: 'id' });
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

          // Increased limit to 50000 to accommodate large collections
          if (results.length < 50000) {
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

  async getStats(): Promise<{ 
    stats: Record<string, number>, 
    total: number, 
    categoryStats: { scratch: number, lottery: number },
    countryStats: Record<string, number>,
    stateStats: Record<string, number>,
    collectorStats: Record<string, number>
  }> {
     if (!this.db) await this.init();

     return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");
      
      const transaction = this.db.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.openCursor();

      const stats: Record<string, number> = {
        'Europa': 0, 'América': 0, 'Ásia': 0, 'África': 0, 'Oceania': 0
      };
      
      const categoryStats = { scratch: 0, lottery: 0 };
      const countryStats: Record<string, number> = {};
      const stateStats: Record<string, number> = {};
      const collectorStats: Record<string, number> = {};

      let total = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          const img = cursor.value as ScratchcardData;
          total++;
          
          // Continent Stats
          if (stats[img.continent] !== undefined) {
            stats[img.continent]++;
          }
          
          // Category Stats
          if (img.category === 'lotaria') {
            categoryStats.lottery++;
          } else {
            categoryStats.scratch++;
          }

          // Country Stats
          const country = img.country || 'Desconhecido';
          countryStats[country] = (countryStats[country] || 0) + 1;

          // State Stats
          const state = img.state || 'Outro';
          stateStats[state] = (stateStats[state] || 0) + 1;

          // Collector Stats - Advanced Normalization for Jorge, Fabio & Chloe
          if (img.collector && img.collector.trim() !== '') {
             const rawName = img.collector.trim().toLowerCase();
             let finalName = rawName;

             // Logic for Vovô Jorge
             if (rawName.includes('jorge') || rawName.includes('mesquita') || rawName === 'jm' || rawName === 'j.m.') {
                 finalName = 'Jorge Mesquita';
             }
             // Logic for Fabio
             else if (rawName.includes('fabio') || rawName.includes('pagni') || rawName === 'fp') {
                 finalName = 'Fabio Pagni';
             }
             // Logic for Chloe
             else if (rawName.includes('chloe')) {
                 finalName = 'Chloe';
             }
             else {
                 // Standard Title Case for others
                 finalName = rawName.split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
             }
             
             collectorStats[finalName] = (collectorStats[finalName] || 0) + 1;
          }

          cursor.continue();
        } else {
          resolve({ stats, total, categoryStats, countryStats, stateStats, collectorStats });
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

  async importData(jsonString: string): Promise<number> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
       try {
          const items = JSON.parse(jsonString);
          if (!Array.isArray(items)) throw new Error("Formato inválido");
          
          if (!this.db) return reject("Database not initialized");
          const transaction = this.db.transaction([STORE_ITEMS], 'readwrite');
          const store = transaction.objectStore(STORE_ITEMS);
          
          let count = 0;
          items.forEach((item: ScratchcardData) => {
             // Basic validation
             if (item.id && item.gameName) {
                store.put(item);
                count++;
             }
          });
          
          transaction.oncomplete = () => resolve(count);
          transaction.onerror = () => reject("Erro na transação de importação");

       } catch (e) {
          reject(e);
       }
    });
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

  // --- WEBSITE LINKS METHODS ---

  async getWebsites(): Promise<WebsiteLink[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");
      
      const transaction = this.db.transaction([STORE_SITES], 'readonly');
      const store = transaction.objectStore(STORE_SITES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject("Erro ao buscar sites");
    });
  }

  async saveWebsite(site: WebsiteLink): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_SITES], 'readwrite');
      const store = transaction.objectStore(STORE_SITES);
      const request = store.put(site);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao salvar site");
    });
  }

  async deleteWebsite(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_SITES], 'readwrite');
      const store = transaction.objectStore(STORE_SITES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao deletar site");
    });
  }
}

export const storageService = new StorageService();