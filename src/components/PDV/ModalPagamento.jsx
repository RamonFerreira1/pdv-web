import React, { useState, useEffect, useContext } from 'react';
import { CheckCircle, Printer, Mail, Share2, ArrowRight, X, Loader2 } from 'lucide-react';
import { PDVContext } from '../../context/PDVContext';
import Recibo from './Recibo';

const METODOS = [
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { id: 'pix', label: 'Pix', icon: '⚡' },
  { id: 'credito', label: 'Cartão de Crédito', icon: '💳' },
  { id: 'debito', label: 'Débito', icon: '🏧' },
  { id: 'fiado', label: 'Fiado', icon: '📓' },
];

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Teclado({ valor, onChange }) {
  const handle = (tecla) => {
    if (tecla === 'C') return onChange('');
    if (tecla === '⌫') return onChange(valor.slice(0, -1));
    if (valor.length >= 10) return;
    onChange(valor + tecla);
  };
  const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {teclas.map((t) => (
        <button
          key={t}
          onClick={() => handle(t)}
          className={`h-12 rounded-lg text-lg font-medium transition-colors ${
            t === 'C' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
            t === '⌫' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' :
            'bg-darkBorder text-slate-100 hover:bg-slate-600'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export default function ModalPagamento({ isOpen, onClose, desconto = 0, clienteId = null }) {
  const { precoTotal, carrinhoItens, finalizarVenda } = useContext(PDVContext);
  const totalComDesconto = Math.max(0, precoTotal - desconto);
  
  const [metodo, setMetodo] = useState(null);
  const [valorRecebido, setValorRecebido] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [numeroVenda, setNumeroVenda] = useState(0);
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMetodo(null);
      setValorRecebido('');
      setSucesso(false);
      setNumeroVenda(Math.floor(Math.random() * 9000) + 1000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const valorNum = parseFloat(valorRecebido) || 0;
  const troco = valorNum - totalComDesconto;
  const podeFinalizar = metodo !== null && 
    (metodo !== 'dinheiro' || valorNum >= totalComDesconto) &&
    (metodo !== 'fiado' || clienteId !== null);


  const handleFinalizar = async () => {
    setFinalizando(true);
    const realVendaId = await finalizarVenda(metodo, valorNum, troco, desconto, clienteId);
    setFinalizando(false);
    if (realVendaId) setNumeroVenda(realVendaId); // Usa ID real do banco
    setSucesso(true);
  };

  const handleNovaVenda = () => {
    onClose();
  };

  const handleImprimir = () => {
    window.print();
  };

  const saleDetails = sucesso ? {
    items: carrinhoItens,
    subtotal: precoTotal,
    desconto: desconto || 0,
    total: totalComDesconto,
    troco: Math.max(troco, 0),
    metodo: METODOS.find((m) => m.id === metodo)?.label,
    numeroVenda: numeroVenda,
    data: new Date().toISOString()
  } : null;

  const handleWhatsApp = () => {
    let text = `*SMART PDV - RECIBO DE VENDA*\n`;
    text += `Cupom: #${String(numeroVenda).padStart(6, '0')}\n`;
    text += `Data: ${new Date().toLocaleString('pt-BR')}\n\n`;
    text += `*ITENS:*\n`;
    carrinhoItens.forEach(item => {
      text += `${item.qty}x ${item.name} - ${fmt(item.price * item.qty)}\n`;
    });
    text += `\n`;
    if (desconto > 0) {
      text += `Subtotal: ${fmt(precoTotal)}\n`;
      text += `Desconto: -${fmt(desconto)}\n`;
    }
    text += `*TOTAL: ${fmt(totalComDesconto)}*\n`;
    text += `Pagamento: ${METODOS.find((m) => m.id === metodo)?.label}\n\n`;
    text += `Obrigado pela preferência!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (sucesso) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-darkCard w-full max-w-md rounded-2xl p-8 flex flex-col items-center border border-darkBorder shadow-2xl">
          <CheckCircle className="text-primaryGreen w-20 h-20 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Venda finalizada!</h2>
          <p className="text-slate-400 font-mono mb-6">VENDA #{String(numeroVenda).padStart(4, '0')}</p>
          
          <div className="text-4xl font-bold text-white mb-6">
            {fmt(totalComDesconto)}
            {desconto > 0 && (
              <div className="text-sm font-normal text-slate-400 mt-1 text-center">
                <span className="line-through text-slate-500">{fmt(precoTotal)}</span>
                <span className="text-amber-400 ml-2">- {fmt(desconto)} desconto</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-slate-300 bg-darkBorder/50 px-4 py-2 rounded-lg mb-8">
            <span>{METODOS.find((m) => m.id === metodo)?.icon}</span>
            <span>{METODOS.find((m) => m.id === metodo)?.label}</span>
          </div>

          <div className="flex w-full gap-3 mb-6">
            <button 
              onClick={handleImprimir}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-darkBorder hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition-colors"
            >
              <Printer size={20} />
              <span className="text-xs">Imprimir</span>
            </button>
            <button 
              onClick={handleWhatsApp}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] py-3 rounded-xl transition-colors border border-[#25D366]/30"
            >
              <Share2 size={20} />
              <span className="text-xs">WhatsApp</span>
            </button>
          </div>

          <button 
            onClick={handleNovaVenda}
            className="w-full bg-primaryGreen hover:bg-primaryHover text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <span>Nova Venda</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Componente de Impressão (invisível na tela, visível no CSS @media print) */}
        <div className="hidden print:block absolute left-0 top-0 w-full h-full bg-white z-[9999]">
          <Recibo saleDetails={saleDetails} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-darkCard w-full max-w-4xl h-[600px] rounded-2xl flex flex-col border border-darkBorder shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-darkBorder flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Pagamento</h2>
            <p className="text-sm text-slate-400">{new Date().toLocaleString('pt-BR')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-darkBorder transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Methods */}
          <div className="w-1/2 p-6 border-r border-darkBorder overflow-y-auto">
            <div className="bg-darkBg rounded-xl p-6 flex flex-col items-center justify-center mb-6 border border-darkBorder/50">
              <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Total a pagar</span>
              <span className="text-4xl font-bold text-primaryGreen">{fmt(totalComDesconto)}</span>
              {desconto > 0 && (
                <span className="text-xs text-amber-400 mt-1">Desconto: {fmt(desconto)} aplicado</span>
              )}
            </div>

            <h3 className="text-slate-300 font-medium mb-4">Método de pagamento</h3>
            <div className="grid grid-cols-2 gap-3">
              {METODOS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMetodo(m.id); setValorRecebido(''); }}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    metodo === m.id 
                      ? 'border-primaryGreen bg-primaryGreen/10 text-white' 
                      : 'border-darkBorder bg-darkBg text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  <span className="text-3xl">{m.icon}</span>
                  <span className="font-medium text-sm">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Details / Keypad */}
          <div className="w-1/2 p-6 flex flex-col bg-slate-900/30">
            {metodo === 'dinheiro' ? (
              <div className="flex-1 flex flex-col">
                <h3 className="text-slate-300 font-medium mb-4">Valor recebido</h3>
                
                <div className="bg-darkBg border border-darkBorder rounded-xl p-4 text-right mb-2">
                  <span className={`text-3xl font-mono ${valorRecebido ? 'text-white' : 'text-slate-600'}`}>
                    {valorRecebido ? fmt(parseFloat(valorRecebido)) : 'R$ 0,00'}
                  </span>
                </div>

                <div className={`flex justify-between items-center p-4 rounded-xl border mb-2 ${
                  troco >= 0 && valorNum > 0 ? 'bg-primaryGreen/10 border-primaryGreen/30 text-primaryGreen' : 'bg-darkBg border-darkBorder text-slate-400'
                }`}>
                  <span className="font-medium uppercase text-sm">Troco</span>
                  <span className="text-xl font-bold">{valorNum > 0 ? fmt(Math.max(troco, 0)) : '—'}</span>
                </div>

                <Teclado valor={valorRecebido} onChange={setValorRecebido} />
              </div>
            ) : metodo ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-darkBorder flex items-center justify-center text-4xl mb-6">
                  {METODOS.find((m) => m.id === metodo)?.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {METODOS.find((m) => m.id === metodo)?.label}
                </h3>
                <p className="text-slate-400">
                  {metodo === 'pix' && 'Aguardando confirmação do Pix...'}
                  {(metodo === 'credito' || metodo === 'debito') && 'Insira ou aproxime o cartão na maquininha.'}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                <div className="text-6xl mb-4 opacity-50">💳</div>
                <p>Selecione um método de pagamento<br/>para continuar</p>
              </div>
            )}

            <button
              onClick={handleFinalizar}
              disabled={!podeFinalizar || finalizando}
              className={`w-full py-4 rounded-xl font-bold text-lg mt-auto transition-all ${
                podeFinalizar 
                  ? 'bg-primaryGreen hover:bg-primaryHover text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-darkBorder text-slate-500 cursor-not-allowed'
              }`}
            >
              {finalizando ? <Loader2 className="animate-spin mx-auto" size={22} /> : (podeFinalizar ? `Finalizar Pagamento • ${fmt(totalComDesconto)}` : 'Finalizar Pagamento')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
