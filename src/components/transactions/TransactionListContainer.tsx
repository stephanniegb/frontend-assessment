import { List } from "react-window";
import { TransactionItem } from "./TransactionItem";
import { useTransactionContext } from "../../contexts/TransactionContext";
import { useState } from "react";
import { useUserContext } from "../../contexts/UserContext";
const TransactionListContainer = () => {
  const { filteredTransactions } = useTransactionContext();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const { handleTransactionClick } = useUserContext();

  const handleItemClick = (index: number) => {
    const updatedSelected = new Set(selectedItems);
    const transaction = filteredTransactions[index];
    if (updatedSelected.has(transaction.id)) {
      updatedSelected.delete(transaction.id);
    } else {
      updatedSelected.add(transaction.id);
    }
    setSelectedItems(updatedSelected);
    handleTransactionClick(transaction);
  };

  return (
    <div
      className="transaction-list-container"
      role="grid"
      aria-labelledby="transaction-list-title"
      aria-rowcount={filteredTransactions.length}
      tabIndex={0}
    >
      <List
        rowComponent={TransactionItem}
        rowCount={filteredTransactions.length}
        rowHeight={189}
        rowProps={{
          transactions: filteredTransactions,
          onItemClick: handleItemClick,
          selectedItems: selectedItems,
        }}
      />
    </div>
  );
};

export default TransactionListContainer;
