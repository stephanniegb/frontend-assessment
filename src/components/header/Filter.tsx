import { useUserContext } from "../../contexts/UserContext";
import { TRANSACTION_CATEGORIES } from "../../static";

const Filter: React.FC = () => {
  const { handleFilterChange, filters } = useUserContext();

  return (
    <div className="filter-controls">
      <select
        aria-label="Filter transactions by type"
        value={filters.type || "all"}
        onChange={(e) =>
          handleFilterChange({
            ...filters,
            type: e.target.value as "debit" | "credit" | "all",
          })
        }
      >
        <option value="all">All Types</option>
        <option value="debit">Debit</option>
        <option value="credit">Credit</option>
      </select>

      <select
        aria-label="Filter transactions by status"
        value={filters.status || "all"}
        onChange={(e) =>
          handleFilterChange({
            ...filters,
            status: e.target.value as
              | "pending"
              | "completed"
              | "failed"
              | "all",
          })
        }
      >
        <option value="all">All Status</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>

      <select
        aria-label="Filter transactions by category"
        value={filters.category || ""}
        onChange={(e) =>
          handleFilterChange({ ...filters, category: e.target.value })
        }
      >
        <option value="">All Categories</option>
        {TRANSACTION_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
