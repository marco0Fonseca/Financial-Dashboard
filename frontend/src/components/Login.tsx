import React, { useState } from 'react';

// Interface para os dados vindos do Login
interface AuthData {
  email: string;
  id: string;
  token: string;
  name: string;
}

interface LoginProps {
  onLogin: (data: AuthData) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [isCadastro, setIsCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const API_URL = 'http://localhost:5000/api/auth'; 

  const isSenhaIgual = !isCadastro || senha === confirmSenha;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = isCadastro ? '/signup' : '/signin';
      const body = isCadastro 
        ? { name: nome, email, password: senha }
        : { email, password: senha };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem("authToken", data.token);
        onLogin(email);
      } else if (response.status === 401) {
        alert(data.error);
      }
      else {
        alert('Erro ao fazer login: Email ou senha inválidos');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#2c3e50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        
        {/* --- ÁREA DO LOGO --- */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
           <img 
             src="/loginLogo.png" 
             alt="Logo Financial Dashboard" 
             style={{ 
               maxWidth: '280px', 
               height: 'auto', 
               objectFit: 'contain'
             }} 
           />
        </div>
        {/* -------------------- */}

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#333' }}>
            {isCadastro ? 'Criar Conta' : 'Bem-vindo'}
          </h2>
          
          {isCadastro && (
            <div style={{ marginBottom: 16 }}>
              <label style={{display: 'block', marginBottom: 4, fontWeight: 500, color: '#555'}}>Nome</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
          )}
          
          <div style={{ marginBottom: 16 }}>
            <label style={{display: 'block', marginBottom: 4, fontWeight: 500, color: '#555'}}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{display: 'block', marginBottom: 4, fontWeight: 500, color: '#555'}}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          {isCadastro && (
            <div style={{ marginBottom: 24 }}>
              <label style={{display: 'block', marginBottom: 4, fontWeight: 500, color: '#555'}}>Confirmar senha</label>
              <input
                type="password"
                value={confirmSenha}
                onChange={e => setConfirmSenha(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
              {senha && confirmSenha && senha !== confirmSenha && (
                <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                  As senhas não coincidem.
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isCadastro && (!isSenhaIgual || senha.length === 0)}
            style={{
              width: '100%',
              padding: '12px',
              background: isCadastro && (!isSenhaIgual || senha.length === 0) ? '#ccc' : '#1abc9c',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: isCadastro && (!isSenhaIgual || senha.length === 0) ? 'not-allowed' : 'pointer',
              marginBottom: 16,
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
          >
            {isCadastro ? 'Cadastrar' : 'Entrar'}
          </button>

          <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setIsCadastro(!isCadastro)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1abc9c',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem'
                }}
              >
                {isCadastro ? 'Já tenho uma conta' : 'Criar nova conta'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;