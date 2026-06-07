const express = require('express');
const cors = require('cors');
const db = require('./db');
const initializeDb = require('./init-db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const caixaRoutes = require('./routes/caixa');
const { authenticateToken } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Sincronizar banco de dados ao iniciar
initializeDb();

// Rotas de Autenticação (públicas)
app.use('/api/auth', authRoutes);

// Rotas de Relatórios
app.use('/api/reports', reportRoutes);

// Rotas de Controle de Caixa
app.use('/api/caixa', caixaRoutes);

// Rota para buscar todos os produtos
app.get('/api/produtos', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM item');
    
    // Mapeando para o formato que o frontend espera (adicionando campos mockados que não tem no banco)
    const produtosFormatados = rows.map(row => ({
      id: row.ID,
      name: row.nome,
      price: parseFloat(row.preco),
      stock: row.estoque,
      category: "Diversos", // Campo fixo pois não existe no banco
      icon: "📦" // Ícone padrão
    }));
    
    res.json(produtosFormatados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Rota para adicionar produto
app.post('/api/produtos', authenticateToken, async (req, res) => {
  const { name, price, stock, codigo_barras } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO item (nome, preco, estoque, codigo_barras) VALUES (?, ?, ?, ?)',
      [name, price, stock, codigo_barras || null]
    );
    res.status(201).json({ id: result.insertId, name, price, stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar produto' });
  }
});

// Rota para atualizar produto
app.put('/api/produtos/:id', authenticateToken, async (req, res) => {
  const { name, price, stock, category, icon, codigo_barras } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE item SET nome = ?, preco = ?, estoque = ?, codigo_barras = ? WHERE ID = ?',
      [name, price, stock, codigo_barras || null, id]
    );
    res.json({ message: 'Produto atualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Rota para deletar produto
app.delete('/api/produtos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM item WHERE ID = ?', [id]);
    res.json({ message: 'Produto excluído' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

// Rota para salvar uma venda
app.post('/api/vendas', authenticateToken, async (req, res) => {
  const { total, items } = req.body; // items é um array de { id, qty, price }
  const usuarioId = req.user.id; // Pegar ID do usuário logado via JWT
  
  try {
    // Iniciar uma transação
    await db.query('START TRANSACTION');

    // Inserir a venda com o usuário real
    const [vendaResult] = await db.query(
      'INSERT INTO vendas (total, usuario_id) VALUES (?, ?)',
      [total, usuarioId] 
    );
    const vendaId = vendaResult.insertId;

    // Inserir os itens da venda e atualizar o estoque
    for (const item of items) {
      await db.query(
        'INSERT INTO venda_itens (ID_venda, ID_item, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
        [vendaId, item.id, item.qty, item.price]
      );

      // Descontar do estoque (somente se não for serviço/ilimitado)
      await db.query(
        'UPDATE item SET estoque = GREATEST(0, estoque - ?) WHERE ID = ?',
        [item.qty, item.id]
      );
    }

    await db.query('COMMIT');
    res.status(201).json({ success: true, vendaId });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Erro ao finalizar venda' });
  }
});

// Rota para listar histórico de vendas
app.get('/api/vendas', authenticateToken, async (req, res) => {
  try {
    const [vendas] = await db.query('SELECT * FROM vendas ORDER BY data_venda DESC');
    res.json(vendas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

// Rota para detalhes de uma venda (com itens)
app.get('/api/vendas/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [vendas] = await db.query('SELECT * FROM vendas WHERE ID = ?', [id]);
    if (vendas.length === 0) return res.status(404).json({ error: 'Venda não encontrada' });
    
    const [itens] = await db.query(`
      SELECT vi.quantidade, vi.preco_unitario, i.nome AS produto
      FROM venda_itens vi
      JOIN item i ON vi.ID_item = i.ID
      WHERE vi.ID_venda = ?
    `, [id]);

    res.json({ ...vendas[0], itens });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da venda' });
  }
});

// ==========================================
// GESTÃO DE USUÁRIOS (ADMIN)
// ==========================================

app.get('/api/admin/usuarios', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const [rows] = await db.query('SELECT ID, nome, sobrenome, email, role FROM usuario ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/usuarios/:id/role', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Acesso negado' });
  const { role } = req.body;
  const { id } = req.params;
  const rolesPermitidos = ['Admin', 'Gerente', 'Caixa'];
  if (!rolesPermitidos.includes(role)) return res.status(400).json({ error: 'Role inválido' });
  try {
    await db.query('UPDATE usuario SET role = ? WHERE ID = ?', [role, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/usuarios/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Acesso negado' });
  if (String(req.user.id) === String(req.params.id)) return res.status(400).json({ error: 'Você não pode excluir sua própria conta.' });
  try {
    await db.query('DELETE FROM usuario WHERE ID = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ROTA DINÂMICA (GENERIC CRUD) PARA NOVAS TELAS
// ==========================================

// Lista de tabelas permitidas por segurança
const allowedTables = ['categorias', 'clientes', 'fornecedores', 'vendedores', 'pedidos', 'devolucoes', 'caixa', 'fiado', 'financeiro'];

app.get('/api/dynamic/:table', authenticateToken, async (req, res) => {
  const table = req.params.table;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Tabela não permitida' });
  try {
    const [rows] = await db.query(`SELECT * FROM ${table}`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dynamic/:table', authenticateToken, async (req, res) => {
  const table = req.params.table;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Tabela não permitida' });
  
  const data = req.body;
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  try {
    const [result] = await db.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`, values);
    res.status(201).json({ id: result.insertId, ...data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/dynamic/:table/:id', authenticateToken, async (req, res) => {
  const { table, id } = req.params;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Tabela não permitida' });
  
  const data = req.body;
  const keys = Object.keys(data);
  const values = Object.values(data);
  const assignments = keys.map(k => `${k} = ?`).join(', ');
  
  try {
    await db.query(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...values, id]);
    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/dynamic/:table/:id', authenticateToken, async (req, res) => {
  const { table, id } = req.params;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Tabela não permitida' });
  
  try {
    await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
