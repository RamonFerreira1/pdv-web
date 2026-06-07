import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nome: '', sobrenome: '', telefone: '', email: '', senha: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.senha);
    } else {
      result = await registerUser(formData);
    }
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-darkCard border border-darkBorder rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primaryGreen/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primaryGreen" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Acesso ao Sistema' : 'Criar Nova Conta'}
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Entre com suas credenciais para continuar' : 'Preencha os dados abaixo para se cadastrar'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-white focus:border-primaryGreen transition-colors"
                  placeholder="Nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Sobrenome</label>
                <input
                  type="text"
                  value={formData.sobrenome}
                  onChange={(e) => setFormData({...formData, sobrenome: e.target.value})}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-white focus:border-primaryGreen transition-colors"
                  placeholder="Opcional"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-primaryGreen transition-colors"
                placeholder={isLogin ? "admin@pdv.com" : "seu@email.com"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="password"
                required
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-primaryGreen transition-colors"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primaryGreen hover:bg-primaryHover text-white font-bold py-3.5 rounded-xl transition-colors mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Ainda não tem uma conta? " : "Já possui uma conta? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ nome: '', sobrenome: '', telefone: '', email: '', senha: '' });
              }}
              className="text-primaryGreen font-bold hover:underline"
            >
              {isLogin ? 'Criar Conta' : 'Fazer Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
