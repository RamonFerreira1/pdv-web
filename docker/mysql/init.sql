-- ============================================
-- PDV Web — Dump gerado em 06/06/2026, 17:27:30
-- ============================================

CREATE DATABASE IF NOT EXISTS `pdv`;
USE `pdv`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------
-- Estrutura das tabelas
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS `item` (
  `ID` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` varchar(40) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `estoque` smallint(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `usuario` (
  `ID` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) NOT NULL,
  `sobrenome` varchar(30) NOT NULL,
  `telefone` varchar(14) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vendas` (
  `ID` int(6) UNSIGNED NOT NULL AUTO_INCREMENT,
  `data_venda` timestamp NOT NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  `usuario_id` int(8) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `venda_itens` (
  `ID` int(6) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ID_venda` int(6) UNSIGNED NOT NULL,
  `ID_item` int(8) UNSIGNED NOT NULL,
  `quantidade` int(5) UNSIGNED NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `categorias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `telefone` VARCHAR(20),
  `email` VARCHAR(255),
  `documento` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fornecedores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `razao_social` VARCHAR(255) NOT NULL,
  `cnpj` VARCHAR(50),
  `telefone` VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vendedores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `comissao` DECIMAL(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT,
  `status` VARCHAR(50) DEFAULT 'Aberto',
  `total` DECIMAL(10,2) DEFAULT 0.00,
  `data_pedido` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `devolucoes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `venda_id` INT,
  `motivo` TEXT,
  `valor_devolvido` DECIMAL(10,2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `caixa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo` VARCHAR(50) NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `data_movimento` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fiado` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id` INT,
  `valor_devido` DECIMAL(10,2) NOT NULL,
  `data_vencimento` DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `financeiro` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo` VARCHAR(50) NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------
-- Dados exportados do Aiven
-- ----------------------------------------

-- Tabela usuario: sem dados

INSERT INTO `item` (`ID`, `nome`, `preco`, `estoque`) VALUES
(1, 'coca', '111.00', 1);

INSERT INTO `vendas` (`ID`, `data_venda`, `total`, `usuario_id`) VALUES
(1, '2026-06-05 01:50:52', '111.00', 1);

INSERT INTO `venda_itens` (`ID`, `ID_venda`, `ID_item`, `quantidade`, `preco_unitario`) VALUES
(1, 1, 1, 1, '111.00');

SET FOREIGN_KEY_CHECKS = 1;
