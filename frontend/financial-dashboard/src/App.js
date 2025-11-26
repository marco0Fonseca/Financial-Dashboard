import React, { useState } from 'react';
import Login from './components/Login';
import PurchaseForm from './components/PurchaseForm';
import PurchaseList from './components/PurchaseList';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedPage, setSelectedPage] = useState('overview');
  const [purchases, setPurchases] = useState([]);

  const addPurchase = (purchase) => {
    setPurchases([...purchases, purchase]);
  };

  const handleLogin = (email) => {
    setLoggedInUser(email);
  };

  if (!loggedInUser) {
    return <Login onLogin={handleLogin} />;
  }

  let content;
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
          <h2>Gastos Mensais</h2>
          <PurchaseForm onAddPurchase={addPurchase} />
          <PurchaseList purchases={purchases} />
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
        <h1>Controle de Finanças Pessoais</h1>
        <p>Bem-vindo, {loggedInUser}</p>
        {content}
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          height: 100vh;
          background: #ecf0f1;
          color: #2c3e50;
          font-family: Arial, sans-serif;
        }
        .app-content {
          flex-grow: 1;
          padding: 20px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

export default App;

