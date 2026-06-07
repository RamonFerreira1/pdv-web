import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, productToEdit }) {
  const isEditing = !!productToEdit;
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Diversos',
    icon: '📦'
  });

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/dynamic`;
        const token = localStorage.getItem('pdv_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_URL}/categorias`, { headers });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          // Set default category to first available if creating new
          if (!isEditing && data.length > 0) {
             setFormData(prev => ({ ...prev, category: data[0].nome }));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
      if (isEditing && productToEdit) {
        setFormData({
          name: productToEdit.name,
          price: productToEdit.price,
          stock: productToEdit.stock === 999 ? '' : productToEdit.stock,
          category: productToEdit.category,
          icon: productToEdit.icon,
          codigo_barras: productToEdit.codigo_barras || ''
        });
      } else {
        setFormData({ name: '', price: '', stock: '', category: 'Diversos', icon: '📦', codigo_barras: '' });
      }
    }
  }, [isOpen, isEditing, productToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedPrice = parseFloat(String(formData.price).replace(',', '.'));
    const parsedStock = formData.stock === '' ? 999 : parseInt(formData.stock, 10);
    
    if (isNaN(parsedPrice)) {
      alert("Preço inválido.");
      return;
    }

    onSave({
      ...formData,
      price: parsedPrice,
      stock: isNaN(parsedStock) ? 0 : parsedStock,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-darkCard w-full max-w-md rounded-2xl border border-darkBorder shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-darkBorder flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Produto</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors"
              placeholder="Ex: Coca-Cola 350ml"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Preço (R$)</label>
              <input 
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cód. Barras</label>
              <input 
                type="text"
                value={formData.codigo_barras}
                onChange={e => setFormData({...formData, codigo_barras: e.target.value})}
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Estoque</label>
              <input 
                type="number"
                min="0"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors"
                placeholder="Vazio = Infinito"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors appearance-none"
              >
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))
                ) : (
                  <>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Eletrônicos">Eletrônicos</option>
                    <option value="Roupas">Roupas</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Diversos">Diversos</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Ícone</label>
              <input 
                type="text" 
                value={formData.icon}
                onChange={e => setFormData({...formData, icon: e.target.value})}
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors"
                placeholder="Emoji 📦"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-darkBorder hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 rounded-xl font-medium text-white bg-primaryGreen hover:bg-primaryHover transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
