import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Globe2, ShieldCheck } from 'lucide-react';
import authApi from '../services/authApi';

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
      <section className="login-card">
        <div className="login-brand"><Image src="/brand-logo.jpg" alt="Logo" width={52} height={52} priority /><div><span className="eyebrow">SO9 SOCIAL WORKSPACE</span><h1>Đăng nhập</h1></div></div>
        <p className="login-intro">Đăng nhập bằng Facebook để quản lý Fanpage và lịch đăng bài.</p>
        {errorMessage && <div className="notice login-error">{errorMessage}</div>}
        <button className="button button-primary login-facebook" type="button" onClick={startFacebookLogin} disabled={loading || !authStatus?.configured}>
          <Globe2 size={18} /> Tiếp tục với Facebook
        </button>
        {!loading && !authStatus?.configured && <div className="login-setup"><strong>Cần cấu hình máy chủ</strong><p>Thêm các biến sau vào <code>server/.env</code> rồi restart backend:</p><ul>{(authStatus?.missing || []).map((item) => <li key={item}><code>{item}</code></li>)}</ul><p>Meta App cần bật Facebook Login và đăng ký đúng <code>FACEBOOK_REDIRECT_URI</code>. Thêm Facebook User ID của quản trị viên vào <code>FACEBOOK_ADMIN_IDS</code>.</p></div>}
        {!loading && authStatus?.configured && !authStatus.adminConfigured && <div className="login-setup"><strong>Chưa có admin được khai báo</strong><p>Bạn vẫn có thể đăng nhập với quyền thành viên. Đăng nhập xong, xem Facebook ID ở tooltip tài khoản rồi thêm ID đó vào <code>FACEBOOK_ADMIN_IDS</code> trong <code>server/.env</code>.</p></div>}
        <div className="login-security"><ShieldCheck size={16} /> Session được ký máy chủ và cookie HttpOnly; access token Facebook không lưu trong session.</div>
      </section>
    </main>
  );
}
