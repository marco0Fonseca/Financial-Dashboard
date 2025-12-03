import React from 'react';

function Sidebar({ selected, onSelect }) {
  const menuItems = [
    { key: 'overview', label: 'Overview', icon: 'overview.png' },
    { key: 'mensais', label: 'Movimentações', icon: 'mensais.png' },
    { key: 'investimentos', label: 'Investimentos', icon: 'investimentos.png' },
    { key: 'dividas', label: 'Dívidas', icon: 'dividas.png' },
  ];

  return (
    <nav className="sidebar">
      {menuItems.map((item) => (
        <div
          key={item.key}
          className={`sidebar-item ${selected === item.key ? 'active' : ''}`}
          onClick={() => onSelect(item.key)}
        >
          <img
	      src={process.env.PUBLIC_URL + '/' + item.icon}
	      alt={item.label}
	      className={item.key === 'dividas' ? 'icon-rectangular' : 'icon-square'}
	  />
          <span>{item.label}</span>
        </div>
      ))}

      <style jsx>{`
        .sidebar {
          width: 120px;
          height: 100vh;
          background-color: #2c3e50;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }
        .sidebar-item {
          color: white;
          text-align: center;
          padding: 20px 0;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.3s ease;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .sidebar-item:hover {
          background-color: #34495e;
        }
        .sidebar-item.active {
          background-color: #1abc9c;
        }
        img.icon-square {
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
	  object-fit: contain;
        }

	img.icon-rectangular {
	width: 80px;
	height: 40px;
	margin-bottom: 8px;
	object-fit: contain;

        span {
          font-size: 14px;
          font-weight: bold;
        }
      `}</style>
    </nav>
  );
}

export default Sidebar;
