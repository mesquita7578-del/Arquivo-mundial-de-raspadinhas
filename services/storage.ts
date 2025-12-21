
import { ScratchcardData, DocumentItem, WebsiteLink, CategoryItem, SiteMetadata } from "../types";

const DB_NAME = 'raspadinhas-archive-db';
const DB_VERSION = 6; 
const STORE_ITEMS = 'items';
const STORE_DOCS = 'documents';
const STORE_SITES = 'websites';
const STORE_CATEGORIES = 'categories';
const STORE_SETTINGS = 'settings';

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'raspadinha', isDefault: true, createdAt: 0 },
  { id: 'cat-2', name: 'lotaria', isDefault: true, createdAt: 0 },
  { id: 'cat-3', name: 'boletim', isDefault: true, createdAt: 0 },
  { id: 'cat-4', name: 'objeto', isDefault: true, createdAt: 0 },
];

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
        if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
          db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
        }
      };
    });
  }

  async getSiteMetadata(): Promise<SiteMetadata> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_SETTINGS], 'readonly');
      const store = transaction.objectStore(STORE_SETTINGS);
      const request = store.get('site_settings');
      request.onsuccess = () => {
        resolve(request.result || { id: 'site_settings', founderPhotoUrl: '' });
      };
    });
  }

  async saveSiteMetadata(metadata: SiteMetadata): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORE_SETTINGS);
      store.put(metadata);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Erro ao salvar definições");
    });
  }

  async getCategories(): Promise<CategoryItem[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_CATEGORIES], 'readonly');
      const store = transaction.objectStore(STORE_CATEGORIES);
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result || [];
        if (results.length === 0) {
          const initTx = this.db!.transaction([STORE_CATEGORIES], 'readwrite');
          const initStore = initTx.objectStore(STORE_CATEGORIES);
          DEFAULT_CATEGORIES.forEach(c => initStore.put(c));
          resolve(DEFAULT_CATEGORIES);
        } else {
          resolve(results.sort((a, b) => a.createdAt - b.createdAt));
        }
      };
      request.onerror = () => reject("Erro ao buscar categorias");
    });
  }

  async saveCategory(category: CategoryItem): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_CATEGORIES], 'readwrite');
      const store = transaction.objectStore(STORE_CATEGORIES);
      store.put(category);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Erro ao salvar categoria");
    });
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_CATEGORIES], 'readwrite');
      const store = transaction.objectStore(STORE_CATEGORIES);
      store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Erro ao deletar categoria");
    });
  }

  async getAll(): Promise<ScratchcardData[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ITEMS], 'readonly');
      const store = transaction.objectStore(STORE_ITEMS);
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.sort((a, b) => (a.gameNumber || "").localeCompare(b.gameNumber || "", undefined, { numeric: true })));
      };
      request.onerror = () => reject("Erro ao buscar items");
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
    // Chloe: Garantimos que o DB está pronto antes de exportar!
    if (!this.db) await this.init();
    const [items, categories, settings] = await Promise.all([
      this.getAll(),
      this.getCategories(),
      this.getSiteMetadata()
    ]);
    return JSON.stringify({ items, categories, settings }, null, 2);
  }

  async importData(jsonString: string): Promise<number> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
       try {
          const data = JSON.parse(jsonString);
          const items = data.items || [];
          const categories = data.categories || [];
          const settings = data.settings;
          
          const transaction = this.db!.transaction([STORE_ITEMS, STORE_CATEGORIES, STORE_SETTINGS], 'readwrite');
          const store = transaction.objectStore(STORE_ITEMS);
          const catStore = transaction.objectStore(STORE_CATEGORIES);
          const setStore = transaction.objectStore(STORE_SETTINGS);
          
          let count = 0;
          if (Array.isArray(items)) {
            items.forEach((item: ScratchcardData) => { if (item.id && item.gameName) { store.put(item); count++; } });
          }
          if (Array.isArray(categories)) {
            categories.forEach((cat: CategoryItem) => { if (cat.id && cat.name) { catStore.put(cat); } });
          }
          if (settings) {
            setStore.put(settings);
          }
          
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
