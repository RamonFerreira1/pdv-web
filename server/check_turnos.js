require('dotenv').config();
const db = require('./db');

async function run() {
  try {
    const [tables] = await db.query("SHOW TABLES LIKE 'turnos_caixa'");
    console.log("Tables found:", tables);
    
    if (tables.length > 0) {
      const [columns] = await db.query("DESCRIBE turnos_caixa");
      console.log("Columns:", columns);
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
