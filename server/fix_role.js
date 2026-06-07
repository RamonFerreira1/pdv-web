require('dotenv').config();
const db = require('./db');

async function run() {
  try {
    await db.query("ALTER TABLE usuario ADD COLUMN role varchar(20) DEFAULT 'Caixa'");
    console.log("Coluna role adicionada com sucesso!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
