const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Listar todos os fiados pendentes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [fiados] = await db.query(`
      SELECT f.id, f.valor_devido, f.data_vencimento, c.nome as cliente_nome, c.telefone as cliente_telefone 
      FROM fiado f 
      JOIN clientes c ON f.cliente_id = c.id 
      WHERE f.valor_devido > 0
    `);
    res.json(fiados);
  } catch (error) {
    console.error('Erro ao listar fiados:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Abater dívida
router.post('/:id/abater', authenticateToken, async (req, res) => {
  const { valor } = req.body;
  try {
    // Buscar dívida atual
    const [fiado] = await db.query('SELECT valor_devido FROM fiado WHERE id = ?', [req.params.id]);
    if (fiado.length === 0) return res.status(404).json({ error: 'Fiado não encontrado' });

    const novoValor = Math.max(0, fiado[0].valor_devido - valor);
    
    // Atualizar valor
    await db.query('UPDATE fiado SET valor_devido = ? WHERE id = ?', [novoValor, req.params.id]);
    
    // Opcional: Registrar no caixa
    await db.query(
      'INSERT INTO caixa (tipo, descricao, valor) VALUES (?, ?, ?)',
      ['Entrada', `Pagamento Fiado #${req.params.id}`, valor]
    );

    res.json({ success: true, novoValor });
  } catch (error) {
    console.error('Erro ao abater fiado:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
