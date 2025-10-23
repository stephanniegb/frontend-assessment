import { generateTransactionData } from "../utils/dataGenerator";
const POLLING_TRANSACTIONS_COUNT = 200;
interface PollingWorkerMessage {
  type: "START_POLLING" | "STOP_POLLING" | "GENERATE_NOW";
  intervalMs?: number;
}

let pollingInterval: NodeJS.Timeout | null = null;

onmessage = (e: MessageEvent<PollingWorkerMessage>) => {
  const { type, intervalMs = 30000 } = e.data;

  try {
    switch (type) {
      case "START_POLLING":
        startPolling(intervalMs);
        break;

      case "STOP_POLLING":
        stopPolling();
        break;

      case "GENERATE_NOW":
        generateAndSendTransactions();
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: "POLLING_ERROR",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

function startPolling(intervalMs: number) {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Generate immediately
  generateAndSendTransactions();

  // Then set up interval
  pollingInterval = setInterval(() => {
    generateAndSendTransactions();
  }, intervalMs);

  self.postMessage({
    type: "POLLING_STARTED",
    intervalMs,
  });
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;

    self.postMessage({
      type: "POLLING_STOPPED",
    });
  }
}

function generateAndSendTransactions() {
  try {
    // Generate 200 new transactions using the same method as main app
    const newTransactions = generateTransactionData(POLLING_TRANSACTIONS_COUNT);

    self.postMessage({
      type: "NEW_TRANSACTIONS",
      transactions: newTransactions,
      count: newTransactions.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error generating transactions in polling worker:", error);
    self.postMessage({
      type: "POLLING_ERROR",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
