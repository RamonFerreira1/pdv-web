import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/AvisoContext';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/dynamic`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('pdv_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export default function DynamicCrudPage({ title, endpoint, fields }) {
  const navigate = useNavigate();
  const { mostrarAviso } = useToast();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

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
      fields.forEach(f => (emptyForm[f.name] = ''));
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validação
    for (const f of fields) {
      if (f.required && (!formData[f.name] || String(formData[f.name]).trim() === '')) {
        mostrarAviso(`O campo ${f.label} é obrigatório.`, 'error');
        return;
      }
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${endpoint}/${editingId}` : `${API_URL}/${endpoint}`;
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        mostrarAviso(`Registro ${editingId ? 'atualizado' : 'criado'} com sucesso!`, 'success');
      } else {
        mostrarAviso('Erro ao salvar o registro.', 'error');
      }
    } catch (e) {
      console.error(e);
      mostrarAviso('Erro de conexão ao salvar.', 'error');
    }
  };

  const requestDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${itemToDelete.id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const formatValue = (field, value) => {
    if (!value) return '—';
    if (field.type === 'number') return `R$ ${parseFloat(value || 0).toFixed(2)}`;
    if (field.type === 'date') {
      try {
        const dateStr = value.substring(0, 10);
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      } catch (e) {
        return value;
      }
    }
    return value;
  };

  const primaryField = fields[0];

  const handleInputChange = (field, value) => {
    let sanitizedValue = value;

    // Remover números de campos de nome/razão social
    if (field.name === 'nome' || field.name === 'razao_social') {
      sanitizedValue = value.replace(/[0-9]/g, '');
    }

    // Remover letras de campos de telefone e documentos
    if (field.name === 'telefone' || field.name === 'cnpj' || field.name === 'documento') {
      sanitizedValue = value.replace(/[A-Za-z]/g, '');
    }

    setFormData({ ...formData, [field.name]: sanitizedValue });
  };

  return (
    <div className="flex flex-col h-full bg-darkBg">
      {/* Topbar */}
      <div className="border-b border-darkBorder px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 bg-darkCard/50">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-darkBorder rounded-lg transition-colors shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 bg-darkCard border border-darkBorder rounded-xl pl-9 pr-4 py-2 text-white focus:border-primaryGreen transition-colors text-sm"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primaryGreen hover:bg-primaryHover text-white px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap text-sm"
          >
            <Plus size={18} /> Novo
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">

        {/* Desktop Table */}
        <div className="hidden sm:block bg-darkCard border border-darkBorder rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-darkBg/50 border-b border-darkBorder">
              <tr>
                {fields.map(f => (
                  <th key={f.name} className="px-6 py-4 text-slate-400 font-medium text-sm">
                    {f.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-slate-400 font-medium text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder">
              {filteredData.map(item => (
                <tr key={item.id} className="hover:bg-darkBg/30 transition-colors">
                  {fields.map(f => (
                    <td key={f.name} className="px-6 py-4 text-slate-200">
                      {formatValue(f, item[f.name])}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => requestDelete(item)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors ml-2"
                    >
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

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-2">
          {filteredData.length === 0 && (
            <div className="text-center text-slate-500 py-10">Nenhum registro encontrado.</div>
          )}
          {filteredData.map(item => (
            <div key={item.id} className="bg-darkCard border border-darkBorder rounded-xl overflow-hidden">
              {/* Card Header */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
              >
                <span className="text-white font-medium">
                  {formatValue(primaryField, item[primaryField.name])}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); openModal(item); }}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); requestDelete(item); }}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedRow === item.id
                    ? <ChevronUp size={16} className="text-slate-400" />
                    : <ChevronDown size={16} className="text-slate-400" />
                  }
                </div>
              </button>

              {/* Expanded Details */}
              {expandedRow === item.id && (
                <div className="border-t border-darkBorder px-4 py-3 space-y-2">
                  {fields.slice(1).map(f => (
                    <div key={f.name} className="flex justify-between text-sm">
                      <span className="text-slate-400">{f.label}</span>
                      <span className="text-slate-200">{formatValue(f, item[f.name])}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-darkBorder flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Editar' : 'Novo'} Registro
              </h2>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={f.name.toLowerCase() === 'email' ? 'email' : (f.type || 'text')}
                    value={formData[f.name] || ''}
                    onChange={(e) => handleInputChange(f, e.target.value)}
                    required={f.required}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-white focus:border-primaryGreen transition-colors outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-darkBorder flex gap-3">
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-sm overflow-hidden p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h2>
            <p className="text-slate-400 mb-6">
              Deseja realmente excluir este registro? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-darkBorder text-slate-300 rounded-xl hover:bg-slate-700 font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
