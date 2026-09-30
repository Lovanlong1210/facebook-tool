const axios = require('axios');
const { getStoredPageAccessToken } = require('./FacebookPageConnections');

const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';

async function getFacebookPageAccessToken(pageId) {
  const storedPageToken = await getStoredPageAccessToken(pageId);
  if (storedPageToken) return storedPageToken;

  const configuredToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!configuredToken) {
    throw new Error('Thiếu FACEBOOK_PAGE_ACCESS_TOKEN trong server/.env');
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