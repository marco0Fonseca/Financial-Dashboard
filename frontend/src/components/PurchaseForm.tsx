import React, { useState } from 'react';
import './PurchaseForm.css';

function PurchaseForm({ onAddPurchase }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [type, setType] = useState('gasto');

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddPurchase({ description, amount, category, isRecurring, type });
    setDescription('');
    setAmount('');
    setCategory('');
    setIsRecurring(false);
  };

  return (
    <form className="purchase-form" onSubmit={handleSubmit}>
      <div className="pf-header">
        <h2>Movimentações</h2>
        <p className="pf-sub">Registre despesas e ganhos rapidamente</p>
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
