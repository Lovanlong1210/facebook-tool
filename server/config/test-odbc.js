const odbc = require('msnodesqlv8');

const connectionString =
  'Driver={ODBC Driver 17 for SQL Server};' +
  'Server=TUAN\\SQLEXPRESS;' +
  'Database=SO9_Studio;' +
  'Trusted_Connection=Yes;' +
  'TrustServerCertificate=Yes;';

const sql = `
  SELECT
    @@SERVERNAME AS ServerName,
    DB_NAME() AS DatabaseName,
    SUSER_SNAME() AS LoginName
`;

odbc.query(connectionString, sql, (err, rows) => {
  if (err) {
    console.error('❌ ODBC ERROR:');
    console.dir(err, { depth: null });
    return;
  }

  console.log('✅ KẾT NỐI SQL SERVER THÀNH CÔNG');
  console.table(rows);
});