import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, ArrowLeft, Search, Phone, Calendar, Cake, Mail } from 'lucide-react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Aniversariantes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1); // mês atual
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clientes`;
        const token = localStorage.getItem('pdv_token');
        const res = await fetch(API_URL, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          setClientes(await res.json());
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  // Filtra clientes com data de nascimento no mês selecionado
  const aniversariantes = clientes.filter(c => {
    if (!c.data_nascimento) return false;
    const mes = new Date(c.data_nascimento + 'T00:00:00').getMonth() + 1;
    const nomeMatch = c.nome?.toLowerCase().includes(busca.toLowerCase());
    return mes === mesSelecionado && nomeMatch;
  });

  const hoje = new Date();

  const aniversariantesHoje = aniversariantes.filter(c => {
    if (!c.data_nascimento) return false;
    const d = new Date(c.data_nascimento + 'T00:00:00');
    return d.getDate() === hoje.getDate() && d.getMonth() + 1 === hoje.getMonth() + 1;
  });

  const getIdade = (dataNasc) => {
    if (!dataNasc) return null;
    const nasc = new Date(dataNasc + 'T00:00:00');
    const age = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    return m < 0 || (m === 0 && hoje.getDate() < nasc.getDate()) ? age - 1 : age;
  };

  const getDia = (dataNasc) => {
    if (!dataNasc) return '';
    return new Date(dataNasc + 'T00:00:00').getDate();
  };

  return (
    <div className="flex flex-col h-full bg-darkBg text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-darkCard border-b border-darkBorder px-4 sm:px-6 py-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-white hover:bg-darkBorder rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift size={20} className="text-rose-400" />
            Aniversariantes
          </h1>
          <p className="text-xs text-slate-400">Fidelize clientes comemorando seus aniversários</p>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Aniversariantes de hoje */}
        {aniversariantesHoje.length > 0 && (
          <div className="bg-gradient-to-r from-rose-500/20 to-pink-500/10 border border-rose-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cake size={20} className="text-rose-400" />
              <h2 className="font-bold text-rose-300">🎂 Aniversariantes de Hoje!</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {aniversariantesHoje.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center font-bold text-rose-300 text-sm">
                    {c.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{c.nome}</p>
                    {c.telefone && (
                      <p className="text-xs text-slate-400">{c.telefone}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seletor de mês */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400 font-medium">Selecione o mês</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MESES.map((mes, idx) => (
              <button
                key={idx}
                onClick={() => setMesSelecionado(idx + 1)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mesSelecionado === idx + 1
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-darkBg border border-darkBorder text-slate-400 hover:text-white hover:border-rose-500/50'
                }`}
              >
                {mes}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de aniversariantes */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-darkBorder flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Gift size={18} className="text-rose-400" />
              <span className="font-semibold text-white">
                {MESES[mesSelecionado - 1]} — {aniversariantes.length} aniversariante{aniversariantes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:border-rose-400 outline-none transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">Carregando clientes...</span>
              </div>
            </div>
          ) : aniversariantes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Gift size={48} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhum aniversariante em {MESES[mesSelecionado - 1]}</p>
              <p className="text-sm mt-1 text-slate-600">
                Certifique-se de cadastrar a data de nascimento dos clientes
              </p>
            </div>
          ) : (
            <div className="divide-y divide-darkBorder">
              {aniversariantes
                .sort((a, b) => getDia(a.data_nascimento) - getDia(b.data_nascimento))
                .map((cliente, idx) => {
                  const dia = getDia(cliente.data_nascimento);
                  const idade = getIdade(cliente.data_nascimento);
                  const isHoje = dia === hoje.getDate() && mesSelecionado === hoje.getMonth() + 1;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-4 hover:bg-darkBg/30 transition-colors ${
                        isHoje ? 'bg-rose-500/5 border-l-2 border-rose-500' : ''
                      }`}
                    >
                      {/* Avatar com dia */}
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        isHoje ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-darkBg border border-darkBorder text-slate-300'
                      }`}>
                        <span className="text-lg font-black leading-none">{dia}</span>
                        <span className="text-xs opacity-70">{MESES[mesSelecionado - 1].substring(0, 3)}</span>
                      </div>

                      {/* Info do cliente */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white truncate">{cliente.nome}</p>
                          {isHoje && (
                            <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-medium">
                              🎂 Hoje!
                            </span>
                          )}
                          {idade !== null && (
                            <span className="text-xs bg-darkBg border border-darkBorder text-slate-400 px-2 py-0.5 rounded-full">
                              {idade + 1} anos
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          {cliente.telefone && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Phone size={11} /> {cliente.telefone}
                            </span>
                          )}
                          {cliente.email && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Mail size={11} /> {cliente.email}
                            </span>
                          )}
                          {!cliente.telefone && !cliente.email && (
                            <span className="text-xs text-slate-600">Sem contato cadastrado</span>
                          )}
                        </div>
                      </div>

                      {/* Botão de contato */}
                      {cliente.telefone && (
                        <a
                          href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        >
                          <Phone size={12} /> WhatsApp
                        </a>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
