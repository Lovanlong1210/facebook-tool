const { getPool } = require('./db');

async function test() {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        @@SERVERNAME AS ServerName,
        DB_NAME() AS DatabaseName,
        SUSER_SNAME() AS LoginName
    `);

    console.table(result.recordset);

    await pool.close();
  } catch (error) {
    console.error('DATABASE ERROR:');
    console.dir(error, { depth: null });
  }
}

test();