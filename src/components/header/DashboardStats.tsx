import { Clock, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTransactionContext } from "../../contexts/TransactionContext";

const DashboardStats = () => {
  const analyticsWorkerRef = useRef<Worker | null>(null);
  const [riskAnalytics, setRiskAnalytics] = useState<{
    totalRisk: number;
    highRiskTransactions: number;
    patterns: Record<string, number>;
    anomalies: Record<string, number>;
    generatedAt: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const createAnalyticsWorker = () => {
    if (typeof window !== "undefined" && window.Worker) {
      analyticsWorkerRef.current = new Worker(
        new URL("../../workers/analyticsWorker.ts", import.meta.url),
        { type: "module" }
      );
    }
  };

  useEffect(() => {
    createAnalyticsWorker();

    return () => {
      if (analyticsWorkerRef.current) {
        analyticsWorkerRef.current.terminate();
      }
    };
  }, []);

  const { filteredTransactions, transactions, summary } =
    useTransactionContext();

  useEffect(() => {
    if (filteredTransactions.length > 2000) {
      setIsAnalyzing(true);
      if (analyticsWorkerRef.current) {
        analyticsWorkerRef.current.postMessage({
          transactions: filteredTransactions,
        });
        analyticsWorkerRef.current.onmessage = (event) => {
          if (event.data.type === "ANALYTICS_COMPLETED") {
            setRiskAnalytics(event.data.data);
            setIsAnalyzing(false);
          }
        };
      } else {
        // fallback if worker is not available
      }
    }

    return () => {
      if (analyticsWorkerRef.current) {
        analyticsWorkerRef.current.terminate();
      }
    };
  }, [filteredTransactions]);

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-icon">
          <DollarSign size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">
            ${summary ? summary.totalAmount.toLocaleString() : "0"}
          </div>
          <div className="stat-label">Total Amount</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <TrendingUp size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">
            ${summary ? summary.totalCredits.toLocaleString() : "0"}
          </div>
          <div className="stat-label">Total Credits</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <TrendingDown size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">
            ${summary ? summary.totalDebits.toLocaleString() : "0"}
          </div>
          <div className="stat-label">Total Debits</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <Clock size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-value">
            {filteredTransactions.length.toLocaleString()}
            {filteredTransactions.length !== transactions.length && (
              <span className="stat-total">
                {" "}
                of {transactions.length.toLocaleString()}
              </span>
            )}
          </div>
          <div className="stat-label">
            Transactions
            {isAnalyzing && <span> (Analyzing...)</span>}
            {riskAnalytics && (
              <span> - Risk: {riskAnalytics.highRiskTransactions}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
