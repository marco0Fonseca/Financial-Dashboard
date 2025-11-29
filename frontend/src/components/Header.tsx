import React from 'react';

const headerStyle: React.CSSProperties = {
  width: '100%',
  height: '80px',
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
};

const iconStyle: React.CSSProperties = {
  height: '36px',
  width: '36px',
  marginRight: '12px',
};

const buttonStyle: React.CSSProperties = {
  background: '#fff',
  color: '#2c3e50',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 600,
};

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
            Olá, {user.split('@')[0]}
          </span>
        )}
        <button style={buttonStyle} onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Header;