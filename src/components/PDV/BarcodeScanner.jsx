import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Inicializar o scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 }, formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (err) => {
        // Ignorar erros normais de leitura por frame
      }
    );

    return () => {
      scanner.clear().catch(e => console.error("Falha ao limpar scanner", e));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm p-4">
      <div className="flex justify-between items-center mb-4 pt-4 px-2">
        <h2 className="text-white font-bold text-xl">Ler Código de Barras</h2>
        <button onClick={onClose} className="p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700">
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto relative">
        {/* Container que o html5-qrcode usa */}
        <div id="reader" className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl"></div>
        <p className="text-slate-400 text-center mt-6">Aponte a câmera para o código de barras do produto.</p>
      </div>
    </div>
  );
}
