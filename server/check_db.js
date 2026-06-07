require('dotenv').config();
const db = require('./db');

async function run() {
  try {
    const [columns] = await db.query('DESCRIBE usuario');
    console.log(columns);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
