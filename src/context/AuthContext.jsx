import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('pdv_token', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erro ao realizar login.' };
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
        localStorage.setItem('pdv_token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        const errorMsg = data.detalhes ? `${data.error} Detalhes: ${data.detalhes}` : (data.error || 'Erro ao criar conta.');
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      return { success: false, error: 'Falha na conexão com o servidor.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('pdv_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
