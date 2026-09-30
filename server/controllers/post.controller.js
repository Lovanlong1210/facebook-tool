const { sql, getPool } = require('../config/db');

async function getPostsList(req, res) {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;
    const pool = await getPool();
    
    let query = `SELECT * FROM Posts`;
    const request = pool.request();

    // Thêm điều kiện lọc trạng thái nếu người dùng chọn
    if (status && status !== 'all') {
      query += ` WHERE status = @status`;
      request.input('status', sql.NVarChar, status);
    }

    query += ` ORDER BY id DESC`;

    const result = await request.query(query);

    return res.status(200).json({
      success: true,
      posts: result.recordset,
      total: result.recordset.length
    });
  } catch (error) {
    console.error("Lỗi getPostsList:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi kết nối CSDL khi lấy danh sách bài đăng",
      error: error.message
    });
  }
}

module.exports = { getPostsList };