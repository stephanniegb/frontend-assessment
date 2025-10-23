import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Transaction, TransactionSummary } from "../types/transaction";
import { TransactionDB } from "../utils/transactionDB";
import { debounce } from "lodash";

const TRANSACTION_CONSTANTS = {
  TOTAL_TRANSACTIONS_TO_GENERATE: 100_000,
  INITIAL_PAGE_SIZE: 1000,
  SUMMARY_DEBOUNCE_DELAY: 300,
} as const;

interface TransactionContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  setFilteredTransactions: (transactions: Transaction[]) => void;
  updateCurrentTransactions: (transactions: Transaction[]) => void;
  getAllTransactions: () => Transaction[];
  addNewTransactions: (newTransactions: Transaction[]) => Transaction[];
  totalTransactions: number;
  loading: boolean;

  summary: TransactionSummary | null;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const transactionsRef = useRef<Transaction[]>([]);
  const transactionWorkerRef = useRef<Worker | null>(null);
  const databaseRef = useRef<TransactionDB | null>(null);

  const [totalTransactions, setTotalTransactions] = useState(0);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const debouncedCalculateSummary = debounce((transactions: Transaction[]) => {
    if (transactions.length > 0 && transactionWorkerRef.current) {
      transactionWorkerRef.current.postMessage({
        type: "CALCULATE_SUMMARY",
        transactions: transactions,
      });
    }
  }, TRANSACTION_CONSTANTS.SUMMARY_DEBOUNCE_DELAY);

  const handleWorkerMessage = useCallback(async (event: MessageEvent) => {
    const { type, data, index, total, result } = event.data;

    try {
      switch (type) {
        case "TRANSACTION_CHUNK":
          await handleTransactionChunk(data, index, total);
          break;
        case "GENERATION_COMPLETED":
          handleGenerationComplete(total);
          break;
        case "CALCULATION_COMPLETE":
          handleSummaryCalculationComplete(result);
          break;
        case "WORKER_ERROR":
          handleWorkerError(event.data.error);
          break;
        default:
          console.warn(`Unknown worker message type: ${type}`);
      }
    } catch (error) {
      console.error("Error handling worker message:", error);
    }
  }, []);

  const handleTransactionChunk = async (
    transactionChunk: Transaction[],
    chunkIndex: number,
    totalTransactions: number
  ) => {
    await databaseRef.current?.addTransactions(transactionChunk);

    const progressPercentage =
      ((chunkIndex + transactionChunk.length) / totalTransactions) * 100;
    console.log(
      `Adding transactions... ${progressPercentage.toFixed(2)}% complete`
    );

    if (chunkIndex === 0) {
      transactionsRef.current = transactionChunk;
      setFilteredTransactions(transactionChunk);
      setLoading(false);
    }
  };

  const handleGenerationComplete = (totalCount: number) => {
    setTotalTransactions(totalCount);
  };

  const handleSummaryCalculationComplete = (
    summaryResult: TransactionSummary
  ) => {
    setSummary(summaryResult);
  };

  const handleWorkerError = (errorMessage: string) => {
    console.error("Worker error:", errorMessage);
  };

  const initializeTransactionWorker = useCallback(() => {
    if (typeof window !== "undefined" && window.Worker) {
      transactionWorkerRef.current = new Worker(
        new URL("../workers/transactionWorker.ts", import.meta.url),
        { type: "module" }
      );
      transactionWorkerRef.current.onmessage = handleWorkerMessage;
    }
  }, [handleWorkerMessage]);

  const initializeDatabase = useCallback(async () => {
    try {
      databaseRef.current = new TransactionDB();
      await databaseRef.current.init();

      const existingTransactionCount = await databaseRef.current.getCount();

      if (existingTransactionCount > 0) {
        setTotalTransactions(existingTransactionCount);

        const initialTransactionBatch =
          await databaseRef.current.getTransactions(
            0,
            TRANSACTION_CONSTANTS.INITIAL_PAGE_SIZE
          );
        transactionsRef.current = initialTransactionBatch;
        setFilteredTransactions(initialTransactionBatch);
        setLoading(false);
      } else {
        generateLargeTransactionDataset();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }, []);

  const generateLargeTransactionDataset = useCallback(() => {
    if (transactionWorkerRef.current) {
      transactionWorkerRef.current.postMessage({
        type: "GENERATE_TRANSACTIONS",
        count: TRANSACTION_CONSTANTS.TOTAL_TRANSACTIONS_TO_GENERATE,
      });
    }
  }, []);

  const updateCurrentTransactions = (transactions: Transaction[]) => {
    transactionsRef.current = transactions;
  };

  const addNewTransactions = useCallback(
    (newTransactions: Transaction[]): Transaction[] => {
      const currentTransactions = transactionsRef.current;

      const updatedTransactions = [...newTransactions, ...currentTransactions];
      transactionsRef.current = updatedTransactions;

      return updatedTransactions;
    },
    []
  );

  useEffect(() => {
    initializeTransactionWorker();
    initializeDatabase();

    return () => {
      if (transactionWorkerRef.current) {
        transactionWorkerRef.current.terminate();
      }
    };
  }, [initializeTransactionWorker, initializeDatabase]);

  useEffect(() => {
    debouncedCalculateSummary(filteredTransactions);
  }, [filteredTransactions]);

  const contextValue = {
    transactions: transactionsRef.current,
    filteredTransactions,
    setFilteredTransactions,
    updateCurrentTransactions,
    getAllTransactions: () => transactionsRef.current,
    addNewTransactions,
    totalTransactions,
    loading,
    summary,
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider"
    );
  }
  return context;
};
