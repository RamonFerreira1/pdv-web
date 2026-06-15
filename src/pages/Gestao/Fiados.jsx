import React, { useState, useEffect } from 'react';
import { BookOpen, DollarSign, Search, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/AvisoContext';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/fiado`;

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Fiados() {
  const { mostrarAviso } = useToast();
  const [fiados, setFiados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Abatimento modal
  const [abaterModal, setAbaterModal] = useState(null);
  const [valorAbate, setValorAbate] = useState('');

  const fetchFiados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('pdv_token');
      const res = await fetch(API_URL, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) setFiados(await res.json());
    } catch (e) {
      console.error(e);
      mostrarAviso('Erro ao carregar fiados', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiados();
  }, []);

  const handleAbater = async () => {
    const valorNum = parseFloat(valorAbate.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) return mostrarAviso('Valor inválido', 'error');
    if (valorNum > abaterModal.valor_devido) return mostrarAviso('Valor maior que a dívida', 'error');

    try {
      const token = localStorage.getItem('pdv_token');
      const res = await fetch(`${API_URL}/${abaterModal.id}/abater`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ valor: valorNum })
      });

      if (res.ok) {
        mostrarAviso('Abatimento registrado com sucesso!', 'success');
        setAbaterModal(null);
        setValorAbate('');
        fetchFiados();
      } else {
        mostrarAviso('Erro ao registrar abatimento', 'error');
      }
    } catch (e) {
      console.error(e);
      mostrarAviso('Erro na conexão', 'error');
    }
  };

  const filtered = fiados.filter(f => (f.cliente_nome || '').toLowerCase().includes(busca.toLowerCase()));
  const totalDevido = fiados.reduce((acc, f) => acc + parseFloat(f.valor_devido), 0);

  return (
    <div className="flex flex-col h-full bg-darkBg text-white p-4 sm:p-8 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
            <BookOpen className="text-primaryGreen" /> Contas a Receber (Fiado)
          </h1>
          <p className="text-slate-400">Gerencie clientes com saldo devedor.</p>
        </div>
        <div className="bg-darkCard px-6 py-3 rounded-xl border border-darkBorder flex items-center gap-4">
          <div className="p-2 bg-primaryGreen/10 text-primaryGreen rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Total na Rua</p>
            <p className="text-2xl font-bold text-white">{fmt(totalDevido)}</p>
          </div>
        </div>
      </div>

      <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="p-4 border-b border-darkBorder flex items-center bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-darkBg border border-darkBorder rounded-lg py-2 pl-10 pr-4 text-white focus:border-primaryGreen transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full text-slate-500">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex justify-center items-center h-full text-slate-500">Nenhum fiado pendente.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-darkBg sticky top-0 z-10 text-xs uppercase text-slate-400 font-semibold border-b border-darkBorder">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Dívida Atual</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{f.cliente_nome}</td>
                    <td className="px-6 py-4 text-slate-400">{f.cliente_telefone || '-'}</td>
                    <td className="px-6 py-4 text-amber-400 font-bold">{fmt(f.valor_devido)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setAbaterModal(f)}
                        className="bg-primaryGreen/10 text-primaryGreen hover:bg-primaryGreen hover:text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        Abater
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {abaterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-darkCard w-full max-w-sm rounded-2xl p-6 border border-darkBorder">
            <h3 className="text-lg font-bold text-white mb-2">Abater Dívida</h3>
            <p className="text-slate-400 text-sm mb-4">
              Cliente: <strong className="text-white">{abaterModal.cliente_nome}</strong><br/>
              Dívida total: <strong className="text-amber-400">{fmt(abaterModal.valor_devido)}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-slate-400 text-sm font-medium mb-2">Valor a pagar agora (R$)</label>
              <input 
                type="number"
                value={valorAbate}
                onChange={e => setValorAbate(e.target.value)}
                placeholder="Ex: 50.00"
                className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 text-white focus:border-primaryGreen text-lg font-mono"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setAbaterModal(null)}
                className="flex-1 bg-darkBg border border-darkBorder text-slate-300 py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAbater}
                className="flex-1 bg-primaryGreen text-white py-3 rounded-xl hover:bg-primaryHover transition-colors font-medium flex justify-center items-center gap-2"
              >
                <CheckCircle size={18} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
