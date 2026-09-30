module.exports = {
  apps: [
    {
      name: 'tool-face-backend',
      script: './server/src/app.js', // 👈 Đổi lại đúng file chạy Backend (index.js hoặc app.js)
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'tool-face-worker',
      script: './server/queues/post.worker.js',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'tool-face-comment-worker',
      script: './server/queues/comment.worker.js',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'tool-face-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: './client',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};