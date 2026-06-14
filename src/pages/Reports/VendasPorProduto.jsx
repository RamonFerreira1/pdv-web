// Autor: FE Pessoa 4 — Dashboard, Gestão & Relatórios
// Responsabilidade: Relatório de vendas agrupado por produto com receita total
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ArrowLeft, Package, TrendingUp } from 'lucide-react';

export default function VendasPorProduto() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reports/vendas-produto`;
        const token = localStorage.getItem('pdv_token');
        const res = await fetch(API_URL, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex flex-col h-full bg-darkBg text-white p-4 sm:p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-white hover:bg-darkBorder rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart2 className="text-primaryGreen" /> 
            Vendas por Produto
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acompanhe o desempenho de vendas de cada item do seu estoque real.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center text-primaryGreen">Carregando dados...</div>
      ) : (
        <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-lg">
          {data.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              Nenhuma venda registrada até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-darkBg/50 border-b border-darkBorder text-slate-400 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium"><div className="flex items-center gap-2"><Package size={16}/> Produto</div></th>
                    <th className="px-6 py-4 font-medium">Qtd Vendida</th>
                    <th className="px-6 py-4 font-medium text-right"><div className="flex justify-end items-center gap-2"><TrendingUp size={16}/> Receita Total</div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBorder">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-darkBg/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{row.produto}</td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className="bg-primaryGreen/10 text-primaryGreen px-3 py-1 rounded-full text-sm font-bold">
                          {row.quantidade_vendida} un
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">
                        {fmt(row.receita_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
