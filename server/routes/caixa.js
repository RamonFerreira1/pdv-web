const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Busca o turno atual aberto do usuário logado
router.get('/turno-atual', authenticateToken, async (req, res) => {
  try {
    const [turnos] = await db.query(
      'SELECT * FROM turnos_caixa WHERE usuario_id = ? AND status = "Aberto" ORDER BY data_abertura DESC LIMIT 1',
      [req.user.id]
    );
    res.json(turnos.length > 0 ? turnos[0] : null);
  } catch (error) {
    console.error('Erro ao buscar turno:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Abre um novo turno de caixa
router.post('/abrir', authenticateToken, async (req, res) => {
  const { troco_inicial } = req.body;
  try {
    // Verifica se já não existe um aberto
    const [abertos] = await db.query(
      'SELECT id FROM turnos_caixa WHERE usuario_id = ? AND status = "Aberto"',
      [req.user.id]
    );
    if (abertos.length > 0) return res.status(400).json({ error: 'Você já possui um caixa aberto.' });

    const [result] = await db.query(
      'INSERT INTO turnos_caixa (usuario_id, troco_inicial, status) VALUES (?, ?, "Aberto")',
      [req.user.id, troco_inicial || 0]
    );
    res.json({ id: result.insertId, status: 'Aberto', troco_inicial });
  } catch (error) {
    console.error('Erro ao abrir caixa:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Registra sangria ou suprimento (vinculado ao turno, mas por hora usa a tabela caixa genérica)
router.post('/movimento', authenticateToken, async (req, res) => {
  const { tipo, valor, descricao } = req.body;
  try {
    await db.query(
      'INSERT INTO caixa (tipo, descricao, valor) VALUES (?, ?, ?)',
      [tipo, descricao, valor]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erro no movimento de caixa:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Fecha o turno atual
router.post('/fechar', authenticateToken, async (req, res) => {
  const { turno_id, saldo_final } = req.body;
  try {
    await db.query(
      'UPDATE turnos_caixa SET status = "Fechado", data_fechamento = CURRENT_TIMESTAMP, saldo_final = ? WHERE id = ? AND usuario_id = ?',
      [saldo_final, turno_id, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Resumo das vendas do dia/turno
router.get('/resumo/:turno_id', authenticateToken, async (req, res) => {
  const { turno_id } = req.params;
  try {
    const [turnoInfo] = await db.query('SELECT data_abertura, data_fechamento FROM turnos_caixa WHERE id = ?', [turno_id]);
    if (turnoInfo.length === 0) return res.status(404).json({ error: 'Turno não encontrado' });
    
    const start = turnoInfo[0].data_abertura;
    const end = turnoInfo[0].data_fechamento || new Date(); // Até agora se tiver aberto
    
    // Total de vendas
    const [vendas] = await db.query(
      'SELECT SUM(total) as total_vendas FROM vendas WHERE usuario_id = ? AND data_venda >= ? AND data_venda <= ?',
      [req.user.id, start, end]
    );
    
    // Entradas/Saidas (caixa) - assumindo q são todas desse turno p simplificar
    const [movimentos] = await db.query(
      'SELECT tipo, SUM(valor) as total FROM caixa WHERE data_movimento >= ? AND data_movimento <= ? GROUP BY tipo',
      [start, end]
    );
    
    res.json({
      total_vendas: vendas[0].total_vendas || 0,
      movimentos: movimentos
    });
  } catch (error) {
    console.error('Erro no resumo do caixa:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
