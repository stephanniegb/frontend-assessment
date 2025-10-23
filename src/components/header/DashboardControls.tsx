import { SearchBar } from "./SearchBar";
import Filter from "./Filter";

const DashboardControls = () => {
  return (
    <div className="dashboard-controls">
      <SearchBar />
      <Filter />
    </div>
  );
};

export default DashboardControls;
