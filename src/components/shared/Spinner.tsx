const Spinner = () => {
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "4px solid #e0e0e0",
        borderTop: "4px solid #2196f3",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );
};

export default Spinner;
