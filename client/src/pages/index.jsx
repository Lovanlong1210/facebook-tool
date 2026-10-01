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
  LayoutDashboard
} from 'lucide-react';
import BrandLogo from '../components/brand/BrandLogo';

export default function LandingPage() {
  return (
    <div className="landing-wrap">
      {/* Background visual effects */}
      <div className="landing-glow glow-top" />
      <div className="landing-glow glow-center" />
      <div className="landing-grid-bg" />

      {/* Navigation Header */}
      <header className="landing-header">
        <div className="header-inner">
          <BrandLogo size={42} subtitle="Automation Suite" />
          <nav className="header-nav">
            <a href="#features" className="nav-link">Tính năng</a>
            <a href="#workflow" className="nav-link">Quy trình</a>
            <a href="#metrics" className="nav-link">Hiệu suất</a>
          </nav>
          <div className="header-actions">
            <Link href="/login" className="login-btn">
              Đăng nhập
            </Link>
            <Link href="/login" className="start-btn">
              <span>Bắt đầu ngay</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>AI-Driven Fanpage Publisher v2.0</span>
          </div>

          <h1 className="hero-title">
            Quản trị & Phân phối <br />
            <span className="gradient-text">Fanpage Tự Động</span> Đỉnh Cao
          </h1>

          <p className="hero-subtitle">
            Giải pháp chuyên nghiệp dành cho đội ngũ Marketing & Doanh nghiệp. Tự động hóa lên lịch đăng bài, đồng bộ hàng loạt Fanpage qua Facebook Graph API và phân tích hiệu suất thời gian thực.
          </p>

          <div className="hero-cta-group">
            <Link href="/login" className="primary-cta-btn">
              <span>Đăng nhập với Facebook</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="secondary-cta-btn">
              <LayoutDashboard size={18} />
              <span>Vào Workspace</span>
            </Link>
          </div>

          <div className="hero-trust-bar">
            <div className="trust-item">
              <CheckCircle2 size={16} color="#10b981" />
              <span>Meta Graph API v19.0 Ready</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} color="#10b981" />
              <span>Bảo mật Cookie HttpOnly</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} color="#10b981" />
              <span>1-Click Facebook Connect</span>
            </div>
          </div>
        </div>

        {/* Live Dashboard Preview Mock */}
        <div className="hero-preview-wrap">
          <div className="hero-preview-card">
            <div className="preview-topbar">
              <div className="preview-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="preview-url-bar">
                <span>https://facebook-tool.workspace/dashboard</span>
              </div>
              <div className="live-status-pill">
                <span className="pulse-indicator" /> Live
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
                  <div className="mock-trend blue">● Hàng đợi BullMQ</div>
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
                  <span>3 bài tiếp theo</span>
                </div>
                <div className="queue-items">
                  <div className="queue-row">
                    <span className="time-badge">14:30</span>
                    <span className="post-title">Chiến dịch Mùa Hè 2026 - Video Review</span>
                    <span className="status-badge published">Đã xuất bản</span>
                  </div>
                  <div className="queue-row">
                    <span className="time-badge">18:00</span>
                    <span className="post-title">Infographic Hướng dẫn tối ưu chi phí Ads</span>
                    <span className="status-badge queued">Đang chờ</span>
                  </div>
                  <div className="queue-row">
                    <span className="time-badge">20:30</span>
                    <span className="post-title">Bộ sưu tập hình ảnh sự kiện ra mắt sản phẩm</span>
                    <span className="status-badge queued">Đang chờ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <div className="section-header">
          <div className="section-eyebrow">TÍNH NĂNG VƯỢT TRỘI</div>
          <h2>Công cụ mạnh mẽ để phát triển Fanpage</h2>
          <p>Tất cả mọi thứ bạn cần để mở rộng quy mô xuất bản trên nền tảng Facebook.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="card-icon-wrap icon-blue">
              <CalendarRange size={24} />
            </div>
            <h3>Lên Lịch Tự Động Hàng Loạt</h3>
            <p>Thiết lập lịch đăng bài định kỳ cho hàng chục Fanpage cùng lúc với độ chính xác từng giây.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon-wrap icon-cyan">
              <FileSpreadsheet size={24} />
            </div>
            <h3>Nhập Dữ Liệu Qua Excel</h3>
            <p>Nhập hàng trăm bài viết, link media và chú thích cùng lúc từ bảng tính Excel chuẩn hóa.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon-wrap icon-purple">
              <Cpu size={24} />
            </div>
            <h3>AI Content Studio</h3>
            <p>Tạo tiêu đề hấp dẫn, nội dung quảng cáo và bộ hashtag chuẩn viral với trợ lý AI tích hợp sẵn.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon-wrap icon-amber">
              <TrendingUp size={24} />
            </div>
            <h3>Theo Dõi & Tối Ưu</h3>
            <p>Giám sát tiến trình hàng đợi BullMQ, tỷ lệ xuất bản thành công và phát hiện lỗi tự động.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <BrandLogo size={36} subtitle="Facebook Tool Workspace" />
          <div className="footer-meta">
            <span>© 2026 Facebook Tool Pro · Bản quyền thuộc về bạn.</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .landing-wrap {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          position: relative;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .landing-grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .landing-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
        }

        .glow-top {
          width: 700px;
          height: 480px;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(56, 189, 248, 0.06) 60%, transparent 80%);
        }

        .glow-center {
          width: 600px;
          height: 600px;
          bottom: 20%;
          right: -100px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
        }

        /* Header */
        .landing-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.9);
          padding: 16px 24px;
        }

        .header-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-link {
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #1d4ed8;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .login-btn {
          color: #334155;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .login-btn:hover {
          color: #1d4ed8;
          background: rgba(37, 99, 235, 0.06);
        }

        .start-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #1877f2 0%, #2563eb 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
          transition: all 0.2s;
        }

        .start-btn:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          transform: translateY(-1px);
        }

        /* Hero */
        .hero-section {
          max-width: 1240px;
          margin: 0 auto;
          padding: 64px 24px 80px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 48px;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #1d4ed8;
          margin-bottom: 24px;
        }

        .sparkle-icon {
          color: #2563eb;
        }

        .hero-title {
          font-size: clamp(2.6rem, 4.5vw, 4.2rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #0f172a;
          margin: 0 0 20px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #1877f2 0%, #0284c7 50%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 17px;
          line-height: 1.65;
          color: #475569;
          margin: 0 0 32px;
          max-width: 540px;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .primary-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #1877f2 0%, #2563eb 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          padding: 14px 26px;
          border-radius: 12px;
          box-shadow: 0 8px 24px -4px rgba(37, 99, 235, 0.4);
          transition: all 0.2s;
        }

        .primary-cta-btn:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 12px 28px -4px rgba(37, 99, 235, 0.5);
        }

        .secondary-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #1e293b;
          font-size: 15px;
          font-weight: 600;
          padding: 14px 24px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
        }

        .secondary-cta-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          transform: translateY(-1px);
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
          gap: 7px;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        /* Hero Preview Mock */
        .hero-preview-wrap {
          perspective: 1000px;
        }

        .hero-preview-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.02);
          overflow: hidden;
        }

        .preview-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
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

        .dot-red { background: #f87171; }
        .dot-yellow { background: #fbbf24; }
        .dot-green { background: #34d399; }

        .preview-url-bar {
          flex: 1;
          background: #edf2f7;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11px;
          color: #64748b;
          font-family: monospace;
          text-align: center;
        }

        .live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .pulse-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .preview-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #ffffff;
        }

        .mock-stat-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .mock-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
        }

        .mock-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .mock-val {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        .mock-trend {
          font-size: 10px;
          font-weight: 600;
          margin-top: 4px;
        }

        .mock-trend.green { color: #059669; }
        .mock-trend.blue { color: #2563eb; }

        .mock-queue-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
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
          color: #1e293b;
        }

        .queue-title span {
          color: #64748b;
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
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12px;
        }

        .time-badge {
          color: #2563eb;
          font-family: monospace;
          font-weight: 700;
          font-size: 11px;
        }

        .post-title {
          flex: 1;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .status-badge.published {
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .status-badge.queued {
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        /* Features */
        .features-section {
          max-width: 1240px;
          margin: 0 auto;
          padding: 80px 24px;
          border-top: 1px solid #e2e8f0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-eyebrow {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #2563eb;
          margin-bottom: 8px;
        }

        .section-header h2 {
          font-size: clamp(2rem, 3.2vw, 2.8rem);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px;
        }

        .section-header p {
          color: #475569;
          font-size: 16px;
          margin: 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .feature-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          transition: all 0.25s;
        }

        .feature-card:hover {
          border-color: #93c5fd;
          transform: translateY(-3px);
          box-shadow: 0 16px 36px -10px rgba(37, 99, 235, 0.12);
        }

        .card-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
        }

        .icon-blue { background: #eff6ff; color: #2563eb; }
        .icon-cyan { background: #ecfeff; color: #0891b2; }
        .icon-purple { background: #faf5ff; color: #9333ea; }
        .icon-amber { background: #fffbeb; color: #d97706; }

        .feature-card h3 {
          font-size: 17px;
          font-weight: 700;
          margin: 0 0 8px;
          color: #0f172a;
        }

        .feature-card p {
          font-size: 13px;
          line-height: 1.6;
          color: #64748b;
          margin: 0;
        }

        /* Footer */
        .landing-footer {
          border-top: 1px solid #e2e8f0;
          padding: 32px 24px;
          background: #ffffff;
        }

        .footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-meta {
          font-size: 13px;
          color: #64748b;
        }

        @media (max-width: 960px) {
          .hero-section {
            grid-template-columns: 1fr;
            padding-top: 40px;
          }
          .features-grid {
            grid-template-columns: 1fr 1fr;
          }
          .header-nav {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .mock-stat-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}