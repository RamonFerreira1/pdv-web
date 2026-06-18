// Autor: ISSAMO - FE Pessoa 3 (Estoque e Cadastros)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function EmConstrucao() {
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
        <h1 className="text-xl font-bold text-white">Em Construção</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-darkCard border border-darkBorder rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <Construction size={48} className="text-primaryGreen" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Tela em Construção</h2>
        <p className="text-slate-400 max-w-md">
          Esta funcionalidade ainda não foi implementada. Ela foi adicionada ao menu para manter a fidelidade visual com o aplicativo original.
        </p>
      </div>
    </div>
  );
}

