const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('CREATE DATABASE IF NOT EXISTS pdv');
    console.log('Banco de dados pdv criado (ou já existe).');
    await connection.end();
  } catch (error) {
    console.error('Erro ao criar o banco:', error);
  }
}

createDatabase();
