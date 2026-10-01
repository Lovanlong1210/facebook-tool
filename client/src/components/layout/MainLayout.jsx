import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  FileSpreadsheet,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Settings,
  Sparkles,
  UsersRound
} from 'lucide-react';

const navigation = [
  { label: 'Bảng tin', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Studio', href: '/ai-studio', icon: Sparkles },
  { label: 'Viết bài', href: '/post-planner/compose', icon: PenLine },
  { label: 'Lịch đăng', href: '/post-planner/calendar', icon: CalendarDays },
  { label: 'Hội thoại', href: '/channels', icon: MessageCircle },
  { label: 'Báo cáo', href: '/post-planner/dashboard', icon: BarChart3 },
  { label: 'Kênh', href: '/channels', icon: UsersRound },
  { label: 'Thêm', href: '/post-planner/bulk-upload', icon: MoreHorizontal }
];

export default function MainLayout({ children, title = 'Không gian làm việc', actions }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="auth-loading">Đang xác thực phiên đăng nhập…</div>;
  if (!user) return null;

  return (
    <div className="workspace">
      <aside className="sidebar" aria-label="Điều hướng chính">
        <Link href="/" className="brand-mark-clean" aria-label="Về bảng tin" style={{ margin: '6px 0 18px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(24, 119, 242, 0.4)' }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
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
          <Link className="nav-item" href="/post-planner/bulk-upload" title="Tải Excel">
            <FileSpreadsheet size={19} strokeWidth={1.8} aria-hidden="true" /><span>Tải Excel</span>
          </Link>
          <button className="nav-item" type="button" title="Cài đặt">
            <Settings size={19} strokeWidth={1.8} aria-hidden="true" /><span>Cài đặt</span>
          </button>
          <button className="profile-avatar" type="button" aria-label={`Tài khoản ${user.name}`}>{user.name?.charAt(0)?.toUpperCase() || 'F'}</button>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-spacer" />
          <button className="icon-button" type="button" aria-label="Trợ giúp"><CircleHelp size={19} /></button>
          <button className="icon-button" type="button" aria-label="Thông báo"><Bell size={19} /></button>
          <button className="account-chip" type="button" onClick={logout} title={`Facebook ID: ${user.id} · Đăng xuất`}><span className="account-dot">{user.name?.charAt(0)?.toUpperCase() || 'F'}</span><span>{user.name}<small className="account-role">{user.role === 'admin' ? 'Admin' : 'Thành viên'} · Đăng xuất</small></span><ChevronDown size={15} /></button>
        </header>
        <main className="page-area">
          <div className="page-topline">
            <div>
              <span className="eyebrow">FB WORKSPACE PRO</span>
              <h1>{title}</h1>
            </div>
            {actions && <div className="page-actions">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
      <button className="support-fab" type="button" aria-label="Mở hỗ trợ"><Bot size={20} /></button>
    </div>
  );
}