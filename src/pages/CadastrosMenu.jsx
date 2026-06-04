import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tags, PackageSearch, Layers, Sliders, Users, Truck, UserCircle } from 'lucide-react';

export default function CadastrosMenu() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Categorias',
      desc: 'Cadastre categorias para facilitar a visualização dos seus produtos',
      icon: Tags,
      path: '/categorias'
    },
    {
      title: 'Produtos e Serviços',
      desc: 'Cadastre seus produtos e serviços para ter um melhor controle',
      icon: PackageSearch,
      path: '/estoque' // Este já está implementado!
    },
    {
      title: 'Combo de Produtos',
      desc: 'Cadastre seus combos e facilite a venda de seus produtos.',
      icon: Layers,
      path: '/combos',
      badge: 'PREMIUM'
    },
    {
      title: 'Modificador',
      desc: 'Adicione modificadores em seus produtos para alterar seus preços',
      icon: Sliders,
      path: '/modificadores'
    },
    {
      title: 'Clientes',
      desc: 'Cadastre clientes e vincule-os às suas vendas e pedidos.',
      icon: Users,
      path: '/clientes'
    },
    {
      title: 'Fornecedores',
      desc: 'Cadastre seus fornecedores e lance suas contas a pagar.',
      icon: Truck,
      path: '/fornecedores'
    },
    {
      title: 'Vendedores',
      desc: 'Cadastre seus vendedores para controlar comissões.',
      icon: UserCircle,
      path: '/vendedores'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-darkBg text-white">
      {/* App Bar */}
      <div className="h-16 bg-[#1e3a8a] flex items-center px-4 shadow-md shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-blue-800 rounded-full transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-medium">Cadastros</h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-slate-100">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              onClick={() => navigate(item.path)}
              className="flex items-start p-4 bg-white border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="mt-1 mr-4 text-slate-500">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-slate-800 font-medium text-lg">{item.title}</h3>
                  {item.badge && (
                    <span className="bg-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm leading-snug pr-4">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 text-slate-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
