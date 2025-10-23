import { Transaction } from "../types/transaction";
import { generateTransactionData } from "../utils/dataGenerator";
import { calculateSummary } from "../services/summary";

interface WorkerMessage {
  type: "GENERATE_TRANSACTIONS" | "CALCULATE_SUMMARY" | "WORKER_ERROR";
  count?: number;
  transactions?: Transaction[];
  id?: string;
}

// Processing constants
const CHUNK_SIZE = 1000;
onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, count, transactions, id } = e.data;

  try {
    switch (type) {
      case "GENERATE_TRANSACTIONS":
        handleGenerateTransactions(count!);
        break;

      case "CALCULATE_SUMMARY":
        handleCalculateSummary(transactions!, id!);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: "WORKER_ERROR",
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const handleGenerateTransactions = (count: number): void => {
  const transactions = generateTransactionData(count);

  for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
    const chunk = transactions.slice(i, i + CHUNK_SIZE);
    self.postMessage({
      type: "TRANSACTION_CHUNK",
      data: chunk,
      index: i,
      total: transactions.length,
    });
  }

  self.postMessage({ type: "GENERATION_COMPLETED" });
};

const handleCalculateSummary = (
  transactions: Transaction[],
  id: string
): void => {
  const summary = calculateSummary(transactions);

  self.postMessage({
    type: "CALCULATION_COMPLETE",
    id,
    result: summary,
    calculationType: "SUMMARY",
  });
};
