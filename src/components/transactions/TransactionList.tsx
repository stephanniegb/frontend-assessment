import React, { Suspense, lazy } from "react";

import { useTransactionContext } from "../../contexts/TransactionContext";
import TransactionsSkeleton from "./skeleton/TransactionsSkeleton";

const TransactionListContainer = lazy(
  () => import("./TransactionListContainer")
);

const TransactionList: React.FC = () => {
  const { summary } = useTransactionContext();

  return (
    <div className="dashboard-content">
      <div
        className="transaction-list"
        role="region"
        aria-label="Transaction list"
      >
        <div className="transaction-list-header">
          <h2 id="transaction-list-title">Transactions</h2>
          <span className="total-amount" aria-live="polite">
            Total:{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(summary?.totalAmount || 0)}
          </span>
        </div>

        <Suspense fallback={<TransactionsSkeleton />}>
          <TransactionListContainer />
        </Suspense>
      </div>
    </div>
  );
};

export default TransactionList;
