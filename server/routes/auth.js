const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Rota de Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.senha);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.ID, email: user.email, nome: user.nome, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' } // Token expira em 12 horas
    );

    res.json({
      token,
      user: {
        id: user.ID,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Registro de Usuário (Criar Conta)
router.post('/register', async (req, res) => {
  const { nome, sobrenome, telefone, email, senha } = req.body;

  try {
    // Verificar se e-mail já existe
    const [existingUsers] = await db.query('SELECT id FROM usuario WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'E-mail já está em uso.' });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir no banco
    const [result] = await db.query(
      'INSERT INTO usuario (nome, sobrenome, telefone, email, senha, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, sobrenome || '', telefone || '', email, hashedPassword, 'Caixa']
    );

    // Gerar token automático para já logar
    const user = { id: result.insertId, nome, email, role: 'Caixa' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });

    res.json({ token, user });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota para validar token e pegar dados do usuário logado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT ID, nome, sobrenome, email, role FROM usuario WHERE ID = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
