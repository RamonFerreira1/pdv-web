import React, { useEffect, useState, useContext } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Package, AlertTriangle, BarChart2, Clock } from 'lucide-react';
import { AutenticacaoContext } from '../context/AutenticacaoContext';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function StatCard({ icon: Icon, label, value, sub, color = 'primaryGreen', gradient }) {
  const colors = {
    primaryGreen: { bg: 'bg-primaryGreen/10', text: 'text-primaryGreen', border: 'border-primaryGreen/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  };
  const c = colors[color] || colors.primaryGreen;

  return (
    <div className={`bg-darkCard border ${c.border} rounded-2xl p-6 flex flex-col gap-3 hover:shadow-lg transition-all`}>
      <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
        <Icon size={24} className={c.text} />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { usuario } = useContext(AutenticacaoContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('pdv_token');
        const res = await fetch(`${API_URL}/reports/dashboard`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error('Erro ao carregar dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="flex flex-col h-full bg-darkBg text-white p-4 sm:p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          {saudacao}, {usuario?.nome || 'Operador'}! 👋
        </h1>
        <p className="text-slate-400 flex items-center gap-2">
          <Clock size={14} />
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primaryGreen border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <p>Não foi possível carregar as métricas.</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={DollarSign}
              label="Vendas Hoje"
              value={fmt(data.hoje.total)}
              sub={`${data.hoje.qtd} venda${data.hoje.qtd !== 1 ? 's' : ''} realizadas`}
              color="primaryGreen"
            />
            <StatCard
              icon={TrendingUp}
              label="Ticket Médio"
              value={fmt(data.hoje.ticketMedio)}
              sub="Valor médio por venda hoje"
              color="blue"
            />
            <StatCard
              icon={ShoppingBag}
              label="Faturamento do Mês"
              value={fmt(data.mes.total)}
              sub={`${data.mes.qtd} vendas no mês atual`}
              color="purple"
            />
            <StatCard
              icon={AlertTriangle}
              label="Alertas de Estoque"
              value={data.estoqueBaixo.length}
              sub={data.estoqueBaixo.length === 0 ? 'Estoque saudável ✅' : 'Produto(s) com estoque baixo'}
              color={data.estoqueBaixo.length > 0 ? 'amber' : 'primaryGreen'}
            />
          </div>

          {/* Lower Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Produtos */}
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BarChart2 size={20} className="text-primaryGreen" />
                  Top 5 Produtos
                </h2>
                <button
                  onClick={() => navigate('/relatorios/produtos')}
                  className="text-xs text-primaryGreen hover:underline"
                >
                  Ver tudo
                </button>
              </div>
              {data.topProdutos.length === 0 ? (
                <p className="text-slate-500 text-center py-6">Nenhuma venda registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {data.topProdutos.map((p, i) => {
                    const maxQty = data.topProdutos[0].quantidade;
                    const pct = Math.round((p.quantidade / maxQty) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300 font-medium truncate max-w-[70%]">{p.produto}</span>
                          <span className="text-primaryGreen font-bold shrink-0">{p.quantidade} un</span>
                        </div>
                        <div className="h-2 bg-darkBg rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primaryGreen rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Alertas de Estoque Baixo */}
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Package size={20} className="text-amber-400" />
                  Estoque Baixo
                </h2>
                <button
                  onClick={() => navigate('/estoque')}
                  className="text-xs text-primaryGreen hover:underline"
                >
                  Gerenciar
                </button>
              </div>
              {data.estoqueBaixo.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-primaryGreen">
                  <div className="w-14 h-14 bg-primaryGreen/10 rounded-full flex items-center justify-center mb-3">
                    <Package size={28} className="text-primaryGreen" />
                  </div>
                  <p className="font-medium">Todos os produtos têm estoque suficiente!</p>
                  <p className="text-slate-500 text-sm mt-1">Nada a repor no momento.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.estoqueBaixo.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                        <span className="text-slate-200 text-sm font-medium truncate">{p.nome}</span>
                      </div>
                      <span className={`font-bold text-sm shrink-0 ${p.estoque === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                        {p.estoque === 0 ? 'Esgotado!' : `${p.estoque} un`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
