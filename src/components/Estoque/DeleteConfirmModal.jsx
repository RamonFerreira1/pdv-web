import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, productName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-darkCard w-full max-w-sm rounded-2xl border border-darkBorder shadow-2xl p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">Excluir Produto</h2>
        <p className="text-slate-400 mb-6">
          Deseja remover <strong>{productName}</strong> do estoque? Esta ação não pode ser desfeita.
        </p>

        <div className="flex w-full gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-darkBorder hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
