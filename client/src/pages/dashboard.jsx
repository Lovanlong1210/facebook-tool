import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CircleAlert, FileSpreadsheet, PenLine, Send, Sparkles } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import postApi from '../services/postApi';

export default function DashboardHomePage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, failed: 0 });
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([postApi.getStats(), postApi.getPostsList({ limit: 5 })])
      .then(([summary, result]) => {
        setStats(summary.stats);
        setPosts(result.posts || []);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải dữ liệu bảng tin.'));
  }, []);

  const cards = [
    { label: 'Bài đăng', value: stats.total, note: 'Trong workspace của bạn', icon: Send },
    { label: 'Đang chờ', value: stats.pending, note: 'Chờ tới lịch đăng', icon: CalendarDays },
    { label: 'Đã xuất bản', value: stats.published, note: 'Đã đăng thành công', icon: PenLine },
    { label: 'Cần kiểm tra', value: stats.failed, note: 'Bài đăng thất bại', icon: CircleAlert }
  ];

  return (
    <MainLayout title="Bảng tin">
      <section className="home-banner">
        <div><h2>Không gian xuất bản của bạn</h2><p>Soạn, lên lịch và theo dõi nội dung trên các Fanpage đã kết nối.</p></div>
        <div className="home-banner-actions"><Link className="button button-primary" href="/post-planner/compose"><PenLine size={15} /> Viết bài</Link><Link className="button button-secondary" href="/post-planner/bulk-upload"><FileSpreadsheet size={15} /> Tải Excel</Link></div>
      </section>
      <section className="metric-grid">
        {cards.map(({ label, value, note, icon: Icon }) => <article className="panel metric-card" key={label}><div className="metric-label"><Icon size={16} />{label}</div><div className="metric-value">{value}</div><div className="metric-foot">{note}</div></article>)}
      </section>
      {error && <div className="notice" style={{ marginBottom: 14 }}>{error}</div>}
      <div className="home-columns">
        <section className="panel"><div className="panel-heading"><h2>Bài đăng gần đây</h2><Link className="button button-secondary" href="/post-planner/list">Xem tất cả</Link></div><div className="panel-body">
          {posts.length ? posts.map((post) => <div className="post-row" key={post.id}><div><strong>{post.content || 'Chưa có nội dung'}</strong><small>#{post.id} · {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString('vi-VN') : 'Chưa đặt lịch'}</small></div><span className={`status-pill ${post.status || 'pending'}`}>{post.status || 'pending'}</span></div>) : <div className="empty-state">Chưa có bài đăng gần đây.</div>}
        </div></section>
        <section className="panel"><div className="panel-heading"><h2>Truy cập nhanh</h2></div><div className="panel-body quick-links">
          <Link className="quick-link" href="/post-planner/calendar"><span className="quick-icon"><CalendarDays size={17} /></span><span><strong>Lịch đăng</strong><small>Xem bài theo ngày</small></span></Link>
          <Link className="quick-link" href="/ai-studio"><span className="quick-icon"><Sparkles size={17} /></span><span><strong>AI Studio</strong><small>Mở không gian sáng tạo</small></span></Link>
          <Link className="quick-link" href="/channels"><span className="quick-icon"><Send size={17} /></span><span><strong>Kênh đăng</strong><small>Quản lý Facebook Pages</small></span></Link>
          <Link className="quick-link" href="/post-planner/bulk-upload"><span className="quick-icon"><FileSpreadsheet size={17} /></span><span><strong>Tải hàng loạt</strong><small>Nhập lịch từ Excel</small></span></Link>
        </div></section>
      </div>
    </MainLayout>
  );
}
