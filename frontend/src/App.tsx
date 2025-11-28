
import React, { useState } from 'react';
import Login from './components/Login.tsx';
import PurchaseForm from './components/PurchaseForm.tsx';
import PurchaseList from './components/PurchaseList.tsx';
import Dashboard from './components/Dashboard.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dividas from './components/Dividas.tsx';
import Investimentos from './components/Investimentos.tsx';
import './global.css'


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
          <h2>Movimentações Mensais</h2>
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
      content = <Investimentos />;
      break;
    case 'dividas':
      content = <Dividas />;
      break;
    default:
      content = null;
  }

  return (
    <div className="app-container">
      <Sidebar selected={selectedPage} onSelect={setSelectedPage} />
      <main className="app-content">
        <h1>Controle de Finanças Pessoais</h1>
        <p>Bem-vindo, {loggedInUser}</p>
        {content}
      </main>

    </div>
  );
}

export default App;
