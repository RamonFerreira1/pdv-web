const db = require('./db');

const tables = [
  `CREATE TABLE IF NOT EXISTS item (
    ID mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome varchar(40) NOT NULL,
    preco decimal(10,2) NOT NULL,
    estoque smallint(5) UNSIGNED NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS usuario (
    ID mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome varchar(30) NOT NULL,
    sobrenome varchar(30) NOT NULL,
    telefone varchar(14) NOT NULL,
    email varchar(255) UNIQUE,
    senha varchar(255),
    role varchar(20) DEFAULT 'Caixa'
  )`,
  `CREATE TABLE IF NOT EXISTS vendas (
    ID int(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data_venda timestamp NOT NULL DEFAULT current_timestamp(),
    total decimal(10,2) NOT NULL,
    usuario_id int(8) UNSIGNED DEFAULT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS venda_itens (
    ID int(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ID_venda int(6) UNSIGNED NOT NULL,
    ID_item int(8) UNSIGNED NOT NULL,
    quantidade int(5) UNSIGNED NOT NULL,
    preco_unitario decimal(10,2) NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    documento VARCHAR(50),
    data_nascimento DATE
  )`,
  `CREATE TABLE IF NOT EXISTS fornecedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(50),
    telefone VARCHAR(20)
  )`,
  `CREATE TABLE IF NOT EXISTS vendedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    comissao DECIMAL(5,2) DEFAULT 0.00
  )`,
  `CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    status VARCHAR(50) DEFAULT 'Aberto',
    total DECIMAL(10,2) DEFAULT 0.00,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS devolucoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venda_id INT,
    motivo TEXT,
    valor_devolvido DECIMAL(10,2)
  )`,
  `CREATE TABLE IF NOT EXISTS caixa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- Entrada ou Saida
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_movimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS fiado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    valor_devido DECIMAL(10,2) NOT NULL,
    data_vencimento DATE
  )`,
  `CREATE TABLE IF NOT EXISTS financeiro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- Pagar ou Receber
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente'
  )`,
  `CREATE TABLE IF NOT EXISTS turnos_caixa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP NULL,
    troco_inicial DECIMAL(10,2) DEFAULT 0.00,
    saldo_final DECIMAL(10,2) NULL,
    status VARCHAR(20) DEFAULT 'Aberto'
  )`
];

const bcrypt = require('bcryptjs');

async function initializeDb() {
  try {
    for (const query of tables) {
      await db.query(query);
    }
    
    try {
      await db.query('ALTER TABLE item ADD COLUMN codigo_barras VARCHAR(100) NULL');
      console.log('Coluna codigo_barras adicionada a tabela item.');
    } catch (e) {
      // Ignore
    }

    try {
      await db.query("ALTER TABLE item ADD COLUMN categoria VARCHAR(255) DEFAULT 'Diversos'");
      console.log('Coluna categoria adicionada a tabela item.');
    } catch (e) {
      // Ignore
    }

    // Migração: adicionar data_nascimento na tabela clientes se não existir
    try {
      await db.query('ALTER TABLE clientes ADD COLUMN data_nascimento DATE NULL');
      console.log('Coluna data_nascimento adicionada a tabela clientes.');
    } catch (e) {
      // Já existe, ignorar
    }

    // Migração: adicionar metodo_pagamento na tabela vendas
    try {
      await db.query("ALTER TABLE vendas ADD COLUMN metodo_pagamento VARCHAR(50) DEFAULT 'dinheiro'");
      console.log('Coluna metodo_pagamento adicionada a tabela vendas.');
    } catch (e) {}

    // Migração: adicionar turno_id e usuario_id na tabela caixa
    try {
      await db.query('ALTER TABLE caixa ADD COLUMN turno_id INT NULL');
      await db.query('ALTER TABLE caixa ADD COLUMN usuario_id INT NULL');
      console.log('Colunas turno_id e usuario_id adicionadas a tabela caixa.');
    } catch (e) {}

    // Migração: adicionar ativo na tabela item
    try {
      await db.query('ALTER TABLE item ADD COLUMN ativo BOOLEAN DEFAULT TRUE');
      console.log('Coluna ativo adicionada a tabela item.');
    } catch (e) {}


    // Try to alter the usuario table to add missing columns from previous schema versions
    try {
      await db.query('ALTER TABLE usuario ADD COLUMN email varchar(255) UNIQUE');
    } catch(e) {}
    try {
      await db.query('ALTER TABLE usuario ADD COLUMN senha varchar(255)');
    } catch(e) {}
    try {
      await db.query("ALTER TABLE usuario ADD COLUMN role varchar(20) DEFAULT 'Caixa'");
    } catch(e) {}

    // Agora que as colunas existem, cria o admin
    const [users] = await db.query('SELECT COUNT(*) as count FROM usuario');
    if (users[0].count === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await db.query(
        'INSERT INTO usuario (nome, sobrenome, telefone, email, senha, role) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin', 'Sistema', '00000000000', 'admin@pdv.com', hashedPassword, 'Admin']
      );
      console.log('Usuário admin criado (admin@pdv.com / 123456)');
    }

    // Cria produtos de teste se não houver nenhum
    const [itemsCount] = await db.query('SELECT COUNT(*) as count FROM item');
    if (itemsCount[0].count === 0) {
      await db.query(
        'INSERT INTO item (nome, preco, estoque, codigo_barras) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        ['Refrigerante Cola 350ml', 5.50, 50, '7891234567890', 'Salgadinho de Queijo', 4.00, 30, '7890987654321']
      );
      console.log('Produtos de teste criados com sucesso.');
    }

    console.log('Banco de dados sincronizado: Tabelas garantidas com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar tabelas:', error);
  }
}

module.exports = initializeDb;
