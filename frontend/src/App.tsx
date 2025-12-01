import React, { useState, useEffect } from 'react';
import Login from './components/Login.tsx';
import PurchaseForm from './components/PurchaseForm.tsx';
import PurchaseList from './components/PurchaseList.tsx';
import Dashboard from './components/Dashboard.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dividas from './components/Dividas.tsx';
import Investimentos from './components/Investimentos.tsx';
import Header from './components/Header.tsx';
import './global.css'

export interface Purchase {
  description: string;
  amount: string;
  category: string;
  isRecurring: boolean;
  type: 'gasto' | 'ganho';
  date?: string;
}

// Interface para os dados vindos do Login
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
  
  // Estados vitais para a API
  const [userId, setUserId] = useState(''); 
  const [token, setToken] = useState('');   
  const [categories, setCategories] = useState<any[]>([]); // Array de categorias

  // Função auxiliar para buscar categorias do backend
  const fetchCategories = async (uid: string, tkn: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${uid}/categories`, {
        headers: {
          'Authorization': `Bearer ${tkn}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // O backend retorna algo como [{id: 1, label: "Comida", ...}]
        // Vamos mapear para o formato que o front espera {id, name}
        const mappedCategories = data.map((c: any) => ({
          id: c.id,
          name: c.label // O backend usa 'label', mas o front usa 'name' no PurchaseForm
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

  // Callback chamado quando uma NOVA categoria é criada pelo PurchaseForm
  const handleCategoryCreated = (newCategory: any) => {
    setCategories(prev => [...prev, { id: newCategory.id, name: newCategory.label }]);
  };

  // Função atualizada para receber o objeto completo do Login
  const handleLogin = (data: AuthData) => {
    setLoggedInUser(data.email);
    setUserId(data.id);
    setToken(data.token);
    
    // Busca as categorias imediatamente após o login
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
            onCategoryCreated={handleCategoryCreated} // Importante para atualizar a lista
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
    case 'dividas':
      content = <Dividas />;
      break;
    default:
      content = null;
  }

  return (
    <>
      <Header onLogout={handleLogout} user={loggedInUser} />
      <div className="app-container" style={{ paddingTop: 56 }}>
        <Sidebar selected={selectedPage} onSelect={setSelectedPage} />
        <main className="app-content">
          {content}
        </main>
      </div>
    </>
  );
}

export default App;