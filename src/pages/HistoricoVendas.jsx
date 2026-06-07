import React, { useState, useEffect, useContext } from 'react';
import { Search, Clock, ShoppingBag, ArrowLeft, ChevronDown, ChevronUp, Package, X, Download, Printer } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;
const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function VendaDetalhesModal({ vendaId, onClose }) {
  const [venda, setVenda] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = localStorage.getItem('pdv_token');
        const res = await fetch(`${API_URL}/vendas/${vendaId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) setVenda(await res.json());
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [vendaId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-darkCard border border-darkBorder w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-darkBorder">
          <h2 className="text-lg font-bold text-white">
            {loading ? 'Carregando...' : `Venda #${venda?.ID}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-primaryGreen border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !venda ? (
            <p className="text-slate-500 text-center py-6">Não foi possível carregar os detalhes.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(venda.data_venda).toLocaleString('pt-BR')}
                </span>
                <span className="font-bold text-primaryGreen text-lg">{fmt(parseFloat(venda.total))}</span>
              </div>

              <div className="bg-darkBg rounded-xl border border-darkBorder divide-y divide-darkBorder overflow-hidden">
                {venda.itens && venda.itens.length > 0 ? (
                  venda.itens.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primaryGreen/10 flex items-center justify-center shrink-0">
                          <Package size={14} className="text-primaryGreen" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{item.produto}</p>
                          <p className="text-slate-500 text-xs">{item.quantidade}x {fmt(parseFloat(item.preco_unitario))}</p>
                        </div>
                      </div>
                      <span className="text-white font-semibold text-sm">
                        {fmt(item.quantidade * parseFloat(item.preco_unitario))}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">Itens não disponíveis.</p>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-darkBorder">
                <span className="font-bold text-white text-lg">Total</span>
                <span className="font-bold text-primaryGreen text-xl">{fmt(parseFloat(venda.total))}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoricoVendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVendaId, setSelectedVendaId] = useState(null);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const token = localStorage.getItem('pdv_token');
        const response = await fetch(`${API_URL}/vendas`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
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
            <p className="text-xs text-slate-400">{vendas.length} venda{vendas.length !== 1 ? 's' : ''} registrada{vendas.length !== 1 ? 's' : ''} — clique para ver detalhes</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => exportToCSV(vendas, 'historico_vendas')}
              className="flex items-center gap-1 bg-darkBg border border-darkBorder hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <Download size={14} /> <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 bg-darkBg border border-darkBorder hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <Printer size={14} /> <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

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
                  onClick={() => setSelectedVendaId(venda.ID)}
                  className="bg-darkCard border border-darkBorder rounded-xl p-4 hover:border-primaryGreen/40 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primaryGreen/10 flex items-center justify-center shrink-0 group-hover:bg-primaryGreen/20 transition-colors">
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
                    <div className="flex items-center gap-2">
                      <span className="text-primaryGreen font-bold text-lg shrink-0">
                        {fmt(parseFloat(venda.total))}
                      </span>
                      <ChevronDown size={16} className="text-slate-500 group-hover:text-primaryGreen transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedVendaId && (
        <VendaDetalhesModal vendaId={selectedVendaId} onClose={() => setSelectedVendaId(null)} />
      )}
    </div>
  );
}
