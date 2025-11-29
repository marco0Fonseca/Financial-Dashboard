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
  onAddPurchase: (purchase: any) => void;
}

function PurchaseForm({ onAddPurchase }: PurchaseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [type, setType] = useState('gasto');
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [date, setDate] = useState(getTodayISO());

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddPurchase({ description, amount, category, isRecurring, type, date });
    setDescription('');
    setAmount('');
    setCategory('');
    setIsRecurring(false);
    setType('gasto');
    setUseCurrentDate(true);
    setDate(getTodayISO());
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

        {/* Data field to the right of Categoria */}
        <label className="pf-field">
          <span className="pf-label">Data</span>
          {useCurrentDate ? (
            <input
              type="text"
              value={formatDateDisplay(getTodayISO())}
              disabled
              style={{ color: '#888', background: '#f3f3f3' }}
              className="pf-date-field"
            />
          ) : (
            <input
              type="text"
              value={formatDateDisplay(date)}
              onChange={(e) => {
                // Accept only DD/MM/AAAA and convert to ISO
                const val = e.target.value.replace(/\s/g, '');
                const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (match) {
                  setDate(`${match[3]}-${match[2]}-${match[1]}`);
                } else {
                  setDate(date); // ignore invalid
                }
              }}
              className="pf-date-field"
              placeholder="DD / MM / AAAA"
              maxLength={14}
            />
          )}
          <label style={{ display: 'block', marginTop: 4, fontWeight: 400 }}>
            <input
              type="checkbox"
              checked={useCurrentDate}
              onChange={(e) => {
                setUseCurrentDate(e.target.checked);
                if (e.target.checked) setDate(getTodayISO());
              }}
              style={{ marginRight: 6 }}
            />
            Usar data atual
          </label>
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
