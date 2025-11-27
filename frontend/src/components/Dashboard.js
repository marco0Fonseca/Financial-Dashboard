import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF'];

function Dashboard({ purchases }) {
  // Agrupar gastos por categoria
  const data = [];
  const map = new Map();

  purchases.forEach((p) => {
    if (map.has(p.category)) {
      map.set(p.category, map.get(p.category) + parseFloat(p.amount));
    } else {
      map.set(p.category, parseFloat(p.amount));
    }
  });

  for (let [key, value] of map) {
    data.push({ name: key, value: value });
  }

  if (data.length === 0) {
    return <p>Nenhum gasto registrado para mostrar no dashboard.</p>;
  }

  return (
    <div>
      <h2>Dashboard de Gastos</h2>
      <PieChart width={400} height={300}>
        <Pie
          dataKey="value"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={(entry) => `${entry.name}: R$${entry.value.toFixed(2)}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default Dashboard;

