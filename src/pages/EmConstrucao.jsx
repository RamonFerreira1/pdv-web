import React from 'react';
import { Construction } from 'lucide-react';

export default function EmConstrucao() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-darkBg text-center p-8">
      <div className="w-24 h-24 bg-darkCard border border-darkBorder rounded-3xl flex items-center justify-center mb-6 shadow-xl">
        <Construction size={48} className="text-primaryGreen" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Tela em Construção</h1>
      <p className="text-slate-400 max-w-md">
        Esta funcionalidade ainda não foi implementada. Ela foi adicionada ao menu para manter a fidelidade visual com o aplicativo original.
      </p>
    </div>
  );
}
