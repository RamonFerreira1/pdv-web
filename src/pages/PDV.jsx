import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Search, ScanLine, ShoppingCart, Trash2, Plus, Minus, Package, X, ChevronUp, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { POSContext } from '../context/POSContext';
import { AuthContext } from '../context/AuthContext';
import PaymentModal from '../components/PDV/PaymentModal';
import ClienteSearch from '../components/PDV/ClienteSearch';
import BarcodeScanner from '../components/PDV/BarcodeScanner';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function ItemCard({ product, onAdd }) {
  return (
    <div
      className="bg-darkCard border border-darkBorder rounded-xl p-3 sm:p-4 flex flex-col hover:border-primaryGreen/50 hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => onAdd(product)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-darkBg flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
          {product.icon}
        </div>
        <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-1 bg-darkBg text-slate-400 rounded-md">
          {product.stock === 999 ? '∞' : product.stock}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-white font-medium text-sm sm:text-base mb-1 line-clamp-2 leading-tight">{product.name}</h3>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-primaryGreen font-bold text-sm sm:text-lg">{fmt(product.price)}</span>
        <button
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primaryGreen/10 text-primaryGreen flex items-center justify-center hover:bg-primaryGreen hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onAdd(product); }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function CartItem({ item, onInc, onDec, onRemove }) {
  return (
    <div className="flex items-center justify-between p-3 bg-darkBg border border-darkBorder rounded-xl">
      <div className="flex-1 pr-3 min-w-0">
        <h4 className="text-sm font-medium text-white mb-1 truncate">{item.name}</h4>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-darkCard rounded-lg border border-darkBorder">
            <button onClick={() => onDec(item.id)} className="p-1 text-slate-400 hover:text-white transition-colors">
              <Minus size={13} />
            </button>
            <span className="w-6 text-center text-sm text-white">{item.qty}</span>
            <button onClick={() => onInc(item.id)} className="p-1 text-slate-400 hover:text-white transition-colors">
              <Plus size={13} />
            </button>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">× {fmt(item.price)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="font-semibold text-white text-sm">{fmt(item.price * item.qty)}</span>
        <button onClick={() => onRemove(item.id)} className="text-slate-500 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function PDV() {
  const { products, cartItems, totalQty, totalPrice, addToCart, incQty, decQty, removeItem, clearCart } = useContext(POSContext);
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [activecat, setActivecat] = useState('Todos');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [desconto, setDesconto] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  
  const [isCaixaAberto, setIsCaixaAberto] = useState(false);
  const [caixaLoading, setCaixaLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleClearCart = () => {
    clearCart();
    setDesconto('');
    setClienteSelecionado(null);
  };

  useEffect(() => {
    const checkCaixa = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/caixa`;
        const token = localStorage.getItem('pdv_token');
        const res = await fetch(`${API_URL}/turno-atual`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setIsCaixaAberto(!!data);
        }
      } catch (e) {
        console.error('Erro ao checar caixa', e);
      } finally {
        setCaixaLoading(false);
      }
    };
    checkCaixa();
  }, []);

  // Leitor de Código de Barras (Bipador)
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // Ignora digitação em inputs para não conflitar com a barra de pesquisa
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      
      // Se demorou mais que 50ms entre teclas, provavelmente é digitação humana e não leitor
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter' && barcodeBuffer.length > 0) {
        e.preventDefault();
        // Buscar produto pelo codigo de barras
        const scannedProduct = products.find(p => p.codigo_barras === barcodeBuffer);
        if (scannedProduct) {
          addToCart(scannedProduct);
          // Opcional: Feedback visual ou sonoro aqui
        }
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addToCart]);

  const handleCameraScan = (decodedText) => {
    const scannedProduct = products.find(p => p.codigo_barras === decodedText);
    if (scannedProduct) {
      addToCart(scannedProduct);
      setShowScanner(false);
    } else {
      // Opcional: mostrar erro se não achar
    }
  };

  const categories = ['Todos', ...new Set(products.map((p) => p.category))];

  const filtered = useMemo(() =>
    products.filter((p) =>
      (activecat === 'Todos' || p.category === activecat) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ),
    [products, search, activecat]
  );

  if (caixaLoading) return <div className="p-10 text-primaryGreen h-full flex items-center justify-center">Verificando Caixa...</div>;

  if (!isCaixaAberto) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-darkBg text-white p-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-red-500" size={48} />
        </div>
        <h1 className="text-3xl font-bold mb-3">Caixa Fechado</h1>
        <p className="text-slate-400 mb-8 max-w-md text-center">Para iniciar as vendas, você precisa abrir o caixa do seu turno informando o troco inicial.</p>
        <button 
          onClick={() => navigate('/caixa')}
          className="bg-primaryGreen hover:bg-primaryHover text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg shadow-primaryGreen/20"
        >
          Ir para Controle de Caixa
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full relative">

      {/* ==================== Left Area — Products ==================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-darkBg">

        {/* Topbar */}
        <div className="h-16 sm:h-20 border-b border-darkBorder px-4 sm:px-6 flex items-center gap-3 bg-darkCard/50 shrink-0">
          <div className="flex items-center gap-2 bg-darkCard border border-darkBorder px-3 py-2 rounded-lg shrink-0">
            <div className="w-2 h-2 rounded-full bg-primaryGreen" />
            <span className="text-xs sm:text-sm font-medium text-slate-200 whitespace-nowrap">{user?.nome || 'Operador'}</span>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-darkBg border border-darkBorder rounded-xl pl-9 pr-10 py-2.5 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors text-sm"
            />
            <button 
              onClick={() => setShowScanner(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primaryGreen transition-colors"
            >
              <ScanLine size={18} />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 sm:px-6 pt-4 pb-2 overflow-x-auto flex gap-2 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium whitespace-nowrap transition-colors text-sm ${
                activecat === cat
                  ? 'bg-primaryGreen text-white'
                  : 'bg-darkCard border border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
              onClick={() => setActivecat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-4 sm:p-6 pt-3 overflow-y-auto pb-24 sm:pb-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
              {filtered.map((p) => (
                <ItemCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Package size={48} className="mb-4 opacity-50" />
              <p>Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== Desktop Cart — Right Panel ==================== */}
      <div className="hidden sm:flex w-[380px] lg:w-[400px] border-l border-darkBorder bg-darkCard flex-col shrink-0">
        <div className="h-20 border-b border-darkBorder px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primaryGreen/10 text-primaryGreen flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Carrinho</h2>
            <span className="bg-primaryGreen text-white text-xs font-bold px-2 py-1 rounded-md">
              {totalQty}
            </span>
          </div>
          <button
            onClick={handleClearCart}
            className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
          >
            Limpar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para iniciar a venda.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem key={item.id} item={item} onInc={incQty} onDec={decQty} onRemove={removeItem} />
            ))
          )}
        </div>

        <div className="p-5 border-t border-darkBorder bg-darkCard shrink-0">
          {/* Cliente */}
          <ClienteSearch clienteSelecionado={clienteSelecionado} onSelect={setClienteSelecionado} />
          
          <div className="flex justify-between items-center mb-1 text-slate-400 text-sm">
            <span>Subtotal</span>
            <span>{fmt(totalPrice)}</span>
          </div>
          
          {/* Desconto */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">Desconto (R$)</span>
            <input
              type="number"
              min="0"
              max={totalPrice}
              step="0.01"
              value={desconto}
              onChange={e => setDesconto(e.target.value)}
              placeholder="0.00"
              className="w-24 text-right bg-darkBg border border-darkBorder rounded-lg px-2 py-1 text-sm text-amber-400 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex justify-between items-center mb-5 text-white text-xl font-bold">
            <span>Total</span>
            <span className="text-primaryGreen">{fmt(Math.max(0, totalPrice - (parseFloat(desconto) || 0)))}</span>
          </div>

          <button
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              cartItems.length > 0
                ? 'bg-primaryGreen hover:bg-primaryHover text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-darkBorder text-slate-500 cursor-not-allowed'
            }`}
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={cartItems.length === 0}
          >
            {cartItems.length === 0 ? 'COBRAR' : `COBRAR ${fmt(Math.max(0, totalPrice - (parseFloat(desconto) || 0)))}`}
          </button>
        </div>
      </div>

      {/* ==================== Mobile Cart — Floating Button ==================== */}
      {!isCartOpen && (
        <button
          className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-primaryGreen text-white px-6 py-3.5 rounded-full font-bold shadow-lg shadow-primaryGreen/30 flex items-center gap-3 transition-all hover:bg-primaryHover active:scale-95"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart size={20} />
          <span>
            {cartItems.length === 0 ? 'Carrinho vazio' : `Carrinho (${totalQty}) · ${fmt(totalPrice)}`}
          </span>
          <ChevronUp size={18} />
        </button>
      )}

      {/* ==================== Mobile Cart — Drawer ==================== */}
      {isCartOpen && (
        <div className="sm:hidden fixed inset-0 z-30 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsCartOpen(false)}
          />
          {/* Drawer */}
          <div className="relative bg-darkCard border-t border-darkBorder rounded-t-2xl flex flex-col max-h-[85vh]">
            {/* Handle */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-darkBorder shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-primaryGreen" />
                <h2 className="text-lg font-bold text-white">Carrinho</h2>
                <span className="bg-primaryGreen text-white text-xs font-bold px-2 py-0.5 rounded-md">{totalQty}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={clearCart} className="text-sm text-slate-400 hover:text-red-400 transition-colors">
                  Limpar
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <ShoppingCart size={40} className="mb-3 opacity-20" />
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItem key={item.id} item={item} onInc={incQty} onDec={decQty} onRemove={removeItem} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-darkBorder shrink-0">
              <div className="flex justify-between text-slate-400 text-sm mb-1">
                <span>Subtotal</span><span>{fmt(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg mb-4">
                <span>Total</span><span className="text-primaryGreen">{fmt(totalPrice)}</span>
              </div>
              <button
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  cartItems.length > 0
                    ? 'bg-primaryGreen hover:bg-primaryHover text-white'
                    : 'bg-darkBorder text-slate-500 cursor-not-allowed'
                }`}
                onClick={() => { setIsCartOpen(false); setIsPaymentModalOpen(true); }}
                disabled={cartItems.length === 0}
              >
              {cartItems.length === 0 ? 'COBRAR' : `COBRAR ${fmt(Math.max(0, totalPrice - (parseFloat(desconto) || 0)))}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setDesconto(''); setClienteSelecionado(null); }}
        desconto={parseFloat(desconto) || 0}
        clienteId={clienteSelecionado?.id || null}
      />
      
      {showScanner && (
        <BarcodeScanner 
          onScan={handleCameraScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
}
