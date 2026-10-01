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
  saveFacebookUser,
  syncFacebookPages,
  getStoredUserAccessToken,
  getConnectedPages
} = require('./utils/FacebookPageConnections');
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
  requireAuth,
  setCookie,
  signSession
} = require('./middlewares/auth');

const app = express();
const frontendOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/api', loadSession);

const mediaDirectory = path.resolve(__dirname, '../uploads');
fs.mkdirSync(mediaDirectory, { recursive: true });
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
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

function sendApiError(res, label, error, fallback) {
  const message = error.response?.data?.error?.message || error.message || fallback;
  console.error(`[${label}]`, message);
  return res.status(error.response ? 502 : 500).json({ success: false, message: fallback });
}

function localMediaFilename(link) {
  if (typeof link !== 'string' || !link.startsWith('local://')) return null;
  const fileName = link.slice('local://'.length);
  return path.basename(fileName) === fileName && /^[a-f0-9-]+\.[a-z0-9]+$/i.test(fileName) ? fileName : null;
}

let postOwnershipSchema;
async function ensurePostOwnershipSchema() {
  if (!postOwnershipSchema) {
    postOwnershipSchema = getPool().then((pool) => pool.request().query(`
      IF COL_LENGTH('dbo.Posts', 'created_by_user_id') IS NULL
        ALTER TABLE dbo.Posts ADD created_by_user_id varchar(64) NULL;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Posts_created_by_user_id' AND object_id=OBJECT_ID('dbo.Posts'))
        CREATE INDEX IX_Posts_created_by_user_id ON dbo.Posts(created_by_user_id, scheduled_at DESC);
    `)).catch((error) => {
      postOwnershipSchema = null;
      throw error;
    });
  }
  await postOwnershipSchema;
}

async function userOwnsPage(userId, pageId) {
  const pages = await getConnectedPages(userId);
  return pages.some((page) => String(page.id) === String(pageId));
}

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
  return res.json({ authenticated: true, user: { id: req.user.sub, name: req.user.name, role: req.user.role } });
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
    const shortTokenResponse = await axios.get(`https://graph.facebook.com/${graphVersion}/oauth/access_token`, {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: facebookRedirectUri(),
        code: req.query.code
      },
      timeout: 15000
    });
    let userAccessToken = shortTokenResponse.data.access_token;
    let tokenExpiresIn = shortTokenResponse.data.expires_in;
    try {
      const longTokenResponse = await axios.get(`https://graph.facebook.com/${graphVersion}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: userAccessToken
        },
        timeout: 15000
      });
      userAccessToken = longTokenResponse.data.access_token || userAccessToken;
      tokenExpiresIn = longTokenResponse.data.expires_in || tokenExpiresIn;
    } catch (exchangeError) {
      console.warn('[Facebook OAuth] Could not exchange to a long-lived token; using the short-lived token for this session.');
    }
    const profileResponse = await axios.get(`https://graph.facebook.com/${graphVersion}/me`, {
      params: { fields: 'id,name', access_token: userAccessToken },
      timeout: 15000
    });
    await saveFacebookUser(profileResponse.data, userAccessToken, tokenExpiresIn);
    const connectedPages = await syncFacebookPages(profileResponse.data.id, userAccessToken);
    console.log(`[Facebook OAuth] Connected ${connectedPages.length} Page(s) for user ${profileResponse.data.id}.`);
    setCookie(req, res, SESSION_COOKIE, signSession(profileResponse.data), SESSION_TTL_SECONDS);
    return res.redirect(`${clientOrigin()}/dashboard`);
  } catch (error) {
    console.error('[Facebook OAuth Error]', error.response?.status || error.message);
    return res.redirect(`${clientOrigin()}/login?error=oauth_failed`);
  }
});

app.post('/api/auth/logout', (_req, res) => {
  clearCookie(_req, res, SESSION_COOKIE);
  clearCookie(_req, res, OAUTH_STATE_COOKIE);
  return res.json({ success: true });
});

app.post('/api/media', requireAuth, handleMediaUpload, (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh hoặc video.' });
  return res.status(201).json({
    success: true,
    mediaLink: `local://${req.file.filename}`,
    mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    fileName: req.file.originalname,
    size: req.file.size
  });
});

app.get('/api/ai/status', requireAuth, (_req, res) => res.json({
  success: true,
  configured: Boolean(process.env.AI_API_KEY),
  model: process.env.AI_MODEL || 'gpt-4o-mini'
}));

app.post('/api/ai/chat', requireAuth, async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const apiKey = process.env.AI_API_KEY;
  if (!message) return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống.' });
  if (!apiKey) return res.status(503).json({ success: false, message: 'AI chưa được cấu hình. Hãy đặt AI_API_KEY trong server/.env.' });

  const history = Array.isArray(req.body.history)
    ? req.body.history.filter((item) => ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
      .slice(-12).map((item) => ({ role: item.role, content: item.content.slice(0, 4000) }))
    : [];
  try {
    const baseUrl = (process.env.AI_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [...history, { role: 'user', content: message }],
      temperature: 0.7
    }, { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 60000 });
    const reply = response.data.choices?.[0]?.message?.content;
    if (!reply) throw new Error('AI provider returned an empty response.');
    return res.json({ success: true, reply });
  } catch (error) {
    console.error('[AI Chat Error]', error.response?.status || error.message);
    return res.status(502).json({ success: false, message: 'Không thể nhận phản hồi từ AI provider. Kiểm tra AI_API_KEY, AI_MODEL và nhật ký server.' });
  }
});

app.get('/api/channels', requireAuth, async (req, res) => {
  try {
    const userToken = await getStoredUserAccessToken(req.user.sub);
    if (!userToken) {
      return res.status(409).json({ success: false, message: 'Phiên Facebook chưa có token Page. Hãy đăng xuất rồi đăng nhập lại để đồng bộ Page.' });
    }
    const channels = await syncFacebookPages(req.user.sub, userToken);
    return res.json({ success: true, channels });
  } catch (error) {
    return sendApiError(res, 'Channels Error', error, 'Không thể đồng bộ Page từ Facebook. Kiểm tra quyền pages_show_list và pages_read_engagement.');
  }
});

app.get('/api/posts/template', (_req, res) => {
  const headers = ['STT', 'Fanpage Channel (Tên | Page ID)', 'Content', 'Schedule', 'Loại Media', 'Media Link', 'Media Thumb'];
  for (let index = 1; index <= 5; index++) headers.push(`Seeding Comment ${index}`, `Schedule Comment ${index}`, `Media Comment ${index}`);
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

app.post('/api/posts', requireAuth, async (req, res) => {
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const pageId = String(req.body.pageId || process.env.FACEBOOK_PAGE_ID || '').trim();
  const mediaType = String(req.body.mediaType || 'text').toLowerCase();
  const mediaLinks = Array.isArray(req.body.mediaLinks) ? req.body.mediaLinks : [];
  const scheduledAt = new Date(req.body.scheduledAt || Date.now());
  if (!content) return res.status(400).json({ success: false, message: 'Nội dung bài đăng không được để trống.' });
  if (!/^\d+$/.test(pageId)) return res.status(400).json({ success: false, message: 'Page ID không hợp lệ.' });
  if (!['text', 'image', 'video'].includes(mediaType)) return res.status(400).json({ success: false, message: 'Loại media phải là text, image hoặc video.' });
  if (mediaType !== 'text' && (mediaLinks.length === 0 || mediaLinks.some((link) => {
    if (localMediaFilename(link)) return false;
    try { return new URL(link).protocol !== 'https:'; } catch { return true; }
  }))) return res.status(400).json({ success: false, message: 'Media cần URL HTTPS công khai hoặc media đã tải lên.' });
  if (Number.isNaN(scheduledAt.getTime())) return res.status(400).json({ success: false, message: 'Thời gian đăng không hợp lệ.' });

  const comments = Array.isArray(req.body.comments) ? req.body.comments.slice(0, 5) : [];
  try {
    await ensurePostOwnershipSchema();
    if (!await userOwnsPage(req.user.sub, pageId)) {
      return res.status(403).json({ success: false, message: 'Fanpage này chưa được kết nối với tài khoản Facebook đang đăng nhập.' });
    }
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    let postId;
    try {
      const result = await new sql.Request(transaction)
        .input('pageId', sql.VarChar, pageId)
        .input('ownerId', sql.VarChar(64), req.user.sub)
        .input('content', sql.NVarChar, content)
        .input('mediaType', sql.VarChar, mediaType)
        .input('mediaLinks', sql.NVarChar, JSON.stringify(mediaLinks))
        .input('scheduledAt', sql.DateTime2, scheduledAt)
        .input('status', sql.VarChar, 'pending')
        .query('INSERT INTO Posts (page_id, content, media_type, media_links, scheduled_at, status, created_by_user_id) OUTPUT INSERTED.id VALUES (@pageId, @content, @mediaType, @mediaLinks, @scheduledAt, @status, @ownerId);');
      postId = result.recordset[0].id;
      for (const [index, comment] of comments.entries()) {
        if (typeof comment.content !== 'string' || !comment.content.trim()) continue;
        await new sql.Request(transaction)
          .input('postId', sql.Int, postId)
          .input('commentIndex', sql.Int, index + 1)
          .input('content', sql.NVarChar, comment.content.trim())
          .input('delayMinutes', sql.Int, Math.max(0, Number.parseInt(comment.delayMinutes, 10) || 0))
          .input('mediaUrl', sql.VarChar, comment.mediaUrl || null)
          .query("INSERT INTO PostComments (post_id, comment_index, content, delay_minutes, media_url, status) VALUES (@postId, @commentIndex, @content, @delayMinutes, @mediaUrl, 'pending');");
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    try {
      await addPostToQueue(postId, scheduledAt);
    } catch (queueError) {
      await pool.request().input('id', sql.Int, postId).query("UPDATE Posts SET status = 'failed' WHERE id = @id AND status = 'pending'");
      console.error('[Post Queue Error]', queueError.message);
      return res.status(503).json({ success: false, postId, message: 'Đã lưu bài nhưng chưa đưa được vào hàng đợi. Bài được đánh dấu thất bại.' });
    }
    return res.status(202).json({ success: true, postId, status: 'pending', scheduledAt, message: 'Đã lưu bài và đưa vào lịch đăng.' });
  } catch (error) {
    console.error('[Create Post Error]', error.message);
    return res.status(500).json({ success: false, message: 'Không thể tạo lịch đăng bài.' });
  }
});

app.get('/api/posts', requireAuth, async (req, res) => {
  try {
    await ensurePostOwnershipSchema();
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
    if (req.user.role !== 'admin') {
      filters.push('created_by_user_id = @ownerId');
      countRequest.input('ownerId', sql.VarChar(64), req.user.sub);
      postsRequest.input('ownerId', sql.VarChar(64), req.user.sub);
    }
    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const count = await countRequest.query(`SELECT COUNT(*) AS total FROM Posts ${whereClause}`);
    const result = await postsRequest.input('offset', sql.Int, (page - 1) * limit).input('limit', sql.Int, limit).query(`SELECT * FROM Posts ${whereClause} ORDER BY scheduled_at DESC, id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;`);
    return res.json({ success: true, posts: result.recordset, total: count.recordset[0].total, page, limit });
  } catch (error) {
    console.error('[Posts List Error]', error.message);
    return res.status(500).json({ success: false, message: 'Không thể tải danh sách bài đăng.' });
  }
});

app.get('/api/posts/stats', requireAuth, async (req, res) => {
  try {
    await ensurePostOwnershipSchema();
    const pool = await getPool();
    const request = pool.request();
    const where = req.user.role === 'admin' ? '' : 'WHERE created_by_user_id=@ownerId';
    if (req.user.role !== 'admin') request.input('ownerId', sql.VarChar(64), req.user.sub);
    const result = await request.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) AS published, SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed FROM Posts ${where};`);
    const stats = result.recordset[0];
    return res.json({ success: true, stats: { total: Number(stats.total || 0), pending: Number(stats.pending || 0), published: Number(stats.published || 0), failed: Number(stats.failed || 0) } });
  } catch (error) {
    console.error('[Posts Stats Error]', error.message);
    return res.status(500).json({ success: false, message: 'Không thể tải thống kê bài đăng.' });
  }
});

app.get('/api/reports/insights', requireAuth, async (req, res) => {
  let pageId = req.query.pageId ? String(req.query.pageId) : '';
  try {
    const pages = await getConnectedPages(req.user.sub);
    pageId = pageId || pages[0]?.id;
    if (!pageId) return res.status(409).json({ success: false, available: false, message: 'Tài khoản chưa có Fanpage đã kết nối.' });
    if (!pages.some((page) => String(page.id) === pageId)) return res.status(403).json({ success: false, available: false, message: 'Không có quyền xem Insights của Fanpage này.' });
  } catch (error) {
    return sendApiError(res, 'Insights Page Lookup Error', error, 'Không thể tải danh sách Fanpage.');
  }
  const daysValue = Number.parseInt(req.query.days, 10);
  const days = [7, 14, 30].includes(daysValue) ? daysValue : 14;
  const until = new Date();
  const since = new Date(until.getTime() - days * 86400000);
  try {
    const token = await getFacebookPageAccessToken(pageId);
    const version = process.env.FB_GRAPH_VERSION || 'v19.0';
    const names = (process.env.FB_INSIGHT_METRICS || 'page_post_engagements,page_views_total,page_media_view').split(',').map((value) => value.trim()).filter(Boolean);
    const result = await axios.get(`https://graph.facebook.com/${version}/${pageId}/insights`, {
      params: { metric: names.join(','), period: 'day', since: since.toISOString().slice(0, 10), until: until.toISOString().slice(0, 10), access_token: token },
      timeout: 15000
    });
    const metrics = (result.data.data || []).map((metric) => ({ name: metric.name, period: metric.period, values: (metric.values || []).map((item) => ({ endTime: item.end_time, value: item.value })) }));
    const available = metrics.some((metric) => metric.values.length > 0);
    return res.json({ success: true, available, days, metrics, message: available ? null : 'Facebook chưa trả datapoint Insights cho Page này trong khoảng thời gian đã chọn.' });
  } catch (error) {
    return sendApiError(res, 'Insights Error', error, 'Không tải được Facebook Insights.');
  }
});

app.get('/api/posts/:postId/publish-now', (_req, res) => res.status(405).json({ success: false, message: 'Dùng POST để đưa bài vào hàng đợi.' }));
app.post('/api/posts/:postId/publish-now', requireAuth, async (req, res) => {
  const postId = Number.parseInt(req.params.postId, 10);
  if (!Number.isSafeInteger(postId) || postId <= 0) return res.status(400).json({ success: false, message: 'ID bài đăng không hợp lệ.' });
  try {
    await ensurePostOwnershipSchema();
    const pool = await getPool();
    const request = pool.request().input('id', sql.Int, postId).input('scheduledAt', sql.DateTime2, new Date());
    const ownerFilter = req.user.role === 'admin' ? '' : ' AND created_by_user_id=@ownerId';
    if (req.user.role !== 'admin') request.input('ownerId', sql.VarChar(64), req.user.sub);
    const result = await request.query(`UPDATE Posts SET scheduled_at=@scheduledAt,status='pending' OUTPUT INSERTED.id WHERE id=@id AND status IN ('pending','failed')${ownerFilter};`);
    if (!result.recordset.length) return res.status(409).json({ success: false, message: 'Không tìm thấy bài chờ đăng hoặc bài đang xử lý.' });
    await addPostToQueue(postId, new Date());
    return res.status(202).json({ success: true, message: 'Đã đưa bài đăng vào hàng đợi.' });
  } catch (error) {
    console.error('[Publish Now Error]', error.message);
    return res.status(500).json({ success: false, message: 'Không thể đưa bài vào hàng đợi.' });
  }
});

app.delete('/api/posts/:postId', requireAuth, async (req, res) => {
  const postId = Number.parseInt(req.params.postId, 10);
  if (!Number.isSafeInteger(postId) || postId <= 0) return res.status(400).json({ success: false, message: 'ID bài đăng không hợp lệ.' });
  try {
    await ensurePostOwnershipSchema();
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, postId).query('SELECT id,status,media_links,created_by_user_id FROM Posts WHERE id=@id');
    const post = result.recordset[0];
    if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng.' });
    if (req.user.role !== 'admin' && post.created_by_user_id !== req.user.sub) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng.' });
    if (!['pending', 'failed'].includes(post.status)) return res.status(409).json({ success: false, message: 'Chỉ xóa được bài chờ hoặc thất bại.' });
    await removePostFromQueue(postId);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      await new sql.Request(transaction).input('id', sql.Int, postId).query('DELETE FROM PostComments WHERE post_id=@id; DELETE FROM Posts WHERE id=@id;');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    try {
      const mediaLinks = JSON.parse(post.media_links || '[]');
      for (const link of Array.isArray(mediaLinks) ? mediaLinks : [mediaLinks]) {
        const name = localMediaFilename(link);
        if (name) await fs.promises.unlink(path.resolve(mediaDirectory, name)).catch(() => {});
      }
    } catch {}
    return res.json({ success: true, message: 'Đã xóa bài đăng.' });
  } catch (error) {
    console.error('[Delete Post Error]', error.message);
    return res.status(500).json({ success: false, message: 'Không thể xóa bài đăng.' });
  }
});

app.post('/api/posts/bulk-upload', requireAuth, memoryUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng upload file Excel.' });
    await ensurePostOwnershipSchema();
    const posts = parseBulkExcel(req.file.buffer);
    const pool = await getPool();
    const connectedPages = await getConnectedPages(req.user.sub);
    const connectedPageIds = new Set(connectedPages.map((page) => String(page.id)));
    const defaultPageId = connectedPages[0]?.id;
    const createdIds = [];
    const errors = [];
    for (const post of posts) {
      const transaction = new sql.Transaction(pool);
      try {
        await transaction.begin();
        const pageId = String(post.pageId || defaultPageId || '');
        if (!connectedPageIds.has(pageId)) throw new Error('Page trong dòng Excel chưa được kết nối với Facebook account này.');
        const inserted = await new sql.Request(transaction)
          .input('pageId', sql.VarChar, pageId)
          .input('ownerId', sql.VarChar(64), req.user.sub)
          .input('content', sql.NVarChar, post.content)
          .input('mediaType', sql.VarChar, post.mediaType)
          .input('mediaLinks', sql.NVarChar, JSON.stringify(post.mediaLinks))
          .input('mediaThumb', sql.VarChar, post.mediaThumb)
          .input('scheduledAt', sql.DateTime2, post.scheduledAt)
          .input('status', sql.VarChar, 'pending')
          .query('INSERT INTO Posts (page_id,content,media_type,media_links,media_thumb,scheduled_at,status,created_by_user_id) OUTPUT INSERTED.id VALUES (@pageId,@content,@mediaType,@mediaLinks,@mediaThumb,@scheduledAt,@status,@ownerId);');
        const postId = inserted.recordset[0].id;
        for (const comment of post.comments) {
          await new sql.Request(transaction)
            .input('postId', sql.Int, postId)
            .input('commentIndex', sql.Int, comment.commentIndex)
            .input('content', sql.NVarChar, comment.content)
            .input('delay', sql.Int, comment.delayMinutes)
            .input('mediaUrl', sql.VarChar, comment.mediaUrl)
            .query("INSERT INTO PostComments (post_id,comment_index,content,delay_minutes,media_url,status) VALUES (@postId,@commentIndex,@content,@delay,@mediaUrl,'pending');");
        }
        await transaction.commit();
        try {
          await addPostToQueue(postId, post.scheduledAt);
          createdIds.push(postId);
        } catch (error) {
          await pool.request().input('id', sql.Int, postId).query("UPDATE Posts SET status='failed' WHERE id=@id");
          errors.push({ row: post.rowIndex, message: error.message });
        }
      } catch (error) {
        await transaction.rollback().catch(() => {});
        errors.push({ row: post.rowIndex, message: error.message });
      }
    }
    return res.json({ success: errors.length === 0, data: createdIds, errors, message: `Đã xếp lịch ${createdIds.length}/${posts.length} bài.` });
  } catch (error) {
    console.error('[Bulk Upload Error]', error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
});

app.use((error, _req, res, _next) => {
  console.error('[Unhandled API Error]', error.message);
  return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
server.on('error', (error) => {
  console.error('[HTTP Server Error]', error.message);
  process.exitCode = 1;
});

module.exports = app;
