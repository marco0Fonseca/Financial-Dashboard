import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [isCadastro, setIsCadastro] = useState(false);

  const isSenhaIgual = !isCadastro || senha === confirmSenha;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCadastro) {
      if (isSenhaIgual && senha.length > 0) {
        // Aqui você pode adicionar lógica de cadastro real
        onLogin(email);
      }
    } else {
      onLogin(email);
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
          <img
            src="/loginLogo.png"
            alt="Login Logo"
            style={{ width: 216, height: 72, objectFit: 'contain' }}
          />
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
        <div style={{ marginBottom: 16 }}>
          <label>
            E-mail:
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '94.5%',
                padding: 8,
                marginTop: 4,
                borderRadius: 4,
                border: '1px solid #ccc'
              }}
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
              style={{
                width: '94.5%',
                padding: 8,
                marginTop: 4,
                borderRadius: 4,
                border: '1px solid #ccc'
              }}
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
                style={{
                  width: '94.5%',
                  padding: 8,
                  marginTop: 4,
                  borderRadius: 4,
                  border: '1px solid #ccc'
                }}
              />
            </label>
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
          {!isCadastro ? (
            <button
              type="button"
              onClick={() => setIsCadastro(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1abc9c',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: 15
              }}
            >
              Cadastrar usuário
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCadastro(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1abc9c',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: 15
              }}
            >
              Voltar para login
            </button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
};

export default Login;