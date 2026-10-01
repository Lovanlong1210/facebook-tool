import Link from 'next/link';
import Image from 'next/image';
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
          <Link className="nav-item" href="/post-planner/bulk-upload" title="Tải Excel">
            <FileSpreadsheet size={19} strokeWidth={1.8} aria-hidden="true" /><span>Tải Excel</span>
          </Link>
          <button className="nav-item" type="button" title="Cài đặt">
            <Settings size={19} strokeWidth={1.8} aria-hidden="true" /><span>Cài đặt</span>
          </button>
          <button className="profile-avatar" type="button" aria-label="Tài khoản Tuấn">T</button>
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
              <span className="eyebrow">SO9 SOCIAL WORKSPACE</span>
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