const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pdv_super_secret_key_123';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.usuario = usuario;
    next();
  });
}

// Middleware opcional para verificar se é Admin (para rotas que exigem)
function requireAdmin(req, res, next) {
  if (req.usuario && req.usuario.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado: Requer privilégios de Administrador' });
  }
}

module.exports = { authenticateToken, requireAdmin, JWT_SECRET };
