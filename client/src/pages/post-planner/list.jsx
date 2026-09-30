import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import postApi from '../../services/postApi';
import channelApi from '../../services/channelApi';
import { CalendarClock, ChevronLeft, ChevronRight, RefreshCw, Send, Trash2 } from 'lucide-react';

export default function PostListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageIdFilter, setPageIdFilter] = useState('all');
  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await postApi.getPostsList({ page, limit: pageSize, status: statusFilter, pageId: pageIdFilter });
      setPosts(data.posts || data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Lỗi tải danh sách bài viết:", err);
      setError(err.response?.data?.message || 'Không thể kết nối tới Server API.');
    } finally {
      setLoading(false);
    }
  }, [page, pageIdFilter, pageSize, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    channelApi.list().then((result) => setChannels(result.channels || [])).catch(() => setChannels([]));
  }, []);

  // Hàm xử lý kích hoạt đăng ngay
  const handlePublishNow = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn đăng bài viết này lên Fanpage ngay lập tức?")) return;
    try {
      await postApi.triggerPostNow(id);
      alert("Đã gửi yêu cầu đăng bài vào Queue thành công!");
      fetchPosts();
    } catch (err) {
      alert("Lỗi khi đăng bài: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này khỏi hệ thống?')) return;
    try {
      await postApi.deletePost(id);
      if (posts.length === 1 && page > 1) setPage((current) => current - 1);
      else await fetchPosts();
    } catch (err) {
      alert('Lỗi khi xóa bài: ' + (err.response?.data?.message || err.message));
    }
  };

  // Trả về badge màu cho từng trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="status-pill published">Đã đăng</span>;
      case 'publishing':
        return <span className="status-pill publishing">Đang đăng</span>;
      case 'failed':
        return <span className="status-pill failed">Thất bại</span>;
      default:
        return <span className="status-pill pending">Chờ đăng</span>;
    }
  };

  return (
    <MainLayout title="Lịch đăng bài" actions={<button className="button button-secondary" onClick={fetchPosts} type="button"><RefreshCw size={15} /> Làm mới</button>}>
      <section className="panel">
        <div className="filter-bar">
          <div><strong>Danh sách bài đăng</strong><span className="muted"> · {total} mục</span></div>
          <div className="table-tools">
            <select className="field" style={{ width: 180 }} aria-label="Lọc trạng thái" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ đăng</option>
              <option value="publishing">Đang đăng</option>
              <option value="published">Đã đăng</option>
              <option value="failed">Thất bại</option>
            </select>
            <select className="field" style={{ width: 180 }} aria-label="Lọc Fanpage" value={pageIdFilter} onChange={(e) => { setPage(1); setPageIdFilter(e.target.value); }}>
              <option value="all">Tất cả Fanpage</option>
              {channels.map((channel) => <option value={channel.id} key={channel.id}>{channel.name}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="notice" style={{ margin: 14 }}>{error}</div>}
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Nội dung bài đăng</th><th>Kênh</th><th>Media</th><th>Lịch đăng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7"><div className="empty-state">Đang tải lịch đăng…</div></td></tr> : posts.length === 0 ? <tr><td colSpan="7"><div className="empty-state">Chưa có bài đăng phù hợp.</div></td></tr> : posts.map((post) => (
                <tr key={post.id}>
                  <td>#{post.id}</td>
                  <td><div className="table-content" title={post.content}>{post.content || 'Chưa có nội dung'}</div></td>
                  <td>{post.page_id || 'Fanpage'}</td>
                  <td>{post.media_type || 'text'}</td>
                  <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CalendarClock size={14} />{post.scheduled_at ? new Date(post.scheduled_at).toLocaleString('vi-VN') : 'Đăng ngay'}</span></td>
                  <td>{renderStatusBadge(post.status)}</td>
                  <td><div className="table-tools">
                    {['pending', 'failed'].includes(post.status) && <button className="button button-quiet" onClick={() => handlePublishNow(post.id)} type="button"><Send size={14} /> Đăng ngay</button>}
                    {['pending', 'failed'].includes(post.status) && <button className="button button-danger" onClick={() => handleDelete(post.id)} type="button" aria-label={`Xóa bài ${post.id}`}><Trash2 size={14} /></button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar">
          <span className="muted">Trang {page} / {Math.max(1, Math.ceil(total / pageSize))}</span>
          <div className="table-tools">
            <button className="button button-secondary" type="button" aria-label="Trang trước" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}><ChevronLeft size={15} /></button>
            <button className="button button-secondary" type="button" aria-label="Trang sau" onClick={() => setPage((current) => current + 1)} disabled={page >= Math.ceil(total / pageSize) || loading}><ChevronRight size={15} /></button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}