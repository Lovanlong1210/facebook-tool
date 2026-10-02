import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Calendar,
  Share2,
  LayoutDashboard,
  Zap,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Clock,
  Type,
  Smile,
  Hash,
  Eye,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';
import BrandLogo from '../components/brand/BrandLogo';

export default function LandingPage() {
  const [demoFont, setDemoFont] = useState('bold');
  const [demoText, setDemoText] = useState('Khuyến Mãi Hè 2026 - Giảm 50% Toàn Bộ Sản Phẩm');

  const getFontPreview = (text, type) => {
    if (type === 'bold') return '𝗞𝗵𝘂𝘆𝗲̂́𝗻 𝗠𝗮̃𝗶 𝗛𝗲̀ 𝟮𝟬𝟮𝟲 - 𝗚𝗶𝗮̉𝗺 𝟱𝟬% 𝗧𝗼𝗮̀𝗻 𝗕𝗼̣̂ 𝗦𝗮̉𝗻 𝗣𝗵𝗮̂̉𝗺';
    if (type === 'italic') return '𝘒𝘩𝘶𝘺𝘦̂́𝘯 𝘔𝘢̃𝘪 𝘏𝘦̀ 2026 - 𝘎𝘪𝘢̉𝘮 50% 𝘛𝘰𝘢̀𝘯 𝘉𝘰̣̂ 𝘚𝘢̉𝘯 𝘗𝘩𝘢̂̉𝘮';
    if (type === 'gothic') return '𝔎𝔥𝔲𝔶𝔢̂́𝔫 𝔐𝔞̃𝔦 ℌ𝔢̀ 2026 - 𝔊𝔦𝔞̉𝔪 50% 𝔗𝔬𝔞̀𝔫 𝔅𝔬̣̂ 𝔖𝔞̉𝔫 𝔓𝔥𝔞̂̉𝔪';
    if (type === 'bubble') return 'Ⓚⓗⓤⓨⓔ̂́ⓝ Ⓜⓐ̃ⓘ Ⓗⓔ̀ 2026 - Ⓖⓘⓐ̉ⓜ 50% Ⓣⓞⓐ̀ⓝ Ⓑⓞ̣̂ Ⓢⓐ̉ⓝ Ⓟⓗⓐ̂̉ⓜ';
    return text;
  };

  return (
    <div className="flow-wrap">
      {/* Background Glow Orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-pattern" />

      {/* Floating Island Header Navbar */}
      <header className="island-header">
        <div className="island-inner">
          <BrandLogo size={36} subtitle="Automation Cloud" />
          <nav className="island-nav">
            <a href="#pipeline" className="nav-item">Quy trình</a>
            <a href="#bento" className="nav-item">Công nghệ</a>
            <a href="#comparison" className="nav-item">Hiệu suất</a>
            <a href="#live-demo" className="nav-item">Thử nghiệm font</a>
          </nav>
          <div className="island-actions">
            <Link href="/login" className="login-btn">
              Đăng nhập
            </Link>
            <Link href="/login" className="flow-btn-primary">
              <span>Bắt đầu ngay</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Centered High-Impact Architecture) */}
      <section className="hero-center">
        <div className="hero-pill-badge">
          <span className="badge-sparkle">✨</span>
          <span>Thế hệ Tự động hóa Fanpage Meta 2026</span>
          <span className="badge-arrow">→</span>
        </div>

        <h1 className="hero-title">
          Quản trị Fanpage đa kênh, <br />
          <span className="flow-gradient-text">Soạn bài nghệ thuật</span> & Phân phối tự động
        </h1>

        <p className="hero-lead">
          Nền tảng giúp bạn kết nối hàng loạt Fanpage, chuyển đổi phông chữ Facebook độc đáo, chèn emoji & hashtag thu hút tương tác, và tự động xuất bản đúng từng giây qua hàng đợi thông minh BullMQ.
        </p>

        <div className="hero-action-row">
          <Link href="/login" className="flow-cta-primary">
            <Zap size={18} />
            <span>Trải nghiệm Workspace miễn phí</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard" className="flow-cta-secondary">
            <LayoutDashboard size={18} />
            <span>Vào Bảng Điều Khiển</span>
          </Link>
        </div>

        {/* Feature Badges Strip */}
        <div className="hero-badges-strip">
          <div className="strip-badge">
            <CheckCircle2 size={16} color="#10B981" />
            <span>Meta Graph API v19.0 Ready</span>
          </div>
          <div className="strip-badge">
            <CheckCircle2 size={16} color="#10B981" />
            <span>Lên lịch chính xác từng phút</span>
          </div>
          <div className="strip-badge">
            <CheckCircle2 size={16} color="#10B981" />
            <span>Bảo mật Cookie HttpOnly</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Command Center Showcase */}
      <section id="bento" className="bento-section">
        <div className="bento-header">
          <span className="bento-eyebrow">COMMAND CENTER</span>
          <h2>Trung tâm điều khiển xuất bản đa kênh đỉnh cao</h2>
          <p>Tất cả công cụ bạn cần được tích hợp trong một giao diện trực quan, tinh gọn và tốc độ cao.</p>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1: Rich Editor & Live Facebook Preview (Card Lớn) */}
          <div className="bento-card bento-card-large">
            <div className="bento-card-top">
              <div>
                <span className="card-badge">LIVE COMPOSER</span>
                <h3>Trình soạn thảo nghệ thuật & Xem trước Newsfeed</h3>
                <p>Chuyển đổi phông chữ in đậm, nghiêng, gothic trực tiếp trên Facebook và xem trước thời gian thực.</p>
              </div>
            </div>

            <div className="mock-composer-container">
              {/* Mini Toolbar */}
              <div className="mock-toolbar">
                <button type="button" className={`mock-tool-btn ${demoFont === 'bold' ? 'active' : ''}`} onClick={() => setDemoFont('bold')}>
                  <Type size={14} /> <strong>In đậm Sans</strong>
                </button>
                <button type="button" className={`mock-tool-btn ${demoFont === 'italic' ? 'active' : ''}`} onClick={() => setDemoFont('italic')}>
                  <em>In nghiêng</em>
                </button>
                <button type="button" className={`mock-tool-btn ${demoFont === 'gothic' ? 'active' : ''}`} onClick={() => setDemoFont('gothic')}>
                  Gothic
                </button>
                <button type="button" className={`mock-tool-btn ${demoFont === 'bubble' ? 'active' : ''}`} onClick={() => setDemoFont('bubble')}>
                  Bong bóng
                </button>
                <span className="mock-tag-tip">💡 Click đổi font ngay!</span>
              </div>

              {/* Feed Preview Card */}
              <div className="mock-feed-preview">
                <div className="feed-header">
                  <div className="feed-avatar">PF</div>
                  <div className="feed-info">
                    <strong>PageFlow Studio</strong>
                    <span>Vừa xong · 🌐 Công khai</span>
                  </div>
                  <span className="feed-verified-badge">✓</span>
                </div>
                <div className="feed-content">
                  <p className="feed-text">{getFontPreview(demoText, demoFont)}</p>
                  <div className="feed-tags">#PageFlow #Marketing #ViralPost #FacebookAutomation</div>
                </div>
                <div className="feed-actions-mock">
                  <span>👍 1.8k Thích</span>
                  <span>💬 142 Bình luận</span>
                  <span>↗️ 89 Chia sẻ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Queue Radar (BullMQ) */}
          <div className="bento-card bento-card-radar">
            <div className="card-badge orange">BULLMQ ENGINE</div>
            <h3>Hàng đợi phân phối thông minh</h3>
            <p>Xử lý lịch trình 24/7 với Redis, tự động retry khi mạng chập chờn.</p>
            
            <div className="radar-metric-box">
              <div className="radar-row">
                <span>Độ trễ xử lý</span>
                <strong>&lt; 20ms</strong>
              </div>
              <div className="radar-row">
                <span>Hàng đợi tiếp theo</span>
                <span className="radar-time-pill"><Clock size={12} /> 18:00 Hôm nay</span>
              </div>
              <div className="radar-row">
                <span>Tỷ lệ hoàn thành</span>
                <strong className="text-green">99.98%</strong>
              </div>
            </div>

            <div className="queue-pulse-indicator">
              <span className="pulse-dot" />
              <span>Worker đang chạy ngầm liên tục</span>
            </div>
          </div>

          {/* Bento Card 3: Multi-Fanpage Matrix */}
          <div className="bento-card bento-card-pages">
            <div className="card-badge purple">MULTI-PAGE SYNC</div>
            <h3>Đồng bộ không giới hạn Fanpage</h3>
            <p>1-Click chuyển đổi kênh, phân quyền quản trị an toàn tuyệt đối.</p>

            <div className="mock-page-list">
              <div className="page-item-row">
                <div className="page-row-avatar">FB</div>
                <div className="page-row-name">
                  <strong>Thời Trang Cao Cấp</strong>
                  <span>● 24 bài đang chờ</span>
                </div>
                <span className="status-pill-green">Đã kết nối</span>
              </div>
              <div className="page-item-row">
                <div className="page-row-avatar blue">DS</div>
                <div className="page-row-name">
                  <strong>Digital Marketing Agency</strong>
                  <span>● 86 bài đang chờ</span>
                </div>
                <span className="status-pill-green">Đã kết nối</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: AI & Excel Automation */}
          <div className="bento-card bento-card-ai">
            <div className="card-badge pink">AI STUDIO & BULK EXCEL</div>
            <h3>Nhập bài hàng loạt qua Excel & AI</h3>
            <p>Tải lên hàng trăm bài viết từ tệp Excel và nhờ AI tự động tối ưu tiêu đề, hashtag viral.</p>

            <div className="ai-chips-preview">
              <span className="ai-chip">✨ Tự động viết caption</span>
              <span className="ai-chip">🏷️ Gợi ý #Hashtag hot</span>
              <span className="ai-chip">📊 Tải Excel 1-Click</span>
            </div>
          </div>
        </div>
      </section>

      {/* Production Pipeline: 3 Bước Xuất Bản */}
      <section id="pipeline" className="pipeline-section">
        <div className="pipeline-header">
          <span className="bento-eyebrow">QUY TRÌNH TINH GỌN</span>
          <h2>3 Bước xuất bản tự động hóa từ A - Z</h2>
          <p>Thiết lập quy trình đăng bài Fanpage một lần, hệ thống tự động vận hành cả tháng.</p>
        </div>

        <div className="pipeline-grid">
          <div className="pipeline-step">
            <div className="step-count">01</div>
            <h3>Kết nối Fanpage An toàn</h3>
            <p>Đăng nhập nhanh 1-Click hoặc dùng Meta OAuth chính thức, không cần lo lắng về checkpoint hay mất quyền quản trị.</p>
          </div>
          <div className="pipeline-step">
            <div className="step-count">02</div>
            <h3>Soạn bài với Font & Emoji</h3>
            <p>Tạo sự chú ý trên Newsfeed bằng các kiểu chữ nghệ thuật, kho emoji biểu cảm, gắn thẻ sản phẩm và mẫu chữ ký bán hàng.</p>
          </div>
          <div className="pipeline-step">
            <div className="step-count">03</div>
            <h3>Lên lịch & Hàng đợi tự động</h3>
            <p>Chọn khung giờ vàng, hệ thống BullMQ & Redis tự động đăng bài đúng hẹn cho dù bạn đang ngủ hay đi du lịch.</p>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Thủ công vs PageFlow */}
      <section id="comparison" className="compare-section">
        <div className="compare-box">
          <div className="compare-col manual">
            <div className="col-tag">CÁCH LÀM THỦ CÔNG CŨ</div>
            <h3>Tốn thời gian & Kém hiệu quả</h3>
            <ul className="compare-list">
              <li><X size={16} color="#EF4444" /> Mất 3 - 4 tiếng mỗi ngày để đăng từng bài cho từng Page</li>
              <li><X size={16} color="#EF4444" /> Chữ đơn điệu, không thể in đậm hay tạo điểm nhấn trên Facebook</li>
              <li><X size={16} color="#EF4444" /> Thường xuyên quên giờ đăng, lỡ mất khung giờ vàng tương tác</li>
              <li><X size={16} color="#EF4444" /> Quản lý rời rạc, khó kiểm soát chất lượng nội dung</li>
            </ul>
          </div>

          <div className="compare-col automated">
            <div className="col-tag pro">VỚI PAGEFLOW PRO</div>
            <h3>Tự động hóa & Tăng x3 tương tác</h3>
            <ul className="compare-list">
              <li><Check size={16} color="#10B981" /> <strong>Chỉ 10 phút mỗi tuần:</strong> Lên lịch cho toàn bộ hệ thống Fanpage</li>
              <li><Check size={16} color="#10B981" /> <strong>Bộ Font nghệ thuật độc quyền:</strong> Thu hút người đọc ngay cái nhìn đầu tiên</li>
              <li><Check size={16} color="#10B981" /> <strong>Hàng đợi BullMQ:</strong> Phân phối chính xác từng giây, tự động retry khi lỗi</li>
              <li><Check size={16} color="#10B981" /> <strong>Bản xem trước trực quan:</strong> Nhìn thấy giao diện thật trước khi xuất bản</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Finale Strip */}
      <section className="finale-cta-section">
        <div className="finale-card">
          <h2>Sẵn sàng nhân bản quy mô Fanpage của bạn?</h2>
          <p>Bắt đầu ngay hôm nay để trải nghiệm sức mạnh của hệ thống phân phối nội dung tự động thế hệ mới.</p>
          <div className="finale-actions">
            <Link href="/login" className="flow-cta-primary large">
              <span>Đăng nhập vào Workspace ngay</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flow-footer">
        <div className="footer-inner">
          <BrandLogo size={36} subtitle="Hệ thống Tự động hóa Fanpage Đa kênh" />
          <div className="footer-nav">
            <Link href="/login">Đăng nhập</Link>
            <Link href="/post-planner/compose">Soạn bài viết</Link>
            <Link href="/channels">Quản lý Kênh</Link>
            <Link href="/post-planner/list">Lịch đã lên</Link>
          </div>
          <div className="footer-copyright">
            © 2026 PageFlow Pro. Bản quyền thuộc về bạn.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .flow-wrap {
          min-height: 100vh;
          background: #F8FAFC;
          color: #0F172A;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient Glow Orbs */
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(255, 107, 0, 0.15) 0%, rgba(255, 46, 116, 0.1) 50%, transparent 75%);
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          top: 800px;
          right: -100px;
          background: radial-gradient(circle, rgba(121, 40, 202, 0.08) 0%, transparent 70%);
        }

        .ambient-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 0;
        }

        /* Floating Island Header */
        .island-header {
          position: sticky;
          top: 16px;
          z-index: 100;
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .island-inner {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 999px;
          padding: 10px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.08);
        }

        .island-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-item {
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .nav-item:hover {
          color: #FF2E74;
        }

        .island-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-btn {
          color: #334155;
          font-size: 14px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 999px;
          transition: all 0.2s;
        }

        .login-btn:hover {
          color: #FF2E74;
          background: rgba(255, 46, 116, 0.06);
        }

        .flow-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #FF6B00 0%, #FF2E74 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 18px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(255, 46, 116, 0.35);
          transition: all 0.2s ease;
        }

        .flow-btn-primary:hover {
          background: linear-gradient(135deg, #E65A00 0%, #E61E64 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255, 46, 116, 0.45);
        }

        /* Centered Hero Section */
        .hero-center {
          position: relative;
          z-index: 10;
          max-width: 980px;
          margin: 0 auto;
          padding: 80px 24px 60px;
          text-align: center;
        }

        .hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          margin-bottom: 24px;
        }

        .badge-sparkle {
          font-size: 14px;
        }

        .badge-arrow {
          color: #FF2E74;
          font-weight: 800;
        }

        .hero-title {
          font-size: clamp(2.4rem, 4.4vw, 4rem);
          font-weight: 900;
          line-height: 1.14;
          letter-spacing: -0.035em;
          color: #0F172A;
          margin: 0 0 24px;
        }

        .flow-gradient-text {
          background: linear-gradient(135deg, #FF6B00 0%, #FF2E74 50%, #7928CA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-lead {
          font-size: 17px;
          line-height: 1.65;
          color: #475569;
          margin: 0 auto 36px;
          max-width: 720px;
        }

        .hero-action-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .flow-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #FF6B00 0%, #FF2E74 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          padding: 15px 28px;
          border-radius: 12px;
          box-shadow: 0 10px 28px rgba(255, 46, 116, 0.35);
          transition: all 0.2s ease;
        }

        .flow-cta-primary:hover {
          background: linear-gradient(135deg, #E65A00 0%, #E61E64 100%);
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(255, 46, 116, 0.45);
        }

        .flow-cta-primary.large {
          font-size: 16px;
          padding: 16px 36px;
        }

        .flow-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #CBD5E1;
          color: #1E293B;
          font-size: 15px;
          font-weight: 700;
          padding: 15px 24px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .flow-cta-secondary:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }

        .hero-badges-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .strip-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        /* Bento Grid Section */
        .bento-section {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 24px;
        }

        .bento-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .bento-eyebrow {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #FF2E74;
          display: block;
          margin-bottom: 8px;
        }

        .bento-header h2 {
          font-size: clamp(2rem, 3.2vw, 2.7rem);
          font-weight: 900;
          color: #0F172A;
          margin: 0 0 12px;
        }

        .bento-header p {
          color: #64748B;
          font-size: 16px;
          margin: 0;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 24px;
        }

        .bento-card {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.06);
          position: relative;
          overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
        }

        .bento-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.1);
        }

        .bento-card-large {
          grid-row: span 2;
        }

        .card-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(255, 46, 116, 0.1);
          color: #FF2E74;
          margin-bottom: 12px;
        }

        .card-badge.orange {
          background: rgba(255, 107, 0, 0.1);
          color: #FF6B00;
        }

        .card-badge.purple {
          background: rgba(121, 40, 202, 0.1);
          color: #7928CA;
        }

        .card-badge.pink {
          background: rgba(255, 46, 116, 0.1);
          color: #FF2E74;
        }

        .bento-card h3 {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 8px;
        }

        .bento-card p {
          font-size: 13px;
          line-height: 1.55;
          color: #64748B;
          margin: 0 0 20px;
        }

        /* Mock Composer inside Bento */
        .mock-composer-container {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 16px;
        }

        .mock-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          padding-bottom: 14px;
          border-bottom: 1px solid #E2E8F0;
          margin-bottom: 14px;
        }

        .mock-tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 9px;
          border-radius: 6px;
          border: 1px solid #CBD5E1;
          background: #ffffff;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
        }

        .mock-tool-btn.active {
          background: #FF2E74;
          color: #ffffff;
          border-color: #FF2E74;
        }

        .mock-tag-tip {
          font-size: 11px;
          color: #FF6B00;
          font-weight: 700;
          margin-left: auto;
        }

        .mock-feed-preview {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .feed-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .feed-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B00, #FF2E74);
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          display: grid;
          place-items: center;
        }

        .feed-info strong {
          display: block;
          font-size: 13px;
          color: #0F172A;
        }

        .feed-info span {
          font-size: 11px;
          color: #64748B;
        }

        .feed-verified-badge {
          margin-left: auto;
          color: #1877F2;
          font-weight: 900;
          font-size: 14px;
        }

        .feed-text {
          font-size: 14px;
          line-height: 1.5;
          color: #1E293B;
          margin: 0 0 6px;
          font-weight: 500;
        }

        .feed-tags {
          font-size: 12px;
          color: #2563EB;
          font-weight: 600;
        }

        .feed-actions-mock {
          display: flex;
          align-items: center;
          gap: 14px;
          border-top: 1px solid #F1F5F9;
          padding-top: 10px;
          margin-top: 12px;
          font-size: 11px;
          color: #64748B;
          font-weight: 600;
        }

        /* Radar Box */
        .radar-metric-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .radar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #475569;
        }

        .radar-row strong {
          color: #0F172A;
        }

        .radar-row strong.text-green {
          color: #10B981;
        }

        .radar-time-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FFF4E5;
          color: #FF6B00;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 11px;
        }

        .queue-pulse-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #10B981;
          font-weight: 700;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        /* Multi-page Rows */
        .mock-page-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .page-item-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 10px 12px;
          border-radius: 10px;
        }

        .page-row-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #1877F2;
          color: #fff;
          font-weight: 800;
          font-size: 12px;
          display: grid;
          place-items: center;
        }

        .page-row-avatar.blue {
          background: #0284C7;
        }

        .page-row-name {
          flex: 1;
        }

        .page-row-name strong {
          display: block;
          font-size: 12px;
          color: #0F172A;
        }

        .page-row-name span {
          font-size: 11px;
          color: #64748B;
        }

        .status-pill-green {
          font-size: 10px;
          font-weight: 700;
          color: #059669;
          background: #ECFDF5;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .ai-chips-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ai-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        /* Pipeline Section */
        .pipeline-section {
          max-width: 1140px;
          margin: 0 auto;
          padding: 70px 24px;
        }

        .pipeline-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .pipeline-header h2 {
          font-size: clamp(2rem, 3vw, 2.6rem);
          font-weight: 900;
          color: #0F172A;
          margin: 0 0 10px;
        }

        .pipeline-header p {
          color: #64748B;
          font-size: 15px;
          margin: 0;
        }

        .pipeline-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .pipeline-step {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 32px 24px;
          position: relative;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
        }

        .step-count {
          font-size: 32px;
          font-weight: 900;
          color: #E2E8F0;
          margin-bottom: 16px;
          line-height: 1;
        }

        .pipeline-step h3 {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 10px;
        }

        .pipeline-step p {
          font-size: 13px;
          line-height: 1.6;
          color: #64748B;
          margin: 0;
        }

        /* Comparison Section */
        .compare-section {
          max-width: 1040px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .compare-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.08);
          border: 1px solid #E2E8F0;
        }

        .compare-col {
          padding: 40px 32px;
        }

        .compare-col.manual {
          background: #ffffff;
          border-right: 1px solid #E2E8F0;
        }

        .compare-col.automated {
          background: #F8FAFC;
        }

        .col-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #EF4444;
          margin-bottom: 10px;
        }

        .col-tag.pro {
          color: #10B981;
        }

        .compare-col h3 {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 20px;
        }

        .compare-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .compare-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.5;
          color: #475569;
        }

        /* Finale Card */
        .finale-cta-section {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .finale-card {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          border-radius: 28px;
          padding: 60px 32px;
          text-align: center;
          color: #ffffff;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
          position: relative;
          overflow: hidden;
        }

        .finale-card h2 {
          font-size: clamp(2rem, 3.2vw, 2.8rem);
          font-weight: 900;
          margin: 0 0 16px;
        }

        .finale-card p {
          font-size: 16px;
          color: #94A3B8;
          max-width: 600px;
          margin: 0 auto 32px;
        }

        .finale-actions {
          display: flex;
          justify-content: center;
        }

        /* Footer */
        .flow-footer {
          border-top: 1px solid #E2E8F0;
          padding: 40px 24px;
          background: #ffffff;
        }

        .footer-inner {
          max-width: 1140px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-nav {
          display: flex;
          gap: 24px;
        }

        .footer-nav a {
          color: #475569;
          font-size: 14px;
          font-weight: 600;
        }

        .footer-nav a:hover {
          color: #FF2E74;
        }

        .footer-copyright {
          font-size: 13px;
          color: #64748B;
        }

        @media (max-width: 960px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
          .bento-card-large {
            grid-row: auto;
          }
          .pipeline-grid {
            grid-template-columns: 1fr;
          }
          .compare-box {
            grid-template-columns: 1fr;
          }
          .compare-col.manual {
            border-right: 0;
            border-bottom: 1px solid #E2E8F0;
          }
          .island-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}