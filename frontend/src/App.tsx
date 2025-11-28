
import React, { useState } from 'react';
import './App.css';
import Login from './components/Login.tsx';
import PurchaseForm from './components/PurchaseForm.tsx';
import PurchaseList from './components/PurchaseList.tsx';
import Dashboard from './components/Dashboard.tsx';
import Sidebar from './components/Sidebar.tsx';

export interface Purchase {
  description: string;
  amount: string;
  category: string;
  isRecurring: boolean;
  type: 'gasto' | 'ganho';
}

type Page = 'overview' | 'mensais' | 'investimentos' | 'dividas';

function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page>('overview');
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const addPurchase = (purchase: Purchase) => {
    setPurchases([...purchases, purchase]);
  };

  const handleLogin = (email: string) => {
    setLoggedInUser(email);
  };

  if (!loggedInUser) {
    return <Login onLogin={handleLogin} />;
  }

  let content: React.ReactNode;
  switch (selectedPage) {
    case 'overview':
      content = (
        <>
          <h2>Visão Geral</h2>
          <Dashboard purchases={purchases} />
        </>
      );
      break;
    case 'mensais':
      content = (
        <>
          <h2>Movimentações</h2>
          <PurchaseForm onAddPurchase={addPurchase} />
          <PurchaseList
            purchases={purchases}
            onDelete={(index: number) => {
              setPurchases((prev) => prev.filter((_, i) => i !== index));
            }}
          />
        </>
      );
      break;
    case 'investimentos':
      content = <h2>Investimentos - Em desenvolvimento</h2>;
      break;
    case 'dividas':
      content = <h2>Dívidas - Em desenvolvimento</h2>;
      break;
    default:
      content = null;
  }

  return (
    <div className="app-container">
      <Sidebar selected={selectedPage} onSelect={setSelectedPage} />
      <main className="app-content">
        {content}
      </main>

    </div>
  );
}

export default App;
