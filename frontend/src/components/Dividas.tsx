import React, { useState } from 'react';

interface Divida {
  id: number;
  nome: string;
  credor: string;
  valorTotal: number;
  valorPago: number;
}

const Dividas: React.FC = () => {
  const [lista, setLista] = useState<Divida[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoCredor, setNovoCredor] = useState('');
  const [novoTotal, setNovoTotal] = useState('');
  const [pagamentos, setPagamentos] = useState<{ [key: number]: string }>({});
  const [erros, setErros] = useState<{ [key: number]: string }>({});

  const handleAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoCredor || !novoTotal) {
      alert("Preencha todos os campos!");
      return;
    }

    const novaDivida: Divida = {
      id: Date.now(),
      nome: novoNome,
      credor: novoCredor,
      valorTotal: parseFloat(novoTotal),
      valorPago: 0
    };

    setLista([...lista, novaDivida]);
    setNovoNome('');
    setNovoCredor('');
    setNovoTotal('');
  };

  const handleExcluir = (id: number) => {
    if (window.confirm("Tem certeza que deseja apagar essa dívida?")) {
      setLista(lista.filter(d => d.id !== id));
    }
  };

  const handlePagar = (id: number) => {
    const valorDigitado = parseFloat(pagamentos[id] || '0');
    const dividaAtual = lista.find(d => d.id === id);

    if (!dividaAtual || !valorDigitado || valorDigitado <= 0) return;

    const faltaPagar = dividaAtual.valorTotal - dividaAtual.valorPago;

    if (valorDigitado > faltaPagar) {
      setErros({ ...erros, [id]: `Erro: Falta apenas R$ ${faltaPagar.toFixed(2)}` });
      setTimeout(() => setErros({ ...erros, [id]: '' }), 3000);
      return;
    }

    const novaLista = lista.map(d =>
      d.id === id
        ? { ...d, valorPago: d.valorPago + valorDigitado }
        : d
    );

    setLista(novaLista);
    setPagamentos({ ...pagamentos, [id]: '' });
    setErros({ ...erros, [id]: '' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <h2>Minhas Dívidas</h2>
        <small style={{ color: '#7f8c8d' }}>Gerencie seus pagamentos pendentes</small>
      </div>

      <form onSubmit={handleAdicionar} style={styles.formCard}>
        <h3>Nova Dívida</h3>
        <div style={styles.formRow}>
          <input
            placeholder="Descrição"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
            style={{ ...styles.input, flex: 2 }}
          />
          <input
            placeholder="Credor"
            value={novoCredor}
            onChange={e => setNovoCredor(e.target.value)}
            style={{ ...styles.input, flex: 1 }}
          />
          <input
            type="number"
            placeholder="Valor Total (R$)"
            value={novoTotal}
            onChange={e => setNovoTotal(e.target.value)}
            style={{ ...styles.input, flex: 1 }}
          />
          <button type="submit" style={styles.btnAdd}>+ Adicionar</button>
        </div>
      </form>

      <div style={styles.grid}>
        {lista.map(d => {
          const porcentagem = (d.valorPago / d.valorTotal) * 100;
          const isQuitado = porcentagem >= 100;
          const saldoRestante = d.valorTotal - d.valorPago;

          return (
            <div key={d.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>{d.nome}</h4>
                  <small style={{ color: '#7f8c8d' }}>Devendo para: {d.credor}</small>
                </div>
                <button onClick={() => handleExcluir(d.id)} style={styles.btnDelete} title="Excluir">
                  🗑️
                </button>
              </div>

              <div style={styles.valuesArea}>
                <div>
                  <small>Total</small>
                  <div style={{ fontWeight: 'bold' }}>R$ {d.valorTotal.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small>Falta</small>
                  <div style={{ fontWeight: 'bold', color: '#c0392b' }}>R$ {saldoRestante.toFixed(2)}</div>
                </div>
              </div>

              <div style={styles.progressContainer}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${porcentagem}%`,
                    background: isQuitado ? '#27ae60' : '#f39c12'
                  }}
                ></div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '15px' }}>
                {porcentagem.toFixed(1)}% Pago
              </div>

              {isQuitado ? (
                <div style={styles.quitadoBadge}> DÍVIDA QUITADA! </div>
              ) : (
                <div style={styles.paymentArea}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input
                      type="number"
                      placeholder="Valor p/ abater"
                      value={pagamentos[d.id] || ''}
                      onChange={(e) => setPagamentos({ ...pagamentos, [d.id]: e.target.value })}
                      style={styles.inputPayment}
                    />
                    <button onClick={() => handlePagar(d.id)} style={styles.btnPay}>
                      Pagar
                    </button>
                  </div>
                  {erros[d.id] && <div style={styles.errorMsg}>{erros[d.id]}</div>}
                </div>
              )}
            </div>
          );
        })}

        {lista.length === 0 && (
          <p style={{ textAlign: 'center', color: '#95a5a6', gridColumn: '1/-1' }}>
            Nenhuma dívida cadastrada. 
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
  headerArea: { marginBottom: '30px', textAlign: 'center' as 'center' },
  formCard: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' },
  formRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' as 'wrap', marginTop: '10px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' },
  btnAdd: { padding: '12px 25px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
  card: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' as 'column', justifyContent: 'space-between' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' },
  btnDelete: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.6, transition: '0.2s' },
  valuesArea: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' },
  progressContainer: { width: '100%', height: '8px', background: '#ecf0f1', borderRadius: '4px', marginBottom: '5px', overflow: 'hidden' },
  progressBar: { height: '100%', transition: 'width 0.5s ease-in-out' },
  paymentArea: { marginTop: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '8px' },
  inputPayment: { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '60%' },
  btnPay: { padding: '8px 15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' },
  quitadoBadge: { background: '#e8f8f5', color: '#27ae60', padding: '10px', borderRadius: '6px', textAlign: 'center' as 'center', fontWeight: 'bold' as 'bold', border: '1px solid #27ae60' },
  errorMsg: { color: '#e74c3c', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' as 'bold' }
};

export default Dividas;
