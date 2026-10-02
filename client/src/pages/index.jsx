import Link from 'next/link';
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Globe2,
  Layers3,
  PenSquare,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  ShieldCheck,
  FileSpreadsheet,
  Share2,
  LayoutDashboard,
  Flame,
  MessageCircle,
  BarChart3,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import BrandLogo from '../components/brand/BrandLogo';

export default function LandingPage() {
  return (
    <div className="so9-wrap">
      {/* Top Banner (SO9 style) */}
      <div className="so9-topbar">
        <div className="topbar-inner">
          <span className="topbar-badge">MỚI</span>
          <span>🔥 Hệ sinh thái Quản trị & Lên lịch đăng bài Fanpage tự động 100% — Tối ưu 80% thời gian</span>
          <Link href="/login" className="topbar-link">
            Trải nghiệm ngay →
          </Link>
        </div>
      </div>

      {/* Main Navbar (SO9 style) */}
      <header className="so9-header">
        <div className="header-inner">
          <BrandLogo size={42} subtitle="Hệ sinh thái Quản trị Fanpage" />
          <nav className="header-nav">
            <a href="#features" className="nav-link">Giải pháp</a>
            <a href="#channels" className="nav-link">Kênh kết nối</a>
            <a href="#workflow" className="nav-link">Lên lịch & Hàng đợi</a>
            <a href="#metrics" className="nav-link">Hiệu quả</a>
          </nav>
          <div className="header-actions">
            <Link href="/login" className="login-link">
              Đăng nhập
            </Link>
            <Link href="/login" className="so9-btn-primary">
              <Flame size={16} />
              <span>Dùng thử miễn phí</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (SO9 style) */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pill">
            <Flame size={15} color="#FF6B00" />
            <span>HỆ SINH THÁI QUẢN TRỊ MẠNG XÃ HỘI TOÀN DIỆN</span>
          </div>

          <h1 className="hero-title">
            Tối ưu hóa quản trị & <br />
            <span className="gradient-so9">Phân phối Fanpage</span> tự động hàng loạt.
          </h1>

          <p className="hero-subtitle">
            Hơn <strong>30.000+ Cá nhân, Doanh nghiệp & Agency</strong> tin dùng. Hẹn lịch đăng bài thông minh, đổi phông chữ Facebook nghệ thuật, chèn emoji & hashtag viral, tiết kiệm đến 80% thời gian vận hành.
          </p>

          <div className="hero-cta-group">
            <Link href="/login" className="so9-cta-btn">
              <span>Bắt đầu dùng thử miễn phí</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="so9-cta-outline">
              <LayoutDashboard size={18} />
              <span>Vào Workspace ngay</span>
            </Link>
          </div>

          <div className="hero-trust-bar">
            <div className="trust-item">
              <CheckCircle2 size={16} color="#36B37E" />
              <span>Meta Graph API v19.0 chính thức</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} color="#36B37E" />
              <span>Hàng đợi BullMQ phân phối đúng hẹn</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} color="#36B37E" />
              <span>Bảo mật HttpOnly & Không lo checkpoint</span>
            </div>
          </div>
        </div>

        {/* Live Dashboard Preview Mock (SO9 Style) */}
        <div className="hero-preview-wrap">
          <div className="so9-preview-card">
            <div className="preview-topbar">
              <div className="preview-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="preview-url-bar">
                <span>https://so9.workspace/facebook/post-planner</span>
              </div>
              <div className="live-status-pill">
                <span className="pulse-indicator" /> Đang hoạt động
              </div>
            </div>

            <div className="preview-body">
              <div className="mock-stat-cards">
                <div className="mock-card">
                  <div className="mock-label">Fanpage Đã Kết Nối</div>
                  <div className="mock-val">28 Kênh</div>
                  <div className="mock-trend green">● Hoạt động 100%</div>
                </div>
                <div className="mock-card">
                  <div className="mock-label">Bài Đăng Đang Chờ</div>
                  <div className="mock-val">142 Bài</div>
                  <div className="mock-trend orange">● Hàng đợi BullMQ</div>
                </div>
                <div className="mock-card">
                  <div className="mock-label">Tỷ Lệ Tương Tác</div>
                  <div className="mock-val">+248%</div>
                  <div className="mock-trend green">▲ Tăng trưởng tuần</div>
                </div>
              </div>

              <div className="mock-queue-panel">
                <div className="queue-title">
                  <strong>Lịch Xuất Bản Hôm Nay</strong>
                  <span>Hàng đợi tự động</span>
                </div>
                <div className="queue-items">
                  <div className="queue-row">
                    <span className="time-badge">14:30</span>
                    <span className="post-title">🔥 Khuyến Mãi Hè 2026 - Flash Sale Giảm 50%</span>
                    <span className="status-badge published">Đã xuất bản</span>
                  </div>
                  <div className="queue-row">
                    <span className="time-badge">18:00</span>
                    <span className="post-title">📚 Hướng dẫn chạy Ads tiết kiệm chi phí cho người mới</span>
                    <span className="status-badge queued">Đang chờ</span>
                  </div>
                  <div className="queue-row">
                    <span className="time-badge">20:30</span>
                    <span className="post-title">✨ Bộ sưu tập sản phẩm mới - Freeship toàn quốc</span>
                    <span className="status-badge queued">Đang chờ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms (SO9 Kênh Kết Nối) */}
      <section id="channels" className="channels-section">
        <p className="channels-heading">HỆ THỐNG KẾT NỐI VÀ ĐỒNG BỘ TOÀN DIỆN</p>
        <div className="channels-pill-list">
          <div className="channel-pill is-active">
            <span className="channel-icon fb">f</span>
            <span>Facebook Fanpage</span>
          </div>
          <div className="channel-pill">
            <span className="channel-icon ig">📸</span>
            <span>Instagram</span>
          </div>
          <div className="channel-pill">
            <span className="channel-icon tt">🎵</span>
            <span>TikTok</span>
          </div>
          <div className="channel-pill">
            <span className="channel-icon th">🧵</span>
            <span>Threads</span>
          </div>
          <div className="channel-pill">
            <span className="channel-icon zl">💬</span>
            <span>Zalo OA</span>
          </div>
          <div className="channel-pill">
            <span className="channel-icon yt">▶️</span>
            <span>YouTube</span>
          </div>
        </div>
      </section>

      {/* Features Grid (SO9 6 Tính Năng Sản Phẩm Đặc Trưng) */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="section-eyebrow">TÍNH NĂNG VƯỢT TRỘI CỦA SO9</div>
          <h2>Bộ công cụ giúp nhân x10 hiệu suất Marketing</h2>
          <p>Tất cả mọi giải pháp để bạn xây dựng và phát triển hệ thống kênh bán hàng tự động.</p>
        </div>

        <div className="features-grid">
          {/* Card 1: Cam SO9 */}
          <div className="so9-feature-card orange-card">
            <div className="card-icon-wrap" style={{ background: '#FFF4E5', color: '#FF8B00' }}>
              <CalendarRange size={26} />
            </div>
            <div className="card-tag" style={{ color: '#FF8B00' }}>PHÂN PHỐI NỘI DUNG</div>
            <h3>Hẹn Lịch Đăng Hàng Loạt, Đa Kênh</h3>
            <p>Lên kế hoạch đăng bài tự động trước nhiều tuần cho hàng chục Fanpage với độ chính xác từng phút.</p>
          </div>

          {/* Card 2: Xanh lá SO9 */}
          <div className="so9-feature-card green-card">
            <div className="card-icon-wrap" style={{ background: '#E3FCEF', color: '#36B37E' }}>
              <Sparkles size={26} />
            </div>
            <div className="card-tag" style={{ color: '#36B37E' }}>RICH POST EDITOR</div>
            <h3>Đổi Phông Chữ & Emoji Nghệ Thuật</h3>
            <p>Hỗ trợ in đậm, in nghiêng, gothic, bong bóng cùng kho emoji & hashtag viral thu hút tương tác gấp 3 lần.</p>
          </div>

          {/* Card 3: Đỏ cam SO9 */}
          <div className="so9-feature-card red-card">
            <div className="card-icon-wrap" style={{ background: '#FFEBE6', color: '#FF5230' }}>
              <BarChart3 size={26} />
            </div>
            <div className="card-tag" style={{ color: '#FF5230' }}>THEO DÕI HIỆU QUẢ</div>
            <h3>Báo Cáo Trực Quan Thời Gian Thực</h3>
            <p>Theo dõi tỷ lệ bài đăng thành công, lượt tiếp cận và phát hiện lỗi kết nối ngay tức thì.</p>
          </div>

          {/* Card 4: Xanh ngọc SO9 */}
          <div className="so9-feature-card cyan-card">
            <div className="card-icon-wrap" style={{ background: '#E6FCFF', color: '#00B8D9' }}>
              <FileSpreadsheet size={26} />
            </div>
            <div className="card-tag" style={{ color: '#00B8D9' }}>NHẬP HÀNG LOẠT</div>
            <h3>Đồng Bộ Qua File Excel Siêu Tốc</h3>
            <p>Tải lên hàng trăm bài viết, link video và hình ảnh cùng lúc chỉ với 1 bảng tính Excel chuẩn hóa.</p>
          </div>

          {/* Card 5: Tím SO9 */}
          <div className="so9-feature-card purple-card">
            <div className="card-icon-wrap" style={{ background: '#EAE6FF', color: '#4B38B3' }}>
              <Cpu size={26} />
            </div>
            <div className="card-tag" style={{ color: '#4B38B3' }}>AI STUDIO ENGINE</div>
            <h3>Viết Bài & Bắt Trend Bằng AI</h3>
            <p>Tạo tiêu đề hấp dẫn, gợi ý nội dung bán hàng và tự động tạo hashtag thu hút đối tượng mục tiêu.</p>
          </div>

          {/* Card 6: Xanh dương SO9 */}
          <div className="so9-feature-card blue-card">
            <div className="card-icon-wrap" style={{ background: '#DEEBFF', color: '#0052CC' }}>
              <Zap size={26} />
            </div>
            <div className="card-tag" style={{ color: '#0052CC' }}>TỰ ĐỘNG HÓA VẬN HÀNH</div>
            <h3>Hàng Đợi BullMQ Bền Vững 24/7</h3>
            <p>Cơ chế xử lý song song với Redis, tự động retry khi mạng chập chờn, phân phối an toàn tuyệt đối.</p>
          </div>
        </div>
      </section>

      {/* Metrics Banner (SO9 Thống kê ấn tượng) */}
      <section id="metrics" className="metrics-section">
        <div className="metrics-inner">
          <div className="metric-box">
            <div className="metric-num">30.000+</div>
            <div className="metric-desc">Cá nhân & Doanh nghiệp tin dùng</div>
          </div>
          <div className="metric-divider" />
          <div className="metric-box">
            <div className="metric-num">1.5M+</div>
            <div className="metric-desc">Bài viết xuất bản tự động</div>
          </div>
          <div className="metric-divider" />
          <div className="metric-box">
            <div className="metric-num">80%</div>
            <div className="metric-desc">Tiết kiệm thời gian vận hành</div>
          </div>
          <div className="metric-divider" />
          <div className="metric-box">
            <div className="metric-num">99.98%</div>
            <div className="metric-desc">Tỷ lệ phân phối đúng hẹn</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="so9-footer">
        <div className="footer-inner">
          <BrandLogo size={38} subtitle="Hệ sinh thái Quản trị Fanpage Pro" />
          <div className="footer-links">
            <Link href="/login">Đăng nhập</Link>
            <Link href="/post-planner/compose">Soạn bài viết</Link>
            <Link href="/channels">Kênh kết nối</Link>
            <Link href="/post-planner/list">Lịch đã lên</Link>
          </div>
          <div className="footer-meta">
            <span>© 2026 SO9 FB Automation Suite · Phát triển vì cộng đồng kinh doanh online.</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .so9-wrap {
          min-height: 100vh;
          background: #ffffff;
          color: #172B4D;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow-x: hidden;
        }

        /* Top Announcement Bar */
        .so9-topbar {
          background: #0B1B3D;
          color: #ffffff;
          padding: 8px 16px;
          font-size: 13px;
          text-align: center;
        }

        .topbar-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .topbar-badge {
          background: #FF6B00;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .topbar-link {
          color: #FFAB00;
          font-weight: 700;
          text-decoration: underline;
        }

        .topbar-link:hover {
          color: #ffffff;
        }

        /* Header Navbar */
        .so9-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #EBECF0;
          padding: 14px 24px;
        }

        .header-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          color: #42526E;
          font-size: 15px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #FF6B00;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .login-link {
          color: #172B4D;
          font-size: 14px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          transition: color 0.2s;
        }

        .login-link:hover {
          color: #FF6B00;
        }

        .so9-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(115deg, #FF8B00 0%, #FF5230 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 14px rgba(255, 107, 0, 0.35);
          transition: all 0.2s ease;
        }

        .so9-btn-primary:hover {
          background: linear-gradient(115deg, #FF7A00 0%, #E04020 100%);
          box-shadow: 0 6px 18px rgba(255, 107, 0, 0.45);
          transform: translateY(-1px);
        }

        /* Hero Section */
        .hero-section {
          max-width: 1240px;
          margin: 0 auto;
          padding: 60px 24px 70px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          align-items: center;
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFF4E5;
          border: 1px solid #FFE2BA;
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 800;
          color: #FF6B00;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }

        .hero-title {
          font-size: clamp(2.4rem, 4vw, 3.8rem);
          font-weight: 900;
          line-height: 1.15;
          color: #0B1B3D;
          letter-spacing: -0.03em;
          margin: 0 0 20px;
        }

        .gradient-so9 {
          background: linear-gradient(115deg, #FF8B00 0%, #FF5230 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 16px;
          line-height: 1.65;
          color: #5E6C84;
          margin: 0 0 32px;
          max-width: 560px;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .so9-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(115deg, #FF8B00 0%, #FF5230 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          padding: 15px 28px;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(255, 107, 0, 0.4);
          transition: all 0.2s ease;
        }

        .so9-cta-btn:hover {
          background: linear-gradient(115deg, #FF7A00 0%, #E04020 100%);
          box-shadow: 0 10px 28px rgba(255, 107, 0, 0.5);
          transform: translateY(-2px);
        }

        .so9-cta-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #DFE1E6;
          color: #172B4D;
          font-size: 15px;
          font-weight: 700;
          padding: 15px 24px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .so9-cta-outline:hover {
          background: #F4F5F7;
          border-color: #C1C7D0;
        }

        .hero-trust-bar {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6B778C;
          font-weight: 600;
        }

        /* Preview Card */
        .hero-preview-wrap {
          perspective: 1000px;
        }

        .so9-preview-card {
          background: #ffffff;
          border: 1px solid #EBECF0;
          border-radius: 18px;
          box-shadow: 0 20px 50px -10px rgba(9, 30, 66, 0.15), 0 0 1px 1px rgba(9, 30, 66, 0.05);
          overflow: hidden;
        }

        .preview-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
          background: #FAFBFC;
          border-bottom: 1px solid #EBECF0;
        }

        .preview-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-red { background: #FF5630; }
        .dot-yellow { background: #FFAB00; }
        .dot-green { background: #36B37E; }

        .preview-url-bar {
          flex: 1;
          background: #EBECF0;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11px;
          color: #6B778C;
          font-family: monospace;
          text-align: center;
        }

        .live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #36B37E;
          background: #E3FCEF;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .pulse-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #36B37E;
          box-shadow: 0 0 6px #36B37E;
        }

        .preview-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mock-stat-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .mock-card {
          background: #FAFBFC;
          border: 1px solid #EBECF0;
          border-radius: 12px;
          padding: 12px;
        }

        .mock-label {
          font-size: 11px;
          color: #6B778C;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .mock-val {
          font-size: 18px;
          font-weight: 900;
          color: #0B1B3D;
        }

        .mock-trend {
          font-size: 10px;
          font-weight: 700;
          margin-top: 4px;
        }

        .mock-trend.green { color: #36B37E; }
        .mock-trend.orange { color: #FF6B00; }

        .mock-queue-panel {
          background: #FAFBFC;
          border: 1px solid #EBECF0;
          border-radius: 12px;
          padding: 14px;
        }

        .queue-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .queue-title strong {
          color: #0B1B3D;
        }

        .queue-title span {
          color: #6B778C;
        }

        .queue-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .queue-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #EBECF0;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12px;
        }

        .time-badge {
          color: #FF6B00;
          font-family: monospace;
          font-weight: 700;
          font-size: 11px;
        }

        .post-title {
          flex: 1;
          color: #172B4D;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 600;
        }

        .status-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .status-badge.published {
          color: #36B37E;
          background: #E3FCEF;
        }

        .status-badge.queued {
          color: #FF6B00;
          background: #FFF4E5;
        }

        /* Supported Channels */
        .channels-section {
          max-width: 1240px;
          margin: 0 auto;
          padding: 24px;
          text-align: center;
        }

        .channels-heading {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #7A869A;
          margin-bottom: 20px;
        }

        .channels-pill-list {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .channel-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 999px;
          background: #F4F5F7;
          border: 1px solid #EBECF0;
          font-size: 13px;
          font-weight: 700;
          color: #42526E;
          transition: all 0.2s;
        }

        .channel-pill.is-active {
          background: #FFF4E5;
          border-color: #FFE2BA;
          color: #FF6B00;
        }

        .channel-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 900;
        }

        .channel-icon.fb { background: #1877F2; color: #fff; }

        /* Features Section */
        .features-section {
          max-width: 1240px;
          margin: 0 auto;
          padding: 70px 24px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .section-eyebrow {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.8px;
          color: #FF6B00;
          margin-bottom: 10px;
        }

        .section-header h2 {
          font-size: clamp(2rem, 3.2vw, 2.7rem);
          font-weight: 900;
          color: #0B1B3D;
          margin: 0 0 12px;
        }

        .section-header p {
          color: #5E6C84;
          font-size: 16px;
          margin: 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .so9-feature-card {
          background: #ffffff;
          border: 1px solid #EBECF0;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 16px rgba(9, 30, 66, 0.04);
          transition: all 0.25s ease;
        }

        .so9-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(9, 30, 66, 0.08);
          border-color: #DFE1E6;
        }

        .card-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
        }

        .card-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .so9-feature-card h3 {
          font-size: 18px;
          font-weight: 800;
          color: #0B1B3D;
          margin: 0 0 10px;
        }

        .so9-feature-card p {
          font-size: 14px;
          line-height: 1.6;
          color: #5E6C84;
          margin: 0;
        }

        /* Metrics Section */
        .metrics-section {
          background: #0B1B3D;
          color: #ffffff;
          padding: 50px 24px;
          margin: 40px 0;
        }

        .metrics-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
        }

        .metric-box {
          flex: 1;
          text-align: center;
          min-width: 180px;
        }

        .metric-num {
          font-size: clamp(2rem, 3.4vw, 3rem);
          font-weight: 900;
          color: #FF8B00;
          margin-bottom: 6px;
        }

        .metric-desc {
          font-size: 13px;
          color: #A5B2C6;
          font-weight: 600;
        }

        .metric-divider {
          width: 1px;
          height: 48px;
          background: rgba(255, 255, 255, 0.15);
        }

        /* Footer */
        .so9-footer {
          border-top: 1px solid #EBECF0;
          padding: 40px 24px;
          background: #FAFBFC;
        }

        .footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          color: #42526E;
          font-size: 14px;
          font-weight: 600;
        }

        .footer-links a:hover {
          color: #FF6B00;
        }

        .footer-meta {
          font-size: 13px;
          color: #7A869A;
        }

        @media (max-width: 960px) {
          .hero-section {
            grid-template-columns: 1fr;
            padding-top: 30px;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .header-nav {
            display: none;
          }
          .metric-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}