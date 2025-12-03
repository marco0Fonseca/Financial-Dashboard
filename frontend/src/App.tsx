import React, { useState } from 'react';
import Login from './components/Login.tsx';
import PurchaseForm, { TransactionTypeClass } from './components/PurchaseForm.tsx';
import PurchaseList from './components/PurchaseList.tsx';
import Dashboard from './components/Dashboard.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dividas from './components/Dividas.tsx';
import Investimentos from './components/Investimentos.tsx';
import Header from './components/Header.tsx';
import './global.css';

export interface Purchase {
  description: string;
  amount: string;
  category: string;
  isRecurring: boolean;
  type: TransactionTypeClass.COST | TransactionTypeClass.GAIN;
  date?: string;
}

interface AuthData {
  email: string;
  id: string;
  token: string;
  name: string;
}

type Page = 'overview' | 'mensais' | 'investimentos' | 'dividas';

function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page>('overview');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  const [userId, setUserId] = useState(''); 
  const [token, setToken] = useState('');   
  const [categories, setCategories] = useState<any[]>([]);

  const fetchCategories = async (uid: string, tkn: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${uid}/categories`, {
        headers: { 'Authorization': `Bearer ${tkn}` }
      });
      if (response.ok) {
        const data = await response.json();
        const mappedCategories = data.map((c: any) => ({
          id: c.id,
          name: c.label
        }));
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const addPurchase = (purchase: Purchase) => {
    setPurchases([...purchases, purchase]);
  };

  const handleCategoryCreated = (newCategory: any) => {
    setCategories(prev => [...prev, { id: newCategory.id, name: newCategory.label }]);
  };

  const handleLogin = (data: AuthData) => {
    setLoggedInUser(data.name); // Salva o nome
    setUserId(data.id);
    setToken(data.token);
    fetchCategories(data.id, data.token);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setUserId('');
    setToken('');
    setCategories([]);
    setPurchases([]);
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
          <PurchaseForm
            onAddPurchase={addPurchase}
            onCategoryCreated={handleCategoryCreated}
            userId={userId}
            token={token}
            categories={categories}
          />
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
    // case 'dividas':
    //   content = <Dividas />;
    //   break;
    default:
      content = null;
  }

  return (
    <>
      <Header onLogout={handleLogout} user={loggedInUser} />
      
      {/* REMOVIDO style={{ paddingTop: 56 }} 
         Agora o CSS global cuida do posicionamento correto 
      */}
      <div className="app-container">
        <Sidebar selected={selectedPage} onSelect={setSelectedPage} />
        <main className="app-content">
          {content}
        </main>
      </div>
    </>
  );
}

export default App;