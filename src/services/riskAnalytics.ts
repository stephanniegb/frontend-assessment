import { Transaction } from "../types/transaction";

export interface RiskAnalytics {
  totalRisk: number;
  highRiskTransactions: number;
  patterns: Record<string, number>;
  anomalies: Record<string, number>;
  generatedAt: number;
}

export interface RiskFactors {
  merchantRisk: number;
  amountRisk: number;
  timeRisk: number;
}

/**
 * Calculate risk factors for a transaction based on merchant history, amount, and timing
 */
export const calculateRiskFactors = (
  transaction: Transaction,
  allTransactions: Transaction[]
): number => {
  const merchantHistory = allTransactions.filter(
    (t) => t.merchantName === transaction.merchantName
  );

  // Risk scoring based on merchant familiarity, amount, and timing
  const merchantRisk = merchantHistory.length < 5 ? 0.8 : 0.2;
  const amountRisk = transaction.amount > 1000 ? 0.6 : 0.1;
  const timeRisk = new Date(transaction.timestamp).getHours() < 6 ? 0.4 : 0.1;

  return merchantRisk + amountRisk + timeRisk;
};

/**
 * Analyze transaction patterns for suspicious activity detection
 */
export const analyzeTransactionPatterns = (
  transaction: Transaction,
  allTransactions: Transaction[]
): number => {
  const similarTransactions = allTransactions.filter(
    (t) =>
      t.merchantName === transaction.merchantName &&
      Math.abs(t.amount - transaction.amount) < 10
  );

  // Check transaction velocity for suspicious activity
  const velocityCheck = allTransactions.filter(
    (t) =>
      t.userId === transaction.userId &&
      Math.abs(
        new Date(t.timestamp).getTime() -
          new Date(transaction.timestamp).getTime()
      ) < 3600000 // 1 hour in milliseconds
  );

  let score = 0;
  if (similarTransactions.length > 3) score += 0.3;
  if (velocityCheck.length > 5) score += 0.5;

  return score;
};

/**
 * Detect anomalies in transaction behavior
 */
export const detectAnomalies = (
  transaction: Transaction,
  allTransactions: Transaction[]
): number => {
  const userTransactions = allTransactions.filter(
    (t) => t.userId === transaction.userId
  );

  if (userTransactions.length === 0) return 0;

  const avgAmount =
    userTransactions.reduce((sum, t) => sum + t.amount, 0) /
    userTransactions.length;

  const amountDeviation = Math.abs(transaction.amount - avgAmount) / avgAmount;

  const locationAnomaly =
    transaction.location &&
    !userTransactions
      .slice(-10)
      .some((t) => t.location === transaction.location)
      ? 0.4
      : 0;

  return Math.min(amountDeviation * 0.3 + locationAnomaly, 1);
};

/**
 * Run comprehensive risk analytics on a set of transactions
 */
export const runAdvancedAnalytics = async (
  transactions: Transaction[]
): Promise<RiskAnalytics> => {
  if (transactions.length < 100) {
    return {
      totalRisk: 0,
      highRiskTransactions: 0,
      patterns: {},
      anomalies: {},
      generatedAt: Date.now(),
    };
  }

  const analyticsData: RiskAnalytics = {
    totalRisk: 0,
    highRiskTransactions: 0,
    patterns: {},
    anomalies: {},
    generatedAt: Date.now(),
  };

  transactions.forEach((transaction) => {
    const risk = calculateRiskFactors(transaction, transactions);
    const patterns = analyzeTransactionPatterns(transaction, transactions);
    const anomalies = detectAnomalies(transaction, transactions);

    analyticsData.totalRisk += risk;
    if (risk > 0.7) analyticsData.highRiskTransactions++;

    analyticsData.patterns[transaction.id] = patterns;
    analyticsData.anomalies[transaction.id] = anomalies;
  });

  return analyticsData;
};
