
import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF5C8A', '#1abc9c'];

function Dashboard({ purchases }) {
  // First chart: all expenses, group all 'despesa recorrente' as one slice
  const normalMap = new Map();
  let recurringTotal = 0;
  let hasRecurring = false;

  purchases.forEach((p) => {
    if (p.isRecurring) {
      recurringTotal += parseFloat(p.amount);
      hasRecurring = true;
    } else {
      if (normalMap.has(p.category)) {
        normalMap.set(p.category, normalMap.get(p.category) + parseFloat(p.amount));
      } else {
        normalMap.set(p.category, parseFloat(p.amount));
      }
    }
  });

  const pie1 = Array.from(normalMap.entries()).map(([cat, value]) => ({ name: cat, value }));
  if (hasRecurring) {
    pie1.push({ name: 'Despesas Recorrentes', value: recurringTotal });
  }

  // Second chart: only recurring expenses, each as its own slice
  const pie2 = purchases
    .filter((p) => p.isRecurring)
    .map((p, idx) => ({ name: p.description || `Recorrente ${idx+1}`, value: parseFloat(p.amount) }));

  if (pie1.length === 0) {
    return <p>Nenhum gasto registrado para mostrar no dashboard.</p>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
      <div>
        <h3>Gastos Gerais (recorrentes agrupados)</h3>
        <PieChart width={340} height={300}>
          <Pie
            dataKey="value"
            data={pie1}
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
          >
            {pie1.map((entry, index) => (
              <Cell key={`cell1-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
      <div>
        <h3>Despesas Recorrentes (detalhadas)</h3>
        {pie2.length === 0 ? (
          <p>Nenhuma despesa recorrente registrada.</p>
        ) : (
          <PieChart width={340} height={300}>
            <Pie
              dataKey="value"
              data={pie2}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.name}: R$${entry.value.toFixed(2)}`}
            >
              {pie2.map((entry, index) => (
                <Cell key={`cell2-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
