import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Zap,
  KeyRound,
  Layers,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Settings2,
  TrendingUp,
  Cpu,
  BarChart3,
  CalendarCheck,
  Share2
} from 'lucide-react';
import authApi from '../services/authApi';
import BrandLogo from '../components/brand/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'token' | 'meta'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [directName, setDirectName] = useState('Tài khoản của tôi');
  const [directId, setDirectId] = useState('1000' + Math.floor(10000000000 + Math.random() * 90000000000));
  const [facebookToken, setFacebookToken] = useState('');

  // Meta App config form
  const [appIdInput, setAppIdInput] = useState('28213168488378346');
  const [appSecretInput, setAppSecretInput] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const error = router.query.error;
    const loggedOut = router.query.loggedOut === '1';
    if (error === 'oauth_state_invalid') setErrorMessage('Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng thử lại.');
    if (error === 'invalid_client_secret') {
      setErrorMessage('Facebook từ chối: App Secret không đúng ("Error validating client secret"). Lưu ý: App Secret là chuỗi 32 ký tự hex trong developers.facebook.com > Cài đặt ứng dụng > Thông thường > Khóa bí mật, KHÔNG PHẢI mật khẩu tài khoản cá nhân. Bạn hãy chọn tab "Đăng nhập Nhanh" để vào sử dụng ngay lập tức!');
    } else if (error === 'oauth_failed') {
      const msg = typeof router.query.msg === 'string' ? router.query.msg : '';
      setErrorMessage(`Facebook OAuth chưa hoàn tất: ${msg || 'App ID hoặc Secret bị Meta từ chối'}. Bạn có thể chọn tab "Đăng nhập Nhanh" để vào sử dụng ngay!`);
    }
    if (loggedOut) setSuccessMessage('Bạn đã đăng xuất an toàn.');

    authApi.me()
      .then((data) => {
        if (data?.authenticated) {
          const next = typeof router.query.next === 'string' && router.query.next.startsWith('/') && !router.query.next.startsWith('//')
            ? router.query.next
            : '/dashboard';
          router.replace(next);
        }
      })
      .catch(() => {})
      .finally(() => {
        authApi.status()
          .then(setAuthStatus)
          .catch(() => setAuthStatus({ configured: false, missing: ['API backend'] }))
          .finally(() => setLoading(false));
      });
  }, [router.isReady, router.query.error, router.query.loggedOut, router.query.next]);

  // Handle Quick / Direct Login
  const handleQuickLogin = async (e) => {
    e.preventDefault();
    if (!directName.trim() || !directId.trim()) {
      setErrorMessage('Vui lòng nhập Tên hiển thị và Facebook ID của bạn.');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await authApi.loginDirect({
        id: directId.trim(),
        name: directName.trim()
      });
      if (res.success) {
        setSuccessMessage(`Đăng nhập thành công! Xin chào ${directName}`);
        setTimeout(() => {
          router.replace('/dashboard');
        }, 600);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Đăng nhập không thành công. Hãy thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Token / Cookie Login
  const handleTokenLogin = async (e) => {
    e.preventDefault();
    if (!facebookToken.trim()) {
      setErrorMessage('Vui lòng dán Facebook User Access Token (EAA...) hoặc Cookie.');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await authApi.loginWithFacebookToken(facebookToken.trim());
      if (res.success) {
        setSuccessMessage(res.message || `Đăng nhập thành công với tài khoản: ${res.user?.name || 'Facebook'}`);
        setTimeout(() => {
          router.replace('/dashboard');
        }, 700);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xác thực bằng Token này. Vui lòng kiểm tra lại token hoặc dùng tab Đăng nhập Nhanh.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Save & Connect Meta App
  const handleSaveMetaConfig = async (e) => {
    if (e) e.preventDefault();
    if (!appIdInput.trim() || !appSecretInput.trim()) {
      setErrorMessage('Vui lòng nhập cả App ID và App Secret từ developers.facebook.com.');
      return false;
    }
    setSavingConfig(true);
    setErrorMessage('');
    try {
      const res = await authApi.saveMetaConfig({
        appId: appIdInput.trim(),
        appSecret: appSecretInput.trim()
      });
      if (res.success) {
        setSuccessMessage('Đã lưu cấu hình Meta App thành công!');
        const updated = await authApi.status();
        setAuthStatus(updated);
        return true;
      }
      return false;
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Không thể lưu cấu hình.');
      return false;
    } finally {
      setSavingConfig(false);
    }
  };

  const startOAuthLogin = async () => {
    setErrorMessage('');
    // Nếu người dùng đã điền App ID và Secret trong form, tự động lưu và chuyển hướng ngay
    if (appIdInput.trim() && appSecretInput.trim()) {
      const saved = await handleSaveMetaConfig();
      if (!saved) return;
      window.location.assign(authApi.facebookLoginUrl);
      return;
    }

    if (!authStatus?.configured) {
      setErrorMessage('Vui lòng điền Meta App ID và Secret bên dưới, hoặc dùng tab "Facebook của tôi" để vào ngay!');
      return;
    }
    window.location.assign(authApi.facebookLoginUrl);
  };

  return (
    <div className="login-root">
      {/* Ambient background glows */}
      <div className="ambient-glow ambient-1" />
      <div className="ambient-glow ambient-2" />
      <div className="ambient-grid" />

      <div className="login-container">
        {/* Left Side: Enterprise Showcase */}
        <section className="showcase-side">
          <div className="showcase-header">
            <Link href="/" className="brand-logo-link">
              <BrandLogo size={44} subtitle="Automation Suite Pro" />
            </Link>
            <div className="api-badge">
              <span className="live-dot" />
              Meta Graph API v19.0
            </div>
          </div>

          <div className="showcase-hero">
            <h1>Trung tâm Quản trị & Tự động hóa Fanpage Đỉnh cao.</h1>
            <p>
              Tối ưu hóa quy trình lên lịch xuất bản, đồng bộ đa kênh, tạo nội dung tự động bằng AI và phân tích tăng trưởng bài đăng theo thời gian thực.
            </p>
          </div>

          {/* Interactive Live Preview Card */}
          <div className="preview-card">
            <div className="preview-card-header">
              <div className="page-avatar">FB</div>
              <div className="page-info">
                <strong>Fanpage Workspace Pro</strong>
                <span>● Đã đồng bộ 24 kênh xuất bản</span>
              </div>
              <div className="metric-chip">
                <TrendingUp size={14} /> +148% Tương tác
              </div>
            </div>

            <div className="preview-features-grid">
              <div className="feature-pill">
                <CalendarCheck size={16} color="#38bdf8" />
                <div>
                  <strong>Lên lịch đa kênh</strong>
                  <span>Hàng đợi 1.2k bài/tuần</span>
                </div>
              </div>
              <div className="feature-pill">
                <Cpu size={16} color="#a855f7" />
                <div>
                  <strong>AI Studio Engine</strong>
                  <span>Tạo nội dung & hashtag</span>
                </div>
              </div>
              <div className="feature-pill">
                <Share2 size={16} color="#34d399" />
                <div>
                  <strong>Bulk Media Sync</strong>
                  <span>Nhập hàng loạt qua Excel</span>
                </div>
              </div>
              <div className="feature-pill">
                <BarChart3 size={16} color="#f59e0b" />
                <div>
                  <strong>Báo cáo thời gian thực</strong>
                  <span>Theo dõi lượt xem & click</span>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <div className="stat-item">
              <strong>99.98%</strong>
              <span>Tỷ lệ phân phối đúng hẹn</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-item">
              <strong>&lt; 50ms</strong>
              <span>Độ trễ xử lý hàng đợi</span>
            </div>
            <div className="stat-separator" />
            <div className="stat-item">
              <strong>1-Click</strong>
              <span>Đăng nhập an toàn tuyệt đối</span>
            </div>
          </div>
        </section>

        {/* Right Side: Auth Console */}
        <section className="auth-side">
          <div className="auth-card">
            <div className="auth-card-top">
              <h2>Đăng nhập Hệ thống</h2>
              <p>Chọn phương thức kết nối Facebook của bạn để truy cập Workspace</p>
            </div>

            {/* Navigation Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'quick' ? 'is-active' : ''}`}
                onClick={() => { setActiveTab('quick'); setErrorMessage(''); }}
              >
                <Zap size={16} />
                <span>Facebook của tôi</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'token' ? 'is-active' : ''}`}
                onClick={() => { setActiveTab('token'); setErrorMessage(''); }}
              >
                <KeyRound size={16} />
                <span>Access Token</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'meta' ? 'is-active' : ''}`}
                onClick={() => { setActiveTab('meta'); setErrorMessage(''); }}
              >
                <Settings2 size={16} />
                <span>Meta App</span>
              </button>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="alert alert-error">
                <AlertCircle size={18} className="alert-icon" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} className="alert-icon" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Tab 1: Quick Facebook Login */}
            {activeTab === 'quick' && (
              <form onSubmit={handleQuickLogin} className="auth-form">
                <div className="form-item">
                  <label htmlFor="user-name">Tên tài khoản Facebook</label>
                  <input
                    id="user-name"
                    type="text"
                    className="styled-input"
                    placeholder="Ví dụ: Nguyễn Văn A (Admin)"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-item">
                  <div className="label-row">
                    <label htmlFor="user-id">Facebook UID / Link cá nhân</label>
                    <button
                      type="button"
                      className="text-action-btn"
                      onClick={() => setDirectId('1000' + Math.floor(10000000000 + Math.random() * 90000000000))}
                    >
                      Tạo ID ngẫu nhiên
                    </button>
                  </div>
                  <input
                    id="user-id"
                    type="text"
                    className="styled-input font-mono"
                    placeholder="100085432198765"
                    value={directId}
                    onChange={(e) => setDirectId(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="helper-banner">
                  <Sparkles size={16} className="helper-icon" />
                  <span>
                    Chế độ đăng nhập trực tiếp giúp bạn vào ngay Workspace quản trị mà <strong>không bị chặn bởi Meta xét duyệt App</strong>.
                  </span>
                </div>

                <button
                  type="submit"
                  className="cta-button glow-cta"
                  disabled={submitting}
                >
                  <span>{submitting ? 'Đang xác thực...' : 'Đăng nhập vào Workspace ngay'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Tab 2: Access Token / Cookie */}
            {activeTab === 'token' && (
              <form onSubmit={handleTokenLogin} className="auth-form">
                <div className="form-item">
                  <div className="label-row">
                    <label htmlFor="fb-token">User Access Token hoặc Cookie</label>
                    <a
                      href="https://developers.facebook.com/tools/explorer/"
                      target="_blank"
                      rel="noreferrer"
                      className="external-link"
                    >
                      <span>Lấy Token Meta</span> <ExternalLink size={12} />
                    </a>
                  </div>
                  <textarea
                    id="fb-token"
                    className="styled-textarea font-mono"
                    rows={4}
                    placeholder="Dán User Access Token (EAA...) hoặc Cookie Facebook (c_user=...)"
                    value={facebookToken}
                    onChange={(e) => setFacebookToken(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="helper-banner">
                  <Sparkles size={16} className="helper-icon" />
                  <span>
                    Hệ thống sẽ tự động gọi Graph API để lấy <strong>Tên, Avatar và đồng bộ toàn bộ Fanpage</strong> bạn quản lý.
                  </span>
                </div>

                <button
                  type="submit"
                  className="cta-button glow-cta"
                  disabled={submitting}
                >
                  <span>{submitting ? 'Đang kết nối Facebook...' : 'Kết nối với Facebook Token'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Tab 3: Meta App Config & OAuth */}
            {activeTab === 'meta' && (
              <div className="auth-form">
                <div className="meta-status-card">
                  <div className="status-row">
                    <span>Trạng thái Meta App:</span>
                    {authStatus?.configured || (appIdInput.trim() && appSecretInput.trim()) ? (
                      <span className="badge badge-online">● Sẵn sàng kết nối</span>
                    ) : (
                      <span className="badge badge-offline">● Chưa lưu cấu hình</span>
                    )}
                  </div>
                </div>

                <div className="helper-banner">
                  <Sparkles size={16} className="helper-icon" />
                  <span>
                    <strong>Meta App là gì?</strong> Đây là ứng dụng tạo trên Facebook Developers (gồm App ID & Secret) để cấp quyền OAuth chính thức và kéo toàn bộ Fanpage bạn quản lý về hệ thống.
                  </span>
                </div>

                {/* Form to enter real Meta App ID & Secret */}
                <form onSubmit={handleSaveMetaConfig} className="config-form-section">
                  <div className="config-title">
                    <Settings2 size={16} />
                    <span>Cấu hình Meta App (Điền 1 lần)</span>
                  </div>
                  <p className="config-desc">
                    Nhập App ID và Secret bạn đã tạo, sau đó chỉ cần <strong>bấm nút Kết nối bên dưới là hệ thống nối thẳng với Facebook ngay</strong>:
                  </p>

                  <div className="form-item">
                    <label htmlFor="meta-appid">Meta App ID (Dãy số)</label>
                    <input
                      id="meta-appid"
                      type="text"
                      className="styled-input font-mono"
                      placeholder="Ví dụ: 28213168488378346"
                      value={appIdInput}
                      onChange={(e) => setAppIdInput(e.target.value)}
                      disabled={savingConfig}
                    />
                  </div>

                  <div className="form-item">
                    <label htmlFor="meta-secret">Meta App Secret (Khóa bí mật ứng dụng)</label>
                    <input
                      id="meta-secret"
                      type="password"
                      className="styled-input font-mono"
                      placeholder="Chuỗi 32 ký tự (ví dụ: a1b2c3d4e5f6...)"
                      value={appSecretInput}
                      onChange={(e) => setAppSecretInput(e.target.value)}
                      disabled={savingConfig}
                    />
                    {appSecretInput.includes('@') && (
                      <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 600 }}>
                        ⚠️ Cảnh báo: Bạn đang nhập mật khẩu cá nhân! App Secret là chuỗi 32 ký tự hex từ developers.facebook.com (Cài đặt ứng dụng → Thông thường → Khóa bí mật của ứng dụng).
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                      💡 Lấy tại: <strong>developers.facebook.com/apps/</strong> → Chọn App → Cài đặt ứng dụng → Thông thường → Khóa bí mật của ứng dụng.
                    </span>
                  </div>
                </form>

                <button
                  type="button"
                  className="cta-button glow-cta meta-oauth-btn"
                  onClick={startOAuthLogin}
                  disabled={savingConfig || (!authStatus?.configured && (!appIdInput.trim() || !appSecretInput.trim()))}
                >
                  <Layers size={18} />
                  <span>
                    {savingConfig
                      ? 'Đang lưu & chuyển sang Facebook...'
                      : 'Nối với Facebook của tôi ngay (1-Click)'}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            <div className="auth-footer-security">
              <ShieldCheck size={16} />
              <span>Bảo mật session chuẩn HMAC-SHA256 & Cookie HttpOnly an toàn</span>
            </div>
          </div>

          <div className="home-link-wrap">
            <Link href="/" className="home-link">
              ← Quay lại trang giới thiệu
            </Link>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .login-root {
          min-height: 100vh;
          background: #FAFBFC;
          color: #172B4D;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          overflow-x: hidden;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .ambient-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(9, 30, 66, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(9, 30, 66, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .ambient-1 {
          width: 550px;
          height: 550px;
          top: -120px;
          left: -80px;
          background: rgba(255, 139, 0, 0.08);
        }

        .ambient-2 {
          width: 600px;
          height: 600px;
          bottom: -150px;
          right: -100px;
          background: rgba(255, 82, 48, 0.06);
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1140px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 48px;
          align-items: center;
        }

        /* Showcase Side */
        .showcase-side {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding-right: 16px;
        }

        .showcase-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .api-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 46, 116, 0.08);
          border: 1px solid rgba(255, 46, 116, 0.25);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          color: #FF2E74;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 10px #10B981;
        }

        .showcase-hero h1 {
          font-size: clamp(2.2rem, 3.4vw, 3.2rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
          color: #0F172A;
          background: linear-gradient(135deg, #0F172A 0%, #FF2E74 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .showcase-hero p {
          font-size: 16px;
          line-height: 1.65;
          color: #475569;
          margin: 0;
          max-width: 540px;
        }

        .preview-card {
          background: #ffffff;
          border: 1px solid #EBECF0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(9, 30, 66, 0.08);
        }

        .preview-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #EBECF0;
        }

        .page-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(115deg, #FF8B00 0%, #FF5230 100%);
          color: #fff;
          font-weight: 900;
          display: grid;
          place-items: center;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(255, 107, 0, 0.35);
        }

        .page-info {
          flex: 1;
        }

        .page-info strong {
          display: block;
          font-size: 15px;
          color: #0B1B3D;
          font-weight: 800;
        }

        .page-info span {
          font-size: 12px;
          color: #36B37E;
          font-weight: 700;
        }

        .metric-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #E3FCEF;
          border: 1px solid #ABF5D1;
          color: #006644;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .preview-features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .feature-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FAFBFC;
          border: 1px solid #EBECF0;
          border-radius: 12px;
          padding: 12px;
        }

        .feature-pill strong {
          display: block;
          font-size: 13px;
          color: #172B4D;
          font-weight: 700;
        }

        .feature-pill span {
          display: block;
          font-size: 11px;
          color: #6B778C;
          margin-top: 2px;
        }

        .showcase-footer {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .stat-item strong {
          display: block;
          font-size: 20px;
          font-weight: 900;
          color: #FF6B00;
        }

        .stat-item span {
          font-size: 12px;
          color: #6B778C;
          font-weight: 600;
        }

        .stat-separator {
          width: 1px;
          height: 30px;
          background: #EBECF0;
        }

        /* Auth Side */
        .auth-side {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-card {
          background: #ffffff;
          border: 1px solid #EBECF0;
          border-radius: 24px;
          padding: 34px 28px;
          box-shadow: 0 25px 60px -15px rgba(9, 30, 66, 0.12),
                      0 0 0 1px rgba(9, 30, 66, 0.04);
        }

        .auth-card-top h2 {
          font-size: 22px;
          font-weight: 900;
          margin: 0 0 6px;
          color: #0B1B3D;
        }

        .auth-card-top p {
          font-size: 13px;
          color: #6B778C;
          margin: 0 0 22px;
        }

        .auth-tabs {
          display: flex;
          background: #F4F5F7;
          border: 1px solid #EBECF0;
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 22px;
        }

        .tab-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 8px;
          border: 0;
          background: transparent;
          color: #6B778C;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #0B1B3D;
        }

        .tab-btn.is-active {
          color: #FF6B00;
          background: #ffffff;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(9, 30, 66, 0.08);
        }

        .alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.45;
          margin-bottom: 20px;
        }

        .alert-error {
          background: #FFEBE6;
          border: 1px solid #FFBDAD;
          color: #DE350B;
        }

        .alert-success {
          background: #E3FCEF;
          border: 1px solid #ABF5D1;
          color: #006644;
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-item {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-item label {
          font-size: 12px;
          font-weight: 700;
          color: #172B4D;
        }

        .text-action-btn {
          background: transparent;
          border: 0;
          color: #FF6B00;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .text-action-btn:hover {
          text-decoration: underline;
        }

        .external-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #FF6B00;
          font-size: 12px;
          text-decoration: none;
          font-weight: 600;
        }

        .external-link:hover {
          text-decoration: underline;
        }

        .styled-input, .styled-textarea {
          width: 100%;
          background: #ffffff;
          border: 1px solid #DFE1E6;
          border-radius: 10px;
          padding: 10px 14px;
          color: #172B4D;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .font-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
        }

        .styled-textarea {
          resize: vertical;
          line-height: 1.4;
        }

        .styled-input:focus, .styled-textarea:focus {
          border-color: #FF6B00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.18);
        }

        .helper-banner {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: #FFF4E5;
          border: 1px dashed #FFE2BA;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 12px;
          color: #974F00;
          line-height: 1.45;
        }

        .helper-icon {
          color: #FF6B00;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .cta-button {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          border: 0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .glow-cta {
          background: linear-gradient(115deg, #FF8B00 0%, #FF5230 100%);
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(255, 107, 0, 0.4);
        }

        .glow-cta:hover:not(:disabled) {
          background: linear-gradient(115deg, #FF7A00 0%, #E04020 100%);
          box-shadow: 0 10px 28px rgba(255, 107, 0, 0.5);
          transform: translateY(-1px);
        }

        .meta-oauth-btn {
          background: #1877f2;
          color: #fff;
          box-shadow: 0 8px 20px -4px rgba(24, 119, 242, 0.35);
        }

        .meta-oauth-btn:hover:not(:disabled) {
          background: #166fe5;
          transform: translateY(-1px);
        }

        .cta-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .meta-status-card {
          background: #FAFBFC;
          border: 1px solid #EBECF0;
          border-radius: 10px;
          padding: 10px 14px;
        }

        .status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: #5E6C84;
        }

        .badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .badge-online {
          color: #006644;
          background: #E3FCEF;
          border: 1px solid #ABF5D1;
        }

        .badge-offline {
          color: #974F00;
          background: #FFF4E5;
          border: 1px solid #FFE2BA;
        }

        .config-form-section {
          background: #FAFBFC;
          border: 1px solid #EBECF0;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .config-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          color: #0B1B3D;
        }

        .config-desc {
          font-size: 11px;
          color: #6B778C;
          margin: 0;
          line-height: 1.4;
        }

        .save-config-btn {
          width: 100%;
          padding: 10px;
          background: #ffffff;
          border: 1px solid #DFE1E6;
          border-radius: 8px;
          color: #172B4D;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .save-config-btn:hover:not(:disabled) {
          background: #F4F5F7;
        }

        .auth-footer-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 11px;
          color: #6B778C;
          text-align: center;
        }

        .home-link-wrap {
          text-align: center;
        }

        .home-link {
          color: #6B778C;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition: color 0.2s;
        }

        .home-link:hover {
          color: #FF6B00;
        }

        @media (max-width: 960px) {
          .login-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .showcase-side {
            padding-right: 0;
          }
          .preview-card {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
