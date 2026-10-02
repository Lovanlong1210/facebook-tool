import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Send,
  X,
  Eye,
  Edit3
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import postApi from '../../services/postApi';

const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    postApi.getPostsList({ limit: 100 })
      .then((data) => setPosts(data.posts || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải lịch đăng.'));
  }, []);

  const cells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((offset + dayCount) / 7) * 7;
    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(year, month, index - offset + 1);
      return { date, inMonth: date.getMonth() === month };
    });
  }, [currentMonth]);

  const postsByDay = useMemo(() => posts.reduce((groups, post) => {
    if (!post.scheduled_at) return groups;
    const key = new Date(post.scheduled_at).toLocaleDateString('en-CA');
    groups[key] = [...(groups[key] || []), post];
    return groups;
  }, {}), [posts]);

  const shiftMonth = (amount) => setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1));
  const monthLabel = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <MainLayout
      title="Lịch xuất bản"
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/post-planner/list" className="button button-secondary" style={{ textDecoration: 'none' }}>
            <List size={15} /> Danh sách
          </Link>
          <Link href="/post-planner/compose" className="button button-primary" style={{ textDecoration: 'none' }}>
            <Plus size={15} /> Tạo bài
          </Link>
        </div>
      }
    >
      <section className="panel calendar-panel animate-fade-up">
        {/* Thanh điều hướng tháng & Lọc */}
        <div className="filter-bar">
          <div className="calendar-switch">
            <button className="segment-button is-selected" type="button">
              Lịch biểu tháng
            </button>
          </div>

          <div className="calendar-controls">
            <button
              className="icon-button"
              onClick={() => shiftMonth(-1)}
              type="button"
              aria-label="Tháng trước"
            >
              <ChevronLeft size={18} />
            </button>
            <strong>{monthLabel}</strong>
            <button
              className="icon-button"
              onClick={() => shiftMonth(1)}
              type="button"
              aria-label="Tháng sau"
            >
              <ChevronRight size={18} />
            </button>
            <button
              className="button button-secondary"
              onClick={() => setCurrentMonth(new Date())}
              type="button"
              style={{ fontSize: 12, padding: '0 12px', minHeight: 32 }}
            >
              Hôm nay
            </button>
          </div>
        </div>

        {error && <div className="notice" style={{ margin: 12 }}>{error}</div>}

        {/* Lưới lịch 7 cột */}
        <div className="calendar-grid">
          {weekdays.map((day) => (
            <div className="calendar-weekday" key={day}>
              {day}
            </div>
          ))}

          {cells.map(({ date, inMonth }, index) => {
            const key = date.toLocaleDateString('en-CA');
            const dayPosts = postsByDay[key] || [];
            const today = date.toDateString() === new Date().toDateString();

            return (
              <div
                className={`calendar-cell${inMonth ? '' : ' is-outside'}`}
                key={`${key}-${index}`}
              >
                <span className={`calendar-day${today ? ' is-today' : ''}`}>
                  {date.getDate()}
                </span>

                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    className={`calendar-event ${post.status || 'pending'}`}
                    key={post.id}
                    title={post.content || `Bài #${post.id}`}
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.content || `Bài #${post.id}`}
                  </div>
                ))}

                {dayPosts.length > 3 && (
                  <small
                    className="muted"
                    style={{ cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#FF6B00' }}
                    onClick={() => setSelectedPost(dayPosts[3])}
                  >
                    +{dayPosts.length - 3} bài khác
                  </small>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal xem nhanh chi tiết bài đăng khi click vào lịch */}
      {selectedPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 16
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="animate-fade-scale"
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 520,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Chi tiết bài đăng #{selectedPost.id}</span>
                <span className={`status-pill ${selectedPost.status || 'pending'}`}>
                  {selectedPost.status === 'published' ? 'Đã xuất bản' : selectedPost.status === 'failed' ? 'Thất bại' : 'Chờ đăng'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#64748B', display: 'grid', placeItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 16, maxHeight: 220, overflowY: 'auto', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {selectedPost.content || '(Bài đăng không có nội dung văn bản)'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#64748B', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color="#FF6B00" />
                <span>Thời gian: <strong>{selectedPost.scheduled_at ? new Date(selectedPost.scheduled_at).toLocaleString('vi-VN') : 'Đăng ngay'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={14} color="#2563EB" />
                <span>Trang Facebook: <strong>{selectedPost.page_name || selectedPost.page_id || 'Chưa chọn'}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setSelectedPost(null)}
              >
                Đóng
              </button>
              <Link
                href="/post-planner/list"
                className="button button-primary"
                style={{ textDecoration: 'none' }}
              >
                Quản lý trong danh sách
              </Link>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}