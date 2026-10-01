import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import {
  BarChart3,
  Bot,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  MoreHorizontal,
  PenLine,
  Sparkles,
  UsersRound
} from 'lucide-react';

const navigation = [
  { label: 'Bảng tin', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Studio', href: '/ai-studio', icon: Sparkles },
  { label: 'Viết bài', href: '/post-planner/compose', icon: PenLine },
  { label: 'Lịch đăng', href: '/post-planner/calendar', icon: CalendarDays },
  { label: 'Báo cáo', href: '/post-planner/dashboard', icon: BarChart3 },
  { label: 'Kênh', href: '/channels', icon: UsersRound },
  { label: 'Thêm', href: '/post-planner/bulk-upload', icon: MoreHorizontal }
];

export default function MainLayout({ children, title = 'Không gian làm việc', actions }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isAuthenticated = Boolean(user);

  if (loading) return <div className="auth-loading">Đang xác thực phiên đăng nhập…</div>;

  const accountLabel = isAuthenticated ? user.name : 'Khách';
  const accountRole = isAuthenticated ? (user.role === 'admin' ? 'Admin' : 'Thành viên') : 'Xem trước';

  return (
    <div className="workspace">
      <aside className="sidebar" aria-label="Điều hướng chính">
        <Link href="/" className="brand-mark" aria-label="Về bảng tin">
          <Image src="/brand-logo.jpg" alt="Logo" width={43} height={43} priority />
        </Link>
        <nav className="sidebar-nav">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === '/'
              ? router.pathname === '/'
              : router.pathname === href || router.pathname.startsWith(`${href}/`);
            return (
              <Link className={`nav-item${active ? ' is-active' : ''}`} href={href} key={label} title={label}>
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button className="profile-avatar" type="button" aria-label={accountLabel}>{isAuthenticated ? (user.name?.charAt(0)?.toUpperCase() || 'F') : 'V'}</button>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-spacer" />
          <button
            className="account-chip"
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                logout();
                return;
              }
              router.push('/login');
            }}
            title={isAuthenticated ? `Facebook ID: ${user.id} · Đăng xuất` : 'Đăng nhập để dùng chức năng quản lý'}
          >
            <span className="account-dot">{isAuthenticated ? (user.name?.charAt(0)?.toUpperCase() || 'F') : 'V'}</span>
            <span>{accountLabel}<small className="account-role">{accountRole} · {isAuthenticated ? 'Đăng xuất' : 'Đăng nhập'}</small></span>
            <ChevronDown size={15} />
          </button>
        </header>
        <main className="page-area">
          <div className="page-topline">
            <div>
              <h1>{title}</h1>
            </div>
            {actions && <div className="page-actions">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
      <button className="support-fab" type="button" aria-label="Mở hỗ trợ" style={{ display: 'none' }}><Bot size={20} /></button>
    </div>
  );
}