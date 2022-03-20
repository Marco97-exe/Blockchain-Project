import { Navbar, Welcome, Footer, Services, Transactions } from "./components";
import { PrenotationProvider } from "./context/PrenotationContext";

const App = () => {
  return (
      <PrenotationProvider>
        <div className="min-h-screen">
          <div className="gradient-bg-welcome">
            <Navbar />
            <Welcome />
          </div>
          <Services />
          <Transactions />
          <Footer />
        </div>
      </PrenotationProvider>
  );
}

export default App;
