import { FilterOptions, Transaction } from "../types/transaction";
import { searchTransactions } from "./search";

export const applyFilters = (
  data: Transaction[],
  currentFilters: FilterOptions,
  searchTerm: string
): Transaction[] => {
  let filtered = [...data];

  if (searchTerm && searchTerm.length > 0) {
    filtered = searchTransactions(filtered, searchTerm);
  }

  return filterTransactions(filtered, currentFilters);
};

export const filterTransactions = (
  transactions: Transaction[],
  filters: FilterOptions
): Transaction[] => {
  let filtered = [...transactions];

  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((t) => t.type === filters.type);
  }

  if (filters.category) {
    filtered = filtered.filter((t) => t.category === filters.category);
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters.dateRange) {
    filtered = filtered.filter(
      (t) =>
        t.timestamp >= filters.dateRange!.start &&
        t.timestamp <= filters.dateRange!.end
    );
  }

  if (filters.amountRange) {
    filtered = filtered.filter(
      (t) =>
        t.amount >= filters.amountRange!.min &&
        t.amount <= filters.amountRange!.max
    );
  }

  return filtered;
};
