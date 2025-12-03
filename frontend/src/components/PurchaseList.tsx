import React from 'react';

// Interface local para garantir que não dependa de importações quebradas
interface Purchase {
  description: string;
  amount: string;
  category: string;
  isRecurring: boolean;
  type: 'gasto' | 'ganho';
  date?: string;
}

// --- FUNÇÃO DE DATA CORRIGIDA E BLINDADA ---
// Funciona tanto para datas "01/12/2025" quanto "2025-12-01"
export function formatDateDisplay(dateString?: string) {
  if (!dateString) return '';

  // 1. Se já tem barras, retorna direto (veio do formulário)
  if (dateString.includes('/')) return dateString;

  // 2. Se tem traços, converte do formato banco de dados
  if (dateString.includes('-')) {
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return dateString;
        
        // Usa UTC para evitar problemas de fuso horário voltando 1 dia
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const year = dateObj.getUTCFullYear();
        return `${day} / ${month} / ${year}`;
    } catch (e) {
        return dateString;
    }
  }
  return dateString;
}

interface PurchaseListProps {
  purchases: Purchase[];
  onDelete?: (index: number) => void;
}

// Adicionado 'purchases = []' para evitar erro se a lista vier vazia
const PurchaseList: React.FC<PurchaseListProps> = ({ purchases = [], onDelete }) => {
  return (
    <div>
      <h2>Histórico</h2>
      {!purchases || purchases.length === 0 ? (
        <p>Nenhuma movimentação registrada.</p>
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

              {/* Símbolo de Recorrente */}
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

              {/* Data (Usando a função corrigida) */}
              <div style={{ flexBasis: '120px', fontStyle: 'italic', color: '#555', textAlign: 'left' }}>
                {formatDateDisplay(p.date)}
              </div>

              {/* Categoria */}
              <div style={{ flexBasis: '120px', fontStyle: 'italic', color: '#555', textAlign: 'left' }}>
                {p.category}
              </div>

              {/* Botão de Excluir */}
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
                // Correção de tipagem para o evento de mouse
                onMouseOver={(e: any) => (e.currentTarget.style.background = 'rgba(231,76,60,0.08)')}
                onMouseOut={(e: any) => (e.currentTarget.style.background = 'none')}
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseList;