import React, { useState } from 'react';
import './PurchaseForm.css';

const API_BASE_URL = 'http://localhost:3001'; 

function getTodayISO() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

function formatDateDisplay(iso: string) {
  if (!iso) return '';
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd} / ${mm} / ${yyyy}`;
}

interface PurchaseFormProps {
  onAddPurchase?: (purchase: any) => void;
  onCategoryCreated?: (newCategory: any) => void;
  userId: string;
  token: string;
  categories: { id: string; name: string }[];
}

function PurchaseForm({ onAddPurchase, onCategoryCreated, userId, token, categories }: PurchaseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [type, setType] = useState('gasto');
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [date, setDate] = useState(getTodayISO());
  const [displayValue, setDisplayValue] = useState(formatDateDisplay(date));
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!userId) throw new Error("UserID está indefinido. Faça login novamente.");

      const categoryName = category.trim();
      
      // 1. Busca ou Cria Categoria
      let selectedCategory = categories.find(
        cat => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      
      let categoryId = selectedCategory ? selectedCategory.id : null;

      if (!categoryId) {
        const backendType = type === 'gasto' ? 'COST' : 'GAIN';
        const createCategoryUrl = `${API_BASE_URL}/api/users/${userId}/categories`;

        const catResponse = await fetch(createCategoryUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ label: categoryName, type: backendType }),
        });

        if (!catResponse.ok) {
          const errorData = await catResponse.json().catch(() => null);
          throw new Error(errorData?.error || 'Erro ao criar categoria');
        }

        const newCategoryData = await catResponse.json();
        categoryId = newCategoryData.id;
        if (onCategoryCreated) onCategoryCreated(newCategoryData);
      }

      // 2. Cria a Transação no Backend
      const createTransactionUrl = `${API_BASE_URL}/api/users/${userId}/categories/${categoryId}/transactions`;
      
      const payload = {
        value: parseFloat(amount),
        recurrence: isRecurring,
        date: date,
        // O backend ignora description, mas enviamos mesmo assim
      };

      const transResponse = await fetch(createTransactionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!transResponse.ok) {
        const errorData = await transResponse.json().catch(() => null);
        throw new Error(errorData?.error || 'Erro ao registrar transação.');
      }

      // 3. Atualiza a Tela (CORREÇÃO DO ERRO AQUI)
      // Não usamos transResponse.json() direto, pois ele retorna objetos complexos.
      // Montamos um objeto limpo compatível com a interface 'Purchase' do frontend.
      const newPurchaseFrontend = {
        description: description,
        amount: amount,
        category: category, // Passamos a STRING (nome), não o objeto
        isRecurring: isRecurring,
        type: type as 'gasto' | 'ganho',
        date: formatDateDisplay(date) // Mantém formato visual DD / MM / YYYY
      };

      if (onAddPurchase) onAddPurchase(newPurchaseFrontend);

      // Limpeza
      setDescription('');
      setAmount('');
      setCategory('');
      setIsRecurring(false);
      setType('gasto');
      setUseCurrentDate(true);
      setDate(getTodayISO());
      setDisplayValue(formatDateDisplay(getTodayISO()));

    } catch (error: any) {
      console.error("ERRO:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="purchase-form" onSubmit={handleSubmit}>
      <div className="pf-header"><h2>Registrar</h2></div>

      <fieldset className="pf-type">
        <legend>Tipo</legend>
        <label className={`pf-option ${type === 'gasto' ? 'active' : ''}`}>
          <input type="radio" name="type" value="gasto" checked={type === 'gasto'} onChange={() => setType('gasto')} /> Despesa
        </label>
        <label className={`pf-option ${type === 'ganho' ? 'active' : ''}`}>
          <input type="radio" name="type" value="ganho" checked={type === 'ganho'} onChange={() => setType('ganho')} /> Ganho
        </label>
      </fieldset>

      <div className="pf-grid">
        <label className="pf-field">
          <span className="pf-label">Descrição</span>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Ex: Mercado" />
        </label>

        <label className="pf-field">
          <span className="pf-label">Valor</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required step="0.01" min="0.01" placeholder="0.00" />
        </label>

        <label className="pf-field">
          <span className="pf-label">Categoria</span>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="Digite para criar" list="category-suggestions" />
          <datalist id="category-suggestions">
            {categories.map((cat) => <option key={cat.id} value={cat.name} />)}
          </datalist>
        </label>

        <label className="pf-field">
          <span className="pf-label">Data</span>
          {useCurrentDate ? (
            <input type="text" value={formatDateDisplay(getTodayISO())} disabled style={{ background: '#f3f3f3' }} className="pf-date-field" />
          ) : (
            <input type="text" value={displayValue} onChange={(e) => {
                const val = e.target.value; setDisplayValue(val);
                const match = val.replace(/\s/g, '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (match) setDate(`${match[3]}-${match[2]}-${match[1]}`);
              }} className="pf-date-field" placeholder="DD / MM / AAAA" maxLength={14} />
          )}
          <div style={{ marginTop: '8px' }}>
            <label className="pf-recurring" style={{ margin: 0, fontWeight: 400 }}>
              <input type="checkbox" checked={useCurrentDate} onChange={(e) => {
                  setUseCurrentDate(e.target.checked);
                  if (e.target.checked) { const t = getTodayISO(); setDate(t); setDisplayValue(formatDateDisplay(t)); }
                }} />
              <span className="pf-label-inline">Usar data atual</span>
            </label>
          </div>
        </label>

        <div className="pf-field">
          <label className="pf-recurring" style={{ margin: 0, fontWeight: 400 }}>
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            <span className="pf-label-inline">Recorrente</span>
          </label>
        </div>
      </div>

      <div className="pf-actions">
        <button className="btn primary" type="submit" disabled={isLoading}>{isLoading ? '...' : 'Salvar'}</button>
      </div>
    </form>
  );
}

export default PurchaseForm;