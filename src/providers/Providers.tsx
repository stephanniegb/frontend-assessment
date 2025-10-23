import { TransactionProvider } from "../contexts/TransactionContext";
import { UserProvider } from "../contexts/UserContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TransactionProvider>
      <UserProvider>{children}</UserProvider>
    </TransactionProvider>
  );
};

export default Providers;
