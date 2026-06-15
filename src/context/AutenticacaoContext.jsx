import React, { createContext, useState, useEffect } from 'react';

export const AutenticacaoContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth`;

export const AutenticacaoProvider = ({ children }) => {
  const [usuario, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pdv_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token is invalid or expired
          setToken(null);
          setUser(null);
          localStorage.removeItem('pdv_token');
        }
      } catch (error) {
        console.error("Erro ao validar token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const entrar = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/entrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.usuario);
        localStorage.setItem('pdv_token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erro ao realizar entrar.' };
      }
    } catch (error) {
      return { success: false, error: 'Falha na conexão com o servidor.' };
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('pdv_token', data.token);
        setUser(data.usuario);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erro ao criar conta.' };
      }
    } catch (error) {
      return { success: false, error: 'Falha na conexão com o servidor.' };
    }
  };

  const sair = () => {
    localStorage.removeItem('pdv_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AutenticacaoContext.Provider value={{ usuario, entrar, registerUser, sair, loading }}>
      {children}
    </AutenticacaoContext.Provider>
  );
};

//A