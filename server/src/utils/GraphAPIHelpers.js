const axios = require('axios');

/**
 * 1. Đăng bài viết Text
 */
async function publishTextPost(pageId, content, accessToken) {
  const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
  const res = await axios.post(url, {
    message: content,
    access_token: accessToken
  });
  return res.data.id;
}

/**
 * 2. Đăng 1 Ảnh hoặc Album Ảnh (Đã sửa truyền attached_media chuẩn JSON)
 */
async function publishPhotoPost(pageId, content, mediaLinks, accessToken) {
  if (!Array.isArray(mediaLinks) || mediaLinks.length === 0) {
    return await publishTextPost(pageId, content, accessToken);
  }

  // Nếu chỉ có 1 ảnh
  if (mediaLinks.length === 1) {
    const url = `https://graph.facebook.com/v19.0/${pageId}/photos`;
    const res = await axios.post(url, {
      url: mediaLinks[0],
      caption: content,
      access_token: accessToken
    });
    return res.data.post_id || res.data.id;
  }

  // Nếu là Album (> 1 ảnh): Upload ngầm từng ảnh (published=false)
  const attachedMedia = [];
  for (const link of mediaLinks) {
    const photoUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;
    const photoRes = await axios.post(photoUrl, {
      url: link,
      published: false,
      access_token: accessToken
    });
    attachedMedia.push({ media_fbid: photoRes.data.id });
  }

  // Đăng Album bài viết chứa các ảnh đã upload
  const feedUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
  const res = await axios.post(feedUrl, {
    message: content,
    attached_media: attachedMedia, // Graph API v19.0 nhận mảng object này
    access_token: accessToken
  });
  return res.data.id;
}

/**
 * 3. Đăng Video / Reels
 */
async function publishVideoPost(pageId, content, videoUrl, thumbUrl, accessToken) {
  const url = `https://graph.facebook.com/v19.0/${pageId}/videos`;
  const payload = {
    file_url: videoUrl,
    description: content,
    access_token: accessToken
  };

  if (thumbUrl) payload.thumb_url = thumbUrl;

  const res = await axios.post(url, payload);
  return res.data.id;
}

/**
 * 4. Seeding Comment
 */
async function publishComment(facebookPostId, content, mediaUrl, accessToken) {
  const url = `https://graph.facebook.com/v19.0/${facebookPostId}/comments`;
  const payload = {
    message: content,
    access_token: accessToken
  };

  if (mediaUrl) payload.attachment_url = mediaUrl;

  const res = await axios.post(url, payload);
  return res.data.id;
}

module.exports = {
  publishTextPost,
  publishPhotoPost,
  publishVideoPost,
  publishComment
};