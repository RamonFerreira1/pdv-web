/**
 * Script de exportação do banco Aiven → SQL para Docker
 * Executa: node scripts/export-aiven.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.DB_HOST || 'mysql-3df3d8c6-ramonferreirams11-45cd.l.aivencloud.com',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,  // Configure via: $env:DB_PASSWORD="sua_senha"
  database: process.env.DB_NAME || 'pvd',
  port: parseInt(process.env.DB_PORT) || 28312,
  ssl: { rejectUnauthorized: false },
};

// Tabelas para exportar (ordem importa por causa de FKs)
const tables = ['usuario', 'item', 'vendas', 'venda_itens'];

async function exportTable(conn, tableName) {
  const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
  if (rows.length === 0) return `-- Tabela ${tableName}: sem dados\n`;

  const [cols] = await conn.query(`SHOW COLUMNS FROM \`${tableName}\``);
  const colNames = cols.map(c => `\`${c.Field}\``).join(', ');

  const values = rows.map(row => {
    const vals = Object.values(row).map(v => {
      if (v === null) return 'NULL';
      if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
      if (typeof v === 'number') return v;
      return `'${String(v).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
    });
    return `(${vals.join(', ')})`;
  });

  return `INSERT INTO \`${tableName}\` (${colNames}) VALUES\n${values.join(',\n')};\n`;
}

async function main() {
  console.log('🔌 Conectando ao Aiven...');
  const conn = await mysql.createConnection(config);
  console.log('✅ Conectado!\n');

  const outputDir = path.join(__dirname, '..', 'docker', 'mysql');
  fs.mkdirSync(outputDir, { recursive: true });

  const schemaPath = path.join(outputDir, 'init.sql');

  let sql = `-- ============================================
-- PDV Web — Dump gerado em ${new Date().toLocaleString('pt-BR')}
-- ============================================

CREATE DATABASE IF NOT EXISTS \`pdv\`;
USE \`pdv\`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------
-- Estrutura das tabelas
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS \`item\` (
  \`ID\` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(40) NOT NULL,
  \`preco\` decimal(10,2) NOT NULL,
  \`estoque\` smallint(5) UNSIGNED NOT NULL,
  PRIMARY KEY (\`ID\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`usuario\` (
  \`ID\` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(30) NOT NULL,
  \`sobrenome\` varchar(30) NOT NULL,
  \`telefone\` varchar(14) NOT NULL,
  PRIMARY KEY (\`ID\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`vendas\` (
  \`ID\` int(6) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`data_venda\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`total\` decimal(10,2) NOT NULL,
  \`usuario_id\` int(8) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (\`ID\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`venda_itens\` (
  \`ID\` int(6) UNSIGNED NOT NULL AUTO_INCREMENT,
  \`ID_venda\` int(6) UNSIGNED NOT NULL,
  \`ID_item\` int(8) UNSIGNED NOT NULL,
  \`quantidade\` int(5) UNSIGNED NOT NULL,
  \`preco_unitario\` decimal(10,2) NOT NULL,
  PRIMARY KEY (\`ID\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`categorias\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nome\` VARCHAR(255) NOT NULL,
  \`descricao\` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`clientes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nome\` VARCHAR(255) NOT NULL,
  \`telefone\` VARCHAR(20),
  \`email\` VARCHAR(255),
  \`documento\` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`fornecedores\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`razao_social\` VARCHAR(255) NOT NULL,
  \`cnpj\` VARCHAR(50),
  \`telefone\` VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`vendedores\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nome\` VARCHAR(255) NOT NULL,
  \`comissao\` DECIMAL(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`pedidos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`cliente_id\` INT,
  \`status\` VARCHAR(50) DEFAULT 'Aberto',
  \`total\` DECIMAL(10,2) DEFAULT 0.00,
  \`data_pedido\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`devolucoes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`venda_id\` INT,
  \`motivo\` TEXT,
  \`valor_devolvido\` DECIMAL(10,2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`caixa\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tipo\` VARCHAR(50) NOT NULL,
  \`descricao\` VARCHAR(255) NOT NULL,
  \`valor\` DECIMAL(10,2) NOT NULL,
  \`data_movimento\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`fiado\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`cliente_id\` INT,
  \`valor_devido\` DECIMAL(10,2) NOT NULL,
  \`data_vencimento\` DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`financeiro\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tipo\` VARCHAR(50) NOT NULL,
  \`descricao\` VARCHAR(255) NOT NULL,
  \`valor\` DECIMAL(10,2) NOT NULL,
  \`status\` VARCHAR(50) DEFAULT 'Pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------
-- Dados exportados do Aiven
-- ----------------------------------------

`;

  for (const table of tables) {
    process.stdout.write(`📤 Exportando tabela: ${table}...`);
    try {
      const insertSql = await exportTable(conn, table);
      sql += insertSql + '\n';
      console.log(' ✅');
    } catch (err) {
      console.log(` ⚠️  Tabela não encontrada (ignorando): ${err.message}`);
      sql += `-- Tabela ${table}: não encontrada no Aiven\n\n`;
    }
  }

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  fs.writeFileSync(schemaPath, sql, 'utf8');
  console.log(`\n✅ Dump salvo em: ${schemaPath}`);
  console.log(`   Total de caracteres: ${sql.length}`);

  await conn.end();
  console.log('\n🎉 Exportação concluída com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro durante exportação:', err.message);
  process.exit(1);
});
