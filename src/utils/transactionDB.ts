import { Transaction } from "../types/transaction";

// Database configuration constants
const TRANSACTION_DB_NAME = "transaction-db";
const TRANSACTION_DB_VERSION = 1;
const TRANSACTION_STORE_NAME = "transactions";
const TRANSACTION_DB_MAX = 100_000;
const BATCH_SIZE = 100;

export class TransactionDB {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        TRANSACTION_DB_NAME,
        TRANSACTION_DB_VERSION
      );

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const store = db.createObjectStore(TRANSACTION_STORE_NAME, {
          keyPath: "id",
        });
        store.createIndex("merchantName", "merchantName", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("type", "type", { unique: false });
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async addTransactions(transactions: Transaction[]) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    // Enforce max transactions limit before adding
    await this.enforceMaxTransactions();

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(
        [TRANSACTION_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(TRANSACTION_STORE_NAME);

      let completed = 0;

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };

      for (const tx of transactions) {
        const request = store.put(tx);

        request.onsuccess = () => {
          completed++;
          // Yield control back to UI every BATCH_SIZE transactions
          if (completed % BATCH_SIZE === 0) {
            setTimeout(() => {}, 0);
          }
        };

        request.onerror = () => {
          reject(request.error);
        };
      }
    });
  }

  async getCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction(["transactions"], "readonly");
      const store = transaction?.objectStore("transactions");
      const request = store?.count();

      if (request) {
        request.onsuccess = () => {
          resolve(request.result as number);
        };
        request.onerror = () => {
          reject(request.error);
        };
      }
    });
  }

  async getTransactions(
    start: number,
    limit: number,
    sortBy: "timestamp" | "amount" = "timestamp",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<Transaction[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["transactions"], "readonly");
      const store = transaction.objectStore("transactions");

      const index = store.index(sortBy);
      const request = index.openCursor(
        null,
        sortOrder === "desc" ? "prev" : "next"
      );

      const results: Transaction[] = [];
      let currentIndex = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          // Skip to start position
          if (currentIndex < start) {
            currentIndex++;
            cursor.continue();
            return;
          }

          results.push(cursor.value);
          currentIndex++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async enforceMaxTransactions() {
    const count = await this.getCount();

    if (count >= TRANSACTION_DB_MAX) {
      // Calculate how many transactions to remove (keep some buffer)
      const BUFFER_SIZE = 1000;
      const excessCount = count - TRANSACTION_DB_MAX + BUFFER_SIZE;

      await this.deleteOldestTransactions(excessCount);
    }
  }

  async deleteOldestTransactions(count: number): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [TRANSACTION_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(TRANSACTION_STORE_NAME);
      const index = store.index("timestamp");

      // Get oldest transactions by timestamp (ascending order)
      const request = index.openCursor(null, "next");
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && deletedCount < count) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  async searchTransactions(
    _query: string,
    _limit: number = TRANSACTION_DB_MAX / 100 // Default to 1% of max
  ): Promise<Transaction[]> {
    // Implement search with IndexedDB cursors
    // TODO: Implement proper search functionality
    return [];
  }
}
