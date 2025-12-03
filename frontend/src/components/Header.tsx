import React from 'react';

const headerStyle: React.CSSProperties = {
  width: '100%',
  height: '80px', // DEVE SER 80px para bater com o global.css
  background: '#2c3e50',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  boxSizing: 'border-box',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
};

const iconStyle: React.CSSProperties = {
  height: '36px',
  width: '36px',
  marginRight: '12px',
};

const buttonStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#ecf0f1',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '4px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'all 0.2s'
};

interface HeaderProps {
  onLogout: () => void;
  user: string | null; 
}

function Header({ onLogout, user }: HeaderProps) {
  return (
    <header style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/appicon.png" alt="App Icon" style={iconStyle} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>Financial Dashboard</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user && (
          <span style={{ color: '#ecf0f1', fontSize: '16px', fontWeight: 500 }}>
            Olá, {user}
          </span>
        )}
        <button 
          style={buttonStyle} 
          onClick={onLogout}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#fff'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
        >
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;