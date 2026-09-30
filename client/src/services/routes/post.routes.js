import express from 'express';
import { 
  bulkUpload, 
  getPostsList, 
  publishNow, 
  deletePost 
} from '../controllers/post.controller.js';

const router = express.Router();

// Lấy danh sách bài đăng: GET /api/posts
router.get('/', getPostsList);

// Upload Excel hàng loạt: POST /api/posts/bulk-upload
router.post('/bulk-upload', bulkUpload);

// Đăng ngay bài viết: POST /api/posts/:id/publish-now
router.post('/:id/publish-now', publishNow);

// Xóa bài viết: DELETE /api/posts/:id
router.delete('/:id', deletePost);

export default router;