import React, { lazy, Suspense } from "react";

import HeaderSkeleton from "./skeletons/HeaderSkeleton";

const DashboardStats = lazy(() => import("./DashboardStats"));

const DashboardHeader: React.FC = () => {
  return (
    <div className="dashboard-header">
      <h1>FinTech Dashboard</h1>
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
};

export default DashboardHeader;
