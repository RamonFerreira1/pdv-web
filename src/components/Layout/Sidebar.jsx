import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Store, Edit3, ClipboardList, Tag, Undo2, Box, 
  BarChart2, PieChart, Calculator, Users, DollarSign, MessageCircle, X, LogOut, LayoutDashboard, UserCog
} from 'lucide-react';

export default function Sidebar({ onClose }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const menus = [
    {
      title: null,
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Catálogo (PDV)', path: '/pdv', icon: Store },
        { name: 'Cadastros', path: '/cadastros', icon: Edit3 },
        { name: 'Pedidos em aberto', path: '/pedidos', icon: ClipboardList },
        { name: 'Consultar vendas', path: '/historico-vendas', icon: Tag },
        { name: 'Consultar devoluções', path: '/devolucoes', icon: Undo2 },
        { name: 'Consultar estoque', path: '/estoque', icon: Box },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { name: 'Relatórios', path: '/relatorios-menu', icon: BarChart2 },
        { name: 'Relatórios consolidados', path: '/relatorios-consolidados', icon: PieChart },
        { name: 'Controle de caixa', path: '/caixa', icon: Calculator },
        { name: 'Fiado', path: '/fiado', icon: Users },
        { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
        ...(user?.role === 'Admin' ? [{ name: 'Usuários', path: '/usuarios', icon: UserCog }] : []),
      ]
    },
    {
      title: 'Preferências',
      items: [
        { name: 'ENTRE EM CONTATO', path: '/contato', icon: MessageCircle, isButton: true },
      ]
    }
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-72 bg-darkCard border-r border-darkBorder flex flex-col h-full shrink-0 overflow-y-auto">
      {/* Header Profile Info */}
      <div className="bg-[#1e40af] p-5 text-white shrink-0 flex items-start justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold truncate">{user ? user.nome : 'Carregando...'}</h2>
          <p className="text-sm text-blue-200 truncate">{user ? user.email : ''}</p>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          className="md:hidden ml-2 p-1 text-blue-200 hover:text-white transition-colors shrink-0 mt-0.5"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4">
        {menus.map((section, idx) => (
          <div key={idx} className="mb-2">
            {section.title && (
              <h3 className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;

                if (item.isButton) {
                  return (
                    <li key={item.name} className="px-4 pt-4">
                      <button 
                        onClick={handleNavClick}
                        className="w-full flex items-center justify-center gap-3 bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-colors"
                      >
                        <Icon size={20} />
                        <span>{item.name}</span>
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={handleNavClick}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-6 py-3 transition-colors duration-200 ${
                          isActive
                            ? 'text-primaryGreen font-medium bg-darkBg/50 border-r-2 border-primaryGreen'
                            : 'text-slate-300 hover:bg-darkBorder/60 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={18} className={isActive ? 'text-primaryGreen' : 'text-slate-400'} />
                          <span className="text-[14px]">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            {idx < menus.length - 1 && (
              <div className="mx-6 my-2 border-b border-darkBorder/50" />
            )}
          </div>
        ))}

        <div className="mx-6 mt-4 mb-2 border-b border-darkBorder/50" />
        <div className="px-4 pb-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-3 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>Sair (Logout)</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
