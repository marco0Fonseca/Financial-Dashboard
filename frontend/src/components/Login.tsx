import React, { useState } from 'react';

// Atualizamos a interface para receber todos os dados necessários
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
  
  // Se o proxy estiver funcionando use apenas '/api/auth', senão use o localhost:3001
  const API_URL = 'http://localhost:3001/api/auth'; 

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
        // AQUI ESTÁ A CORREÇÃO:
        // Passamos o objeto completo retornado pelo backend
        onLogin({
          email: data.user.email,
          id: data.user.id,
          name: data.user.name,
          token: data.token
        });
      } else {
        alert(data.error || 'Erro na autenticação');
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
      justifyContent: 'center'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
           {/* Seus componentes de imagem... */}
           <h1 style={{color: 'white'}}>Financial Dashboard</h1>
        </div>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: 32,
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(44,62,80,0.10)',
          minWidth: 320
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
          {isCadastro ? 'Cadastro de Usuário' : 'Entrar no Sistema'}
        </h2>
        {isCadastro && (
          <div style={{ marginBottom: 16 }}>
            <label>
              Nome:
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                style={{ width: '94.5%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label>
            E-mail:
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '94.5%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            Senha:
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              style={{ width: '94.5%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </label>
        </div>
        {isCadastro && (
          <div style={{ marginBottom: 16 }}>
            <label>
              Confirmar senha:
              <input
                type="password"
                value={confirmSenha}
                onChange={e => setConfirmSenha(e.target.value)}
                required
                style={{ width: '94.5%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>
          </div>
        )}
        <button
          type="submit"
          disabled={isCadastro && (!isSenhaIgual || senha.length === 0)}
          style={{
            width: '100%',
            padding: 10,
            background: isCadastro && (!isSenhaIgual || senha.length === 0) ? '#ccc' : '#1abc9c',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontWeight: 600,
            cursor: isCadastro && (!isSenhaIgual || senha.length === 0) ? 'not-allowed' : 'pointer',
            marginBottom: 12
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
                fontSize: 15
              }}
            >
              {isCadastro ? 'Voltar para login' : 'Cadastrar usuário'}
            </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default Login;