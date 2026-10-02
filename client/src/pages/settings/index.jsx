import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  User,
  Settings,
  Bell,
  Sparkles,
  Shield,
  Save,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sliders,
  Clock,
  Globe,
  Radio,
  FileText,
  Trash2,
  LogOut
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import useAuth from '../../hooks/useAuth';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form states (lưu local để trải nghiệm mượt mà)
  const [displayName, setDisplayName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [postInterval, setPostInterval] = useState('30');
  const [autoCleanMedia, setAutoCleanMedia] = useState(true);
  const [aiTone, setAiTone] = useState('engaging');
  const [aiLength, setAiLength] = useState('standard');
  const [autoHashtags, setAutoHashtags] = useState(true);
  const [autoSeeding, setAutoSeeding] = useState(true);
  const [notifyExpiredToken, setNotifyExpiredToken] = useState(true);
  const [notifySuccessSound, setNotifySuccessSound] = useState(false);

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(String(router.query.tab));
    }
  }, [router.query.tab]);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
    // Load config from localStorage nếu có
    try {
      const saved = localStorage.getItem('fb_tool_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.postInterval) setPostInterval(parsed.postInterval);
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
        if (parsed.aiTone) setAiTone(parsed.aiTone);
        if (parsed.aiLength) setAiLength(parsed.aiLength);
        if (typeof parsed.autoHashtags === 'boolean') setAutoHashtags(parsed.autoHashtags);
        if (typeof parsed.autoSeeding === 'boolean') setAutoSeeding(parsed.autoSeeding);
        if (typeof parsed.notifyExpiredToken === 'boolean') setNotifyExpiredToken(parsed.notifyExpiredToken);
      }
    } catch {}
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const config = {
        displayName,
        contactEmail,
        timezone,
        postInterval,
        autoCleanMedia,
        aiTone,
        aiLength,
        autoHashtags,
        autoSeeding,
        notifyExpiredToken,
        notifySuccessSound
      };
      localStorage.setItem('fb_tool_settings', JSON.stringify(config));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(String(user.id));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <MainLayout title="Cài đặt hệ thống">
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Banner thông báo lưu thành công */}
        {savedNotice && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 10,
            color: '#065f46',
            fontWeight: 600,
            fontSize: 14,
            boxShadow: '0 2px 8px rgba(16,185,129,0.1)'
          }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>Đã lưu tất cả các cấu hình thành công! Các thiết lập mới sẽ được áp dụng ngay lập tức.</span>
          </div>
        )}

        {/* Layout: Sidebar tab bên trái + Content bên phải */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Menu Tab */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: activeTab === 'account' ? 700 : 500,
                color: activeTab === 'account' ? '#FF6B00' : '#475569',
                background: activeTab === 'account' ? 'rgba(255, 107, 0, 0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <User size={16} />
              <span>Hồ sơ & Tài khoản</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('publishing')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: activeTab === 'publishing' ? 700 : 500,
                color: activeTab === 'publishing' ? '#FF6B00' : '#475569',
                background: activeTab === 'publishing' ? 'rgba(255, 107, 0, 0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Clock size={16} />
              <span>Đăng bài & Hàng đợi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: activeTab === 'ai' ? 700 : 500,
                color: activeTab === 'ai' ? '#FF6B00' : '#475569',
                background: activeTab === 'ai' ? 'rgba(255, 107, 0, 0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={16} />
              <span>Trợ lý AI Marketing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: activeTab === 'notifications' ? 700 : 500,
                color: activeTab === 'notifications' ? '#FF6B00' : '#475569',
                background: activeTab === 'notifications' ? 'rgba(255, 107, 0, 0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Bell size={16} />
              <span>Thông báo & Bảo mật</span>
            </button>

            <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }} />

            <button
              type="button"
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#ef4444',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <LogOut size={16} />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>

          {/* Nội dung Tab bên phải */}
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            {/* TAB 1: HỒ SƠ & TÀI KHOẢN */}
            {activeTab === 'account' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Thông tin tài khoản & Hồ sơ cá nhân
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                  Quản lý danh tính người dùng và thông tin liên kết Facebook của bạn.
                </p>

                {/* Profile Header Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  marginBottom: 24
                }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 24,
                    boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
                  }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{user?.name}</span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: user?.role === 'admin' ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)',
                        color: user?.role === 'admin' ? '#ef4444' : '#2563eb'
                      }}>
                        {user?.role === 'admin' ? 'Quản trị viên (Admin)' : 'Thành viên'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                      <span>Facebook UID: <strong>{user?.id}</strong></span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedId ? '#10b981' : '#FF6B00',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600
                        }}
                      >
                        <Copy size={12} />
                        {copiedId ? 'Đã sao chép!' : 'Sao chép'}
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Tên hiển thị
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Email liên hệ / Thông báo
                      </label>
                      <input
                        type="email"
                        placeholder="admin@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Facebook User ID (UID)
                    </label>
                    <input
                      type="text"
                      value={user?.id || ''}
                      disabled
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        color: '#64748b',
                        fontSize: 13,
                        boxSizing: 'border-box'
                      }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: 11, marginTop: 4, display: 'block' }}>
                      UID này được đồng bộ trực tiếp từ tài khoản đăng nhập Facebook của bạn.
                    </small>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        borderRadius: 8,
                        background: '#FF6B00',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      <Save size={15} />
                      <span>Lưu thông tin</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: ĐĂNG BÀI & HÀNG ĐỢI */}
            {activeTab === 'publishing' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Cấu hình Đăng bài & Lịch trình
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                  Tùy chỉnh khoảng cách lên lịch, múi giờ và định dạng thời gian.
                </p>

                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Múi giờ hệ thống
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          background: '#fff'
                        }}
                      >
                        <option value="Asia/Ho_Chi_Minh">(GMT+07:00) Hà Nội, TP. Hồ Chí Minh, Bangkok</option>
                        <option value="Asia/Singapore">(GMT+08:00) Singapore, Kuala Lumpur</option>
                        <option value="Asia/Tokyo">(GMT+09:00) Tokyo, Seoul</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Định dạng hiển thị thời gian
                      </label>
                      <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#334155' }}>
                        <span style={{ color: '#FF6B00', fontWeight: 800 }}>● Chuẩn 24 Giờ (00:00 - 23:59)</span>: Đã áp dụng trên toàn bộ hệ thống (Soạn bài, Tải Excel, Danh sách bài đăng).
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Giãn cách mặc định giữa các bài đăng tự động
                      </label>
                      <select
                        value={postInterval}
                        onChange={(e) => setPostInterval(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          background: '#fff'
                        }}
                      >
                        <option value="15">15 phút</option>
                        <option value="30">30 phút (Khuyên dùng)</option>
                        <option value="45">45 phút</option>
                        <option value="60">60 phút (1 giờ)</option>
                        <option value="120">120 phút (2 giờ)</option>
                      </select>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={autoCleanMedia}
                        onChange={(e) => setAutoCleanMedia(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Tự động dọn dẹp file hình ảnh/video tạm sau khi bài đăng đã xuất bản thành công</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        borderRadius: 8,
                        background: '#FF6B00',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      <Save size={15} />
                      <span>Lưu cấu hình</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: TRỢ LÝ AI MARKETING */}
            {activeTab === 'ai' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Cấu hình Trợ lý AI Marketing
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                  Thiết lập phong cách viết bài, độ dài và các tiện ích nội dung do AI hỗ trợ.
                </p>

                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Tone giọng viết mặc định
                      </label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          background: '#fff'
                        }}
                      >
                        <option value="engaging">🔥 Thu hút & Kêu gọi tương tác cao (Viral)</option>
                        <option value="professional">💼 Chuyên nghiệp & Đáng tin cậy (B2B / Doanh nghiệp)</option>
                        <option value="sales">🎯 Bán hàng & Thúc đẩy chuyển đổi (Chốt đơn)</option>
                        <option value="humorous">😄 Hài hước & Gần gũi (Gen Z / Bắt trend)</option>
                        <option value="storytelling">📖 Kể chuyện & Truyền cảm hứng (Storytelling)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Độ dài bài viết đề xuất
                      </label>
                      <select
                        value={aiLength}
                        onChange={(e) => setAiLength(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          background: '#fff'
                        }}
                      >
                        <option value="short">Ngắn gọn (1 - 2 đoạn, phù hợp đăng kèm ảnh/video)</option>
                        <option value="standard">Tiêu chuẩn (3 - 5 đoạn, đầy đủ mở đầu, nội dung và CTA)</option>
                        <option value="long">Bài viết dài (Chuyên sâu, phân tích chi tiết)</option>
                      </select>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={autoHashtags}
                        onChange={(e) => setAutoHashtags(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Tự động đính kèm Hashtag thịnh hành và Icon cảm xúc vào cuối bài</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={autoSeeding}
                        onChange={(e) => setAutoSeeding(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Gợi ý sẵn 2 comment mồi (seeding) tự động kích thích tương tác cho mỗi bài</span>
                    </label>

                    <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ fontSize: 13, color: '#0f172a' }}>🔌 Kết nối AI Agent / LLM Chatbot</strong>
                          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                            Nối trực tiếp Google Gemini (miễn phí), OpenAI, DeepSeek hoặc Agent Dify/Webhook để chatbox trả lời linh hoạt đa văn phong.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push('/ai-studio')}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            background: 'linear-gradient(115deg, #FF8B00 0%, #FF5230 100%)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Mở AI Studio để nối Agent ➔
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        borderRadius: 8,
                        background: '#FF6B00',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      <Save size={15} />
                      <span>Lưu cấu hình AI</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: THÔNG BÁO & BẢO MẬT */}
            {activeTab === 'notifications' && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Thông báo & Bảo mật tài khoản
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                  Kiểm soát các cảnh báo lỗi token Fanpage và bảo mật phiên đăng nhập.
                </p>

                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={notifyExpiredToken}
                        onChange={(e) => setNotifyExpiredToken(e.target.checked)}
                        style={{ width: 16, height: 16, marginTop: 2 }}
                      />
                      <div>
                        <strong>Cảnh báo khi Access Token Fanpage hết hạn hoặc mất kết nối</strong>
                        <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                          Hiển thị cảnh báo trực quan và giải thích nguyên nhân rõ ràng kèm hướng dẫn tạo lại token Facebook.
                        </div>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={notifySuccessSound}
                        onChange={(e) => setNotifySuccessSound(e.target.checked)}
                        style={{ width: 16, height: 16, marginTop: 2 }}
                      />
                      <div>
                        <strong>Thông báo âm thanh khi xuất bản bài thành công</strong>
                        <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                          Phát âm thanh nhẹ khi hàng đợi BullMQ hoàn tất đăng bài lên Fanpage.
                        </div>
                      </div>
                    </label>

                    <div style={{
                      marginTop: 10,
                      padding: 14,
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#92400e',
                      lineHeight: 1.6
                    }}>
                      💡 <strong>Mẹo bảo mật Fanpage:</strong> Token Facebook Fanpage chuẩn thường có hiệu lực từ 60 ngày hoặc vĩnh viễn (nếu lấy từ Meta System User). Để tránh gián đoạn lịch đăng, hãy kiểm tra trạng thái token định kỳ tại mục <strong>Kênh đã kết nối</strong>.
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        borderRadius: 8,
                        background: '#FF6B00',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      <Save size={15} />
                      <span>Lưu thiết lập</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
