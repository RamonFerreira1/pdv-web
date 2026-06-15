import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeft, TrendingUp, DollarSign, Search, Calendar } from 'lucide-react';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function VendasPorServico() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState({ inicio: '', fim: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reports/vendas-servico`;
        const token = localStorage.getItem('pdv_token');
        const res = await fetch(API_URL, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error('Erro ao carregar relatório de serviços:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const filtrado = data.filter(row =>
    row.servico?.toLowerCase().includes(busca.toLowerCase())
  );

  const totalReceita = filtrado.reduce((acc, row) => acc + Number(row.receita_total || 0), 0);
  const totalQtd = filtrado.reduce((acc, row) => acc + Number(row.quantidade_vendida || 0), 0);

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
            <Wrench size={20} className="text-purple-400" />
            Vendas por Serviço
          </h1>
          <p className="text-xs text-slate-400">Acompanhe o desempenho de cada serviço prestado</p>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Cards de resumo */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total em Serviços</p>
                  <h3 className="text-2xl font-bold text-white">{fmt(totalReceita)}</h3>
                </div>
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                  <DollarSign size={20} />
                </div>
              </div>
            </div>

            <div className="bg-darkCard border border-darkBorder rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Serviços Realizados</p>
                  <h3 className="text-2xl font-bold text-white">{totalQtd} un</h3>
                </div>
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>

            <div className="bg-darkCard border border-darkBorder rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Ticket Médio</p>
                  <h3 className="text-2xl font-bold text-white">
                    {totalQtd > 0 ? fmt(totalReceita / totalQtd) : 'R$ 0,00'}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                  <Wrench size={20} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-lg">
          {/* Toolbar */}
          <div className="p-4 border-b border-darkBorder flex flex-col sm:flex-row gap-3 bg-slate-900/50">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar serviço..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:border-purple-400 outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <input
                type="date"
                value={periodo.inicio}
                onChange={e => setPeriodo(p => ({ ...p, inicio: e.target.value }))}
                className="bg-darkBg border border-darkBorder rounded-lg py-2 px-3 text-white text-sm focus:border-purple-400 outline-none"
              />
              <span className="text-slate-500 text-sm">até</span>
              <input
                type="date"
                value={periodo.fim}
                onChange={e => setPeriodo(p => ({ ...p, fim: e.target.value }))}
                className="bg-darkBg border border-darkBorder rounded-lg py-2 px-3 text-white text-sm focus:border-purple-400 outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-purple-400">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">Carregando dados...</span>
              </div>
            </div>
          ) : filtrado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Wrench size={48} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhum serviço encontrado</p>
              <p className="text-sm mt-1">
                {busca ? 'Tente outro termo de busca' : 'Nenhuma venda de serviço registrada'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-darkBg/50 border-b border-darkBorder text-slate-400 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">#</th>
                    <th className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2"><Wrench size={14} /> Serviço</div>
                    </th>
                    <th className="px-6 py-4 font-medium">Qtd Realizado</th>
                    <th className="px-6 py-4 font-medium">Ticket Médio</th>
                    <th className="px-6 py-4 font-medium text-right">
                      <div className="flex justify-end items-center gap-2"><TrendingUp size={14} /> Receita Total</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBorder">
                  {filtrado.map((row, idx) => {
                    const ticket = Number(row.quantidade_vendida) > 0
                      ? Number(row.receita_total) / Number(row.quantidade_vendida)
                      : 0;
                    return (
                      <tr key={idx} className="hover:bg-darkBg/30 transition-colors">
                        <td className="px-6 py-4 text-slate-500 text-sm">{idx + 1}</td>
                        <td className="px-6 py-4 font-medium text-slate-200">{row.servico}</td>
                        <td className="px-6 py-4 text-slate-300">
                          <span className="bg-purple-400/10 text-purple-400 px-3 py-1 rounded-full text-sm font-bold">
                            {row.quantidade_vendida} un
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm">{fmt(ticket)}</td>
                        <td className="px-6 py-4 text-right font-bold text-white">{fmt(row.receita_total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-darkBg/50 border-t-2 border-darkBorder">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 font-bold text-slate-300">Total Geral</td>
                    <td className="px-6 py-4 text-right font-black text-purple-400 text-lg">{fmt(totalReceita)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
