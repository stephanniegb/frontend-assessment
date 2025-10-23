import { UserProvider } from "./contexts/UserContext";
import "./App.css";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <UserProvider>
      <div className="App">
        <Dashboard />
      </div>
    </UserProvider>
  );
}

export default App;
