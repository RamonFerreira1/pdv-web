import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ArrowLeft, Package, Wrench, TrendingUp, DollarSign, Search } from 'lucide-react';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function RelatorioConsolidado() {
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState('todos'); // 'todos' | 'produtos' | 'servicos'
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('pdv_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    Promise.allSettled([
      fetch(`${BASE}/api/reports/vendas-produto`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BASE}/api/reports/vendas-servico`, { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([resProd, resSvc]) => {
      setProdutos(resProd.status === 'fulfilled' ? resProd.value : []);
      setServicos(resSvc.status === 'fulfilled' ? resSvc.value : []);
    }).finally(() => setLoading(false));
  }, []);

  // Combina todos os itens para a aba "todos"
  const todos = [
    ...produtos.map(p => ({ ...p, nome: p.produto, tipo: 'produto' })),
    ...servicos.map(s => ({ ...s, nome: s.servico, tipo: 'servico' })),
  ].sort((a, b) => Number(b.receita_total) - Number(a.receita_total));

  const listaAtual = aba === 'todos'
    ? todos
    : aba === 'produtos'
    ? produtos.map(p => ({ ...p, nome: p.produto, tipo: 'produto' }))
    : servicos.map(s => ({ ...s, nome: s.servico, tipo: 'servico' }));

  const filtrado = listaAtual.filter(i =>
    i.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const totalProdutos = produtos.reduce((a, p) => a + Number(p.receita_total || 0), 0);
  const totalServicos = servicos.reduce((a, s) => a + Number(s.receita_total || 0), 0);
  const totalGeral = totalProdutos + totalServicos;
  const totalQtdProd = produtos.reduce((a, p) => a + Number(p.quantidade_vendida || 0), 0);
  const totalQtdSvc = servicos.reduce((a, s) => a + Number(s.quantidade_vendida || 0), 0);

  const abas = [
    { id: 'todos', label: 'Todos', count: todos.length },
    { id: 'produtos', label: 'Produtos', count: produtos.length },
    { id: 'servicos', label: 'Serviços', count: servicos.length },
  ];

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
            <PackagePlus size={20} className="text-amber-400" />
            Produtos e Serviços
          </h1>
          <p className="text-xs text-slate-400">Relatório consolidado de todos os itens vendidos</p>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Cards de resumo */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Receita Total</p>
                  <h3 className="text-2xl font-bold text-white">{fmt(totalGeral)}</h3>
                  <p className="text-xs text-slate-500 mt-1">Produtos + Serviços</p>
                </div>
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                  <DollarSign size={20} />
                </div>
              </div>
            </div>

            <div className="bg-darkCard border border-darkBorder rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Receita em Produtos</p>
                  <h3 className="text-2xl font-bold text-white">{fmt(totalProdutos)}</h3>
                  <p className="text-xs text-slate-500 mt-1">{totalQtdProd} unidades vendidas</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                  <Package size={20} />
                </div>
              </div>
            </div>

            <div className="bg-darkCard border border-darkBorder rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Receita em Serviços</p>
                  <h3 className="text-2xl font-bold text-white">{fmt(totalServicos)}</h3>
                  <p className="text-xs text-slate-500 mt-1">{totalQtdSvc} serviços realizados</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                  <Wrench size={20} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barra de participação */}
        {!loading && totalGeral > 0 && (
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-3 font-medium">Participação no Faturamento</p>
            <div className="w-full h-4 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${(totalProdutos / totalGeral) * 100}%` }}
                title={`Produtos: ${fmt(totalProdutos)}`}
              />
              <div
                className="bg-purple-500 h-full transition-all"
                style={{ width: `${(totalServicos / totalGeral) * 100}%` }}
                title={`Serviços: ${fmt(totalServicos)}`}
              />
            </div>
            <div className="flex gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-400">
                  Produtos {totalGeral > 0 ? ((totalProdutos / totalGeral) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-slate-400">
                  Serviços {totalGeral > 0 ? ((totalServicos / totalGeral) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabela consolidada */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-lg">
          {/* Abas + Busca */}
          <div className="p-4 border-b border-darkBorder flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-900/50">
            <div className="flex gap-1 bg-darkBg border border-darkBorder rounded-xl p-1">
              {abas.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    aba === a.id
                      ? 'bg-amber-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {a.label} ({a.count})
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar item..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:border-amber-400 outline-none transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">Carregando dados...</span>
              </div>
            </div>
          ) : filtrado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <PackagePlus size={48} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhum item encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-darkBg/50 border-b border-darkBorder text-slate-400 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">#</th>
                    <th className="px-6 py-4 font-medium">Item</th>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Qtd Vendida</th>
                    <th className="px-6 py-4 font-medium text-right">
                      <div className="flex justify-end items-center gap-2"><TrendingUp size={14} /> Receita</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBorder">
                  {filtrado.map((row, idx) => (
                    <tr key={idx} className="hover:bg-darkBg/30 transition-colors">
                      <td className="px-6 py-4 text-slate-500 text-sm">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-200">{row.nome}</td>
                      <td className="px-6 py-4">
                        {row.tipo === 'produto' ? (
                          <span className="flex items-center gap-1.5 bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold w-fit">
                            <Package size={12} /> Produto
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 bg-purple-400/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold w-fit">
                            <Wrench size={12} /> Serviço
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          row.tipo === 'produto'
                            ? 'bg-blue-400/10 text-blue-400'
                            : 'bg-purple-400/10 text-purple-400'
                        }`}>
                          {row.quantidade_vendida} un
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">{fmt(row.receita_total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-darkBg/50 border-t-2 border-darkBorder">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 font-bold text-slate-300">Total Geral</td>
                    <td className="px-6 py-4 text-right font-black text-amber-400 text-lg">
                      {fmt(filtrado.reduce((a, r) => a + Number(r.receita_total || 0), 0))}
                    </td>
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
