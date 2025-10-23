import React, { createContext, useContext, useState, useCallback } from "react";
import { Transaction, FilterOptions } from "../types/transaction";
import { applyFilters } from "../services/filter";
import { useTransactionContext } from "./TransactionContext";
// import { generateTransactionAnalytics } from "../services/analyticsService";
// import { useUserPreferences } from "../hooks/useUserPreferences";

interface UserContextType {
  globalSettings: {
    theme: string;
    locale: string;
    currency: string;
    timezone: string;
    featureFlags: Record<string, boolean>;
    userRole: string;
    permissions: string[];
    lastActivity: Date;
  };

  updateGlobalSettings: (settings: any) => void;
  trackActivity: (activity: string) => void;

  // Transaction management
  selectedTransaction: Transaction | null;
  handleTransactionClick: (transaction: Transaction) => void;
  closeTransactionModal: () => void;

  // Filter management
  searchTerm: string;
  filters: FilterOptions;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: FilterOptions) => void;
  handleFilterChange: (newFilters: FilterOptions) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalSettings, setGlobalSettings] = useState({
    theme: "light",
    locale: "en-US",
    currency: "USD",
    timezone: "UTC",
    featureFlags: { newDashboard: true, advancedFilters: false },
    userRole: "user",
    permissions: ["read", "write"],
    lastActivity: new Date(),
  });

  // Transaction management state
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Filter management state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    status: "all",
    category: "",
    searchTerm: "",
  });

  // Get transaction context for filtering
  const { transactions, setFilteredTransactions } = useTransactionContext();

  const updateGlobalSettings = (settings: any) => {
    setGlobalSettings((prev) => ({
      ...prev,
      ...settings,
      lastActivity: new Date(),
    }));
  };

  const trackActivity = (activity: string) => {
    setGlobalSettings((prev) => ({
      ...prev,
      lastActivity: new Date(),
      lastActivityType: activity,
    }));
  };

  const handleTransactionClick = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }, []);

  const closeTransactionModal = useCallback(() => {
    setSelectedTransaction(null);
  }, []);

  // Filter management functions
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    const filteredTransactions = applyFilters(
      transactions,
      newFilters,
      searchTerm
    );
    setFilteredTransactions(filteredTransactions);
  };

  // const handleAnalyticsUpdate = (analyticsData: any) => {
  //   setUserPreferences((prev) => ({
  //     ...prev,
  //     analytics: analyticsData,
  //     timestamps: { ...prev.timestamps, updated: Date.now() },
  //   }));
  // };

  // useEffect(() => {
  //   if (selectedTransaction) {
  //     const analyticsData = generateTransactionAnalytics(
  //       selectedTransaction,
  //       [] // TODO: Add all transactions
  //     );
  //     handleAnalyticsUpdate(analyticsData);

  //     console.log("Related transactions:", analyticsData.relatedCount);
  //   }
  // }, [selectedTransaction]);

  const value = {
    globalSettings,
    updateGlobalSettings,
    trackActivity,
    selectedTransaction,
    handleTransactionClick,
    closeTransactionModal,
    searchTerm,
    filters,
    setSearchTerm,
    setFilters,
    handleFilterChange,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
