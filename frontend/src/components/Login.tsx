import React, { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode validar os dados ou chamar API real, mas vamos simular
    if (email && password) {
      onLogin(email);
    } else {
      alert('Por favor, preencha email e senha.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Entrar no Sistema</h2>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Digite seu email"
        />
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Digite sua senha"
        />
        <button type="submit">Entrar</button>
      </form>
      <style jsx>{`
        .login-container {
          display: flex;
          height: 100vh;
          justify-content: center;
          align-items: center;
          background: #2c3e50;
          color: #12222b;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
        }
        .login-form {
          background: #fff;
          padding: 2rem 2.5rem 2rem 2.5rem;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(23, 32, 88, 0.10);
          width: 340px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .login-form h2 {
          margin-bottom: 1.5rem;
          color: #1abc9c;
          text-align: center;
        }
        input {
          margin-bottom: 1.2rem;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          border: 1px solid #e6e9ef;
          font-size: 1rem;
          background: #f8fafc;
          color: #12222b;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        input:focus {
          border-color: #1abc9c;
          box-shadow: 0 0 0 2px rgba(26,188,156,0.10);
        }
        button {
          background: #1abc9c;
          color: #fff;
          font-weight: 600;
          border: none;
          padding: 0.85rem 0;
          cursor: pointer;
          border-radius: 8px;
          font-size: 1.08rem;
          box-shadow: none;
          transition: background 0.15s;
        }
        button:hover {
          background: #17a689;
        }
        label {
          margin-bottom: 0.25rem;
          color: #374151;
          font-size: 0.98rem;
        }
      `}</style>
    </div>
  );
}

export default Login;
