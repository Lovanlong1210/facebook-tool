import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CircleAlert,
  FileSpreadsheet,
  PenLine,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  UsersRound,
  Zap
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import useAuth from '../hooks/useAuth';
import postApi from '../services/postApi';

export default function DashboardHomePage() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, failed: 0 });
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([postApi.getStats(), postApi.getPostsList({ limit: 5 })])
      .then(([summary, result]) => {
        setStats(summary.stats || { total: 0, pending: 0, published: 0, failed: 0 });
        setPosts(result.posts || []);
      })
      .catch((requestError) => {
        const unauthorized = requestError?.response?.status === 401 || requestError?.response?.status === 403;
        if (unauthorized) {
          setStats({ total: 0, pending: 0, published: 0, failed: 0 });
          setPosts([]);
          return;
        }
        setError(requestError.response?.data?.message || 'Không thể tải dữ liệu bảng tin.');
      });
  }, []);

  const cards = [
    {
      label: 'Tổng bài đăng',
      value: stats.total,
      note: 'Trong workspace của bạn',
      icon: Send,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.1)',
      border: 'rgba(37, 99, 235, 0.2)'
    },
    {
      label: 'Đang chờ duyệt/đăng',
      value: stats.pending,
      note: 'Chờ tới thời điểm xuất bản',
      icon: CalendarDays,
      color: '#D97706',
      bg: 'rgba(217, 119, 6, 0.1)',
      border: 'rgba(217, 119, 6, 0.2)'
    },
    {
      label: 'Đã xuất bản',
      value: stats.published,
      note: 'Đã đăng thành công lên Facebook',
      icon: CheckCircle2,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)'
    },
    {
      label: 'Cần kiểm tra',
      value: stats.failed,
      note: 'Bài đăng gặp lỗi cần xử lý',
      icon: CircleAlert,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)'
    }
  ];

  return (
    <MainLayout title="Bảng điều khiển">
      {/* Banner chào mừng & Hành động nhanh */}
      <section className="home-banner animate-fade-up">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255, 107, 0, 0.2)', border: '1px solid rgba(255, 107, 0, 0.35)', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, color: '#FF9E4A', marginBottom: 10 }}>
            <Sparkles size={13} />
            <span>Nền tảng Tự động hóa Fanpage Đa Kênh</span>
          </div>
          <h2>Chào mừng trở lại, {user?.name || 'Bạn'}! 👋</h2>
          <p>Lên kế hoạch, tạo nội dung với AI Gemini và quản lý hàng loạt Fanpage Facebook dễ dàng.</p>
        </div>
        <div className="home-banner-actions">
          <Link
            href="/post-planner/compose"
            className="button button-primary"
            style={{ textDecoration: 'none' }}
          >
            <PenLine size={16} /> Soạn bài viết mới
          </Link>
          <Link
            href="/post-planner/bulk-upload"
            className="button button-secondary"
            style={{ textDecoration: 'none', background: 'rgba(255, 255, 255, 0.12)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.25)' }}
          >
            <FileSpreadsheet size={16} /> Tải tệp Excel
          </Link>
          <Link
            href="/ai-studio"
            className="button"
            style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' }}
          >
            <Zap size={15} /> AI Studio
          </Link>
        </div>
      </section>

      {/* Grid thẻ thống kê số liệu */}
      <section className="metric-grid">
        {cards.map(({ label, value, note, icon: Icon, color, bg, border }, idx) => (
          <article
            className={`panel metric-card card-interactive animate-fade-up delay-${idx + 1}`}
            key={label}
            style={{
              borderTop: `3px solid ${color}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="metric-label">{label}</span>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'grid', placeItems: 'center', color }}>
                  <Icon size={17} strokeWidth={2.2} />
                </div>
              </div>
              <div className="metric-value">{value}</div>
            </div>
            <div className="metric-foot" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
              <TrendingUp size={12} color="#10B981" />
              <span>{note}</span>
            </div>
          </article>
        ))}
      </section>

      {error && <div className="notice animate-fade-scale" style={{ marginBottom: 16 }}>{error}</div>}
      {!isAuthenticated && (
        <div className="notice animate-fade-scale" style={{ marginBottom: 16 }}>
          Bạn đang ở chế độ xem trước. Hãy đăng nhập để mở khóa đầy đủ quyền đăng bài và đồng bộ Fanpage.
        </div>
      )}

      {/* Hai cột: Bài đăng gần đây & Lối tắt */}
      <div className="home-columns">
        <section className="panel animate-fade-up delay-2">
          <div className="panel-heading">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={17} color="#FF6B00" />
              <span>Bài đăng gần đây</span>
            </h2>
            <Link className="button button-secondary" href="/post-planner/list" style={{ textDecoration: 'none', fontSize: 12, padding: '0 12px', minHeight: 32 }}>
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>
          <div className="panel-body" style={{ padding: '8px 16px' }}>
            {posts.length ? (
              posts.map((post) => (
                <div className="post-row" key={post.id}>
                  <div>
                    <strong>{post.content || 'Nội dung hình ảnh / video'}</strong>
                    <small>
                      Mã #{post.id} · {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString('vi-VN') : 'Đăng ngay'}
                      {post.page_name && ` · Trang: ${post.page_name}`}
                    </small>
                  </div>
                  <span className={`status-pill ${post.status || 'pending'}`}>
                    {post.status === 'published' ? 'Đã đăng' : post.status === 'failed' ? 'Lỗi đăng' : post.status === 'publishing' ? 'Đang gửi' : 'Chờ đăng'}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p style={{ margin: '0 0 10px', fontSize: 14 }}>Chưa có bài đăng nào trong hàng đợi.</p>
                <Link href="/post-planner/compose" className="button button-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                  <PenLine size={14} /> Soạn bài viết đầu tiên ngay
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="panel animate-fade-up delay-3">
          <div className="panel-heading">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={17} color="#FF6B00" />
              <span>Truy cập nhanh</span>
            </h2>
          </div>
          <div className="panel-body quick-links">
            <Link className="quick-link" href="/post-planner/calendar">
              <span className="quick-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
                <CalendarDays size={18} />
              </span>
              <span>
                <strong>Lịch xuất bản</strong>
                <small>Xem lịch trực quan theo ngày/tháng</small>
              </span>
            </Link>

            <Link className="quick-link" href="/ai-studio">
              <span className="quick-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                <Sparkles size={18} />
              </span>
              <span>
                <strong>AI Studio</strong>
                <small>Sáng tạo bài viết với Gemini AI</small>
              </span>
            </Link>

            <Link className="quick-link" href="/channels">
              <span className="quick-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <UsersRound size={18} />
              </span>
              <span>
                <strong>Kênh Fanpage</strong>
                <small>Quản lý các trang Facebook</small>
              </span>
            </Link>

            <Link className="quick-link" href="/post-planner/bulk-upload">
              <span className="quick-icon" style={{ background: 'rgba(255, 107, 0, 0.1)', color: '#FF6B00' }}>
                <FileSpreadsheet size={18} />
              </span>
              <span>
                <strong>Nhập file Excel</strong>
                <small>Lên lịch hàng loạt bài đăng</small>
              </span>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

