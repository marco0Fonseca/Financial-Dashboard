import React from 'react';

function PurchaseList({ purchases }) {
  return (
    <div>
      <h2>Histórico Mensal</h2>
      {purchases.length === 0 ? (
        <p>Nenhuma compra registrada.</p>
      ) : (
        <ul>
          {purchases.map((p, index) => (
            <li key={index}>
              {p.description} — R${p.amount} — Categoria: {p.category}
              {p.isRecurring && ' (Recorrente)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PurchaseList;

