import { useState, useEffect, useRef } from 'react';
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
  Copy,
  Check,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Settings,
  Sparkles,
  User,
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng dropdown khi chuyển trang
  useEffect(() => {
    setProfileOpen(false);
  }, [router.pathname]);

  const handleCopyUid = (e) => {
    e.stopPropagation();
    if (user?.id) {
      navigator.clipboard.writeText(String(user.id));
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  if (loading) return <div className="auth-loading">Đang xác thực phiên đăng nhập…</div>;
  if (!user) return null;

  const isSettingsActive = router.pathname.startsWith('/settings');

  return (
    <div className="workspace">
      <aside className="sidebar" aria-label="Điều hướng chính">
        <Link href="/" className="brand-mark-clean" aria-label="Về bảng tin" style={{ margin: '6px 0 18px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #FF8B00 0%, #FF5230 100%)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(255, 107, 0, 0.4)' }}>
            <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 18, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>S9</span>
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
          <Link
            className={`nav-item${isSettingsActive ? ' is-active' : ''}`}
            href="/settings"
            title="Cài đặt hệ thống"
          >
            <Settings size={19} strokeWidth={1.8} aria-hidden="true" />
            <span>Cài đặt</span>
          </Link>
          <button
            className="profile-avatar"
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-label={`Tài khoản ${user.name}`}
            title={`Tài khoản ${user.name}`}
          >
            {user.name?.charAt(0)?.toUpperCase() || 'F'}
          </button>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-spacer" />
          <button
            className="icon-button"
            type="button"
            aria-label="Trợ giúp"
            onClick={() => router.push('/settings?tab=notifications')}
            title="Trợ giúp & Hướng dẫn"
          >
            <CircleHelp size={19} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Cài đặt"
            onClick={() => router.push('/settings')}
            title="Cài đặt"
          >
            <Settings size={19} />
          </button>

          {/* Profile Menu Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              className="account-chip"
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              style={{
                cursor: 'pointer',
                background: profileOpen ? '#f1f5f9' : '#ffffff',
                transition: 'background 0.15s ease'
              }}
            >
              <span className="account-dot">{user.name?.charAt(0)?.toUpperCase() || 'F'}</span>
              <span>
                {user.name}
                <small className="account-role">
                  {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                </small>
              </span>
              <ChevronDown
                size={15}
                style={{
                  transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {/* Dropdown Menu Box */}
            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 290,
                  background: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)',
                  zIndex: 9999,
                  overflow: 'hidden',
                  animation: 'fadeInMenu 0.15s ease-out'
                }}
              >
                {/* Header Profile Card */}
                <div style={{
                  padding: '16px 16px 14px',
                  background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: 18,
                      boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                      flexShrink: 0
                    }}>
                      {user.name?.charAt(0)?.toUpperCase() || 'F'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {user.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 10,
                          background: user.role === 'admin' ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)',
                          color: user.role === 'admin' ? '#ef4444' : '#2563eb'
                        }}>
                          {user.role === 'admin' ? 'Admin' : 'Thành viên Pro'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Facebook UID row */}
                  <div style={{
                    marginTop: 10,
                    padding: '6px 10px',
                    background: '#f1f5f9',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#475569'
                  }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>ID: {user.id}</span>
                    <button
                      type="button"
                      onClick={handleCopyUid}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedUid ? '#10b981' : '#2563eb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: 0
                      }}
                      title="Sao chép Facebook ID"
                    >
                      {copiedUid ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedUid ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '6px' }}>
                  <Link
                    href="/settings?tab=account"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#334155',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} color="#64748b" />
                    <span>Thông tin tài khoản</span>
                  </Link>

                  <Link
                    href="/settings"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#334155',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={16} color="#64748b" />
                    <span>Cài đặt hệ thống & Lịch</span>
                  </Link>

                  <Link
                    href="/channels"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#334155',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <UsersRound size={16} color="#64748b" />
                    <span>Quản lý Fanpage kết nối</span>
                  </Link>

                  <Link
                    href="/ai-studio"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#334155',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Sparkles size={16} color="#FF6B00" />
                    <span>AI Marketing Studio</span>
                  </Link>

                  <Link
                    href="/post-planner/dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#334155',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <BarChart3 size={16} color="#64748b" />
                    <span>Báo cáo hiệu suất</span>
                  </Link>

                  <div style={{ height: 1, background: '#f1f5f9', margin: '4px 6px' }} />

                  {/* Đăng xuất Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#ef4444',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} color="#ef4444" />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
      <button
        className="support-fab"
        type="button"
        aria-label="Mở hỗ trợ"
        onClick={() => router.push('/ai-studio')}
        title="Trợ lý AI Marketing"
      >
        <Bot size={20} />
      </button>
    </div>
  );
}