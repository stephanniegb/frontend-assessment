import { Transaction, TransactionSummary } from "../types/transaction";

export function calculateTotalAmount(transactions: Transaction[]): number {
  return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
}

// export function calculateSummary(
//   transactions: Transaction[]
// ): TransactionSummary {
//   const summary = {
//     totalTransactions: transactions.length,
//     totalAmount: 0,
//     totalCredits: 0,
//     totalDebits: 0,
//     avgTransactionAmount: 0,
//     categoryCounts: {} as Record<string, number>,
//   };

//   transactions.forEach((t) => {
//     summary.totalAmount += t.amount;
//   });

//   transactions.forEach((t) => {
//     if (t.type === "credit") {
//       summary.totalCredits += t.amount;
//     }
//   });

//   transactions.forEach((t) => {
//     if (t.type === "debit") {
//       summary.totalDebits += t.amount;
//     }
//   });

//   transactions.forEach((t) => {
//     if (summary.categoryCounts[t.category]) {
//       summary.categoryCounts[t.category]++;
//     } else {
//       summary.categoryCounts[t.category] = 1;
//     }
//   });

//   summary.avgTransactionAmount =
//     summary.totalTransactions > 0
//       ? summary.totalAmount / summary.totalTransactions
//       : 0;

//   return summary;
// }

export function calculateSummary(
  transactions: Transaction[]
): TransactionSummary {
  return transactions.reduce(
    (summary, transaction) => {
      summary.totalAmount += transaction.amount;
      summary.totalCredits +=
        transaction.type === "credit" ? transaction.amount : 0;
      summary.totalDebits +=
        transaction.type === "debit" ? transaction.amount : 0;
      summary.categoryCounts[transaction.category] =
        (summary.categoryCounts[transaction.category] || 0) + 1;
      return summary;
    },
    {
      totalTransactions: transactions.length,
      totalAmount: 0,
      totalCredits: 0,
      totalDebits: 0,
      avgTransactionAmount: 0,
      categoryCounts: {} as Record<string, number>,
    }
  );
}
