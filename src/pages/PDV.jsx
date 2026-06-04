import React, { useState, useMemo, useContext } from 'react';
import { Search, ScanLine, ShoppingCart, Trash2, Plus, Minus, Package } from 'lucide-react';
import { POSContext } from '../context/POSContext';
import PaymentModal from '../components/PDV/PaymentModal';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function ItemCard({ product, onAdd }) {
  return (
    <div 
      className="bg-darkCard border border-darkBorder rounded-xl p-4 flex flex-col hover:border-primaryGreen/50 hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => onAdd(product)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-lg bg-darkBg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {product.icon}
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-darkBg text-slate-400 rounded-md">
          Estoque: {product.stock === 999 ? '∞' : product.stock}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-white font-medium mb-1 line-clamp-2 leading-tight">{product.name}</h3>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-primaryGreen font-bold text-lg">{fmt(product.price)}</span>
        <button 
          className="w-8 h-8 rounded-full bg-primaryGreen/10 text-primaryGreen flex items-center justify-center hover:bg-primaryGreen hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onAdd(product); }}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

function CartItem({ item, onInc, onDec, onRemove }) {
  return (
    <div className="flex items-center justify-between p-3 bg-darkBg border border-darkBorder rounded-xl">
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-medium text-white mb-1 truncate">{item.name}</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-darkCard rounded-lg border border-darkBorder">
            <button onClick={() => onDec(item.id)} className="p-1 text-slate-400 hover:text-white transition-colors">
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm text-white">{item.qty}</span>
            <button onClick={() => onInc(item.id)} className="p-1 text-slate-400 hover:text-white transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <span className="text-xs text-slate-400">× {fmt(item.price)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="font-semibold text-white">{fmt(item.price * item.qty)}</span>
        <button onClick={() => onRemove(item.id)} className="text-slate-500 hover:text-red-400 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function PDV() {
  const { products, cartItems, totalQty, totalPrice, addToCart, incQty, decQty, removeItem, clearCart } = useContext(POSContext);
  
  const [search, setSearch] = useState('');
  const [activecat, setActivecat] = useState('Todos');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const categories = ['Todos', ...new Set(products.map((p) => p.category))];

  const filtered = useMemo(() => 
    products.filter((p) => 
      (activecat === 'Todos' || p.category === activecat) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ),
    [products, search, activecat]
  );

  return (
    <div className="flex h-full w-full">
      {/* Left Area - Products */}
      <div className="flex-1 flex flex-col min-w-0 bg-darkBg">
        {/* Topbar */}
        <div className="h-20 border-b border-darkBorder px-6 flex items-center justify-between bg-darkCard/50">
          <div className="flex items-center gap-2 bg-darkCard border border-darkBorder px-4 py-2 rounded-lg cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-primaryGreen"></div>
            <span className="text-sm font-medium text-slate-200">Vendedor: Robertinho ▾</span>
          </div>
          
          <div className="flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar produto ou código de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-darkBg border border-darkBorder rounded-xl pl-10 pr-12 py-3 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primaryGreen transition-colors">
              <ScanLine size={20} />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="p-6 pb-2 overflow-x-auto flex gap-2 hide-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
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
        <div className="flex-1 p-6 pt-4 overflow-y-auto">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

      {/* Right Area - Cart */}
      <div className="w-[400px] border-l border-darkBorder bg-darkCard flex flex-col shrink-0">
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
            onClick={clearCart}
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
              <CartItem 
                key={item.id} 
                item={item}
                onInc={incQty} 
                onDec={decQty} 
                onRemove={removeItem} 
              />
            ))
          )}
        </div>

        <div className="p-6 border-t border-darkBorder bg-darkCard shrink-0">
          <div className="flex justify-between items-center mb-2 text-slate-400">
            <span>Subtotal</span>
            <span>{fmt(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center mb-6 text-slate-400">
            <span>Descontos</span>
            <span>R$ 0,00</span>
          </div>
          <div className="flex justify-between items-center mb-6 text-white text-xl font-bold">
            <span>Total</span>
            <span className="text-primaryGreen">{fmt(totalPrice)}</span>
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
            {cartItems.length === 0 ? 'COBRAR' : `COBRAR ${fmt(totalPrice)}`}
          </button>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
      />
    </div>
  );
}
