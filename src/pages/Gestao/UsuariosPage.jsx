import React, { useState, useEffect, useContext } from 'react';
import { Users, Shield, Trash2, ChevronDown, ArrowLeft, Loader2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AutenticacaoContext } from '../../context/AutenticacaoContext';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin`;

const ROLES = ['Admin', 'Gerente', 'Caixa'];

const roleBadge = {
  Admin: 'bg-red-500/10 text-red-400 border-red-500/30',
  Gerente: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Caixa: 'bg-primaryGreen/10 text-primaryGreen border-primaryGreen/30',
};

export default function UsuariosPage() {
  const { usuario: currentUser } = useContext(AutenticacaoContext);
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('pdv_token');
      const res = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsuarios(await res.json());
      else navigate('/'); // Não é admin
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (id, novoRole) => {
    try {
      const token = localStorage.getItem('pdv_token');
      const res = await fetch(`${API_URL}/usuarios/${id}/role`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: novoRole })
      });
      if (res.ok) {
        setUsuarios(prev => prev.map(u => u.ID === id ? { ...u, role: novoRole } : u));
        setMsg({ type: 'success', text: 'Permissão atualizada com sucesso!' });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      }
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja remover o usuário "${nome}"?`)) return;
    try {
      const token = localStorage.getItem('pdv_token');
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsuarios(prev => prev.filter(u => u.ID !== id));
        setMsg({ type: 'success', text: 'Usuário removido.' });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      }
    } catch(e) { console.error(e); }
  };

  return (
    <div className="flex flex-col h-full bg-darkBg text-white p-4 sm:p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-darkBorder rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="text-primaryGreen" size={28} /> Gestão de Usuários
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerencie as permissões dos colaboradores do sistema.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-primaryGreen/10 text-primaryGreen border border-primaryGreen/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primaryGreen" size={32} />
        </div>
      ) : (
        <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-lg">
          {/* Desktop Table */}
          <table className="w-full text-left hidden sm:table">
            <thead className="bg-darkBg/50 border-b border-darkBorder text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Permissão</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder">
              {usuarios.map(u => (
                <tr key={u.ID} className="hover:bg-darkBg/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen font-bold text-sm shrink-0">
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.nome} {u.sobrenome}</p>
                        {String(u.ID) === String(currentUser?.id) && (
                          <span className="text-xs text-slate-500">(você)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.ID, e.target.value)}
                        disabled={String(u.ID) === String(currentUser?.id)}
                        className={`appearance-none border rounded-lg px-3 py-1.5 pr-8 text-sm font-semibold cursor-pointer focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${roleBadge[u.role] || roleBadge.Caixa}`}
                        style={{ background: 'transparent' }}
                      >
                        {ROLES.map(r => <option key={r} value={r} className="bg-darkCard text-white">{r}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(u.ID, u.nome)}
                      disabled={String(u.ID) === String(currentUser?.id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-400"
                      title="Remover usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-darkBorder">
            {usuarios.map(u => (
              <div key={u.ID} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryGreen/10 flex items-center justify-center text-primaryGreen font-bold shrink-0">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{u.nome} {u.sobrenome}</p>
                    <p className="text-slate-500 text-xs truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.ID, e.target.value)}
                    disabled={String(u.ID) === String(currentUser?.id)}
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none disabled:opacity-50 ${roleBadge[u.role] || roleBadge.Caixa}`}
                    style={{ background: 'transparent' }}
                  >
                    {ROLES.map(r => <option key={r} value={r} className="bg-darkCard text-white">{r}</option>)}
                  </select>
                  <button
                    onClick={() => handleDelete(u.ID, u.nome)}
                    disabled={String(u.ID) === String(currentUser?.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
