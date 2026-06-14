// Autor: FE Pessoa 4 — Dashboard, Gestão & Relatórios
// Responsabilidade: Relatório de comissões de vendedores (taxa 5%)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, DollarSign, Award } from 'lucide-react';

export default function Comissoes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vamos fixar em 5% por enquanto, no futuro pode vir do banco da tabela 'vendedores'
  const TAXA_COMISSAO = 0.05; 

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reports/comissoes`;
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
            <Users className="text-primaryGreen" /> 
            Comissões de Vendedores
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Com base nas vendas registradas por cada usuário ativo. (Taxa Base: 5%)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center text-primaryGreen">Carregando dados...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length === 0 ? (
            <div className="col-span-full p-10 bg-darkCard border border-darkBorder rounded-2xl text-center text-slate-500">
              Nenhuma venda registrada no período.
            </div>
          ) : (
            data.map((row, idx) => {
              const comissaoTotal = row.total_vendido * TAXA_COMISSAO;
              return (
                <div key={row.usuario_id} className="bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden group hover:border-primaryGreen transition-colors">
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-bl-xl font-bold flex items-center gap-1 text-xs">
                      <Award size={14} /> Destaque
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-darkBg border border-darkBorder rounded-full flex items-center justify-center text-xl font-bold text-slate-300">
                      {row.nome.charAt(0)}{row.sobrenome ? row.sobrenome.charAt(0) : ''}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{row.nome} {row.sobrenome}</h3>
                      <p className="text-slate-400 text-sm">{row.qtd_vendas} vendas realizadas</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-darkBg p-3 rounded-xl border border-darkBorder">
                      <span className="text-slate-400 text-sm">Total Vendido</span>
                      <span className="font-bold text-white">{fmt(row.total_vendido)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-primaryGreen/10 p-3 rounded-xl border border-primaryGreen/20">
                      <span className="text-primaryGreen font-bold flex items-center gap-1 text-sm">
                        <DollarSign size={16} /> Comissão (5%)
                      </span>
                      <span className="font-black text-primaryGreen text-lg">{fmt(comissaoTotal)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
