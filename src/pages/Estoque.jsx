import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { POSContext } from '../context/POSContext';
import ProductModal from '../components/Estoque/ProductModal';
import DeleteConfirmModal from '../components/Estoque/DeleteConfirmModal';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Estoque() {
  const { products, addProduct, updateProduct, deleteProduct } = useContext(POSContext);
  
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const filtered = useMemo(() => 
    products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const handleAdd = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEdit = (product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteReq = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const onSaveProduct = (productData) => {
    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const onConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
    }
    setIsDeleteModalOpen(false);
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-darkBg p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-darkBorder rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Gestão de Estoque</h1>
            <p className="text-slate-400 text-sm">Gerencie seus produtos, preços e quantidades.</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primaryGreen hover:bg-primaryHover text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primaryGreen/20 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus size={20} />
          <span>Adicionar Produto</span>
        </button>
      </div>

      <div className="bg-darkCard border border-darkBorder rounded-2xl flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-darkBorder flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-900/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar produto por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-darkBg border border-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-primaryGreen transition-colors text-sm"
            />
          </div>
          <div className="text-slate-400 text-sm shrink-0">
            Total: {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="flex-1 overflow-auto hidden sm:block">
          <table className="w-full text-left border-collapse">
            <thead className="bg-darkBorder/50 text-slate-400 text-sm uppercase tracking-wider sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Preço</th>
                <th className="px-6 py-4 font-medium">Estoque</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-darkBg border border-darkBorder flex items-center justify-center text-2xl">
                      {p.icon}
                    </div>
                    <span className="font-medium text-white">{p.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <span className="bg-darkBg px-3 py-1 rounded-full text-xs border border-darkBorder">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-primaryGreen">
                    {fmt(p.price)}
                  </td>
                  <td className="px-6 py-4">
                    {p.stock === 999 ? (
                      <span className="text-slate-500 font-medium">Ilimitado</span>
                    ) : (
                      <span className={`font-medium ${p.stock <= 5 ? 'text-red-400' : 'text-slate-300'}`}>
                        {p.stock} un
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2 bg-darkBorder text-slate-300 hover:text-white rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteReq(p)}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center text-slate-500 py-10">Nenhum produto encontrado.</div>
          )}
          {filtered.map(p => (
            <div key={p.id} className="bg-darkBg border border-darkBorder rounded-xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-darkCard border border-darkBorder flex items-center justify-center text-xl shrink-0">
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-primaryGreen font-bold text-sm">{fmt(p.price)}</span>
                  <span className="text-slate-500 text-xs">·</span>
                  <span className={`text-xs font-medium ${p.stock <= 5 ? 'text-red-400' : 'text-slate-400'}`}>
                    {p.stock === 999 ? 'Ilimitado' : `${p.stock} un`}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-2 bg-darkCard text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDeleteReq(p)}
                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)}
        onSave={onSaveProduct}
        productToEdit={productToEdit}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        productName={productToDelete?.name}
      />
    </div>
  );
}
