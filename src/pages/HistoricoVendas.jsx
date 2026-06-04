import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Smartphone } from 'lucide-react';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function HistoricoVendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/vendas');
        if (response.ok) {
          const data = await response.json();
          setVendas(data);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendas();
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800">
      {/* App Bar */}
      <div className="h-16 bg-[#3f51b5] flex items-center justify-between px-4 shadow-md shrink-0 text-white">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-indigo-600 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-medium">Histórico de vendas</h1>
        </div>
        <button className="p-2 hover:bg-indigo-600 rounded-full">
          <Filter size={20} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-slate-500">Carregando...</div>
        ) : vendas.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-40 text-slate-500">
            <Search size={32} className="mb-2 opacity-50" />
            <p>Nenhuma venda encontrada.</p>
          </div>
        ) : (
          <div className="bg-white divide-y divide-slate-200">
            {vendas.map((venda) => {
              const date = new Date(venda.data_venda);
              const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const fullDate = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

              return (
                <div key={venda.ID} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-normal text-slate-800">VENDA {venda.ID}</h3>
                    <div className="flex items-center text-slate-500 text-sm gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {time}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-slate-500 text-sm mb-4 gap-1">
                    <Smartphone size={14} />
                    <span>0938d388cde375b5</span> {/* Mock device ID like in video */}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-slate-500">
                      <p>Produto</p>
                      {venda.usuario_id && (
                        <div className="flex items-center gap-1 mt-1 text-slate-600">
                          <Users size={14} />
                          <span>Alexandre padaria</span> {/* Mock client name */}
                        </div>
                      )}
                    </div>
                    <span className="text-[#10b981] font-medium text-xl">
                      {fmt(parseFloat(venda.total))}
                    </span>
                  </div>
                  
                  {/* Mocking the date separator just for visual fidelity if we wanted, but we'll show it inside the card for simplicity or assume it groups by date. */}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
