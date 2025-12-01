import React, { useState } from 'react';
import './PurchaseForm.css';

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
  onAddPurchase?: (purchase: any) => void; // Torna opcional
  userId: string;
  token: string;
  categories: { id: string; name: string }[]; // Lista de categorias do usuário
}

function PurchaseForm({ onAddPurchase, userId, token, categories }: PurchaseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [type, setType] = useState('gasto');
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [date, setDate] = useState(getTodayISO());
  const [displayValue, setDisplayValue] = useState(formatDateDisplay(date));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Busca o categoryId pelo nome digitado
    const selectedCategory = categories.find(cat => cat.name.toLowerCase() === category.trim().toLowerCase());
    if (!selectedCategory) {
      alert('Categoria não encontrada. Cadastre ou selecione uma categoria válida.');
      return;
    }
    const categoryId = selectedCategory.id;

    const payload = {
      description,
      value: parseFloat(amount),
      isRecurring,
      type,
      date,
    };

    try {
      const response = await fetch(
        `/api/users/${userId}/categories/${categoryId}/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error('Erro ao registrar transação');
      }
      const data = await response.json();
      if (onAddPurchase) onAddPurchase(data);

      // Limpa o formulário
      setDescription('');
      setAmount('');
      setCategory('');
      setIsRecurring(false);
      setType('gasto');
      setUseCurrentDate(true);
      setDate(getTodayISO());
    } catch (error: any) {
      alert(error.message || 'Erro ao registrar transação');
    }
  };

  return (
    <form className="purchase-form" onSubmit={handleSubmit}>
      <div className="pf-header">
        <h2>Registrar</h2>
        <p className="pf-sub"></p>
      </div>

      <fieldset className="pf-type" aria-label="Tipo de movimentação">
        <legend>Tipo</legend>
        <label className={`pf-option ${type === 'gasto' ? 'active' : ''}`}>
          <input
            type="radio"
            name="type"
            value="gasto"
            checked={type === 'gasto'}
            onChange={() => setType('gasto')}
          />
          Despesa
        </label>

        <label className={`pf-option ${type === 'ganho' ? 'active' : ''}`}>
          <input
            type="radio"
            name="type"
            value="ganho"
            checked={type === 'ganho'}
            onChange={() => setType('ganho')}
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
            placeholder="Ex: Compra no supermercado"
          />
        </label>

        <label className="pf-field">
          <span className="pf-label">Valor</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            step="0.01"
            max="9999999.99"
            min="0.01"
            placeholder="0.00"
          />
        </label>

        <label className="pf-field">
          <span className="pf-label">Categoria</span>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="Ex: Alimentação"
          />
        </label>

        <label className="pf-field">
          <span className="pf-label">Data</span>
          {useCurrentDate ? (
            <input
              type="text"
              value={formatDateDisplay(getTodayISO())}
              disabled
              style={{background: '#f3f3f3' }}
              className="pf-date-field"
            />
          ) : (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => {
                const val = e.target.value.replace(/\s/g, '');
                setDisplayValue(e.target.value);
                
                const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (match) {
                  setDate(`${match[3]}-${match[2]}-${match[1]}`);
                }
              }}
              className="pf-date-field"
              placeholder="DD / MM / AAAA"
              maxLength={14}
            />
          )}
          
          <div style={{ marginTop: '8px' }}>
            <label className="pf-recurring" style={{margin: 0, padding: 0, fontWeight: 400}}>
              <input
                type="checkbox"
                checked={useCurrentDate}
                onChange={(e) => {
                  setUseCurrentDate(e.target.checked);
                  if (e.target.checked) setDate(getTodayISO());
                }}
              />
              <span className="pf-label-inline">Usar data atual</span>
            </label>
          </div>
        </label>

        <div className="pf-field">
          <label className="pf-recurring" style={{margin: 0, padding: 0, fontWeight: 400}}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span className="pf-label-inline">Recorrente</span>
          </label>
        </div>
      </div>

      <div className="pf-actions">
        <button className="btn primary" type="submit">Salvar</button>
        <button
          className="btn outline"
          type="button"
          onClick={() => {
            setDescription('');
            setAmount('');
            setCategory('');
            setIsRecurring(false);
            setType('gasto');
          }}
        >Limpar</button>
      </div>
    </form>
  );
}

export default PurchaseForm;