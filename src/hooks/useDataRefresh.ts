import { useEffect, useRef } from "react";
import { useTransactionContext } from "../contexts/TransactionContext";
import { TransactionDB } from "../utils/transactionDB";
import { FilterOptions, Transaction } from "../types/transaction";
import { applyFilters } from "../services/filter";
import { useUserContext } from "../contexts/UserContext";

export const useDataRefresh = (intervalMs: number = 30000) => {
  const { setFilteredTransactions, addNewTransactions } =
    useTransactionContext();
  const { filters, searchTerm } = useUserContext();
  const workerRef = useRef<Worker | null>(null);
  const dbRef = useRef<TransactionDB | null>(null);
  const filteredRef = useRef<FilterOptions>({
    type: "all",
    status: "all",
    category: "",
    searchTerm: "",
  });

  useEffect(() => {
    filteredRef.current = filters;
  }, [filters, searchTerm]);

  const handleNewTransactions = async (newTransactions: Transaction[]) => {
    try {
      const updatedTransactions = addNewTransactions(newTransactions);

      if (
        filteredRef.current.searchTerm ||
        filteredRef.current.type !== "all" ||
        filteredRef.current.status !== "all" ||
        filteredRef.current.category
      ) {
        // with filters
        const filteredTransactions = applyFilters(
          updatedTransactions,
          filteredRef.current,
          filteredRef.current.searchTerm || ""
        );

        setFilteredTransactions(filteredTransactions);
      } else {
        // without filters
        setFilteredTransactions(updatedTransactions);
      }

      if (!dbRef.current) {
        dbRef.current = new TransactionDB();
        await dbRef.current.init();
      }

      await dbRef.current.addTransactions(newTransactions);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  };

  const handleWorkerMessage = async (event: MessageEvent) => {
    const { type, transactions, error } = event.data;

    try {
      switch (type) {
        case "NEW_TRANSACTIONS":
          await handleNewTransactions(transactions);
          break;
        case "POLLING_STARTED":
          console.log("Polling worker started");
          break;
        case "POLLING_STOPPED":
          console.log("Polling worker stopped");
          break;
        case "POLLING_ERROR":
          console.error("Polling worker error:", error);
          break;
        default:
          console.warn(`Unknown worker message type: ${type}`);
      }
    } catch (error) {
      console.error("Error handling worker message:", error);
    }
  };

  const startPolling = () => {
    if (workerRef.current) return;

    workerRef.current = new Worker(
      new URL("../workers/pollingWorker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current.onmessage = handleWorkerMessage;

    workerRef.current.postMessage({
      type: "START_POLLING",
      intervalMs,
    });
  };

  const stopPolling = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "STOP_POLLING" });
      workerRef.current.terminate();
      workerRef.current = null;
      console.log("Stopped data refresh polling");
    }
  };

  const refreshData = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "GENERATE_NOW" });
    }
  };

  useEffect(() => {
    startPolling();

    return () => {
      stopPolling();
    };
  }, []);

  return {
    refreshData,
    startPolling,
    stopPolling,
    isPolling: workerRef.current !== null,
  };
};
