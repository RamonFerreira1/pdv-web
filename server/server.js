const express = require('express');
const cors = require('cors');
const db = require('./db');
const initializeDb = require('./init-db');

const app = express();
app.use(cors());
app.use(express.json());

// Sincronizar banco de dados ao iniciar
initializeDb();

// Rota para buscar todos os produtos
app.get('/api/produtos', async (req, res) => {
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

// Rota para adicionar produto (Opcional caso queira gerenciar no Estoque)
app.post('/api/produtos', async (req, res) => {
  const { name, price, stock } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO item (nome, preco, estoque) VALUES (?, ?, ?)',
      [name, price, stock]
    );
    res.status(201).json({ id: result.insertId, name, price, stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar produto' });
  }
});

// Rota para atualizar produto
app.put('/api/produtos/:id', async (req, res) => {
  const { name, price, stock } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE item SET nome = ?, preco = ?, estoque = ? WHERE ID = ?',
      [name, price, stock, id]
    );
    res.json({ message: 'Produto atualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Rota para deletar produto
app.delete('/api/produtos/:id', async (req, res) => {
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
app.post('/api/vendas', async (req, res) => {
  const { total, items } = req.body; // items é um array de { id, qty, price }
  
  try {
    // Iniciar uma transação
    await db.query('START TRANSACTION');

    // Inserir a venda
    // usuario_id pode ser setado fixo para 1 (Robertinho) já que não temos autenticação real no frontend
    const [vendaResult] = await db.query(
      'INSERT INTO vendas (total, usuario_id) VALUES (?, ?)',
      [total, 1] 
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
app.get('/api/vendas', async (req, res) => {
  try {
    const [vendas] = await db.query('SELECT * FROM vendas ORDER BY data_venda DESC');
    res.json(vendas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

// ==========================================
// ROTA DINÂMICA (GENERIC CRUD) PARA NOVAS TELAS
// ==========================================

// Lista de tabelas permitidas por segurança
const allowedTables = ['categorias', 'clientes', 'fornecedores', 'vendedores', 'pedidos', 'devolucoes', 'caixa', 'fiado', 'financeiro'];

app.get('/api/dynamic/:table', async (req, res) => {
  const table = req.params.table;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Tabela não permitida' });
  try {
    const [rows] = await db.query(`SELECT * FROM ${table}`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dynamic/:table', async (req, res) => {
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

app.put('/api/dynamic/:table/:id', async (req, res) => {
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

app.delete('/api/dynamic/:table/:id', async (req, res) => {
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
