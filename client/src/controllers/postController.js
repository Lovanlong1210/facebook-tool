const { sql, poolPromise } = require('../../config/db');

/**
 * 1. Lấy danh sách bài đăng có Phân trang & Filter chuẩn MSSQL
 */
async function getPosts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const { status, pageId } = req.query;

    const pool = await poolPromise;
    const request = pool.request();

    let whereClause = 'WHERE 1=1';
    
    if (status && status !== 'all') {
      whereClause += ' AND p.status = @status';
      request.input('status', sql.NVarChar, status);
    }
    if (pageId && pageId !== 'all') {
      whereClause += ' AND p.page_id = @pageId';
      request.input('pageId', sql.NVarChar, pageId);
    }

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    // Truy vấn dữ liệu danh sách bài viết & đếm tổng số bản ghi
    const query = `
      SELECT p.id, p.page_id, p.content, p.scheduled_at, p.status, p.facebook_post_id, 
             p.media_type, p.media_links, p.media_thumb, p.created_at,
             COUNT(c.id) AS total_comments,
             ISNULL(SUM(CASE WHEN c.status = 'posted' THEN 1 ELSE 0 END), 0) AS posted_comments
      FROM Posts p
      LEFT JOIN PostComments c ON p.id = c.post_id
      ${whereClause}
      GROUP BY p.id, p.page_id, p.content, p.scheduled_at, p.status, p.facebook_post_id, 
               p.media_type, p.media_links, p.media_thumb, p.created_at
      ORDER BY p.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

      SELECT COUNT(*) AS total FROM Posts p ${whereClause};
    `;

    const result = await request.query(query);

    return res.json({
      success: true,
      data: result.recordsets[0],
      pagination: {
        page,
        limit,
        total: result.recordsets[1][0].total,
        totalPages: Math.ceil(result.recordsets[1][0].total / limit) || 1
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Posts:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy bài đăng!' });
  }
}

/**
 * 2. Lấy Thống kê tổng quan Dashboard
 */
async function getDashboardStats(req, res) {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT 
        COUNT(*) AS total_posts,
        ISNULL(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) AS published_count,
        ISNULL(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_count,
        ISNULL(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) AS failed_count
      FROM Posts;

      SELECT 
        COUNT(*) AS total_comments,
        ISNULL(SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END), 0) AS posted_comments
      FROM PostComments;
    `;

    const result = await pool.request().query(query);
    const postStats = result.recordsets[0][0];
    const cmtStats = result.recordsets[1][0];

    return res.json({
      success: true,
      data: {
        totalPosts: postStats.total_posts || 0,
        publishedPosts: postStats.published_count || 0,
        pendingPosts: postStats.pending_count || 0,
        failedPosts: postStats.failed_count || 0,
        totalComments: cmtStats.total_comments || 0,
        postedComments: cmtStats.posted_comments || 0
      }
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê Dashboard:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thống kê!' });
  }
}

/**
 * 3. Xóa bài viết khỏi SQL Server
 */
async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Posts WHERE id = @id');

    return res.json({ success: true, message: `Đã xóa bài viết ID #${id} thành công!` });
  } catch (error) {
    console.error('Lỗi xóa bài viết:', error);
    return res.status(500).json({ success: false, message: 'Không thể xóa bài viết!' });
  }
}

module.exports = {
  getPosts,
  getDashboardStats,
  deletePost
};