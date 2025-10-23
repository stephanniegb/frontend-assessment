import React from "react";

import DashboardControls from "../components/header/DashboardControls";
import DashboardHeader from "../components/header/DashboardHeader";
import TransactionList from "../components/transactions/TransactionList";
import { useDataRefresh } from "../hooks/useDataRefresh";

const REFRESH_INTERVAL_MS = 60000; // 1 minute

const Dashboard: React.FC = () => {
  useDataRefresh(REFRESH_INTERVAL_MS);
  return (
    <div className="dashboard">
      <DashboardHeader />
      <DashboardControls />
      <TransactionList />
    </div>
  );
};

export default Dashboard;
