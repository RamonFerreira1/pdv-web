import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { POSProvider } from './src/context/POSContext';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import MainLayout from './src/components/Layout/MainLayout';

import PDV from './src/pages/PDV';
import Estoque from './src/pages/Estoque';
import Relatorios from './src/pages/Relatorios';
import CadastrosMenu from './src/pages/CadastrosMenu';
import RelatoriosMenu from './src/pages/RelatoriosMenu';
import HistoricoVendas from './src/pages/HistoricoVendas';
import EmConstrucao from './src/pages/EmConstrucao';
import Dashboard from './src/pages/Dashboard';
import UsuariosPage from './src/pages/Gestao/UsuariosPage';
import Fiados from './src/pages/Gestao/Fiados';

import DynamicCrudPage from './src/components/Templates/DynamicCrudPage';
import GenericReport from './src/components/Templates/GenericReport';
import VendasPorProduto from './src/pages/Reports/VendasPorProduto';
import Comissoes from './src/pages/Reports/Comissoes';
import CaixaDashboard from './src/pages/Gestao/CaixaDashboard';
import Login from './src/pages/Login';
import { ToastProvider } from './src/context/ToastContext';

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-darkBg text-primaryGreen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  return (
    <ToastProvider>
    <AuthProvider>
      <POSProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pdv" element={<PDV />} />
            
            <Route path="estoque" element={<Estoque />} />
            <Route path="cadastros" element={<CadastrosMenu />} />
            <Route path="relatorios-menu" element={<RelatoriosMenu />} />
            <Route path="historico-vendas" element={<HistoricoVendas />} />
            
            {/* ==================================================== */}
            {/* TELAS DE CADASTROS (GERADAS PELO SUPER COMPONENTE) */}
            {/* ==================================================== */}
            
            <Route path="categorias" element={
              <DynamicCrudPage 
                title="Categorias" endpoint="categorias"
                fields={[ { name: 'nome', label: 'Nome' }, { name: 'descricao', label: 'Descrição' } ]} 
              />
            } />
            
            <Route path="clientes" element={
              <DynamicCrudPage 
                title="Gestão de Clientes" endpoint="clientes"
                fields={[ { name: 'nome', label: 'Nome' }, { name: 'telefone', label: 'Telefone' }, { name: 'documento', label: 'CPF/CNPJ' } ]} 
              />
            } />
            
            <Route path="fornecedores" element={
              <DynamicCrudPage 
                title="Fornecedores" endpoint="fornecedores"
                fields={[ { name: 'razao_social', label: 'Razão Social' }, { name: 'cnpj', label: 'CNPJ' }, { name: 'telefone', label: 'Telefone' } ]} 
              />
            } />
            
            <Route path="vendedores" element={
              <DynamicCrudPage 
                title="Vendedores" endpoint="vendedores"
                fields={[ { name: 'nome', label: 'Nome do Vendedor' }, { name: 'comissao', label: 'Comissão (%)', type: 'number' } ]} 
              />
            } />

            {/* ==================================================== */}
            {/* TELAS DE GESTÃO DO SIDEBAR (GERADAS PELO SUPER COMPONENTE) */}
            {/* ==================================================== */}

            <Route path="pedidos" element={
              <DynamicCrudPage 
                title="Pedidos em Aberto" endpoint="pedidos"
                fields={[ { name: 'cliente_id', label: 'ID do Cliente', type: 'number' }, { name: 'status', label: 'Status' }, { name: 'total', label: 'Total', type: 'number' } ]} 
              />
            } />

            <Route path="devolucoes" element={
              <DynamicCrudPage 
                title="Devoluções" endpoint="devolucoes"
                fields={[ { name: 'venda_id', label: 'Nº da Venda', type: 'number' }, { name: 'motivo', label: 'Motivo' }, { name: 'valor_devolvido', label: 'Valor Devolvido', type: 'number' } ]} 
              />
            } />

            <Route path="caixa" element={<CaixaDashboard />} />
            <Route path="usuarios" element={<UsuariosPage />} />

            <Route path="fiado" element={
              <DynamicCrudPage 
                title="Controle de Fiado" endpoint="fiado"
                fields={[ { name: 'cliente_id', label: 'ID do Cliente', type: 'number' }, { name: 'valor_devido', label: 'Valor Devido', type: 'number' } ]} 
              />
            } />

            <Route path="financeiro" element={
              <DynamicCrudPage 
                title="Contas a Pagar/Receber" endpoint="financeiro"
                fields={[ { name: 'tipo', label: 'Tipo (Pagar/Receber)' }, { name: 'descricao', label: 'Descrição' }, { name: 'valor', label: 'Valor', type: 'number' }, { name: 'status', label: 'Status' } ]} 
              />
            } />

            {/* ==================================================== */}
            {/* RELATÓRIOS FALTANTES */}
            {/* ==================================================== */}
            
            <Route path="relatorios-totalizado" element={<Relatorios />} />
            <Route path="relatorios-consolidados" element={<GenericReport title="Relatórios Consolidados" />} />
            {/* Novas Rotas de Relatórios Reais */}
            <Route path="relatorios/produtos" element={<VendasPorProduto />} />
            <Route path="relatorios/comissoes" element={<Comissoes />} />
            <Route path="fiados" element={<Fiados />} />

            {/* Telas ainda em Construção */}
            <Route path="relatorios/servicos" element={<GenericReport title="Vendas por Serviço" />} />
            <Route path="relatorios/aniversariantes" element={<GenericReport title="Aniversariantes" />} />
            
            {/* Opcionais não requeridos ativamente com API, apenas Mock UI */}
            <Route path="combos" element={<GenericReport title="Gestão de Combos (Premium)" />} />
            <Route path="modificadores" element={<GenericReport title="Modificadores" />} />
            <Route path="contato" element={<GenericReport title="Entre em Contato" />} />

            {/* Fallback genérico para links quebrados */}
            <Route path="*" element={<EmConstrucao />} />
          </Route>
          </Routes>
        </BrowserRouter>
      </POSProvider>
    </AuthProvider>
    </ToastProvider>
  );
}