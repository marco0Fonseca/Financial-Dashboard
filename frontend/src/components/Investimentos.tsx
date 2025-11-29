import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Investimento {
  id: number;
  nome: string;
  tipo: string;
  valor: number;
  prazoMeses: number;      
  taxaAnual: number;       
  valorFinalEstimado: number; 
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Investimentos: React.FC = () => {
  const [ativos, setAtivos] = useState<Investimento[]>([]);

  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoPrazo, setNovoPrazo] = useState('');     // Meses
  const [novaTaxa, setNovaTaxa] = useState('');       // % a.a.
  const [novoTipo, setNovoTipo] = useState('Pós-fixado');

  const estimativaAtual = useMemo(() => {
    const P = parseFloat(novoValor) || 0;
    const i_anual = parseFloat(novaTaxa) || 0; 
    const t_meses = parseFloat(novoPrazo) || 0; 

    if (P === 0 || t_meses === 0) return 0;

    // Fórmula: (1 + taxa_anual)^(1/12) - 1
    const i_mensal = Math.pow(1 + (i_anual / 100), 1 / 12) - 1;

    // Fórmula Juros Compostos: M = P * (1 + i)^t
    const Montante = P * Math.pow(1 + i_mensal, t_meses);
    
    return Montante;
  }, [novoValor, novoPrazo, novaTaxa]);
  const handleAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoValor || !novoPrazo || !novaTaxa) return;

    const valorFinal = estimativaAtual;

    const novo: Investimento = {
      id: Math.random(),
      nome: novoNome,
      valor: parseFloat(novoValor),
      prazoMeses: parseFloat(novoPrazo),
      taxaAnual: parseFloat(novaTaxa),
      tipo: novoTipo,
      valorFinalEstimado: valorFinal
    };

    setAtivos([...ativos, novo]);
    
    // Limpar campos
    setNovoNome('');
    setNovoValor('');
    setNovoPrazo('');
    setNovaTaxa('');
  };

  const totalInvestido = ativos.reduce((acc, item) => acc + item.valor, 0);
  const totalEstimadoFuturo = ativos.reduce((acc, item) => acc + item.valorFinalEstimado, 0);

  const dadosGrafico = ativos.map(ativo => ({
    name: ativo.nome,
    value: ativo.valor
  }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2>Carteira de Investimentos</h2>
          <small>Projeção de Rendimentos</small>
        </div>
        
        <div style={{display: 'flex', gap: '20px'}}>
          <div style={styles.summaryCard}>
            <span>Total Investido Hoje</span>
            <strong>R$ {totalInvestido.toFixed(2)}</strong>
          </div>
          <div style={{...styles.summaryCard, background: '#27ae60'}}>
            <span>Patrimônio Futuro Estimado</span>
            <strong>R$ {totalEstimadoFuturo.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.chartContainer}>
          <h3 style={{textAlign: 'center'}}>Alocação Atual</h3>
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
          <h3>Simulador de Aporte</h3>
          <form onSubmit={handleAdicionar} style={styles.form}>
            <input 
              placeholder="Nome do Ativo" 
              value={novoNome} onChange={e => setNovoNome(e.target.value)} 
              style={styles.input} 
            />
            
            <div style={{display: 'flex', gap: '10px'}}>
              <input 
                type="number" placeholder="Valor (R$)" 
                value={novoValor} onChange={e => setNovoValor(e.target.value)} 
                style={styles.input} 
              />
              <select value={novoTipo} onChange={e => setNovoTipo(e.target.value)} style={styles.select}>
                <option value="Pós-fixado">Pós-fixado</option>
                <option value="Pré-fixado">Pré-fixado</option>
                <option value="Inflação">IPCA+</option>
              </select>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <input 
                type="number" placeholder="Prazo (meses)" 
                value={novoPrazo} onChange={e => setNovoPrazo(e.target.value)} 
                style={styles.input} 
              />
              <input 
                type="number" placeholder="Rentabilidade Anual (%)" 
                value={novaTaxa} onChange={e => setNovaTaxa(e.target.value)} 
                style={styles.input} 
              />
            </div>

            {estimativaAtual > 0 && (
              <div style={styles.previewCard}>
                <span>Estimativa ao final do prazo:</span>
                <div style={{fontSize: '20px', fontWeight: 'bold', color: '#27ae60'}}>
                  R$ {estimativaAtual.toFixed(2)}
                </div>
                <small style={{color: '#7f8c8d'}}>
                  Lucro de R$ {(estimativaAtual - (parseFloat(novoValor)||0)).toFixed(2)}
                </small>
              </div>
            )}

            <button type="submit" style={styles.button}>Confirmar Investimento</button>
          </form>
        </div>
      </div>

      <div style={styles.listContainer}>
        <h3>Meus Ativos & Projeções</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{textAlign: 'left', color: '#7f8c8d'}}>
              <th>Ativo</th>
              <th>Tipo</th>
              <th>Prazo</th>
              <th>Taxa (a.a.)</th>
              <th>Valor Investido</th>
              <th>Previsão Final</th>
            </tr>
          </thead>
          <tbody>
            {ativos.map(ativo => (
              <tr key={ativo.id} style={styles.row}>
                <td style={{fontWeight: 'bold'}}>{ativo.nome}</td>
                <td><span style={styles.badge}>{ativo.tipo}</span></td>
                <td>{ativo.prazoMeses} meses</td>
                <td>{ativo.taxaAnual}%</td>
                <td>R$ {ativo.valor.toFixed(2)}</td>
                <td style={{color: '#27ae60', fontWeight: 'bold'}}>
                  R$ {ativo.valorFinalEstimado.toFixed(2)}
                </td>
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
  summaryCard: { background: '#2980b9', color: '#fff', padding: '15px 25px', borderRadius: '8px', display: 'flex', flexDirection: 'column' as 'column', fontSize: '16px' },
  
  contentGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap' as 'wrap', marginBottom: '30px' },
  chartContainer: { flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  formContainer: { flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  
  form: { display: 'flex', flexDirection: 'column' as 'column', gap: '15px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' as 'border-box' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%' },

  button: { padding: '12px', background: '#1abc9c', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as 'bold' },
  
  previewCard: { background: '#e8f8f5', padding: '15px', borderRadius: '8px', textAlign: 'center' as 'center', border: '1px solid #27ae60' },
  
  listContainer: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' as 'collapse' },
  row: { borderBottom: '1px solid #eee', height: '45px' },
  badge: { background: '#ecf0f1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#2c3e50' }
};

export default Investimentos;