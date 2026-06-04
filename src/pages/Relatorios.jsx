import React, { useContext, useState } from 'react';
import { Calendar, DollarSign, TrendingUp, XCircle, Users } from 'lucide-react';
import { POSContext } from '../context/POSContext';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Relatorios() {
  const { sales, sellers, cancellations } = useContext(POSContext);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Calculate actual revenue from mocked sales
  const actualRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  // Include existing seller totals from mock + actual revenue
  const totalRevenue = sellers.reduce((acc, seller) => acc + seller.salesTotal, 0);

  // Sorting sellers by sales
  const sortedSellers = [...sellers].sort((a, b) => b.salesTotal - a.salesTotal);

  return (
    <div className="flex flex-col h-full bg-darkBg p-8 overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Gerencial</h1>
          <p className="text-slate-400">Resumo financeiro e desempenho da equipe.</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-3 bg-darkCard border border-darkBorder p-2 rounded-xl">
          <div className="flex items-center gap-2 px-3 py-1">
            <Calendar size={18} className="text-slate-400" />
            <input 
              type="date" 
              className="bg-transparent border-none text-slate-200 text-sm focus:outline-none"
              value={dateRange.start}
              onChange={e => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <span className="text-slate-500">até</span>
          <div className="flex items-center gap-2 px-3 py-1">
            <input 
              type="date" 
              className="bg-transparent border-none text-slate-200 text-sm focus:outline-none"
              value={dateRange.end}
              onChange={e => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-primaryGreen/5 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 font-medium mb-2">Faturamento Total</p>
              <h3 className="text-4xl font-bold text-white mb-2">{fmt(totalRevenue)}</h3>
              <p className="text-sm text-primaryGreen flex items-center gap-1">
                <TrendingUp size={14} />
                <span>+12.5% em relação ao mês anterior</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-primaryGreen/10 rounded-xl flex items-center justify-center text-primaryGreen">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Cancellations */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 font-medium mb-2">Cancelamentos e Ajustes</p>
              <h3 className="text-4xl font-bold text-white mb-2">{fmt(cancellations)}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <span>Referente ao período selecionado</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Seller */}
      <div className="bg-darkCard border border-darkBorder rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <Users size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Vendas por Vendedor</h2>
        </div>

        <div className="space-y-6">
          {sortedSellers.map(seller => {
            const percentage = totalRevenue > 0 ? (seller.salesTotal / totalRevenue) * 100 : 0;
            return (
              <div key={seller.id}>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-white">
                      {seller.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-200">{seller.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white block">{fmt(seller.salesTotal)}</span>
                    <span className="text-xs text-slate-400">{percentage.toFixed(1)}% do total</span>
                  </div>
                </div>
                <div className="w-full bg-darkBg rounded-full h-3 border border-darkBorder overflow-hidden">
                  <div 
                    className="bg-primaryGreen h-full rounded-full relative"
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
