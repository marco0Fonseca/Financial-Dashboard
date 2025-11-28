import React from 'react';

function PurchaseList({ purchases, onDelete }) {
  return (
    <div>
      <h2>Histórico</h2>
      {purchases.length === 0 ? (
        <p>Nenhuma compra registrada.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {purchases.map((p, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                backgroundColor: '#fff',
                color: p.type === 'gasto' ? 'red' : 'green',
                fontWeight: 'bold',
              }}
            >
              {/* Sinal ( + ) ou ( - ) */}
              <div style={{ flexBasis: '40px', textAlign: 'left' }}>
                {p.type === 'gasto' ? '( - )' : '( + )'}
              </div>

              {/* Preço */}
              <div style={{ flexBasis: '120px', textAlign: 'left', paddingRight: '20px', minWidth: '120px' }}>
                R${parseFloat(p.amount).toFixed(2)}
              </div>

              {/* Recorrente Symbol */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '48px',
                maxWidth: '48px',
                height: '100%',
                color: '#1aa8bc',
                fontSize: '1.3em',
              }}>
                {p.isRecurring ? '↻' : ''}
              </div>

              {/* Descrição */}
              <div style={{ flexGrow: 1, paddingRight: '20px', textAlign: 'left' }}>
                {p.description}
              </div>

              {/* Categoria */}
              <div style={{ flexBasis: '120px', fontStyle: 'italic', color: '#555', textAlign: 'left' }}>
                {p.category}
              </div>

              {/* Delete Button */}
              <button
                onClick={() => onDelete && onDelete(index)}
                style={{
                  marginLeft: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#e74c3c',
                  fontWeight: 'bold',
                  fontSize: '1.1em',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  transition: 'background 0.15s',
                }}
                title="Excluir"
                aria-label="Excluir compra"
                type="button"
                onMouseOver={e => e.currentTarget.style.background = 'rgba(231,76,60,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PurchaseList;
