const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Relatório: Vendas por Produto
router.get('/vendas-produto', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        i.nome AS produto, 
        SUM(vi.quantidade) AS quantidade_vendida,
        SUM(vi.quantidade * vi.preco_unitario) AS receita_total
      FROM venda_itens vi
      JOIN item i ON vi.ID_item = i.ID
      GROUP BY i.ID, i.nome
      ORDER BY receita_total DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro no relatório de vendas por produto:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Relatório: Comissões de Vendedores
router.get('/comissoes', authenticateToken, async (req, res) => {
  try {
    // Busca as vendas agrupadas por usuário
    const query = `
      SELECT 
        u.ID as usuario_id,
        u.nome,
        u.sobrenome,
        SUM(v.total) as total_vendido,
        COUNT(v.ID) as qtd_vendas
      FROM vendas v
      JOIN usuario u ON v.usuario_id = u.ID
      GROUP BY u.ID, u.nome, u.sobrenome
      ORDER BY total_vendido DESC
    `;
    const [rows] = await db.query(query);
    
    // Podemos cruzar com a tabela 'vendedores' do dynamic se quisermos uma taxa específica,
    // mas por hora calculamos uma comissão baseada em 5% ou um valor retornado pro frontend decidir.
    
    res.json(rows);
  } catch (error) {
    console.error('Erro no relatório de comissões:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Relatório: Dashboard (métricas do dia)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Vendas de hoje
    const [vendasHoje] = await db.query(`
      SELECT COUNT(*) as qtd, COALESCE(SUM(total), 0) as total
      FROM vendas
      WHERE DATE(data_venda) = CURDATE()
    `);

    // Ticket médio hoje
    const ticketMedio = vendasHoje[0].qtd > 0
      ? vendasHoje[0].total / vendasHoje[0].qtd
      : 0;

    // Total do mês
    const [vendasMes] = await db.query(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as qtd
      FROM vendas
      WHERE MONTH(data_venda) = MONTH(CURDATE()) AND YEAR(data_venda) = YEAR(CURDATE())
    `);

    // Top 5 produtos mais vendidos
    const [topProdutos] = await db.query(`
      SELECT i.nome AS produto, SUM(vi.quantidade) AS quantidade
      FROM venda_itens vi
      JOIN item i ON vi.ID_item = i.ID
      GROUP BY i.ID, i.nome
      ORDER BY quantidade DESC
      LIMIT 5
    `);

    // Alertas de estoque baixo (< 5 unidades, exceto ilimitados = 999)
    const [estoqueBaixo] = await db.query(`
      SELECT nome, estoque FROM item WHERE estoque < 5 AND estoque != 999 ORDER BY estoque ASC
    `);

    res.json({
      hoje: { total: vendasHoje[0].total, qtd: vendasHoje[0].qtd, ticketMedio },
      mes: { total: vendasMes[0].total, qtd: vendasMes[0].qtd },
      topProdutos,
      estoqueBaixo
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;

//A
