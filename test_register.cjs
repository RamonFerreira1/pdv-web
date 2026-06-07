require('dotenv').config({ path: './.env' });
const db = require('./server/db');

async function test() {
  try {
    const [existingUsers] = await db.query('SELECT ID FROM usuario WHERE email = ?', ['test@test.com']);
    console.log('Existing:', existingUsers);
    
    const [result] = await db.query(
      'INSERT INTO usuario (nome, sobrenome, telefone, email, senha, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['Test', '', '', 'test@test.com', 'hashed', 'Caixa']
    );
    console.log('Insert Result:', result);
    
    await db.query('DELETE FROM usuario WHERE email = ?', ['test@test.com']);
    console.log('Cleaned up');
  } catch (error) {
    console.error('Test failed with error:', error.message);
  } finally {
    process.exit(0);
  }
}

test();
