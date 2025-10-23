import { runAdvancedAnalytics } from "../services/riskAnalytics";

onmessage = async (event) => {
  const { transactions } = event.data;
  const analytics = await runAdvancedAnalytics(transactions);
  self.postMessage({ type: "ANALYTICS_COMPLETED", data: analytics });
};
