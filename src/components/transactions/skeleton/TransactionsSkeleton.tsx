import Spinner from "../../shared/Spinner";

const TransactionsSkeleton: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="transaction-list-container"
    >
      <Spinner />
    </div>
  );
};

export default TransactionsSkeleton;
