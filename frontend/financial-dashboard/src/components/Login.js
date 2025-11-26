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
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          font-family: Arial, sans-serif;
        }
        .login-form {
          background: rgba(255, 255, 255, 0.15);
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          width: 320px;
          display: flex;
          flex-direction: column;
        }
        input {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: 4px;
          border: none;
          font-size: 1rem;
        }
        button {
          background-color: #4caf50;
          color: white;
          font-weight: bold;
          border: none;
          padding: 0.75rem;
          cursor: pointer;
          border-radius: 4px;
          font-size: 1rem;
        }
        button:hover {
          background-color: #45a049;
        }
        label {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}

export default Login;

