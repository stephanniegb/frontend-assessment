import React, { useState } from "react";
import { RowComponentProps } from "react-window";
import { format } from "date-fns";

import TransactionModal from "./TransactionModal";
import { Transaction } from "../../types/transaction";

export const TransactionItem: React.FC<
  RowComponentProps<{
    transactions: Transaction[];
    onItemClick: (index: number) => void;
    selectedItems: Set<string>;
  }>
> = ({ index, transactions, onItemClick, selectedItems, style }) => {
  const transaction = transactions[index];
  const isSelected = selectedItems.has(transaction.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rowIndex = index;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(date, "MMM dd, yyyy HH:mm");
  };
  const getItemClassName = () => {
    const baseClass = "transaction-item";
    const typeClass = transaction.type === "debit" ? "debit" : "credit";
    const selectedClass = isSelected ? "selected" : "";

    return [baseClass, typeClass, selectedClass].filter(Boolean).join(" ");
  };

  const handleTransactionClick = () => {
    onItemClick(index);
    setIsModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        style={{
          ...style,
          marginBottom: "20px",
          height: "169px",
        }}
        role="row"
        aria-rowindex={rowIndex + 1}
        aria-selected={isSelected}
      >
        <div
          className={getItemClassName()}
          onClick={handleTransactionClick}
          role="gridcell"
          aria-describedby={`transaction-${transaction.id}-details`}
          tabIndex={0}
        >
          <div className="transaction-main">
            <div className="transaction-merchant">
              <span className="merchant-name">{transaction.merchantName}</span>
              <span className="transaction-category">
                {transaction.category}
              </span>
            </div>
            <div className="transaction-amount">
              <span className={`amount ${transaction.type}`}>
                {transaction.type === "debit" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>
          <div
            className="transaction-details"
            id={`transaction-${transaction.id}-details`}
          >
            <div
              className="transaction-description"
              aria-label={`Description: ${transaction.description}`}
            >
              {transaction.description}
            </div>
            <div className="transaction-meta">
              <span
                className="transaction-date"
                aria-label={`Date: ${formatDate(transaction.timestamp)}`}
              >
                {formatDate(transaction.timestamp)}
              </span>
              <span
                className={`transaction-status ${transaction.status}`}
                aria-label={`Status: ${transaction.status}`}
                aria-live="polite"
              >
                {transaction.status}
              </span>
              {transaction.location && (
                <span
                  className="transaction-location"
                  aria-label={`Location: ${transaction.location}`}
                >
                  {transaction.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionModal
        transaction={transaction}
        isModalOpen={isModalOpen}
        closeTransactionModal={closeTransactionModal}
      />
    </>
  );
};
