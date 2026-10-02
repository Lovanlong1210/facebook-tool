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
  getConnectedPages,
  addManualFacebookPage,
  removeConnectedPage
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
app.use(cors({
  origin: true,
  credentials: true
}));
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
      IF COL_LENGTH('dbo.Posts', 'error_message') IS NULL
        ALTER TABLE dbo.Posts ADD error_message nvarchar(max) NULL;
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
  // Chỉ dùng public_profile để tránh lỗi Invalid Scopes.
  // Các quyền pages_* cần được bật trước trong Facebook Developer Console.
  const configuredScopes = process.env.FACEBOOK_LOGIN_SCOPES || 'public_profile';
  authorizationUrl.searchParams.set('scope', configuredScopes);
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
    const fbError = error.response?.data?.error;
    const errorMsg = fbError?.message || error.message;
    console.error('[Facebook OAuth Error]', error.response?.data || error.response?.status || error.message);
    const reason = (errorMsg.includes('client secret') || fbError?.code === 1) ? 'invalid_client_secret' : 'oauth_failed';
    return res.redirect(`${clientOrigin()}/login?error=${reason}&msg=${encodeURIComponent(errorMsg)}`);
  }
});

app.post('/api/auth/logout', (_req, res) => {
  clearCookie(_req, res, SESSION_COOKIE);
  clearCookie(_req, res, OAUTH_STATE_COOKIE);
  return res.json({ success: true });
});

app.post('/api/auth/facebook-token', async (req, res) => {
  const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
  if (!token) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập Facebook Access Token hoặc Cookie của bạn.' });
  }

  // 1. Kiểm tra nếu người dùng dán Cookie Facebook (có chứa c_user)
  const cUserMatch = token.match(/c_user=([0-9]+)/);
  if (cUserMatch && !token.startsWith('EAA')) {
    const fbId = cUserMatch[1];
    const profile = { id: fbId, name: `FB Account (${fbId})` };
    saveFacebookUser(profile, token, 60 * 86400 * 60).catch(() => {});
    setCookie(req, res, SESSION_COOKIE, signSession(profile), SESSION_TTL_SECONDS);
    return res.json({
      success: true,
      user: profile,
      message: `Đăng nhập thành công từ Cookie Facebook (UID: ${fbId})`
    });
  }

  // 2. Nếu là Access Token Facebook
  try {
    const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
    const profileResponse = await axios.get(`https://graph.facebook.com/${graphVersion}/me`, {
      params: { fields: 'id,name,picture.type(large)', access_token: token },
      timeout: 6000
    });
    const profile = profileResponse.data;

    // Lưu user và đồng bộ pages ở background (không chặn kết quả trả về)
    saveFacebookUser(profile, token, 60 * 86400 * 60).catch((saveErr) => {
      console.warn('[Facebook Token Login] DB save warning:', saveErr.message);
    });

    syncFacebookPages(profile.id, token).catch((pageErr) => {
      console.warn('[Facebook Token Login] Page sync warning:', pageErr.message);
    });

    setCookie(req, res, SESSION_COOKIE, signSession(profile), SESSION_TTL_SECONDS);
    return res.json({
      success: true,
      user: {
        id: profile.id,
        name: profile.name,
        picture: profile.picture?.data?.url
      },
      message: `Kết nối thành công với tài khoản Facebook: ${profile.name}`
    });
  } catch (error) {
    console.error('[Facebook Token Login]', error.response?.data || error.message);
    const fbMsg = error.response?.data?.error?.message;
    return res.status(400).json({
      success: false,
      message: fbMsg
        ? `Lỗi từ Facebook: ${fbMsg}`
        : 'Mã Access Token không hợp lệ hoặc đã hết hạn. Bạn có thể chuyển qua tab "Đăng nhập Nhanh" để vào ngay lập tức.'
    });
  }
});

app.post('/api/auth/facebook-direct', async (req, res) => {
  const fbId = typeof req.body.id === 'string' ? req.body.id.trim() : '';
  const fbName = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!fbId || !fbName) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập Facebook ID và Tên của bạn.' });
  }

  const user = { id: fbId, name: fbName };
  saveFacebookUser(user, '', null).catch((err) => {
    console.warn('[Direct Login] DB save note:', err.message);
  });

  setCookie(req, res, SESSION_COOKIE, signSession(user), SESSION_TTL_SECONDS);
  return res.json({ success: true, user, message: `Đã kết nối tài khoản Facebook: ${fbName}` });
});

app.post('/api/auth/save-meta-config', (req, res) => {
  const appId = typeof req.body.appId === 'string' ? req.body.appId.trim() : '';
  const appSecret = typeof req.body.appSecret === 'string' ? req.body.appSecret.trim() : '';

  if (!appId || !/^\d+$/.test(appId)) {
    return res.status(400).json({ success: false, message: 'App ID phải là dãy số hợp lệ từ developers.facebook.com.' });
  }
  if (!appSecret || appSecret.length < 8) {
    return res.status(400).json({ success: false, message: 'App Secret không hợp lệ (chuỗi bí mật từ Meta developers).' });
  }

  process.env.FACEBOOK_APP_ID = appId;
  process.env.FACEBOOK_APP_SECRET = appSecret;

  try {
    const envPath = path.resolve(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/^FACEBOOK_APP_ID=.*/m, `FACEBOOK_APP_ID=${appId}`);
    envContent = envContent.replace(/^FACEBOOK_APP_SECRET=.*/m, `FACEBOOK_APP_SECRET=${appSecret}`);
    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (fsErr) {
    console.warn('[Save Meta Config] Warning updating .env file:', fsErr.message);
  }

  return res.json({
    success: true,
    message: 'Đã lưu App ID và Secret thành công! Bạn có thể sử dụng Meta Login ngay.'
  });
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
    let channels = [];
    if (userToken) {
      try {
        channels = await syncFacebookPages(req.user.sub, userToken);
      } catch (syncErr) {
        console.warn('[Facebook Page Sync Warning]', syncErr.message);
        channels = await getConnectedPages(req.user.sub);
      }
    } else {
      channels = await getConnectedPages(req.user.sub);
    }
    return res.json({ success: true, channels });
  } catch (error) {
    console.error('[Channels Error]', error.message);
    try {
      const fallbackPages = await getConnectedPages(req.user.sub);
      return res.json({ success: true, channels: fallbackPages });
    } catch {
      return res.json({ success: true, channels: [] });
    }
  }
});

app.post('/api/channels/sync', requireAuth, async (req, res) => {
  try {
    const userToken = await getStoredUserAccessToken(req.user.sub);
    if (!userToken) {
      const existing = await getConnectedPages(req.user.sub);
      return res.json({
        success: true,
        channels: existing,
        message: 'Tài khoản chưa có token Facebook trực tiếp. Đang hiển thị danh sách Page đã lưu.'
      });
    }
    const channels = await syncFacebookPages(req.user.sub, userToken);
    return res.json({
      success: true,
      channels,
      message: `Đồng bộ thành công ${channels.length} Fanpage từ Facebook.`
    });
  } catch (error) {
    console.error('[Channels Sync Error]', error.message);
    const existing = await getConnectedPages(req.user.sub).catch(() => []);
    return res.json({
      success: true,
      channels: existing,
      warning: 'Facebook chưa cấp quyền hoặc phiên đã hết hạn. Đang hiển thị kênh đã kết nối.'
    });
  }
});

app.post('/api/channels/add', requireAuth, async (req, res) => {
  const pageId = typeof req.body.pageId === 'string' ? req.body.pageId.trim() : '';
  const pageName = typeof req.body.pageName === 'string' ? req.body.pageName.trim() : '';
  const category = typeof req.body.category === 'string' ? req.body.category.trim() : '';
  const link = typeof req.body.link === 'string' ? req.body.link.trim() : '';
  const pageToken = typeof req.body.pageToken === 'string' ? req.body.pageToken.trim() : '';

  if (!pageId) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Page ID hoặc UID của Fanpage.' });
  }

  try {
    const page = await addManualFacebookPage(req.user.sub, {
      pageId,
      pageName: pageName || `Fanpage (${pageId})`,
      category: category || 'Fanpage Facebook',
      link: link || `https://facebook.com/${pageId}`,
      pageToken
    });
    return res.json({
      success: true,
      page,
      message: `Đã kết nối Fanpage "${page.name}" thành công!`
    });
  } catch (err) {
    console.error('[Add Channel Error]', err.message);
    return res.status(500).json({ success: false, message: 'Không thể thêm Fanpage. ' + err.message });
  }
});

app.delete('/api/channels/:pageId', requireAuth, async (req, res) => {
  const pageId = req.params.pageId;
  try {
    await removeConnectedPage(req.user.sub, pageId);
    return res.json({ success: true, message: 'Đã hủy kết nối Fanpage thành công.' });
  } catch (err) {
    console.error('[Delete Channel Error]', err.message);
    return res.status(500).json({ success: false, message: 'Không thể xóa Fanpage.' });
  }
});

// Cập nhật Page Access Token cho Fanpage đã kết nối
app.put('/api/channels/:pageId/token', requireAuth, async (req, res) => {
  const pageId = String(req.params.pageId || '').trim();
  let pageToken = typeof req.body.pageToken === 'string' ? req.body.pageToken.trim() : '';
  if (!pageToken || pageToken.length < 15) {
    return res.status(400).json({ success: false, message: 'Page Access Token không hợp lệ (chuỗi token Facebook bắt đầu bằng EAA... và dài trên 20 ký tự).' });
  }

  if (pageToken.includes('@') && pageToken.length < 40) {
    return res.status(400).json({
      success: false,
      message: 'Mã bạn vừa nhập giống mật khẩu cá nhân, KHÔNG PHẢI Access Token. Token Facebook là một chuỗi dài bắt đầu bằng EAA...'
    });
  }

  // Chặn nếu người dùng dán App Secret (chuỗi 32 ký tự hex) thay vì Page Access Token
  if (pageToken.length === 32 && /^[0-9a-fA-F]{32}$/.test(pageToken)) {
    return res.status(400).json({
      success: false,
      message: 'Chuỗi bạn vừa nhập là App Secret (Khóa bí mật ứng dụng Meta gồm 32 ký tự), KHÔNG PHẢI là Page Access Token! Page Access Token là mã dài trên 100 ký tự bắt đầu bằng EAA... lấy từ Graph API Explorer.'
    });
  }

  const configuredAppId = String(process.env.FACEBOOK_APP_ID || '').trim();
  if (configuredAppId && pageId === configuredAppId) {
    return res.status(400).json({
      success: false,
      message: `ID ${pageId} là Meta App ID (ID ứng dụng), không phải Fanpage. Bạn không thể gán token hay đăng bài lên App ID.`
    });
  }

  const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
  let verifiedPageName = '';

  // 1. Thử kiểm tra trực tiếp xem token có phải là Page Token hợp lệ không
  try {
    const testResponse = await axios.get(`https://graph.facebook.com/${graphVersion}/${pageId}`, {
      params: { fields: 'id,name', access_token: pageToken },
      timeout: 8000
    });
    verifiedPageName = testResponse.data.name;
    console.log(`[Token Verify] Token hợp lệ trực tiếp cho Fanpage: ${testResponse.data.name} (${testResponse.data.id})`);
  } catch (verifyErr) {
    // 2. Nếu không gọi trực tiếp được, kiểm tra xem có phải người dùng dán User Token không
    try {
      const meRes = await axios.get(`https://graph.facebook.com/${graphVersion}/me`, {
        params: { fields: 'id,name', access_token: pageToken },
        timeout: 8000
      });

      // Nếu là User Token, thử lấy Page Token từ /me/accounts
      const accountsRes = await axios.get(`https://graph.facebook.com/${graphVersion}/me/accounts`, {
        params: { fields: 'id,name,access_token', access_token: pageToken },
        timeout: 8000
      });

      const matchedAccount = (accountsRes.data.data || []).find((acc) => String(acc.id) === String(pageId));
      if (matchedAccount?.access_token) {
        pageToken = matchedAccount.access_token;
        verifiedPageName = matchedAccount.name;
        console.log(`[Token Verify] Đã tự động đổi sang Page Access Token cho Trang: ${matchedAccount.name}`);
      } else {
        // Kiểm tra quyền của User Token này để báo lỗi chính xác
        const permRes = await axios.get(`https://graph.facebook.com/${graphVersion}/me/permissions`, {
          params: { access_token: pageToken },
          timeout: 5000
        }).catch(() => ({ data: { data: [] } }));
        const grantedPerms = (permRes.data?.data || []).filter((p) => p.status === 'granted').map((p) => p.permission);

        return res.status(400).json({
          success: false,
          message: `Mã token bạn dán là User Token của tài khoản "${meRes.data.name}" và chỉ có quyền [${grantedPerms.join(', ') || 'public_profile'}]. Nó thiếu quyền quản lý Fanpage này. Trong Graph API Explorer, hãy bấm vào ô "User or Page" -> chọn trực tiếp Trang Facebook của bạn để copy Page Access Token!`
        });
      }
    } catch {
      const fbMsg = verifyErr.response?.data?.error?.message || verifyErr.message;
      return res.status(400).json({
        success: false,
        message: `Facebook từ chối token: "${fbMsg}". Vui lòng chọn Trang trong Graph API Explorer để lấy Page Access Token.`
      });
    }
  }

  try {
    const pages = await getConnectedPages(req.user.sub);
    const page = pages.find((p) => String(p.id) === String(pageId));
    await addManualFacebookPage(req.user.sub, {
      pageId,
      pageName: verifiedPageName || page?.name || ('Fanpage ' + pageId),
      category: page?.category || 'Bán hàng / Dịch vụ',
      link: page?.link || `https://facebook.com/${pageId}`,
      pageToken
    });
    return res.json({ success: true, message: `Đã cập nhật Page Access Token thành công cho Trang "${verifiedPageName || pageId}"!` });
  } catch (err) {
    console.error('[Update Token Error]', err.message);
    return res.status(500).json({ success: false, message: 'Không thể cập nhật token: ' + err.message });
  }
});

// Endpoint kiểm tra Token Facebook có hợp lệ không
app.post('/api/channels/verify-token', requireAuth, async (req, res) => {
  const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
  const pageId = typeof req.body.pageId === 'string' ? req.body.pageId.trim() : '';

  if (!token) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Access Token để kiểm tra.' });
  }

  if (token.includes('@') && token.length < 40) {
    return res.status(400).json({
      success: false,
      message: 'Mã bạn vừa nhập giống mật khẩu cá nhân, KHÔNG PHẢI Access Token. Token Facebook bắt đầu bằng EAA...'
    });
  }

  const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
  try {
    // 1. Kiểm tra /me chỉ với fields: 'id,name' (tránh lỗi nonexisting field category)
    const meRes = await axios.get(`https://graph.facebook.com/${graphVersion}/me`, {
      params: { fields: 'id,name', access_token: token },
      timeout: 8000
    });

    // 2. Nếu có pageId, thử kiểm tra xem token có quyền trên pageId không
    if (pageId) {
      try {
        const pageRes = await axios.get(`https://graph.facebook.com/${graphVersion}/${pageId}`, {
          params: { fields: 'id,name', access_token: token },
          timeout: 8000
        });
        return res.json({
          success: true,
          valid: true,
          message: `✅ Token hợp lệ cho Trang: "${pageRes.data.name}" (ID: ${pageRes.data.id})`
        });
      } catch (pageErr) {
        // Token không thể đọc pageId trực tiếp. Thử kiểm tra me/accounts
        try {
          const accRes = await axios.get(`https://graph.facebook.com/${graphVersion}/me/accounts`, {
            params: { fields: 'id,name,access_token', access_token: token },
            timeout: 8000
          });
          const match = (accRes.data.data || []).find((a) => String(a.id) === String(pageId));
          if (match) {
            return res.json({
              success: true,
              valid: true,
              message: `✅ Token tài khoản của bạn quản lý Trang: "${match.name}". Khi bấm "Lưu Token", hệ thống sẽ tự động gán token chuẩn!`
            });
          }
        } catch {}

        // Kiểm tra quyền để thông báo chính xác
        const permRes = await axios.get(`https://graph.facebook.com/${graphVersion}/me/permissions`, {
          params: { access_token: token },
          timeout: 5000
        }).catch(() => ({ data: { data: [] } }));
        const granted = (permRes.data?.data || []).filter((p) => p.status === 'granted').map((p) => p.permission);

        return res.status(400).json({
          success: false,
          valid: false,
          message: `Token này là User Token của "${meRes.data.name}" (quyền: ${granted.join(', ') || 'public_profile'}). Nó chưa có quyền trên Trang này. Trong Graph API Explorer, hãy chọn mục "User or Page" -> chọn Fanpage của bạn để copy Page Access Token!`
        });
      }
    }

    return res.json({
      success: true,
      valid: true,
      entity: meRes.data,
      message: `Token hợp lệ cho: ${meRes.data.name} (ID: ${meRes.data.id})`
    });
  } catch (err) {
    const fbMsg = err.response?.data?.error?.message || err.message;
    return res.status(400).json({
      success: false,
      valid: false,
      message: `Facebook báo lỗi: ${fbMsg}`
    });
  }
});

// Endpoint đồng bộ Fanpage bằng Token (từ Graph API Explorer)
app.post('/api/channels/sync-with-token', requireAuth, async (req, res) => {
  const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
  if (!token || token.length < 20) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập Token Facebook hợp lệ (chuỗi dài bắt đầu bằng EAA...).' });
  }

  const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  try {
    // 1. Kiểm tra loại token qua debug_token của Facebook
    let debugData = null;
    if (appId && appSecret) {
      try {
        const debugRes = await axios.get(`https://graph.facebook.com/${graphVersion}/debug_token`, {
          params: { input_token: token, access_token: `${appId}|${appSecret}` },
          timeout: 8000
        });
        debugData = debugRes.data?.data;
        console.log('[Sync With Token] debug_token:', debugData?.type, debugData?.profile_id);
      } catch (debugErr) {
        console.warn('[Sync With Token] debug_token warning:', debugErr.message);
      }
    }

    if (debugData && debugData.is_valid === false) {
      return res.status(400).json({
        success: false,
        message: 'Mã Token này không hợp lệ hoặc đã hết hạn. Vui lòng bấm "Generate Access Token" trong Graph API Explorer để tạo mã mới.'
      });
    }

    if (debugData && debugData.type === 'APP') {
      return res.status(400).json({
        success: false,
        message: 'Bạn đang chọn "App Token" (Mã ứng dụng), mã này không thể dùng để đăng bài lên Trang. Trong Graph API Explorer, tại ô "User or Page", vui lòng chọn Trang Facebook của bạn hoặc chọn "User Token"!'
      });
    }

    // 2. Nếu là PAGE TOKEN (xác định qua debug_token hoặc fallback)
    if (debugData && debugData.type === 'PAGE') {
      const pageId = String(debugData.profile_id);
      let pageName = `Fanpage ${pageId}`;
      let pageCategory = 'Doanh nghiệp / Cộng đồng';
      let pageLink = `https://facebook.com/${pageId}`;
      try {
        const pageInfo = await axios.get(`https://graph.facebook.com/${graphVersion}/${pageId}`, {
          params: { fields: 'name,category,link', access_token: token },
          timeout: 6000
        });
        if (pageInfo.data?.name) pageName = pageInfo.data.name;
        if (pageInfo.data?.category) pageCategory = pageInfo.data.category;
        if (pageInfo.data?.link) pageLink = pageInfo.data.link;
      } catch {}

      await addManualFacebookPage(req.user.sub, {
        pageId,
        pageName,
        category: pageCategory,
        link: pageLink,
        pageToken: token
      });
      const updated = await getConnectedPages(req.user.sub);
      return res.json({
        success: true,
        type: 'page',
        message: `Đã kết nối thành công Fanpage "${pageName}" với Page Access Token!`,
        channels: updated
      });
    }

    // 3. Nếu là USER TOKEN (hoặc không lấy được debug_token), gọi /me
    const meRes = await axios.get(`https://graph.facebook.com/${graphVersion}/me`, {
      params: { fields: 'id,name', access_token: token },
      timeout: 8000
    });

    // Thử lấy danh sách Trang từ /me/accounts
    const accountsRes = await axios.get(`https://graph.facebook.com/${graphVersion}/me/accounts`, {
      params: { fields: 'id,name,category,link,access_token,tasks', limit: 100, access_token: token },
      timeout: 15000
    });

    const pages = accountsRes.data.data || [];
    if (pages.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Token của "${meRes.data.name}" không tìm thấy Fanpage nào. Trong Graph API Explorer, bạn hãy bấm vào ô "User or Page", chọn trực tiếp Trang Facebook của bạn ở mục Page Access Tokens!`
      });
    }

    // Đồng bộ vào DB
    const updated = await syncFacebookPages(req.user.sub, token);
    return res.json({
      success: true,
      type: 'user',
      message: `Đã đồng bộ thành công ${pages.length} Fanpage với đầy đủ Page Token!`,
      channels: updated
    });
  } catch (err) {
    console.error('[Sync With Token Error]', err.response?.data || err.message);
    const fbMsg = err.response?.data?.error?.message || err.message;
    return res.status(400).json({
      success: false,
      message: `Lỗi từ Facebook: ${fbMsg}`
    });
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

app.get('/api/reports/workspace', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const ownerFilter = req.user.role === 'admin' ? '' : ' WHERE created_by_user_id = @ownerId';
    const request = pool.request();
    if (req.user.role !== 'admin') request.input('ownerId', sql.VarChar(64), req.user.sub);

    const query = `
      SELECT id, status, media_links, page_id, created_by_user_id
      FROM Posts
      ${ownerFilter}
    `;
    const result = await request.query(query);
    const posts = result.recordset || [];

    const contentTypes = { text: 0, image: 0, video: 0 };
    const channelMap = new Map();

    posts.forEach((p) => {
      let media = [];
      try {
        media = typeof p.media_links === 'string' ? JSON.parse(p.media_links) : (p.media_links || []);
      } catch {
        media = [];
      }

      if (!media.length) contentTypes.text++;
      else if (media.some((m) => String(m).match(/\.(mp4|mov|avi|webm)/i))) contentTypes.video++;
      else contentTypes.image++;

      const pid = p.page_id || 'default';
      const existing = channelMap.get(pid) || {
        pageId: pid,
        pageName: `Fanpage ${pid}`,
        total: 0,
        published: 0,
        pending: 0,
        failed: 0
      };
      existing.total++;
      if (p.status === 'published') existing.published++;
      else if (p.status === 'pending') existing.pending++;
      else if (p.status === 'failed') existing.failed++;
      channelMap.set(pid, existing);
    });

    return res.json({
      success: true,
      channels: Array.from(channelMap.values()),
      accounts: [
        {
          accountId: req.user.sub,
          accountName: req.user.name || 'Admin',
          total: posts.length,
          published: posts.filter((p) => p.status === 'published').length,
          contentTypes
        }
      ],
      contentTypes
    });
  } catch (error) {
    console.error('[Workspace Report Error]', error.message);
    return res.json({
      success: true,
      channels: [],
      accounts: [],
      contentTypes: { text: 0, image: 0, video: 0 }
    });
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

// Chỉnh sửa bài đăng (chỉ sửa khi bài ở trạng thái pending hoặc failed)
app.put('/api/posts/:postId', requireAuth, async (req, res) => {
  const postId = Number.parseInt(req.params.postId, 10);
  if (!Number.isSafeInteger(postId) || postId <= 0) return res.status(400).json({ success: false, message: 'ID bài đăng không hợp lệ.' });

  const { content, pageId, scheduledAt, mediaType } = req.body;
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung bài đăng không được để trống.' });
  }

  try {
    await ensurePostOwnershipSchema();
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, postId).query('SELECT * FROM Posts WHERE id=@id');
    const post = result.recordset[0];
    if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng.' });
    if (req.user.role !== 'admin' && post.created_by_user_id !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa bài đăng này.' });
    }
    if (post.status === 'published') {
      return res.status(409).json({ success: false, message: 'Bài viết đã xuất bản thành công lên Facebook, không thể chỉnh sửa lịch nữa.' });
    }

    const targetPageId = pageId ? String(pageId).trim() : post.page_id;
    const targetScheduledAt = scheduledAt ? new Date(scheduledAt) : (post.scheduled_at || new Date());
    const targetMediaType = mediaType || post.media_type || 'text';

    await pool.request()
      .input('id', sql.Int, postId)
      .input('pageId', sql.VarChar, targetPageId)
      .input('content', sql.NVarChar, content.trim())
      .input('scheduledAt', sql.DateTime2, targetScheduledAt)
      .input('mediaType', sql.VarChar, targetMediaType)
      .query(`
        UPDATE Posts
        SET page_id = @pageId,
            content = @content,
            scheduled_at = @scheduledAt,
            media_type = @mediaType,
            status = 'pending',
            error_message = NULL
        WHERE id = @id
      `);

    try {
      await addPostToQueue(postId, targetScheduledAt);
    } catch (queueErr) {
      console.warn('[Edit Post Queue Warning]', queueErr.message);
    }

    return res.json({ success: true, message: 'Đã cập nhật bài đăng thành công và đưa vào trạng thái chờ đăng!' });
  } catch (error) {
    console.error('[Edit Post Error]', error.message);
    return res.status(500).json({ success: false, message: 'Không thể cập nhật bài đăng: ' + error.message });
  }
});

// 1. Phân tích file Excel và trả về danh sách Preview để người dùng xem, sửa, xoá
app.post('/api/posts/parse-excel', requireAuth, memoryUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file Excel!' });
    const parsedPosts = parseBulkExcel(req.file.buffer);
    const connectedPages = await getConnectedPages(req.user.sub);
    const defaultPageId = connectedPages[0]?.id || '';
    const defaultPageName = connectedPages[0]?.name || 'Fanpage mặc định';

    const postsWithMeta = parsedPosts.map((post, idx) => {
      let page = connectedPages.find((p) => String(p.id) === String(post.pageId));
      if (!page && connectedPages.length > 0) page = connectedPages[0];
      return {
        tempId: 'draft_' + Date.now() + '_' + idx,
        rowIndex: post.rowIndex,
        pageId: page ? String(page.id) : (post.pageId || defaultPageId),
        pageName: page ? page.name : (post.pageId ? `Page ${post.pageId}` : defaultPageName),
        content: post.content || '',
        mediaType: post.mediaType || 'text',
        mediaLinks: Array.isArray(post.mediaLinks) ? post.mediaLinks : [],
        mediaThumb: post.mediaThumb || null,
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString() : new Date(Date.now() + 3600000).toISOString(),
        comments: (post.comments || []).map((c, cIdx) => ({
          commentIndex: c.commentIndex || cIdx + 1,
          content: c.content || '',
          delayMinutes: Number.isFinite(c.delayMinutes) ? c.delayMinutes : 0,
          mediaUrl: c.mediaUrl || null
        }))
      };
    });

    return res.json({
      success: true,
      total: postsWithMeta.length,
      posts: postsWithMeta,
      connectedPages: connectedPages.map((p) => ({ id: String(p.id), name: p.name }))
    });
  } catch (error) {
    console.error('[Parse Excel Error]', error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// 2. Xác nhận danh sách bài đã duyệt từ người dùng và chính thức xếp lịch
app.post('/api/posts/bulk-confirm', requireAuth, async (req, res) => {
  const { posts } = req.body;
  if (!Array.isArray(posts) || posts.length === 0) {
    return res.status(400).json({ success: false, message: 'Danh sách bài đăng rỗng.' });
  }

  try {
    await ensurePostOwnershipSchema();
    const pool = await getPool();
    const connectedPages = await getConnectedPages(req.user.sub);
    const connectedPageIds = new Set(connectedPages.map((page) => String(page.id)));
    const defaultPageId = connectedPages[0]?.id;

    const createdIds = [];
    const errors = [];

    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      const transaction = new sql.Transaction(pool);
      try {
        await transaction.begin();
        const pageId = String(post.pageId || defaultPageId || '');
        if (!connectedPageIds.has(pageId) && connectedPages.length > 0) {
          throw new Error(`Page ${pageId} chưa được kết nối.`);
        }
        const scheduledTime = post.scheduledAt ? new Date(post.scheduledAt) : new Date();

        const inserted = await new sql.Request(transaction)
          .input('pageId', sql.VarChar, pageId)
          .input('ownerId', sql.VarChar(64), req.user.sub)
          .input('content', sql.NVarChar, post.content || '')
          .input('mediaType', sql.VarChar, post.mediaType || 'text')
          .input('mediaLinks', sql.NVarChar, JSON.stringify(post.mediaLinks || []))
          .input('mediaThumb', sql.VarChar, post.mediaThumb || null)
          .input('scheduledAt', sql.DateTime2, scheduledTime)
          .input('status', sql.VarChar, 'pending')
          .query('INSERT INTO Posts (page_id,content,media_type,media_links,media_thumb,scheduled_at,status,created_by_user_id) OUTPUT INSERTED.id VALUES (@pageId,@content,@mediaType,@mediaLinks,@mediaThumb,@scheduledAt,@status,@ownerId);');

        const postId = inserted.recordset[0].id;

        if (Array.isArray(post.comments)) {
          for (const comment of post.comments) {
            if (!comment.content || !comment.content.trim()) continue;
            await new sql.Request(transaction)
              .input('postId', sql.Int, postId)
              .input('commentIndex', sql.Int, comment.commentIndex || 1)
              .input('content', sql.NVarChar, comment.content.trim())
              .input('delay', sql.Int, Number.parseInt(comment.delayMinutes, 10) || 0)
              .input('mediaUrl', sql.VarChar, comment.mediaUrl || null)
              .query("INSERT INTO PostComments (post_id,comment_index,content,delay_minutes,media_url,status) VALUES (@postId,@commentIndex,@content,@delay,@mediaUrl,'pending');");
          }
        }

        await transaction.commit();

        try {
          await addPostToQueue(postId, scheduledTime);
          createdIds.push(postId);
        } catch (queueErr) {
          await pool.request().input('id', sql.Int, postId).query("UPDATE Posts SET status='failed' WHERE id=@id");
          errors.push({ row: index + 1, message: queueErr.message });
        }
      } catch (err) {
        await transaction.rollback().catch(() => {});
        errors.push({ row: index + 1, message: err.message });
      }
    }

    return res.json({
      success: errors.length === 0,
      data: createdIds,
      errors,
      message: `Đã xác nhận và lên lịch thành công ${createdIds.length}/${posts.length} bài đăng.`
    });
  } catch (error) {
    console.error('[Bulk Confirm Error]', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi xác nhận: ' + error.message });
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
const server = app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  if (process.env.DISABLE_EMBEDDED_WORKER !== 'true') {
    try {
      require('../queues/post.worker');
      require('../queues/comment.worker');
      console.log('[Worker Engine] Đã kích hoạt Worker nền chạy cùng Backend!');
    } catch (workerErr) {
      console.warn('[Worker Engine Warning] Không thể khởi động worker nền:', workerErr.message);
    }
  }
});
server.on('error', (error) => {
  console.error('[HTTP Server Error]', error.message);
  process.exitCode = 1;
});

module.exports = app;
