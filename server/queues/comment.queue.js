const { Queue } = require('bullmq');
const { redisConfig } = require('../config/db');

const commentQueue = new Queue('comment-seeding-queue', { connection: redisConfig });
commentQueue.on('error', (error) => {
  console.error('[Comment Queue Error]', error.message);
});

/**
 * Đẩy Sub-Job Auto Comment vào Queue đếm ngược
 */
async function addCommentToQueue(commentId, delayMinutes) {
  const delayMs = Math.max(0, delayMinutes * 60 * 1000);

  await commentQueue.add(
    'publish_comment_job',
    { commentId },
    { jobId: `comment-${commentId}`, delay: delayMs, removeOnComplete: true }
  );

  console.log(`[Queue Comment] Đã lên lịch Auto Comment ID: ${commentId} sau ${delayMinutes} phút`);
}

module.exports = { commentQueue, addCommentToQueue };