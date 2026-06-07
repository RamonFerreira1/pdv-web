import React, { useState, useEffect, useRef } from 'react';
import { User, Search, X } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/dynamic`;

export default function BuscaCliente({ clienteSelecionado, onSelect }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) { setResultados([]); return; }
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('pdv_token');
        const res = await fetch(`${API_URL}/clientes`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          const q = query.toLowerCase();
          setResultados(data.filter(c =>
            c.nome?.toLowerCase().includes(q) ||
            c.documento?.includes(q) ||
            c.telefone?.includes(q)
          ).slice(0, 5));
        }
      } catch(e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (clienteSelecionado) {
    return (
      <div className="flex items-center justify-between bg-primaryGreen/10 border border-primaryGreen/30 rounded-xl px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <User size={14} className="text-primaryGreen" />
          <span className="text-sm font-medium text-white truncate">{clienteSelecionado.nome}</span>
        </div>
        <button onClick={() => onSelect(null)} className="text-slate-400 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-3" ref={ref}>
      <div className="relative">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onFocus={() => setAberto(true)}
          onChange={(e) => { setQuery(e.target.value); setAberto(true); }}
          placeholder="Vincular cliente (opcional)..."
          className="w-full bg-darkBg border border-darkBorder rounded-xl pl-8 pr-3 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primaryGreen transition-colors"
        />
      </div>
      {aberto && resultados.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-darkCard border border-darkBorder rounded-xl shadow-2xl z-50 overflow-hidden">
          {resultados.map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect(c); setQuery(''); setAberto(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-darkBorder transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-primaryGreen/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primaryGreen">{c.nome.charAt(0)}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{c.nome}</p>
                {c.telefone && <p className="text-slate-500 text-xs">{c.telefone}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
