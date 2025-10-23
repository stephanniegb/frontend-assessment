import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

import { useTransactionSearch } from "../../hooks/useTransactionSearch";
import { useTransactionContext } from "../../contexts/TransactionContext";
import { filterTransactions } from "../../services/filter";
import {
  generateSuggestions,
  highlightSuggestion,
  normalizeSearchInput,
  searchTransactions,
} from "../../services/search";
import { useDebounce } from "../../utils/debounce";

interface SearchBarProps {
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search transactions...",
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { filters, searchTerm, setSearchTerm } = useTransactionSearch();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { setFilteredTransactions, transactions } = useTransactionContext();

  const handleSearch = (searchTerm: string) => {
    const searchResults = searchTransactions(
      transactions.slice(0, 100),
      searchTerm
    );
    const filtered = filterTransactions(searchResults, filters);
    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    if (debouncedSearchTerm.length > 0) {
      setIsSearching(true);

      const processedTerm = normalizeSearchInput(debouncedSearchTerm);

      handleSearch(processedTerm);
      const suggestedTerms = generateSuggestions(debouncedSearchTerm);
      setSuggestions(suggestedTerms);
      setIsSearching(false);
    } else {
      handleSearch("");
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length > 2) {
      setSearchHistory((prev) => [...prev, debouncedSearchTerm]);
    }
  }, [debouncedSearchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <div className="search-icon">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button onClick={handleClear} className="clear-button" type="button">
            <X size={16} />
          </button>
        )}
        {isSearching && (
          <div className="search-loading">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="search-suggestions" role="listbox" aria-live="polite">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={false}
              tabIndex={0}
              aria-describedby={`suggestion-${index}-description`}
            >
              <span id={`suggestion-${index}-description`}>
                {highlightSuggestion(suggestion, searchTerm)}
              </span>
            </div>
          ))}
        </div>
      )}

      {searchHistory.length > 0 && searchTerm.length === 0 && (
        <div className="search-history">
          <div className="history-header">Recent searches</div>
          {searchHistory.slice(-10).map((item, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => handleSuggestionClick(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
