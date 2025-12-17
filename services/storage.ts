
import { ScratchcardData, DocumentItem, WebsiteLink } from "../types";

const DB_NAME = 'raspadinhas-archive-db';
const DB_VERSION = 4;
const STORE_ITEMS = 'items';
const STORE_DOCS = 'documents';
const STORE_SITES = 'websites';

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (event) => reject("Erro ao abrir base de dados");
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_ITEMS)) {
          const store = db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_DOCS)) {
          const docStore = db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
          docStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SITES)) {
          db.createObjectStore(STORE_SITES, { keyPath: 'id' });
        }
      };
    });
  }

  async getAll(): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject("Erro ao buscar items");
    });
  }

  async syncInitialItems(initialItems: ScratchcardData[]): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_ITEMS], 'readwrite');
      const store = transaction.objectStore(STORE_ITEMS);
      initialItems.forEach(item => store.put(item));
      transaction.oncomplete = () => resolve();
    });
  }

  async search(term: string, continent: string | 'Mundo'): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.openCursor();
      const results: ScratchcardData[] = [];
      const lowerTerm = term.toLowerCase().trim();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          const img = cursor.value as ScratchcardData;
          let matchesContinent = continent === 'Mundo' || img.continent === continent;
          let matchesTerm = !lowerTerm || 
            img.gameName.toLowerCase().includes(lowerTerm) ||
            img.customId.toLowerCase().includes(lowerTerm) ||
            img.gameNumber.toLowerCase().includes(lowerTerm) ||
            img.country.toLowerCase().includes(lowerTerm) ||
            (img.region && img.region.toLowerCase().includes(lowerTerm));

          if (matchesContinent && matchesTerm) results.push(img);
          cursor.continue();
        } else {
          resolve(results.sort((a, b) => a.gameNumber.localeCompare(b.gameNumber, undefined, { numeric: true })));
        }
      };
      request.onerror = () => reject("Erro na pesquisa");
    });
  }

  async getStats(): Promise<any> {
     if (!this.db) await this.init();
     return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.openCursor();
      const stats: Record<string, number> = { 'Europa': 0, 'América': 0, 'Ásia': 0, 'África': 0, 'Oceania': 0 };
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
          if (stats[img.continent] !== undefined) stats[img.continent]++;
          if (img.category === 'lotaria') categoryStats.lottery++; else categoryStats.scratch++;
          
          const countryKey = img.country || 'Desconhecido';
          countryStats[countryKey] = (countryStats[countryKey] || 0) + 1;
          
          const stateKey = img.state || 'Outro';
          stateStats[stateKey] = (stateStats[stateKey] || 0) + 1;

          let collector = (img.collector || 'Arquivo Geral').trim();
          collectorStats[collector] = (collectorStats[collector] || 0) + 1;
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
      const transaction = this.db!.transaction([STORE_ITEMS], 'readwrite');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro ao salvar item");
    });
  }

  async delete(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ITEMS], 'readwrite');
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
          const transaction = this.db!.transaction([STORE_ITEMS], 'readwrite');
          const store = transaction.objectStore(STORE_ITEMS);
          let count = 0;
          items.forEach((item: ScratchcardData) => { if (item.id && item.gameName) { store.put(item); count++; } });
          transaction.oncomplete = () => resolve(count);
          transaction.onerror = () => reject("Erro na importação");
       } catch (e) { reject(e); }
    });
  }

  async getDocuments(): Promise<DocumentItem[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_DOCS], 'readonly');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result || []).sort((a:any, b:any) => b.createdAt - a.createdAt));
      request.onerror = () => reject("Erro documentos");
    });
  }

  async saveDocument(doc: DocumentItem): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_DOCS], 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.put(doc);
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro salvar documento");
    });
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_DOCS], 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro deletar documento");
    });
  }

  async getWebsites(): Promise<WebsiteLink[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SITES], 'readonly');
      const store = transaction.objectStore(STORE_SITES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject("Erro sites");
    });
  }

  async saveWebsite(site: WebsiteLink): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SITES], 'readwrite');
      const store = transaction.objectStore(STORE_SITES);
      const request = store.put(site);
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro site");
    });
  }

  async deleteWebsite(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SITES], 'readwrite');
      const store = transaction.objectStore(STORE_SITES);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Erro site delete");
    });
  }
}

export const storageService = new StorageService();
