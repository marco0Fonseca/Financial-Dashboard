import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF5C8A', '#1abc9c'];

interface Purchase {
  description: string;
  amount: string;
  category: string;
  isRecurring: boolean;
  type: 'gasto' | 'ganho';
  date?: string;
}

interface DashboardProps {
  purchases: Purchase[];
}

type ViewOption = 'recorrentes' | 'mes' | 'periodo';

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

function isSameMonth(dateStr: string | undefined, month: number, year: number) {
  if (!dateStr) return false;
  const d = new Date(dateStr.split('/').reverse().join('-'));
  return d.getMonth() === month && d.getFullYear() === year;
}

const Dashboard: React.FC<DashboardProps> = ({ purchases }) => {
  const [view, setView] = useState<ViewOption>('mes');
  const [period, setPeriod] = useState({ start: '', end: '' });

  let pieData: { name: string; value: number }[] = [];

  if (view === 'recorrentes') {
    // Only individual recurring expenses
    pieData = purchases
      .filter((p) => p.isRecurring && p.type === 'gasto')
      .map((p, idx) => ({
        name: p.description || `Recorrente ${idx + 1}`,
        value: parseFloat(p.amount),
      }));
  } else if (view === 'mes') {
    // Current month: recurring grouped, others by category
    const { month, year } = getCurrentMonthYear();
    const normalMap = new Map<string, number>();
    let recurringTotal = 0;
    let hasRecurring = false;

    purchases.forEach((p) => {
      if (p.type !== 'gasto') return;
      if (!isSameMonth(p.date, month, year)) return;
      if (p.isRecurring) {
        recurringTotal += parseFloat(p.amount);
        hasRecurring = true;
      } else {
        normalMap.set(
          p.category,
          (normalMap.get(p.category) || 0) + parseFloat(p.amount)
        );
      }
    });

    pieData = Array.from(normalMap.entries()).map(([cat, value]) => ({
      name: cat,
      value,
    }));
    if (hasRecurring) {
      pieData.push({ name: 'Despesas Recorrentes', value: recurringTotal });
    }
  } else if (view === 'periodo') {
    // Filter by period: sum by category
    const start = period.start ? new Date(period.start) : null;
    const end = period.end
      ? (() => {
          const d = new Date(period.end);
          d.setDate(d.getDate() + 1); // soma 1 dia
          return d;
        })()
      : null;
    const normalMap = new Map<string, number>();

    purchases.forEach((p) => {
      if (p.type !== 'gasto') return;
      if (!p.date) return;
      // Assume date in DD/MM/YYYY
      const [dd, mm, yyyy] = p.date.split('/');
      const d = new Date(`${yyyy}-${mm}-${dd}`);
      if (
        (!start || d >= start) &&
        (!end || d < end)
      ) {
        normalMap.set(
          p.category,
          (normalMap.get(p.category) || 0) + parseFloat(p.amount)
        );
      }
    });

    pieData = Array.from(normalMap.entries()).map(([cat, value]) => ({
      name: cat,
      value,
    }));
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 32,
          padding: 20,
          border: '2px solid #2c3e50',
          borderRadius: 12,
          background: '#f8fafc',
          boxShadow: '0 2px 8px rgba(44,62,80,0.07)',
          display: 'inline-block',
          minWidth: 340,
        }}
      >
        <label>
          Visualização:&nbsp;
          <select
            value={view}
            onChange={e => setView(e.target.value as ViewOption)}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="recorrentes">Gastos recorrentes</option>
            <option value="mes">Gastos nesse mês</option>
            <option value="periodo">Filtrar por período</option>
          </select>
        </label>
        {view === 'periodo' && (
          <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
            <div>
              <label>
                Data inicial:&nbsp;
                <input
                  type="date"
                  value={period.start}
                  onChange={e => setPeriod(p => ({ ...p, start: e.target.value }))}
                  style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </label>
            </div>
            <div>
              <label>
                Data final:&nbsp;
                <input
                  type="date"
                  value={period.end}
                  onChange={e => setPeriod(p => ({ ...p, end: e.target.value }))}
                  style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </label>
            </div>
          </div>
        )}
      </div>
      {pieData.length === 0 ? (
        <p>Nenhum gasto registrado para mostrar no gráfico.</p>
      ) : (
        <div
          style={{
            width: '100%',
            minHeight: 500,
            height: 500,
            display: 'flex',
            justifyContent: 'flex-end', // Alinha à direita
            alignItems: 'flex-start',
            marginTop: '-200px',
          }}
        >
          <div style={{ transform: 'translateX(-50%)' }}>
            <PieChart width={500} height={600}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={250}
                fill="#8884d8"
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;