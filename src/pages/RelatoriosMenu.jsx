import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Tag, Wrench, PackagePlus, Users, Gift } from 'lucide-react';

export default function RelatoriosMenu() {
  const navigate = useNavigate();

  const menuItems = [
    { title: 'VENDAS TOTALIZADO', icon: DollarSign, path: '/relatorios-totalizado' },
    { title: 'VENDAS POR PRODUTO', icon: Tag, path: '/vendas-produto' },
    { title: 'VENDAS POR SERVIÇO', icon: Wrench, path: '/vendas-servico' },
    { title: 'VENDAS PRODUTOS E SERVIÇOS', icon: PackagePlus, path: '/relatorios-consolidados' },
    { title: 'COMISSÃO DE VENDEDORES', icon: Users, path: '/comissoes' },
    { title: 'ANIVERSÁRIOS', icon: Gift, path: '/aniversarios' },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* App Bar */}
      <div className="h-16 bg-[#3f51b5] flex items-center px-4 shadow-md shrink-0 text-white">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-indigo-600 rounded-full transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-medium">Relatórios</h1>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="bg-white border-2 border-slate-200 p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-[#3f51b5] hover:bg-indigo-50 transition-colors shadow-sm"
              >
                <div className="text-orange-400">
                  <Icon size={36} strokeWidth={1.5} />
                </div>
                <span className="text-[#3f51b5] font-bold text-sm tracking-wide leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
