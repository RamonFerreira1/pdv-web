import React from 'react';
import { PieChart, BarChart2 } from 'lucide-react';

export default function GenericReport({ title }) {
  return (
    <div className="flex flex-col h-full bg-darkBg p-6 text-white">
      <div className="h-20 border-b border-darkBorder mb-6 flex items-center">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
        <PieChart size={64} className="mb-4 text-primaryGreen/50" />
        <p className="text-xl font-medium text-slate-300">Este relatório ainda não possui dados suficientes.</p>
        <p className="max-w-md text-center mt-2">
          À medida que o sistema registrar novas informações no banco de dados, os gráficos e totalizadores aparecerão automaticamente nesta tela.
        </p>
      </div>
    </div>
  );
}
