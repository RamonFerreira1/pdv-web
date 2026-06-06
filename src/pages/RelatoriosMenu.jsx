import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Tag, Wrench, PackagePlus, Users, Gift, ChevronRight, ArrowLeft } from 'lucide-react';

export default function RelatoriosMenu() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Vendas Totalizado',
      desc: 'Veja o resumo completo de todas as suas vendas',
      icon: DollarSign,
      path: '/relatorios-totalizado',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      title: 'Vendas por Produto',
      desc: 'Analise o desempenho de cada produto vendido',
      icon: Tag,
      path: '/vendas-produto',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Vendas por Serviço',
      desc: 'Acompanhe as vendas de serviços prestados',
      icon: Wrench,
      path: '/vendas-servico',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Produtos e Serviços',
      desc: 'Relatório consolidado de produtos e serviços',
      icon: PackagePlus,
      path: '/relatorios-consolidados',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      title: 'Comissão de Vendedores',
      desc: 'Calcule e acompanhe as comissões da equipe',
      icon: Users,
      path: '/comissoes',
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
    },
    {
      title: 'Aniversários',
      desc: 'Veja os aniversariantes do mês e fidelize clientes',
      icon: Gift,
      path: '/aniversarios',
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-darkBg">
      {/* Header */}
      <div className="bg-darkCard border-b border-darkBorder px-4 sm:px-6 py-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-white hover:bg-darkBorder rounded-lg transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Relatórios</h1>
          <p className="text-xs text-slate-400">Análises e dados do seu negócio</p>
        </div>
      </div>

      {/* Grid / List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-4 bg-darkCard border border-darkBorder rounded-xl hover:border-primaryGreen/50 hover:bg-darkCard/80 transition-all group text-left"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={22} className={item.color} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <span className="text-white font-semibold text-[15px] block mb-0.5">{item.title}</span>
                  <p className="text-slate-400 text-sm leading-snug">{item.desc}</p>
                </div>

                {/* Chevron */}
                <ChevronRight
                  size={18}
                  className="text-slate-600 group-hover:text-primaryGreen group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
