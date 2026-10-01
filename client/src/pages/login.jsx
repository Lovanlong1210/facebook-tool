import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, ArrowUpRight, BarChart3, CalendarDays, CheckCircle2, Layers3, LoaderCircle, ShieldCheck } from 'lucide-react';
import authApi from '../services/authApi';

const workspaceFeatures = [
  { icon: CalendarDays, title: 'Lịch đăng', description: 'Theo dõi nội dung theo ngày.' },
  { icon: Layers3, title: 'Fanpage đã kết nối', description: 'Đồng bộ các Page bạn quản lý.' },
  { icon: BarChart3, title: 'Báo cáo', description: 'Theo dõi trạng thái và hiệu suất.' }
];

export default function LoginPage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const error = router.query.error;
    const loggedOut = router.query.loggedOut === '1';
    if (error === 'oauth_state_invalid') setErrorMessage('Phiên đăng nhập hết hạn hoặc không hợp lệ. Hãy thử lại.');
    if (error === 'oauth_failed') setErrorMessage('Facebook không hoàn tất đăng nhập. Kiểm tra Meta App và callback URL.');
    if (loggedOut) setErrorMessage('Bạn đã đăng xuất. Mọi phiên Facebook cũ đã được xóa khỏi trình duyệt.');

    authApi.me()
      .then(() => {
        const next = typeof router.query.next === 'string' && router.query.next.startsWith('/') && !router.query.next.startsWith('//')
          ? router.query.next
          : '/dashboard';
        router.replace(next);
      })
      .catch(() => {})
      .finally(() => authApi.status().then(setAuthStatus).catch(() => setAuthStatus({ configured: false, missing: ['API backend'] })).finally(() => setLoading(false)));
  }, [router.isReady, router.query.error, router.query.loggedOut, router.query.next]);

  const startFacebookLogin = () => {
    window.location.assign(authApi.facebookLoginUrl);
  };

  return (
    <main className="login-shell">
      <div className="login-frame">
        <header className="login-topbar">
          <Link href="/" className="login-wordmark" aria-label="Về trang chủ">
            <span className="login-avatar"><Image src="/brand-logo.jpg" alt="" width={44} height={44} priority /></span>
            <span className="login-wordmark-copy"><strong>PAGE WORKSPACE</strong><small>FACEBOOK CONTENT DESK</small></span>
          </Link>
          <Link href="/" className="login-home-link">Trang chủ <ArrowUpRight size={15} /></Link>
        </header>

        <div className="login-layout">
          <section className="login-story" aria-label="Không gian làm việc">
            <div className="login-kicker"><span /> QUẢN LÝ NỘI DUNG FACEBOOK</div>
            <h1>Giữ mọi Page<br /><em>đúng nhịp.</em></h1>
            <p className="login-story-copy">Một nơi để sắp xếp lịch đăng, nội dung và hiệu suất các Fanpage của bạn.</p>

            <div className="login-feature-list">
              {workspaceFeatures.map(({ icon: Icon, title, description }, index) => <div className="login-feature" key={title}>
                <span className="login-feature-number">0{index + 1}</span>
                <span className="login-feature-icon"><Icon size={18} strokeWidth={1.8} /></span>
                <span className="login-feature-copy"><strong>{title}</strong><small>{description}</small></span>
              </div>)}
            </div>

            <div className="login-story-foot"><span className="login-live-dot" /> Kết nối trực tiếp với Facebook</div>
          </section>

          <section className="login-panel" aria-labelledby="login-title">
            <div className="login-panel-head">
              <span className="login-panel-label">TÀI KHOẢN CỦA BẠN</span>
              <h2 id="login-title">Đăng nhập</h2>
              <p>Tiếp tục bằng tài khoản Facebook để vào workspace.</p>
            </div>

            {errorMessage && <div className="notice login-error" role="alert"><span>{errorMessage}</span></div>}

            <button className="button button-primary login-facebook" type="button" onClick={startFacebookLogin} disabled={loading || !authStatus?.configured}>
              {loading ? <LoaderCircle className="login-spinner" size={18} /> : <ArrowRight size={18} />}
              {loading ? 'Đang kiểm tra kết nối…' : 'Tiếp tục với Facebook'}
              {!loading && <ArrowUpRight className="login-button-arrow" size={16} />}
            </button>

            {!errorMessage && !loading && authStatus?.configured && (
              <div className="login-status-box"><CheckCircle2 size={16} /><span>Fanpage được đồng bộ từ tài khoản Facebook bạn kết nối.</span></div>
            )}

            {!loading && !authStatus?.configured && (
              <div className="login-setup">
                <strong>Cần cấu hình backend</strong>
                <p>Vui lòng kiểm tra các biến môi trường trong <code>server/.env</code> và khởi động lại server.</p>
              </div>
            )}

            {!loading && authStatus?.configured && !authStatus.adminConfigured && (
              <div className="login-setup">
                <strong>Chưa có quản trị viên được khai báo</strong>
                <p>Đăng nhập sẽ tiếp tục. Nếu cần quyền quản trị, hãy thêm Facebook User ID của bạn vào <code>FACEBOOK_ADMIN_IDS</code>.</p>
              </div>
            )}

            <div className="login-security"><ShieldCheck size={17} /><span>Ứng dụng không nhận hoặc lưu mật khẩu Facebook.</span></div>
          </section>
        </div>

        <footer className="login-footer"><span>PAGE WORKSPACE</span><span>Đăng nhập bảo mật qua Facebook OAuth</span></footer>
      </div>
    </main>
  );
}
