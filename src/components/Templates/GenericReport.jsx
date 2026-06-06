import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, ArrowLeft } from 'lucide-react';

export default function GenericReport({ title }) {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-xs text-slate-400">Relatório</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
        <PieChart size={64} className="mb-4 text-primaryGreen/50" />
        <p className="text-xl font-medium text-slate-300 text-center">Este relatório ainda não possui dados suficientes.</p>
        <p className="max-w-md text-center mt-2 text-sm">
          À medida que o sistema registrar novas informações no banco de dados, os gráficos e totalizadores aparecerão automaticamente nesta tela.
        </p>
      </div>
    </div>
  );
}
