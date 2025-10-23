import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Providers from "./providers/Providers";
import "./styles/index.css";

function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <div className="App">
          <Dashboard />
        </div>
      </Providers>
    </ErrorBoundary>
  );
}

export default App;
