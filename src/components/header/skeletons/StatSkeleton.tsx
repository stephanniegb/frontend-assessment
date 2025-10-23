const StatSkeleton = (props: { icon: React.ReactNode; label: string }) => {
  const { icon, label } = props;
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "108px",
        width: "100%",
      }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">loading...</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatSkeleton;
