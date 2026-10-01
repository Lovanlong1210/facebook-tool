const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const XLSX = require('xlsx');
const { sql, getPool } = require('../config/db');
const { parseBulkExcel } = require('./modules/excel-parser/excelService');
const { addPostToQueue, removePostFromQueue } = require('../queues/post.queue');
const { getFacebookPageAccessToken } = require('./utils/FacebookPageAccessToken');
const {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  adminIds,
  authConfiguration,
  clearCookie,
  clientOrigin,
  facebookRedirectUri,
  loadSession,
  parseCookies,
  requireAdmin,
  requireAuth,
  setCookie,
  signSession
} = require('./middlewares/auth');

const app = express();
const frontendOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json());
app.use('/api', loadSession);

app.get('/api/auth/status', (_req, res) => {
  const config = authConfiguration();
  return res.json({
    success: true,
    configured: config.configured,
    missing: config.missing,
    adminConfigured: config.adminConfigured,
    adminCount: adminIds().size
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ authenticated: false });
  return res.json({
    authenticated: true,
    user: { id: req.user.sub, name: req.user.name, role: req.user.role }
  });
});

app.get('/api/auth/facebook', (req, res) => {
  const config = authConfiguration();
  if (!config.configured) {
    return res.status(503).json({ success: false, message: 'Facebook login chưa cấu hình đầy đủ.', missing: config.missing });
  }

  const state = crypto.randomBytes(32).toString('base64url');
  setCookie(req, res, OAUTH_STATE_COOKIE, state, 10 * 60);
  const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
  const authorizationUrl = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`);
  authorizationUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID);
  authorizationUrl.searchParams.set('redirect_uri', facebookRedirectUri());
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', process.env.FACEBOOK_LOGIN_SCOPES || 'public_profile');
  authorizationUrl.searchParams.set('state', state);
  return res.redirect(302, authorizationUrl.toString());
});

app.get('/api/auth/facebook/callback', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const requestState = typeof req.query.state === 'string' ? Buffer.from(req.query.state) : Buffer.alloc(0);
  const cookieState = cookies[OAUTH_STATE_COOKIE] ? Buffer.from(cookies[OAUTH_STATE_COOKIE]) : Buffer.alloc(0);
  const stateMatches = requestState.length > 0
    && requestState.length === cookieState.length
    && crypto.timingSafeEqual(requestState, cookieState);
  clearCookie(req, res, OAUTH_STATE_COOKIE);
  if (!stateMatches || typeof req.query.code !== 'string') {
    return res.redirect(`${clientOrigin()}/login?error=oauth_state_invalid`);
  }

  try {
    const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: facebookRedirectUri(),
          code: req.query.code
        },
        timeout: 15000
      }
    );
    const profileResponse = await axios.get(
      `https://graph.facebook.com/${graphVersion}/me`,
      { params: { fields: 'id,name', access_token: tokenResponse.data.access_token }, timeout: 15000 }
    );
    const sessionToken = signSession(profileResponse.data);
    setCookie(req, res, SESSION_COOKIE, sessionToken, SESSION_TTL_SECONDS);
    return res.redirect(`${clientOrigin()}/`);
  } catch (error) {
    console.error('[Facebook OAuth Error]', error.response?.status || error.message);
    return res.redirect(`${clientOrigin()}/login?error=oauth_failed`);
  }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  clearCookie(req, res, SESSION_COOKIE);
  return res.json({ success: true });
});

const upload = multer({ storage: multer.memoryStorage() });
const mediaDirectory = path.resolve(__dirname, '../uploads');
fs.mkdirSync(mediaDirectory, { recursive: true });
const mediaUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, mediaDirectory),
    filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return callback(new Error('Chỉ hỗ trợ tệp hình ảnh hoặc video.'));
    }
    return callback(null, true);
  }
});

function handleMediaUpload(req, res, next) {
  mediaUpload.single('file')(req, res, (error) => {
    if (!error) return next();
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({
      success: false,
      message: error.code === 'LIMIT_FILE_SIZE' ? 'Tệp vượt quá giới hạn 100 MB.' : error.message
    });
  });
}

app.post('/api/media', requireAdmin, handleMediaUpload, (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh hoặc video.' });
  return res.status(201).json({
    success: true,
    mediaLink: `local://${req.file.filename}`,
    mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    fileName: req.file.originalname,
    size: req.file.size
  });
});

app.get('/api/ai/status', requireAuth, (_req, res) => {
  return res.json({
    success: true,
    configured: Boolean(process.env.AI_API_KEY),
    model: process.env.AI_MODEL || 'gpt-4o-mini'
  });
});

app.post('/api/ai/chat', requireAuth, async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const apiKey = process.env.AI_API_KEY;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống.' });
  }
  if (!apiKey) {
    return res.status(503).json({ success: false, message: 'AI chưa được cấu hình. Hãy đặt AI_API_KEY trong server/.env.' });
  }

  const history = Array.isArray(req.body.history)
    ? req.body.history
      .filter((item) => ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
      .slice(-12)
      .map((item) => ({ role: item.role, content: item.content.slice(0, 4000) }))
    : [];

  try {
    const baseUrl = (process.env.AI_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [...history, { role: 'user', content: message }],
        temperature: 0.7
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 60000
      }
    );
    const reply = response.data.choices?.[0]?.message?.content;
    if (!reply) throw new Error('AI provider returned an empty response.');
    return res.json({ success: true, reply });
  } catch (error) {
    console.error('[AI Chat Error]', error.response?.status || error.message);
    return res.status(502).json({ success: false, message: 'Không thể nhận phản hồi từ AI provider. Kiểm tra AI_API_KEY, AI_MODEL và nhật ký server.' });
  }
});

app.get('/api/channels', requireAuth, async (_req, res) => {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!pageId) {
    return res.status(503).json({ success: false, message: 'Chưa cấu hình FACEBOOK_PAGE_ID.' });
  }

  try {
    const pageAccessToken = await getFacebookPageAccessToken(pageId);
    const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
    const response = await axios.get(
      `https://graph.facebook.com/${graphVersion}/${pageId}`,
      { params: { fields: 'id,name,category,link', access_token: pageAccessToken } }
    );
    return res.json({
      success: true,
      channels: [{
        id: response.data.id,
        name: response.data.name,
        category: response.data.category || 'Facebook Page',
        link: response.data.link || null,
        platform: 'facebook',
        connected: true
      }]
    });
  } catch (error) {
    const graphError = error.response?.data?.error;
    console.error('[Channels Error]', graphError?.message || error.message);
    return res.status(502).json({
      success: false,
      message: graphError?.message || 'Không thể tải thông tin Fanpage từ Facebook.'
    });
  }
});

app.get('/api/posts/template', (_req, res) => {
  const headers = [
    'STT',
    'Fanpage Channel (Tên | Page ID)',
    'Content',
    'Schedule',
    'Loại Media',
    'Media Link',
    'Media Thumb'
  ];
  for (let index = 1; index <= 5; index++) {
    headers.push(`Seeding Comment ${index}`, `Schedule Comment ${index}`, `Media Comment ${index}`);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['MẪU UPLOAD BÀI ĐĂNG TỰ ĐỘNG - TOOL_FACE_TUAN'],
    ['Schedule: Đăng ngay, D/M/YYYY_HH:mm hoặc YYYY-MM-DD HH:mm:ss. Media Link cần URL công khai nếu có.'],
    headers
  ]);
  worksheet['!cols'] = headers.map((header) => ({ wch: Math.max(16, Math.min(38, header.length + 3)) }));
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MAIN SHEET');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="So9_Upload_Bulk_Template.xlsx"');
  return res.send(buffer);
});

app.post('/api/posts', requireAdmin, async (req, res) => {
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const pageId = String(req.body.pageId || process.env.FACEBOOK_PAGE_ID || '').trim();
  const mediaType = String(req.body.mediaType || 'text').toLowerCase();
  const mediaLinks = Array.isArray(req.body.mediaLinks) ? req.body.mediaLinks : [];
  const scheduledAt = new Date(req.body.scheduledAt || Date.now());

  if (!content) {
    return res.status(400).json({ success: false, message: 'Nội dung bài đăng không được để trống.' });
  }
  if (!/^\d+$/.test(pageId)) {
    return res.status(400).json({ success: false, message: 'Page ID không hợp lệ.' });
  }
  if (!['text', 'image', 'video'].includes(mediaType)) {
    return res.status(400).json({ success: false, message: 'Loại media phải là text, image hoặc video.' });
  }
  if (mediaType !== 'text' && (mediaLinks.length === 0 || mediaLinks.some((link) => {
    if (typeof link === 'string' && /^local:\/\/[a-f0-9-]+\.[a-z0-9]+$/i.test(link)) return false;
    try {
      return new URL(link).protocol !== 'https:';
    } catch {
      return true;
    }
  }))) {
    return res.status(400).json({ success: false, message: 'Media cần URL HTTPS công khai để Facebook tải được.' });
  }
  if (Number.isNaN(scheduledAt.getTime())) {
    return res.status(400).json({ success: false, message: 'Thời gian đăng không hợp lệ.' });
  }

  const comments = Array.isArray(req.body.comments) ? req.body.comments.slice(0, 5) : [];
  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    let postId;
    try {
      const postResult = await new sql.Request(transaction)
        .input('pageId', sql.VarChar, pageId)
        .input('content', sql.NVarChar, content)
        .input('mediaType', sql.VarChar, mediaType)
        .input('mediaLinks', sql.NVarChar, JSON.stringify(mediaLinks))
        .input('scheduledAt', sql.DateTime2, scheduledAt)
        .input('status', sql.VarChar, 'pending')
        .query(`
          INSERT INTO Posts (page_id, content, media_type, media_links, scheduled_at, status)
          OUTPUT INSERTED.id
          VALUES (@pageId, @content, @mediaType, @mediaLinks, @scheduledAt, @status);
        `);
      postId = postResult.recordset[0].id;

      for (const [index, comment] of comments.entries()) {
        if (typeof comment.content !== 'string' || !comment.content.trim()) continue;
        await new sql.Request(transaction)
          .input('postId', sql.Int, postId)
          .input('commentIndex', sql.Int, index + 1)
          .input('content', sql.NVarChar, comment.content.trim())
          .input('delayMinutes', sql.Int, Math.max(0, Number.parseInt(comment.delayMinutes, 10) || 0))
          .input('mediaUrl', sql.VarChar, comment.mediaUrl || null)
          .query(`
            INSERT INTO PostComments (post_id, comment_index, content, delay_minutes, media_url, status)
            VALUES (@postId, @commentIndex, @content, @delayMinutes, @mediaUrl, 'pending');
          `);
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    try {
      await addPostToQueue(postId, scheduledAt);
    } catch (queueError) {
      await pool.request()
        .input('id', sql.Int, postId)
        .query("UPDATE Posts SET status = 'failed' WHERE id = @id AND status = 'pending'");
      console.error('[Post Queue Error]', queueError.message);
      return res.status(503).json({ success: false, postId, message: 'Đã lưu bài nhưng chưa đưa được vào hàng đợi. Bài được đánh dấu thất bại.' });
    }

    return res.status(202).json({
      success: true,
      postId,
      status: 'pending',
      scheduledAt,
      message: 'Đã lưu bài và đưa vào lịch đăng.'
    });
  } catch (error) {
    console.error('[Create Post Error]', error.message);
    return res.status(500).json({ success: false, message: 'Không thể tạo lịch đăng bài.' });
  }
});

app.get('/api/posts', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const pageValue = Number.parseInt(req.query.page, 10);
    const limitValue = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 10;
    const status = String(req.query.status || 'all');
    const pageId = String(req.query.pageId || 'all');
    const filters = [];

    const countRequest = pool.request();
    const postsRequest = pool.request();
    if (status !== 'all') {
      filters.push('status = @status');
      countRequest.input('status', sql.VarChar, status);
      postsRequest.input('status', sql.VarChar, status);
    }
    if (pageId !== 'all') {
      filters.push('page_id = @pageId');
      countRequest.input('pageId', sql.VarChar, pageId);
      postsRequest.input('pageId', sql.VarChar, pageId);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const countResult = await countRequest.query(`SELECT COUNT(*) AS total FROM Posts ${whereClause}`);
    const postsResult = await postsRequest
      .input('offset', sql.Int, (page - 1) * limit)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT * FROM Posts ${whereClause}
        ORDER BY scheduled_at DESC, id DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
      `);

    return res.json({
      success: true,
      posts: postsResult.recordset,
      total: countResult.recordset[0].total,
      page,
      limit
    });
  } catch (error) {
    console.error('[Posts List Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/posts/stats', requireAuth, async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed
      FROM Posts;
    `);
    const stats = result.recordset[0];
    return res.json({
      success: true,
      stats: {
        total: Number(stats.total || 0),
        pending: Number(stats.pending || 0),
        published: Number(stats.published || 0),
        failed: Number(stats.failed || 0)
      }
    });
  } catch (error) {
    console.error('[Posts Stats Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/reports/insights', requireAuth, async (req, res) => {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!pageId) return res.status(503).json({ success: false, available: false, message: 'Chưa cấu hình Facebook Page.' });

  const daysValue = Number.parseInt(req.query.days, 10);
  const days = [7, 14, 30].includes(daysValue) ? daysValue : 14;
  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
  const dateKey = (date) => date.toISOString().slice(0, 10);

  try {
    const token = await getFacebookPageAccessToken(pageId);
    const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
    const metricList = (process.env.FB_INSIGHT_METRICS || 'page_post_engagements,page_views_total,page_media_view')
      .split(',').map((metric) => metric.trim()).filter(Boolean);
    const result = await axios.get(
      `https://graph.facebook.com/${graphVersion}/${pageId}/insights`,
      {
        params: {
          metric: metricList.join(','),
          period: 'day',
          since: dateKey(since),
          until: dateKey(until),
          access_token: token
        },
        timeout: 15000
      }
    );
    const metrics = (result.data.data || []).map((metric) => ({
      name: metric.name,
      period: metric.period,
      values: (metric.values || []).map((item) => ({ endTime: item.end_time, value: item.value }))
    }));
    const hasValues = metrics.some((metric) => metric.values.length > 0);
    return res.json({
      success: true,
      available: hasValues,
      days,
      metrics,
      message: hasValues ? null : 'Facebook chưa trả datapoint Insights cho Page này trong khoảng thời gian đã chọn.'
    });
  } catch (error) {
    const graphError = error.response?.data?.error;
    console.error('[Insights Error]', graphError?.message || error.message);
    return res.status(502).json({
      success: false,
      available: false,
      message: graphError?.message || 'Không tải được Facebook Insights.'
    });
  }
});

app.post('/api/posts/:postId/publish-now', requireAdmin, async (req, res) => {
  const postId = Number.parseInt(req.params.postId, 10);
  if (!Number.isSafeInteger(postId) || postId <= 0) {
    return res.status(400).json({ success: false, message: 'ID bài đăng không hợp lệ.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, postId)
      .input('scheduledAt', sql.DateTime2, new Date())
      .query(`
        UPDATE Posts SET scheduled_at = @scheduledAt, status = 'pending'
        OUTPUT INSERTED.id
        WHERE id = @id AND status IN ('pending', 'failed');
      `);
    if (result.recordset.length === 0) {
      return res.status(409).json({ success: false, message: 'Không tìm thấy bài chờ đăng hoặc bài đang được xử lý.' });
    }

    try {
      await addPostToQueue(postId, new Date());
    } catch (queueError) {
      await pool.request()
        .input('id', sql.Int, postId)
        .query("UPDATE Posts SET status = 'failed' WHERE id = @id AND status = 'pending'");
      throw queueError;
    }

    return res.status(202).json({ success: true, message: 'Đã đưa bài đăng vào hàng đợi.' });
  } catch (error) {
    console.error('[Publish Now Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/posts/:postId', requireAdmin, async (req, res) => {
  const postId = Number.parseInt(req.params.postId, 10);
  if (!Number.isSafeInteger(postId) || postId <= 0) {
    return res.status(400).json({ success: false, message: 'ID bài đăng không hợp lệ.' });
  }

  try {
    const pool = await getPool();
    const postResult = await pool.request()
      .input('id', sql.Int, postId)
      .query('SELECT id, status, media_links FROM Posts WHERE id = @id');
    const post = postResult.recordset[0];
    if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng.' });
    if (!['pending', 'failed'].includes(post.status)) {
      return res.status(409).json({ success: false, message: 'Chỉ có thể xóa bài đang chờ hoặc đăng thất bại.' });
    }

    await removePostFromQueue(postId);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      await new sql.Request(transaction)
        .input('id', sql.Int, postId)
        .query('DELETE FROM PostComments WHERE post_id = @id; DELETE FROM Posts WHERE id = @id;');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    if (post.media_links) {
      try {
        const mediaLinks = JSON.parse(post.media_links);
        for (const mediaLink of Array.isArray(mediaLinks) ? mediaLinks : [mediaLinks]) {
          if (typeof mediaLink !== 'string' || !mediaLink.startsWith('local://')) continue;
          const fileName = mediaLink.slice('local://'.length);
          if (path.basename(fileName) === fileName && /^[a-f0-9-]+\.[a-z0-9]+$/i.test(fileName)) {
            await fs.promises.unlink(path.resolve(mediaDirectory, fileName)).catch(() => {});
          }
        }
      } catch (error) {
        console.error('[Delete Post Media Cleanup Error]', error.message);
      }
    }

    return res.json({ success: true, message: 'Đã xóa bài đăng.' });
  } catch (error) {
    console.error('[Delete Post Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint Bulk Upload Excel
app.post('/api/posts/bulk-upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload file Excel!' });
    }

    const parsedPosts = parseBulkExcel(req.file.buffer);
    const pool = await getPool();
    const createdPostIds = [];
    const rowErrors = [];

    for (const item of parsedPosts) {
      const transaction = new sql.Transaction(pool);
      let transactionOpen = false;
      let committed = false;
      await transaction.begin();
      transactionOpen = true;

      try {
        // 1. Chèn Bài viết chính vào bảng Posts
        const postRequest = new sql.Request(transaction);
        const postResult = await postRequest
          .input('page_id', sql.VarChar, item.pageId || process.env.FACEBOOK_PAGE_ID)
          .input('content', sql.NVarChar, item.content)
          .input('media_type', sql.VarChar, item.mediaType)
          .input('media_links', sql.NVarChar, JSON.stringify(item.mediaLinks))
          .input('media_thumb', sql.VarChar, item.mediaThumb)
          .input('scheduled_at', sql.DateTime2, item.scheduledAt)
          .input('status', sql.VarChar, 'pending')
          .query(`
            INSERT INTO Posts (page_id, content, media_type, media_links, media_thumb, scheduled_at, status)
            OUTPUT INSERTED.id
            VALUES (@page_id, @content, @media_type, @media_links, @media_thumb, @scheduled_at, @status);
          `);

        const newPostId = postResult.recordset[0].id;

        // 2. Chèn Auto Comments vào bảng PostComments
        if (item.comments && item.comments.length > 0) {
          for (const cmt of item.comments) {
            const commentRequest = new sql.Request(transaction);
            await commentRequest
              .input('post_id', sql.Int, newPostId)
              .input('comment_index', sql.Int, cmt.commentIndex)
              .input('content', sql.NVarChar, cmt.content)
              .input('delay_minutes', sql.Int, cmt.delayMinutes)
              .input('media_url', sql.VarChar, cmt.mediaUrl)
              .query(`
                INSERT INTO PostComments (post_id, comment_index, content, delay_minutes, media_url, status)
                VALUES (@post_id, @comment_index, @content, @delay_minutes, @media_url, 'pending');
              `);
          }
        }

        await transaction.commit();
        transactionOpen = false;
        committed = true;

        try {
          await addPostToQueue(newPostId, item.scheduledAt);
        } catch (queueError) {
          await pool.request()
            .input('id', sql.Int, newPostId)
            .query("UPDATE Posts SET status = 'failed' WHERE id = @id AND status = 'pending'");
          throw queueError;
        }
        createdPostIds.push(newPostId);

      } catch (err) {
        if (transactionOpen && !committed) await transaction.rollback();
        console.error(`[SQL Rollback] Lỗi dòng ${item.rowIndex}:`, err);
        rowErrors.push({ row: item.rowIndex, message: err.message });
      }
    }

    return res.json({
      success: rowErrors.length === 0,
      message: `Đã xếp lịch ${createdPostIds.length}/${parsedPosts.length} bài đăng.`,
      data: createdPostIds,
      errors: rowErrors
    });

  } catch (error) {
    console.error('[Bulk Upload Server Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server tool_face_tuan (SQL Server) đang chạy tại port ${PORT}`);
});

server.on('error', (error) => {
  console.error('[HTTP Server Error]', error.message);
  process.exitCode = 1;
});

module.exports = app;