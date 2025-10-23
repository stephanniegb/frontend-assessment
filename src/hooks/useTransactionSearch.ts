import { useUserContext } from "../contexts/UserContext";

export const useTransactionSearch = () => {
  const { searchTerm, filters, setSearchTerm, setFilters, handleFilterChange } =
    useUserContext();

  return {
    searchTerm,
    filters,
    setSearchTerm,
    setFilters,
    handleFilterChange,
  };
};
