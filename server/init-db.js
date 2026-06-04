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
    telefone varchar(14) NOT NULL
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
    documento VARCHAR(50)
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
  )`
];

async function initializeDb() {
  try {
    for (const query of tables) {
      await db.query(query);
    }
    console.log('Banco de dados sincronizado: Tabelas garantidas com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar tabelas:', error);
  }
}

module.exports = initializeDb;
