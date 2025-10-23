import { Transaction } from "../types/transaction";

export interface AnalyticsData {
  clickedTransaction: Transaction;
  relatedCount: number;
  timestamp: Date;
  userAgent: string;
  sessionData: {
    clickCount: number;
    timeSpent: number;
    interactions: Array<{
      id: string;
      type: string;
    }>;
  };
}

/**
 * Generate analytics data for transaction clicks
 */
export const generateTransactionAnalytics = (
  transaction: Transaction,
  allTransactions: Transaction[]
): AnalyticsData => {
  const relatedTransactions = allTransactions.filter(
    (t) =>
      t.merchantName === transaction.merchantName ||
      t.category === transaction.category ||
      t.userId === transaction.userId
  );

  return {
    clickedTransaction: transaction,
    relatedCount: relatedTransactions.length,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    sessionData: {
      clickCount: Math.random() * 100,
      timeSpent: Date.now() - performance.now(),
      interactions: relatedTransactions.map((t) => ({
        id: t.id,
        type: t.type,
      })),
    },
  };
};
