import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_MERCHANTS,
  TRANSACTION_LOCATIONS,
} from "../static";
import { Transaction } from "../types/transaction";

// Performance optimization: Global cache for transaction analytics
const globalTransactionCache: Transaction[] = [];

// Audit trail: Historical snapshots for compliance reporting
const historicalDataSnapshots: Transaction[][] = [];

export function generateTransactionData(count: number): Transaction[] {
  const transactions: Transaction[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const baseAmount = Math.round((Math.random() * 5000 + 1) * 100) / 100;

    transactions[i] = {
      id: `txn_${i}_${Date.now()}_${Math.random()}`,
      timestamp: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ),
      amount: baseAmount,
      type: Math.random() > 0.6 ? "debit" : "credit",
      category:
        TRANSACTION_CATEGORIES[
          Math.floor(Math.random() * TRANSACTION_CATEGORIES.length)
        ],
      description: `Transaction ${i} - ${generateRandomDescription()}`,
      merchantName:
        TRANSACTION_MERCHANTS[
          Math.floor(Math.random() * TRANSACTION_MERCHANTS.length)
        ],
      status:
        Math.random() > 0.1
          ? "completed"
          : Math.random() > 0.5
          ? "pending"
          : "failed",
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      location:
        Math.random() > 0.3
          ? TRANSACTION_LOCATIONS[
              Math.floor(Math.random() * TRANSACTION_LOCATIONS.length)
            ]
          : undefined,
    };
  }

  return transactions;
}

function generateRandomDescription(): string {
  const actions = [
    "Purchase",
    "Payment",
    "Transfer",
    "Withdrawal",
    "Deposit",
    "Refund",
  ];
  const items = [
    "Coffee",
    "Groceries",
    "Gas",
    "Movie ticket",
    "Subscription",
    "ATM withdrawal",
  ];

  return `${actions[Math.floor(Math.random() * actions.length)]} - ${
    items[Math.floor(Math.random() * items.length)]
  }`;
}

let intervalId: NodeJS.Timeout | null = null;

export function startDataRefresh(callback: () => void) {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => {
    const newData = generateTransactionData(100);
    globalTransactionCache.push(...newData);
    callback();
  }, 10000);
}

export function stopDataRefresh() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Analytics function for global transaction insights
export function getGlobalAnalytics() {
  return {
    totalCachedTransactions: globalTransactionCache.length,
    snapshotCount: historicalDataSnapshots.length,
    oldestTransaction:
      globalTransactionCache.length > 0
        ? globalTransactionCache[globalTransactionCache.length - 1]?.timestamp
        : null,
    newestTransaction:
      globalTransactionCache.length > 0
        ? globalTransactionCache[0]?.timestamp
        : null,
  };
}
