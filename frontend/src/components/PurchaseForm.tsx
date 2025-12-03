import React, { useState, useEffect } from 'react';
import './PurchaseForm.css';

// --- Tipos e Interfaces ---
export enum TransactionTypeClass {
  COST = "COST",
  GAIN = "GAIN",
  INVESTMENT = "INVESTMENT"
}

interface PurchaseData {
  description: string;
  amount: string;
  category: string;
  isRecurring: boolean;
  type: TransactionTypeClass;
  date: string;
}

interface PurchaseFormProps {
  userId: string | null;
  onAddPurchase: (purchase: PurchaseData) => void;
}

interface CategorySelectProps {
  userId: string | null;
  category: string;
  setCategory: (value: string) => void;
  type: TransactionTypeClass;
  error?: string; // Novo prop para receber o erro
}

interface CategoryItem {
  id: string;
  label: string;
}

// --- Helpers de Data ---
function getTodayISO() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

// --- FUNÇÃO CORRIGIDA ---
function formatDateDisplay(iso: string) {
  if (!iso) return '';
  
  // 1. Proteção: Se já tem barras, assume que já está formatada e retorna direto
  if (iso.includes('/')) return iso;
  
  // 2. Tenta fazer o split pelo padrão ISO (YYYY-MM-DD)
  const parts = iso.split('-');
  
  // 3. Se não tiver as 3 partes (Ano, Mês, Dia), retorna o valor original para evitar "undefined"
  if (parts.length !== 3) return iso;

  const [yyyy, mm, dd] = parts;
  return `${dd} / ${mm} / ${yyyy}`;
}
// ------------------------

// --- Componente: CategorySelect ---
function CategorySelect({ userId, category, setCategory, type, error }: CategorySelectProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  userId = localStorage.getItem("userId");
  useEffect(() => {
    async function loadCategories() {
      if (!userId) return;
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Erro ao carregar categorias", err);
      }
    }
    loadCategories();
  }, [userId, type]);

  async function createCategory() {
    if (!newCategory.trim() || !userId) return;
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label: newCategory, type }),
      });
      
      if (res.ok) {
        const created = await res.json();
        setCategories(prev => [...prev, created]);
        setCategory(created.label); // Seleciona a nova categoria automaticamente
        setNewCategory("");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Erro ao criar categoria", err);
    }
  }

  return (
    <>
      <label className="pf-field">
        <span className="pf-label">Categoria</span>
        <div className="pf-category-row">
          <select
            className={`pf-select ${error ? 'pf-input-error' : ''}`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Selecione...</option>
            {categories.map(c => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>
          <button type="button" className="pf-add-btn" onClick={() => setIsModalOpen(true)} title="Nova categoria">+</button>
        </div>
        
        {/* O Warning agora fica DENTRO do grid item da categoria, evitando quebra de layout */}
        {error && (
          <div className="pf-warning">
            <span className="pf-warning-icon">!</span>
            <span>{error}</span>
          </div>
        )}
      </label>

      {/* Modal usando as classes CSS originais em vez de style inline */}
      {isModalOpen && (
        <div className="pf-modal-overlay">
          <div className="pf-modal">
            <h3>Nova Categoria ({type === TransactionTypeClass.COST ? "Despesa" : "Ganho"})</h3>
            <input
              type="text"
              placeholder="Ex: Lazer"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              autoFocus
            />
            <div className="pf-modal-actions">
              <button type="button" className="pf-btn-cancel" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="pf-btn-create" onClick={createCategory}>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Componente Principal: PurchaseForm ---
export function PurchaseForm({ userId, onAddPurchase }: PurchaseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [type, setType] = useState<TransactionTypeClass>(TransactionTypeClass.COST);
  
  // Data State
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [date, setDate] = useState(getTodayISO());
  const [displayValue, setDisplayValue] = useState(formatDateDisplay(date));
  const [isLoading, setIsLoading] = useState(false);

  const [warning, setWarning] = useState('');

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setIsRecurring(false);
    setType(TransactionTypeClass.COST);
    setUseCurrentDate(true);
    setDate(getTodayISO());
    setDisplayValue(formatDateDisplay(getTodayISO()));
    setWarning('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!category) {
      setWarning('Selecione uma categoria.');
      return;
    }

    setWarning('');
    onAddPurchase({ 
      description, 
      amount, 
      category, 
      isRecurring, 
      type, 
      date 
    });

    resetForm();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setDisplayValue(rawVal);
    
    // Tenta extrair DD/MM/AAAA
    const cleanVal = rawVal.replace(/\s/g, '');
    const match = cleanVal.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      setDate(`${match[3]}-${match[2]}-${match[1]}`);
    }
  };

  const handleUseCurrentDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setUseCurrentDate(isChecked);
    if (isChecked) {
      const today = getTodayISO();
      setDate(today);
      setDisplayValue(formatDateDisplay(today));
    } else {
      setDisplayValue(""); // Limpa para o usuário digitar se desmarcar
    }
  };

  return (
    <form className="purchase-form" onSubmit={handleSubmit}>
      <div className="pf-header">
        <h2>Registrar Movimentação</h2>
        <p className="pf-sub">Preencha os dados abaixo para atualizar seu dashboard.</p>
      </div>

      <fieldset className="pf-type">
        <legend>Tipo</legend>
        <label className={`pf-option ${type === TransactionTypeClass.COST ? 'active' : ''}`}>
          <input
            type="radio"
            name="type"
            value={TransactionTypeClass.COST}
            checked={type === TransactionTypeClass.COST}
            onChange={() => setType(TransactionTypeClass.COST)}
          />
          Despesa
        </label>

        <label className={`pf-option ${type === TransactionTypeClass.GAIN ? 'active' : ''}`}>
          <input
            type="radio"
            name="type"
            value={TransactionTypeClass.GAIN}
            checked={type === TransactionTypeClass.GAIN}
            onChange={() => setType(TransactionTypeClass.GAIN)}
          />
          Ganho
        </label>
      </fieldset>

      <div className="pf-grid">
        <label className="pf-field">
          <span className="pf-label">Descrição</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Ex: Mercado mensal"
          />
        </label>

        <label className="pf-field">
          <span className="pf-label">Valor (R$)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            step="0.01"
            min="0.01"
            placeholder="0.00"
          />
        </label>

        {/* Componente de Categoria recebendo o Warning via prop */}
        <CategorySelect
          userId={userId}
          category={category}
          setCategory={(cat) => {
            setCategory(cat);
            if (cat) setWarning(''); // Limpa o erro ao selecionar
          }}
          type={type}
          error={warning}
        />

        <label className="pf-field">
          <span className="pf-label">Data</span>
          <input
            type="text"
            value={displayValue}
            onChange={handleDateChange}
            disabled={useCurrentDate}
            className="pf-date-field"
            placeholder="DD / MM / AAAA"
            maxLength={14}
            style={useCurrentDate ? { background: '#f9fafb', color: '#6b7280' } : {}}
          />
          
          <div style={{ marginTop: '8px' }}>
            <label className="pf-recurring" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useCurrentDate}
                onChange={handleUseCurrentDateChange}
              />
              <span className="pf-label-inline">Usar data de hoje</span>
            </label>
          </div>
        </label>

        <div className="pf-field">
          {/* Espaçador visual ou label vazia para alinhar com o grid se necessário, 
              mas aqui usamos apenas o checkbox alinhado */}
          <span className="pf-label">&nbsp;</span>
          <label className="pf-recurring" style={{ cursor: 'pointer', height: '42px' }}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span className="pf-label-inline">Transação Recorrente</span>
          </label>
        </div>
      </div>

      <div className="pf-actions">
        <button className="btn outline" type="button" onClick={resetForm}>
          Limpar
        </button>
        <button className="btn primary" type="submit">
          Salvar
        </button>
      </div>
    </form>
  );
}

export default PurchaseForm;