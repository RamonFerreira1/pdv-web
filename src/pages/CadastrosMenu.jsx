// Autor: ISSAMO - FE Pessoa 3 (Estoque e Cadastros)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tags, PackageSearch, Layers, Sliders, Users, Truck, UserCircle, ChevronRight, ArrowLeft } from 'lucide-react';

export default function CadastrosMenu() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Categorias',
      desc: 'Cadastre categorias para facilitar a visualização dos seus produtos',
      icon: Tags,
      path: '/categorias',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      title: 'Produtos e Serviços',
      desc: 'Cadastre seus produtos e serviços para ter um melhor controle',
      icon: PackageSearch,
      path: '/estoque',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Combo de Produtos',
      desc: 'Cadastre seus combos e facilite a venda de seus produtos.',
      icon: Layers,
      path: '/combos',
      badge: 'PREMIUM',
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
    {
      title: 'Modificador',
      desc: 'Adicione modificadores em seus produtos para alterar seus preços',
      icon: Sliders,
      path: '/modificadores',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Clientes',
      desc: 'Cadastre clientes e vincule-os às suas vendas e pedidos.',
      icon: Users,
      path: '/clientes',
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
    },
    {
      title: 'Fornecedores',
      desc: 'Cadastre seus fornecedores e lance suas contas a pagar.',
      icon: Truck,
      path: '/fornecedores',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      title: 'Vendedores',
      desc: 'Cadastre seus vendedores para controlar comissões.',
      icon: UserCircle,
      path: '/vendedores',
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
          <h1 className="text-xl font-bold text-white">Cadastros</h1>
          <p className="text-xs text-slate-400">Gerencie seus dados cadastrais</p>
        </div>
      </div>

      {/* List */}
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
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-semibold text-[15px]">{item.title}</span>
                    {item.badge && (
                      <span className="bg-orange-400/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-400/30 uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
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

