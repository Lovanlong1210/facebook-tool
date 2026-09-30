const { Worker } = require('bullmq');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const { sql, getPool, redisConfig } = require('../config/db');
const { addCommentToQueue } = require('./comment.queue');
const { getFacebookPageAccessToken } = require('../src/utils/FacebookPageAccessToken');

async function publishMedia({ pageId, mediaType, mediaLink, content, token, graphVersion }) {
  const isLocalUpload = typeof mediaLink === 'string' && mediaLink.startsWith('local://');
  const endpoint = mediaType === 'video' ? 'videos' : 'photos';
  const url = `https://graph.facebook.com/${graphVersion}/${pageId}/${endpoint}`;
  const captionKey = mediaType === 'video' ? 'description' : 'caption';

  if (isLocalUpload) {
    const fileName = mediaLink.slice('local://'.length);
    if (path.basename(fileName) !== fileName || !/^[a-f0-9-]+\.[a-z0-9]+$/i.test(fileName)) {
      throw new Error('Đường dẫn media nội bộ không hợp lệ.');
    }
    const filePath = path.resolve(__dirname, '../uploads', fileName);
    const fileBuffer = await fs.readFile(filePath);
    const formData = new FormData();
    formData.append('source', new Blob([fileBuffer]), fileName);
    formData.append(captionKey, content);
    formData.append('access_token', token);
    return axios.post(url, formData, { timeout: mediaType === 'video' ? 180000 : 60000 });
  }

  return axios.post(url, {
    [captionKey]: content,
    [mediaType === 'video' ? 'file_url' : 'url']: mediaLink,
    access_token: token
  }, { timeout: mediaType === 'video' ? 180000 : 60000 });
}

const postWorker = new Worker(
  'post-publishing-queue',
  async (job) => {
    const { postId } = job.data;
    console.log(`🚀 [Job #${job.id}] Bắt đầu xử lý Post ID: ${postId}`);

    const pool = await getPool();

    // 1. Lấy thông tin bài viết từ SQL Server
    const postQuery = await pool.request()
      .input('id', sql.Int, postId)
      .query('SELECT * FROM Posts WHERE id = @id');

    const post = postQuery.recordset[0];
    if (!post) {
      throw new Error(`Không tìm thấy bài viết ID #${postId} trong SQL Server!`);
    }

    const claimResult = await pool.request()
      .input('id', sql.Int, postId)
      .query("UPDATE Posts SET status = 'publishing' OUTPUT INSERTED.id WHERE id = @id AND status = 'pending'");
    if (claimResult.recordset.length === 0) return;

    try {
      const pageId = post.page_id;
      const pageAccessToken = await getFacebookPageAccessToken(pageId);
      const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';

      let fbPostId = '';
      let mediaLinks = [];
      if (post.media_links) {
        try {
          const parsedLinks = JSON.parse(post.media_links);
          mediaLinks = Array.isArray(parsedLinks) ? parsedLinks : [parsedLinks];
        } catch {
          mediaLinks = String(post.media_links).split(',').map((link) => link.trim()).filter(Boolean);
        }
      }

      if (post.media_type === 'image') {
        const mediaUrl = mediaLinks[0];
        if (!mediaUrl) throw new Error('Bài đăng ảnh chưa có đường dẫn media.');
        const response = await publishMedia({ pageId, mediaType: 'image', mediaLink: mediaUrl, content: post.content, token: pageAccessToken, graphVersion });
        fbPostId = response.data.post_id || response.data.id;
      } else if (post.media_type === 'video') {
        const mediaUrl = mediaLinks[0];
        if (!mediaUrl) throw new Error('Bài đăng video chưa có đường dẫn media.');
        const response = await publishMedia({ pageId, mediaType: 'video', mediaLink: mediaUrl, content: post.content, token: pageAccessToken, graphVersion });
        fbPostId = response.data.id;
      } else {
        // Đăng bài dạng Text thuần túy
        const response = await axios.post(
          `https://graph.facebook.com/${graphVersion}/${pageId}/feed`,
          {
            message: post.content,
            access_token: pageAccessToken,
          }
        );
        fbPostId = response.data.id;
      }

      console.log(`✅ [FB SUCCESS] Đăng bài thành công lên Facebook! ID: ${fbPostId}`);

      // 4. Cập nhật trạng thái 'published' và lưu fbPostId vào SQL Server
      await pool.request()
        .input('id', sql.Int, postId)
        .input('fbId', sql.NVarChar, fbPostId)
        .query("UPDATE Posts SET status = 'published', facebook_post_id = @fbId WHERE id = @id");

      for (const mediaLink of mediaLinks) {
        if (typeof mediaLink !== 'string' || !mediaLink.startsWith('local://')) continue;
        const fileName = mediaLink.slice('local://'.length);
        if (path.basename(fileName) === fileName && /^[a-f0-9-]+\.[a-z0-9]+$/i.test(fileName)) {
          await fs.unlink(path.resolve(__dirname, '../uploads', fileName)).catch(() => {});
        }
      }

      // Schedule comments relative to the successful post time.
      const commentQuery = await pool.request()
        .input('postId', sql.Int, postId)
        .query("SELECT id, delay_minutes FROM PostComments WHERE post_id = @postId AND status = 'pending'");

      for (const comment of commentQuery.recordset) {
        try {
          await addCommentToQueue(comment.id, comment.delay_minutes || 0);
        } catch (commentError) {
          console.error(`❌ Không thể lên lịch comment #${comment.id}:`, commentError.message);
        }
      }

    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.error(`❌ [FB ERROR] Đăng bài thất bại: ${errorMsg}`);

      // Cập nhật trạng thái 'failed' trong SQL Server
      await pool.request()
        .input('id', sql.Int, postId)
        .query("UPDATE Posts SET status = 'failed' WHERE id = @id");

      throw new Error(errorMsg);
    }
  },
  { connection: redisConfig }
);

postWorker.on('error', (error) => {
  console.error('[Post Worker Error]', error.message);
});

console.log('⚡ BullMQ Worker đã sẵn sàng lắng nghe Hàng chờ (Queue)...');