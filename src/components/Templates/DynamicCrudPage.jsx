import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/dynamic`;

export default function DynamicCrudPage({ title, endpoint, fields }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  // Filter Data
  const filteredData = data.filter(item => {
    const searchString = Object.values(item).join(' ').toLowerCase();
    return searchString.includes(search.toLowerCase());
  });

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      const emptyForm = {};
      fields.forEach(f => emptyForm[f.name] = '');
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${endpoint}/${editingId}` : `${API_URL}/${endpoint}`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem certeza que deseja excluir?')) return;
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-darkBg">
      {/* Topbar */}
      <div className="h-20 border-b border-darkBorder px-6 flex items-center justify-between shrink-0 bg-darkCard/50">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-darkCard border border-darkBorder rounded-xl pl-10 pr-4 py-2 text-white focus:border-primaryGreen transition-colors w-64"
            />
          </div>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primaryGreen hover:bg-primaryHover text-white px-4 py-2 rounded-xl font-bold transition-colors"
          >
            <Plus size={20} /> Novo
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-darkCard border border-darkBorder rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-darkBg/50 border-b border-darkBorder">
              <tr>
                {fields.map(f => (
                  <th key={f.name} className="px-6 py-4 text-slate-400 font-medium text-sm">{f.label}</th>
                ))}
                <th className="px-6 py-4 text-slate-400 font-medium text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder">
              {filteredData.map(item => (
                <tr key={item.id} className="hover:bg-darkBg/30 transition-colors">
                  {fields.map(f => (
                    <td key={f.name} className="px-6 py-4 text-slate-200">
                      {f.type === 'number' ? `R$ ${parseFloat(item[f.name]).toFixed(2)}` : item[f.name]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors ml-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} className="px-6 py-8 text-center text-slate-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-darkBorder">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar' : 'Novo'} Registro</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={formData[f.name] || ''}
                    onChange={(e) => setFormData({...formData, [f.name]: e.target.value})}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2 text-white focus:border-primaryGreen transition-colors"
                  />
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-darkBorder flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-darkBg text-white rounded-xl hover:bg-darkBorder font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-primaryGreen text-white rounded-xl hover:bg-primaryHover font-bold transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
