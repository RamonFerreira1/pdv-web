import React, { useState, useEffect } from 'react';
import { Search, Clock, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function HistoricoVendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/vendas`);
        if (response.ok) {
          const data = await response.json();
          setVendas(data);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendas();
  }, []);

  const filtered = vendas.filter(v =>
    String(v.ID).includes(search) || String(v.total).includes(search)
  );

  return (
    <div className="flex flex-col h-full bg-darkBg">
      {/* Header */}
      <div className="bg-darkCard border-b border-darkBorder px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-darkBorder rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Histórico de Vendas</h1>
            <p className="text-xs text-slate-400">{vendas.length} venda{vendas.length !== 1 ? 's' : ''} registrada{vendas.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nº da venda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-darkBg border border-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primaryGreen transition-colors text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-primaryGreen border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
            <ShoppingBag size={40} className="opacity-30" />
            <p>Nenhuma venda encontrada.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {filtered.map((venda) => {
              const date = new Date(venda.data_venda);
              const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const fullDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

              return (
                <div
                  key={venda.ID}
                  className="bg-darkCard border border-darkBorder rounded-xl p-4 hover:border-primaryGreen/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primaryGreen/10 flex items-center justify-center shrink-0">
                        <ShoppingBag size={18} className="text-primaryGreen" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Venda #{venda.ID}</h3>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                          <Clock size={12} />
                          <span>{fullDate} às {time}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-primaryGreen font-bold text-lg shrink-0 ml-4">
                      {fmt(parseFloat(venda.total))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
