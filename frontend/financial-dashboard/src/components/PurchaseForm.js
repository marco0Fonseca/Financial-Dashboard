import React, { useState } from 'react';

function PurchaseForm({ onAddPurchase }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);


  const handleSubmit = (event) => {
    event.preventDefault();
    onAddPurchase({ description, amount, category, isRecurring });
    setDescription('');
    setAmount('');
    setCategory('');
    setIsRecurring(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar Despesa</h2>
      <label>
        Descrição:
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Valor:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          step="0.01"
        />
      </label>
      <br />
      <label>
        Categoria:
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit">Salvar Despesa</button>
      <label>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        [Despesa Recorrente]
      </label>
      <br />
    </form>
  );
}

export default PurchaseForm;

