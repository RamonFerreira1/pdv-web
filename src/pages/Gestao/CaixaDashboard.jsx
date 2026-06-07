import React, { useState, useEffect } from 'react';
import { Calculator, Play, Square, DollarSign, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/caixa`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('pdv_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export default function CaixaDashboard() {
  const [turno, setTurno] = useState(null);
  const [resumo, setResumo] = useState({ total_vendas: 0, movimentos: [] });
  const [loading, setLoading] = useState(true);
  const [trocoInicial, setTrocoInicial] = useState('');
  const [saldoFinal, setSaldoFinal] = useState('');
  const [modalAcao, setModalAcao] = useState(null); // 'sangria' ou 'suprimento'
  const [valorMovimento, setValorMovimento] = useState('');
  const [descMovimento, setDescMovimento] = useState('');

  const navigate = useNavigate();

  const loadTurno = async () => {
    try {
      const res = await fetch(`${API_URL}/turno-atual`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTurno(data);
        if (data) {
          loadResumo(data.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadResumo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/resumo/${id}`, { headers: getAuthHeaders() });
      if (res.ok) setResumo(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTurno();
  }, []);

  const handleAbrir = async () => {
    try {
      const res = await fetch(`${API_URL}/abrir`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ troco_inicial: parseFloat(trocoInicial) || 0 })
      });
      if (res.ok) loadTurno();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFechar = async () => {
    if (!window.confirm('Tem certeza que deseja fechar o caixa? Vendas serão bloqueadas.')) return;
    try {
      const res = await fetch(`${API_URL}/fechar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ turno_id: turno.id, saldo_final: parseFloat(saldoFinal) || 0 })
      });
      if (res.ok) {
        setTurno(null);
        setSaldoFinal('');
        alert('Caixa fechado com sucesso!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMovimento = async () => {
    if (!valorMovimento || !descMovimento) return alert('Preencha os campos');
    try {
      const res = await fetch(`${API_URL}/movimento`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tipo: modalAcao, valor: parseFloat(valorMovimento), descricao: descMovimento })
      });
      if (res.ok) {
        setModalAcao(null);
        setValorMovimento('');
        setDescMovimento('');
        loadResumo(turno.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return <div className="p-10 text-primaryGreen">Carregando...</div>;

  return (
    <div className="flex flex-col h-full bg-darkBg text-white p-4 sm:p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="text-primaryGreen" size={32} />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Controle de Caixa</h1>
          <p className="text-slate-400">Abra, sangre ou feche o caixa do dia.</p>
        </div>
      </div>

      {!turno ? (
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-8 max-w-md mx-auto text-center shadow-lg mt-10">
          <div className="w-20 h-20 bg-primaryGreen/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primaryGreen" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Caixa Fechado</h2>
          <p className="text-slate-400 mb-6">Você precisa abrir o caixa para liberar a tela de vendas do PDV.</p>
          
          <div className="text-left mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Troco em gaveta (R$)</label>
            <input 
              type="number"
              value={trocoInicial}
              onChange={(e) => setTrocoInicial(e.target.value)}
              className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-white focus:border-primaryGreen transition-colors text-lg"
              placeholder="0.00"
            />
          </div>

          <button 
            onClick={handleAbrir}
            className="w-full bg-primaryGreen hover:bg-primaryHover text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg"
          >
            <Play size={20} /> Abrir Caixa Agora
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3"><DollarSign className="text-slate-500 opacity-20" size={60} /></div>
              <h3 className="text-slate-400 font-medium mb-1 relative z-10">Troco Inicial</h3>
              <p className="text-2xl font-bold text-white relative z-10">{fmt(turno.troco_inicial)}</p>
            </div>
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3"><Calculator className="text-slate-500 opacity-20" size={60} /></div>
              <h3 className="text-slate-400 font-medium mb-1 relative z-10">Vendas no Turno</h3>
              <p className="text-2xl font-bold text-primaryGreen relative z-10">{fmt(resumo.total_vendas)}</p>
            </div>
            <div className="bg-darkCard border border-primaryGreen/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primaryGreen text-white px-3 py-1 rounded-bl-xl font-bold text-xs">ABERTO</div>
              <h3 className="text-slate-400 font-medium mb-1">Aberto desde</h3>
              <p className="font-bold text-white text-sm">{new Date(turno.data_abertura).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button onClick={() => setModalAcao('Sangria')} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-6 rounded-2xl font-bold text-lg transition-colors flex flex-col items-center justify-center gap-2">
              Sangria (Retirar Dinheiro)
            </button>
            <button onClick={() => setModalAcao('Suprimento')} className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 py-6 rounded-2xl font-bold text-lg transition-colors flex flex-col items-center justify-center gap-2">
              Suprimento (Colocar Troco)
            </button>
          </div>

          <div className="bg-darkCard border border-darkBorder rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" /> Fechamento de Caixa
            </h2>
            <div className="grid md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Qual o valor físico em gaveta agora? (R$)</label>
                <input 
                  type="number"
                  value={saldoFinal}
                  onChange={(e) => setSaldoFinal(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-white focus:border-red-500 transition-colors text-lg"
                  placeholder="Ex: 250.00"
                />
              </div>
              <button 
                onClick={handleFechar}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg disabled:opacity-50"
                disabled={!saldoFinal}
              >
                <Square size={20} /> Encerrar Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sangria/Suprimento */}
      {modalAcao && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{modalAcao}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm mb-1 text-slate-400">Valor (R$)</label>
                <input type="number" value={valorMovimento} onChange={(e) => setValorMovimento(e.target.value)} className="w-full bg-darkBg border border-darkBorder rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-400">Motivo / Descrição</label>
                <input type="text" value={descMovimento} onChange={(e) => setDescMovimento(e.target.value)} className="w-full bg-darkBg border border-darkBorder rounded-xl p-3" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalAcao(null)} className="flex-1 py-3 bg-darkBorder rounded-xl font-bold">Cancelar</button>
              <button onClick={handleMovimento} className={`flex-1 py-3 rounded-xl font-bold text-white ${modalAcao === 'Sangria' ? 'bg-red-500' : 'bg-blue-500'}`}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
