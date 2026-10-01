const axios = require('axios');
const { getStoredPageAccessToken } = require('./FacebookPageConnections');

const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';

async function getFacebookPageAccessToken(pageId) {
  const storedPageToken = await getStoredPageAccessToken(pageId);
  if (storedPageToken && storedPageToken !== 'manual_page_token_placeholder') {
    if (storedPageToken.length === 32 && /^[0-9a-fA-F]{32}$/.test(storedPageToken)) {
      throw new Error(`Token của Trang [${pageId}] hiện đang là App Secret (32 ký tự), KHÔNG PHẢI Page Access Token. Vui lòng vào 'Kênh đã kết nối' dán mã Page Token bắt đầu bằng EAA...`);
    }
    return storedPageToken;
  }

  const configuredToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!configuredToken) {
    if (storedPageToken === 'manual_page_token_placeholder') {
      throw new Error(`Fanpage [${pageId}] chưa có Page Access Token hợp lệ (đang là token placeholder). Vui lòng vào 'Kênh đã kết nối' để cập nhật Page Access Token thật hoặc đồng bộ từ Facebook.`);
    }
    throw new Error('Thiếu FACEBOOK_PAGE_ACCESS_TOKEN trong server/.env hoặc token Fanpage');
  }

  const identityResponse = await axios.get(
    `https://graph.facebook.com/${graphVersion}/me`,
    { params: { fields: 'id', access_token: configuredToken } }
  );

  if (identityResponse.data.id === String(pageId)) {
    return configuredToken;
  }

  const accountsResponse = await axios.get(
    `https://graph.facebook.com/${graphVersion}/me/accounts`,
    {
      params: {
        fields: 'id,access_token',
        access_token: configuredToken
      }
    }
  );
  const page = (accountsResponse.data.data || []).find(
    (account) => account.id === String(pageId)
  );

  if (!page?.access_token) {
    throw new Error(`Không lấy được Page Access Token cho Fanpage ${pageId}.`);
  }

  return page.access_token;
}

module.exports = { getFacebookPageAccessToken };