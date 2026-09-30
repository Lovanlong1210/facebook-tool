const { Worker } = require('bullmq');
const axios = require('axios');
const { sql, getPool, redisConfig } = require('../config/db');
const { getFacebookPageAccessToken } = require('../src/utils/FacebookPageAccessToken');

const commentWorker = new Worker(
  'comment-seeding-queue',
  async (job) => {
    const { commentId } = job.data;
    const pool = await getPool();
    const claimResult = await pool.request()
      .input('id', sql.Int, commentId)
      .query(`
        UPDATE commentRow
        SET status = 'posting'
        OUTPUT INSERTED.id
        FROM PostComments AS commentRow
        WHERE commentRow.id = @id AND commentRow.status = 'pending';
      `);

    if (claimResult.recordset.length === 0) return;

    try {
      const result = await pool.request()
        .input('id', sql.Int, commentId)
        .query(`
          SELECT commentRow.content, commentRow.media_url, postRow.facebook_post_id, postRow.page_id
          FROM PostComments AS commentRow
          INNER JOIN Posts AS postRow ON postRow.id = commentRow.post_id
          WHERE commentRow.id = @id;
        `);
      const comment = result.recordset[0];
      const pageAccessToken = comment
        ? await getFacebookPageAccessToken(comment.page_id)
        : null;
      if (!comment || !comment.facebook_post_id) {
        throw new Error(`Không tìm thấy bài đăng Facebook cho comment #${commentId}.`);
      }
      const graphVersion = process.env.FB_GRAPH_VERSION || 'v19.0';
      const payload = {
        message: comment.content,
        access_token: pageAccessToken
      };
      if (comment.media_url) payload.attachment_url = comment.media_url;

      await axios.post(
        `https://graph.facebook.com/${graphVersion}/${comment.facebook_post_id}/comments`,
        payload
      );
      await pool.request()
        .input('id', sql.Int, commentId)
        .query("UPDATE PostComments SET status = 'posted' WHERE id = @id");
    } catch (error) {
      await pool.request()
        .input('id', sql.Int, commentId)
        .query("UPDATE PostComments SET status = 'failed' WHERE id = @id");
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  },
  { connection: redisConfig }
);

commentWorker.on('error', (error) => {
  console.error('[Comment Worker Error]', error.message);
});

console.log('Comment worker is listening for scheduled comments.');