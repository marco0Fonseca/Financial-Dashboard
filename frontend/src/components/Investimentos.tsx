import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Investimento {
  id: number;
  nome: string;
  tipo: string;
  taxa: string;
  valor: number;
  vencimento: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Investimentos: React.FC = () => {
  const [ativos, setAtivos] = useState<Investimento[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novaTaxa, setNovaTaxa] = useState('');
  const [novoTipo, setNovoTipo] = useState('Pós-fixado');

  const handleAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoValor) return;

    const novo: Investimento = {
      id: Math.random(),
      nome: novoNome,
      valor: parseFloat(novoValor),
      taxa: novaTaxa || 'N/A',
      tipo: novoTipo,
      vencimento: '2025-01-01'
    };

    setAtivos([...ativos, novo]);
    setNovoNome('');
    setNovoValor('');
    setNovaTaxa('');
  };

  const totalInvestido = ativos.reduce((acc, item) => acc + item.valor, 0);

  // Prepara dados para o gráfico
  const dadosGrafico = ativos.map(ativo => ({
    name: ativo.nome,
    value: ativo.valor
  }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Carteira de Renda Fixa</h2>
        <div style={styles.summaryCard}>
          <span>Total Investido</span>
          <strong>R$ {totalInvestido.toFixed(2)}</strong>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* Gráfico */}
        <div style={styles.chartContainer}>
          <h3 style={{textAlign: 'center'}}>Alocação</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dadosGrafico}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `R$ ${val.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.formContainer}>
          <h3>Novo Aporte</h3>
          <form onSubmit={handleAdicionar} style={styles.form}>
            <input 
              placeholder="Nome (ex: CDB NuBank)" 
              value={novoNome} onChange={e => setNovoNome(e.target.value)} 
              style={styles.input} 
            />
            <div style={{display: 'flex', gap: '10px'}}>
              <input 
                type="number" placeholder="Valor (R$)" 
                value={novoValor} onChange={e => setNovoValor(e.target.value)} 
                style={styles.input} 
              />
              <input 
                placeholder="Taxa (ex: 100% CDI)" 
                value={novaTaxa} onChange={e => setNovaTaxa(e.target.value)} 
                style={styles.input} 
              />
            </div>
            <select value={novoTipo} onChange={e => setNovoTipo(e.target.value)} style={styles.select}>
              <option value="Pós-fixado">Pós-fixado (CDI/Selic)</option>
              <option value="Pré-fixado">Pré-fixado</option>
              <option value="IPCA+">Inflação (IPCA+)</option>
            </select>
            <button type="submit" style={styles.button}>Registrar</button>
          </form>
        </div>
      </div>

      {/* Lista */}
      <div style={styles.listContainer}>
        <h3>Meus Ativos</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{textAlign: 'left', color: '#7f8c8d'}}>
              <th>Ativo</th>
              <th>Tipo</th>
              <th>Taxa</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {ativos.map(ativo => (
              <tr key={ativo.id} style={styles.row}>
                <td style={{fontWeight: 'bold'}}>{ativo.nome}</td>
                <td><span style={styles.badge}>{ativo.tipo}</span></td>
                <td>{ativo.taxa}</td>
                <td style={{color: '#27ae60', fontWeight: 'bold'}}>R$ {ativo.valor.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  summaryCard: { background: '#2980b9', color: '#fff', padding: '15px 25px', borderRadius: '8px', display: 'flex', flexDirection: 'column' as 'column', fontSize: '18px' },
  contentGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap' as 'wrap', marginBottom: '30px' },
  chartContainer: { flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  formContainer: { flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column' as 'column', gap: '15px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' as 'border-box' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%' },
  button: { padding: '12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as 'bold' },
  listContainer: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' as 'collapse' },
  row: { borderBottom: '1px solid #eee', height: '40px' },
  badge: { background: '#ecf0f1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#2c3e50' }
};

export default Investimentos;