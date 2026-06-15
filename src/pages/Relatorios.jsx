import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, TrendingUp, Users, ArrowLeft, BarChart2, Loader2 } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;
const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const TAXA_COMISSAO = 0.05;

export default function Relatorios() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [comissoes, setComissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('pdv_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Monta query params de data
        const params = new URLSearchParams();
        if (dateRange.start) params.append('inicio', dateRange.start);
        if (dateRange.end) params.append('fim', dateRange.end);
        const qs = params.toString() ? `?${params.toString()}` : '';

        const [dashRes, comRes] = await Promise.all([
          fetch(`${API_URL}/reports/dashboard${qs}`, { headers }),
          fetch(`${API_URL}/reports/comissoes${qs}`, { headers }),
        ]);

        if (dashRes.ok) setDashboard(await dashRes.json());
        if (comRes.ok) setComissoes(await comRes.json());
      } catch (e) {
        console.error('Erro ao carregar relatórios:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange.start, dateRange.end]);

  const totalVendido = comissoes.reduce((acc, r) => acc + Number(r.total_vendido || 0), 0);

  return (
    <div className="flex flex-col h-full bg-darkBg p-4 sm:p-8 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-darkBorder rounded-lg transition-colors shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard Gerencial</h1>
            <p className="text-slate-400 text-sm">Resumo financeiro e desempenho da equipe.</p>
          </div>
        </div>

        {/* Filtro de datas funcional */}
        <div className="flex items-center gap-3 bg-darkCard border border-darkBorder p-2 rounded-xl">
          <div className="flex items-center gap-2 px-3 py-1">
            <Calendar size={18} className="text-slate-400 shrink-0" />
            <input
              type="date"
              className="bg-transparent border-none text-slate-200 text-sm focus:outline-none"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <span className="text-slate-500">até</span>
          <div className="flex items-center gap-2 px-3 py-1">
            <input
              type="date"
              className="bg-transparent border-none text-slate-200 text-sm focus:outline-none"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primaryGreen" size={36} />
        </div>
      ) : (
        <>
          {/* Cards de resumo com dados reais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Faturamento real */}
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-primaryGreen/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 font-medium mb-2">Faturamento do Mês</p>
                  <h3 className="text-4xl font-bold text-white mb-2">
                    {dashboard ? fmt(dashboard.mes?.total) : '—'}
                  </h3>
                  <p className="text-sm text-primaryGreen flex items-center gap-1">
                    <TrendingUp size={14} />
                    <span>{dashboard ? `${dashboard.mes?.qtd || 0} vendas no mês` : 'Sem dados'}</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-primaryGreen/10 rounded-xl flex items-center justify-center text-primaryGreen">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            {/* Ticket médio */}
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 font-medium mb-2">Ticket Médio (Hoje)</p>
                  <h3 className="text-4xl font-bold text-white mb-2">
                    {dashboard ? fmt(dashboard.hoje?.ticketMedio) : '—'}
                  </h3>
                  <p className="text-sm text-blue-400 flex items-center gap-1">
                    <span>{dashboard ? `${dashboard.hoje?.qtd || 0} venda(s) hoje` : ''}</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                  <BarChart2 size={24} />
                </div>
              </div>
            </div>

            {/* Total comissões da equipe */}
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 font-medium mb-2">Total a Pagar em Comissões</p>
                  <h3 className="text-4xl font-bold text-white mb-2">
                    {fmt(totalVendido * TAXA_COMISSAO)}
                  </h3>
                  <p className="text-sm text-purple-400 flex items-center gap-1">
                    <span>{comissoes.length} vendedor(es) ativos</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                  <Users size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Vendas por Vendedor (dados reais da API) */}
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                <Users size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Vendas por Usuário</h2>
            </div>

            {comissoes.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Nenhuma venda registrada no período.</p>
            ) : (
              <div className="space-y-6">
                {comissoes.map(seller => {
                  const percentage = totalVendido > 0 ? (Number(seller.total_vendido) / totalVendido) * 100 : 0;
                  return (
                    <div key={seller.usuario_id}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-white">
                            {(seller.nome || '?').charAt(0)}
                          </div>
                          <span className="font-medium text-slate-200">
                            {seller.nome} {seller.sobrenome || ''}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white block">{fmt(seller.total_vendido)}</span>
                          <span className="text-xs text-slate-400">{percentage.toFixed(1)}% do total</span>
                        </div>
                      </div>
                      <div className="w-full bg-darkBg rounded-full h-3 border border-darkBorder overflow-hidden">
                        <div
                          className="bg-primaryGreen h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
