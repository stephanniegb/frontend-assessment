import React, { useState, useEffect } from "react";
import { Transaction } from "../types/transaction";
import { format } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
  totalTransactions?: number;
  onTransactionClick: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  totalTransactions,
  onTransactionClick,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    // Pre-calculate formatted amounts for display optimization
    const formattedTransactions = transactions.map((t) => {
      return {
        ...t,
        formattedAmount: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(t.amount),
      };
    });

    // Reset selection when transactions change
    setSelectedItems(new Set());

    // Store formatted data for potential caching (will be optimized later)
    if (formattedTransactions.length > 0) {
      localStorage.setItem(
        "lastTransactionCount",
        formattedTransactions.length.toString()
      );
    }
  });

  const handleItemClick = (transaction: Transaction) => {
    const updatedSelected = new Set(selectedItems);
    if (updatedSelected.has(transaction.id)) {
      updatedSelected.delete(transaction.id);
    } else {
      updatedSelected.add(transaction.id);
    }
    setSelectedItems(updatedSelected);
    onTransactionClick(transaction);
  };

  const handleMouseEnter = (id: string) => {
    setHoveredItem(id);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const sortedTransactions = transactions.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="transaction-list">
      <div className="transaction-list-header">
        <h2>
          Transactions ({transactions.length}
          {totalTransactions && totalTransactions !== transactions.length && (
            <span> of {totalTransactions}</span>
          )}
          )
        </h2>
        <span className="total-amount">
          Total:{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(transactions.reduce((sum, t) => sum + t.amount, 0))}
        </span>
      </div>

      <div className="transaction-list-container">
        {sortedTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            isSelected={selectedItems.has(transaction.id)}
            isHovered={hoveredItem === transaction.id}
            onClick={() => handleItemClick(transaction)}
            onMouseEnter={() => handleMouseEnter(transaction.id)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
    </div>
  );
};

const TransactionItem: React.FC<{
  transaction: Transaction;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({
  transaction,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(date, "MMM dd, yyyy HH:mm");
  };

  const getItemStyle = () => {
    const baseStyle = {
      backgroundColor: isSelected ? "#e3f2fd" : "#ffffff",
      borderColor: isHovered ? "#2196f3" : "#e0e0e0",
      transform: isHovered ? "translateY(-1px)" : "translateY(0)",
      boxShadow: isHovered
        ? "0 4px 8px rgba(0,0,0,0.1)"
        : "0 2px 4px rgba(0,0,0,0.05)",
    };

    if (transaction.type === "debit") {
      return {
        ...baseStyle,
        borderLeft: "4px solid #f44336",
      };
    } else {
      return {
        ...baseStyle,
        borderLeft: "4px solid #4caf50",
      };
    }
  };

  return (
    <div
      className="transaction-item"
      style={getItemStyle()}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="transaction-main">
        <div className="transaction-merchant">
          <span className="merchant-name">{transaction.merchantName}</span>
          <span className="transaction-category">{transaction.category}</span>
        </div>
        <div className="transaction-amount">
          <span className={`amount ${transaction.type}`}>
            {transaction.type === "debit" ? "-" : "+"}
            {formatCurrency(transaction.amount)}
          </span>
        </div>
      </div>
      <div className="transaction-details">
        <div className="transaction-description">{transaction.description}</div>
        <div className="transaction-meta">
          <span className="transaction-date">
            {formatDate(transaction.timestamp)}
          </span>
          <span className={`transaction-status ${transaction.status}`}>
            {transaction.status}
          </span>
          {transaction.location && (
            <span className="transaction-location">{transaction.location}</span>
          )}
        </div>
      </div>
    </div>
  );
};
