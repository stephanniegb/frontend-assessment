import { Clock, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import StatSkeleton from "./StatSkeleton";

const HeaderSkeleton = () => {
  return (
    <div className="dashboard-stats">
      <StatSkeleton icon={<DollarSign size={24} />} label="Total Amount" />
      <StatSkeleton icon={<TrendingUp size={24} />} label="Total Credits" />
      <StatSkeleton icon={<TrendingDown size={24} />} label="Total Debits" />
      <StatSkeleton icon={<Clock size={24} />} label="Total Transactions" />
    </div>
  );
};

export default HeaderSkeleton;
