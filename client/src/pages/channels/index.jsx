import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Globe2,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Layers,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  Key,
  X
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import channelApi from '../../services/channelApi';

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  // Modal thêm Fanpage thủ công
  const [showAddModal, setShowAddModal] = useState(false);
  const [formPageId, setFormPageId] = useState('');
  const [formPageName, setFormPageName] = useState('');
  const [formCategory, setFormCategory] = useState('Bán hàng / Dịch vụ');
  const [formLink, setFormLink] = useState('');
  const [formToken, setFormToken] = useState('');
  const [addingPage, setAddingPage] = useState(false);

  // Modal cập nhật token
  const [tokenModalPage, setTokenModalPage] = useState(null); // { id, name }
  const [newToken, setNewToken] = useState('');
  const [updatingToken, setUpdatingToken] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenVerifyMessage, setTokenVerifyMessage] = useState(null); // { valid: bool, message: string }

  // Modal đồng bộ nhanh qua Token Graph API
  const [showSyncTokenModal, setShowSyncTokenModal] = useState(false);
  const [syncTokenInput, setSyncTokenInput] = useState('');
  const [syncingWithToken, setSyncingWithToken] = useState(false);

  const loadChannels = async () => {
    setLoading(true);
    setNotice({ type: '', message: '' });
    try {
      const result = await channelApi.list();
      setChannels(result.channels || []);
    } catch (requestError) {
      setNotice({
        type: 'error',
        message: requestError.response?.data?.message || 'Không tải được danh sách kênh.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFacebook = async () => {
    setSyncing(true);
    setNotice({ type: '', message: '' });
    try {
      const result = await channelApi.sync();
      setChannels(result.channels || []);
      setNotice({
        type: result.warning ? 'warning' : 'success',
        message: result.message || (result.warning ? result.warning : 'Đã đồng bộ xong danh sách Fanpage!')
      });
    } catch (requestError) {
      setNotice({
        type: 'error',
        message: requestError.response?.data?.message || 'Lỗi khi đồng bộ từ Facebook.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleAddPage = async (e) => {
    e.preventDefault();
    if (!formPageId.trim()) {
      setNotice({ type: 'error', message: 'Vui lòng nhập Fanpage ID hoặc UID của Page.' });
      return;
    }
    setAddingPage(true);
    try {
      const res = await channelApi.add({
        pageId: formPageId.trim(),
        pageName: formPageName.trim() || `Fanpage ${formPageId.trim()}`,
        category: formCategory.trim(),
        link: formLink.trim(),
        pageToken: formToken.trim()
      });
      if (res.success) {
        setNotice({ type: 'success', message: res.message || 'Đã thêm Fanpage thành công!' });
        setShowAddModal(false);
        setFormPageId('');
        setFormPageName('');
        setFormLink('');
        setFormToken('');
        loadChannels();
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Không thể thêm Fanpage này.'
      });
    } finally {
      setAddingPage(false);
    }
  };

  const handleDeletePage = async (pageId, pageName) => {
    if (!confirm(`Bạn có chắc chắn muốn ngắt kết nối Fanpage "${pageName}"?`)) return;
    try {
      await channelApi.remove(pageId);
      setNotice({ type: 'success', message: `Đã hủy kết nối Fanpage "${pageName}".` });
      setChannels((prev) => prev.filter((p) => String(p.id) !== String(pageId)));
    } catch (err) {
      setNotice({ type: 'error', message: 'Không thể xóa Fanpage.' });
    }
  };

  const handleOpenTokenModal = (channel) => {
    setTokenModalPage({ id: channel.id, name: channel.name });
    setNewToken('');
    setTokenVerifyMessage(null);
    setNotice({ type: '', message: '' });
  };

  const handleVerifyNewToken = async () => {
    if (!newToken.trim()) {
      setTokenVerifyMessage({ valid: false, message: 'Vui lòng dán mã token trước khi kiểm tra.' });
      return;
    }
    if (newToken.trim().includes('@')) {
      setTokenVerifyMessage({ valid: false, message: '⚠️ Đây có vẻ là mật khẩu cá nhân, KHÔNG PHẢI Access Token của Facebook. Token bắt đầu bằng EAA...' });
      return;
    }
    setVerifyingToken(true);
    setTokenVerifyMessage(null);
    try {
      const res = await channelApi.verifyToken(newToken.trim(), tokenModalPage?.id);
      setTokenVerifyMessage({ valid: true, message: res.message || 'Token hợp lệ!' });
    } catch (err) {
      setTokenVerifyMessage({ valid: false, message: err.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.' });
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleUpdateToken = async (e) => {
    e.preventDefault();
    if (!newToken.trim() || newToken.trim().length < 15) {
      setNotice({ type: 'error', message: 'Token quá ngắn (token Facebook bắt đầu bằng EAA... và dài trên 20 ký tự).' });
      return;
    }
    if (newToken.trim().includes('@')) {
      setNotice({ type: 'error', message: 'Mã bạn vừa nhập giống mật khẩu cá nhân, KHÔNG PHẢI Access Token. Token bắt đầu bằng EAA...' });
      return;
    }
    setUpdatingToken(true);
    try {
      const res = await channelApi.updateToken(tokenModalPage.id, newToken.trim());
      if (res.success) {
        setNotice({ type: 'success', message: res.message || 'Đã cập nhật token thành công!' });
        setTokenModalPage(null);
        setNewToken('');
        setTokenVerifyMessage(null);
        loadChannels();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || 'Không thể cập nhật token.' });
    } finally {
      setUpdatingToken(false);
    }
  };

  // Đồng bộ bằng Token Facebook (từ Graph API Explorer)
  const handleSyncWithTokenSubmit = async (e) => {
    e.preventDefault();
    if (!syncTokenInput.trim()) {
      setNotice({ type: 'error', message: 'Vui lòng dán mã Token Facebook.' });
      return;
    }
    if (syncTokenInput.trim().includes('@')) {
      setNotice({ type: 'error', message: 'Mã bạn vừa nhập giống mật khẩu cá nhân, KHÔNG PHẢI Access Token Facebook.' });
      return;
    }
    setSyncingWithToken(true);
    setNotice({ type: '', message: '' });
    try {
      const res = await channelApi.syncWithToken(syncTokenInput.trim());
      if (res.success) {
        setNotice({ type: 'success', message: res.message || 'Đồng bộ thành công!' });
        setShowSyncTokenModal(false);
        setSyncTokenInput('');
        loadChannels();
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || 'Lỗi khi đồng bộ qua Token.' });
    } finally {
      setSyncingWithToken(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  return (
    <MainLayout
      title="Kênh đã kết nối"
      actions={
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => { setShowSyncTokenModal(true); setNotice({ type: '', message: '' }); }}
            style={{ borderColor: '#d97706', color: '#b45309', background: '#fffbeb' }}
            title="Đồng bộ nhanh Fanpage bằng mã Token từ Graph API Explorer"
          >
            <Key size={15} />
            <span>Nhập Token Graph API</span>
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={handleSyncFacebook}
            disabled={loading || syncing}
          >
            <RefreshCw size={15} className={syncing ? 'spin-icon' : ''} />
            <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ từ Facebook'}</span>
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Kết nối Fanpage mới</span>
          </button>
        </div>
      }
    >
      {notice.message && (
        <div
          className={`alert-banner alert-${notice.type || 'info'}`}
          style={{ marginBottom: 18 }}
        >
          {notice.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Grid danh sách kênh */}
      <div className="channel-grid">
        {channels.map((channel, idx) => (
          <article className={`panel channel-card custom-channel-card card-interactive animate-fade-up delay-${(idx % 4) + 1}`} key={channel.id}>
            <div className="channel-card-head">
              <div className="channel-avatar">
                <Globe2 size={24} color="#1877f2" />
              </div>
              {channel.hasValidToken !== false ? (
                <span className="channel-connected" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulseGreen 2s infinite' }} />
                  <Check size={14} /> Sẵn sàng đăng
                </span>
              ) : (
                <span className="channel-warning-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600 }} title="Chưa có Page Access Token để đăng bài">
                  <AlertCircle size={13} /> Thiếu Token
                </span>
              )}
            </div>

            <h2 className="channel-title" title={channel.name}>
              {channel.name}
            </h2>

            <div className="channel-category-tag">
              {channel.category || 'Fanpage Facebook'}
            </div>

            <div className="channel-meta-info">
              <span>ID: <code>{channel.id}</code></span>
            </div>

            <div className="channel-actions-bar">
              <Link
                href={`/post-planner/compose?pageId=${channel.id}`}
                className="btn-action-small btn-primary-soft"
                title="Tạo bài viết cho Page này"
              >
                <FileEdit size={14} />
                <span>Soạn bài</span>
              </Link>

              {channel.hasValidToken === false && (
                <button
                  type="button"
                  className="btn-action-icon btn-token-soft"
                  onClick={() => handleOpenTokenModal(channel)}
                  title="Cập nhật Page Access Token"
                >
                  <Key size={15} />
                </button>
              )}

              {channel.link && (
                <a
                  href={channel.link.startsWith('http') ? channel.link : `https://${channel.link}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-action-icon"
                  title="Xem trang trên Facebook"
                >
                  <ExternalLink size={15} />
                </a>
              )}

              <button
                type="button"
                className="btn-action-icon btn-danger-soft"
                onClick={() => handleDeletePage(channel.id, channel.name)}
                title="Ngắt kết nối Page này"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}

        {/* Nút card Thêm Fanpage mới */}
        <button
          className="panel channel-card add-card-trigger"
          type="button"
          onClick={() => setShowAddModal(true)}
        >
          <div className="add-card-circle">
            <Plus size={24} />
          </div>
          <strong>+ Kết nối thêm Fanpage</strong>
          <span className="muted">Nhập Page ID hoặc link Fanpage của bạn</span>
        </button>
      </div>

      {loading && (
        <section className="panel" style={{ marginTop: 18 }}>
          <div className="panel-body muted" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RefreshCw size={16} className="spin-icon" />
            <span>Đang kiểm tra và đồng bộ thông tin Fanpage từ hệ thống…</span>
          </div>
        </section>
      )}

      {/* Trạng thái đồng bộ Panel */}
      <section className="panel" style={{ marginTop: 22 }}>
        <div className="panel-heading">
          <h2>Trạng thái đồng bộ & Kênh Facebook</h2>
          <button
            className="button button-secondary"
            type="button"
            onClick={loadChannels}
            disabled={loading}
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
        <div className="panel-body">
          <div className="tip-line">
            <Check size={16} className="tip-check" />
            {channels.length > 0 ? (
              <span>
                Hiện tại có <strong>{channels.length} Fanpage</strong> đang sẵn sàng xuất bản và lên lịch bài đăng tự động.
              </span>
            ) : (
              <span>
                Chưa có Fanpage nào được kết nối. Hãy bấm nút <strong>"Kết nối Fanpage mới"</strong> ở góc phải hoặc <strong>"Đồng bộ từ Facebook"</strong> để tải các trang bạn quản trị!
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Modal Thêm Fanpage Thủ Công */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="modal-icon-wrap">
                  <Layers size={20} color="#2563eb" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Kết nối Fanpage của bạn</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    Nhập thông tin Page để hệ thống nhận diện và lên lịch xuất bản
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPage} className="modal-body">
              <div className="form-group">
                <label className="field-label">
                  Tên Fanpage <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Ví dụ: Shop Thời Trang A, Tin Tức 24h..."
                  value={formPageName}
                  onChange={(e) => setFormPageName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label">
                  Fanpage ID (Dãy số hoặc UID Page) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="field-input font-mono"
                  placeholder="Ví dụ: 100085432198765 hoặc 61559812345678"
                  value={formPageId}
                  onChange={(e) => setFormPageId(e.target.value)}
                  required
                />
                <span className="field-hint">
                  Lấy ID bằng cách xem phần "Giới thiệu" trên Fanpage hoặc link facebook.com/ID
                </span>
              </div>

              <div className="form-group">
                <label className="field-label">Link Fanpage (Tùy chọn)</label>
                <input
                  type="url"
                  className="field-input"
                  placeholder="https://facebook.com/trang-cua-ban"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="field-label">Chủ đề / Lĩnh vực</label>
                <select
                  className="field-input"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  <option value="Bán hàng / Thương mại điện tử">Bán hàng / Thương mại điện tử</option>
                  <option value="Dịch vụ & Doanh nghiệp">Dịch vụ & Doanh nghiệp</option>
                  <option value="Tin tức & Truyền thông">Tin tức & Truyền thông</option>
                  <option value="Giải trí & Cộng đồng">Giải trí & Cộng đồng</option>
                  <option value="Cá nhân & Blog">Cá nhân & Blog</option>
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">Page Access Token (Khuyên dùng để đăng bài tự động)</label>
                <input
                  type="password"
                  className="field-input font-mono"
                  placeholder="EAAB... (Dán Page Access Token để tool tự động đăng bài lên Fanpage)"
                  value={formToken}
                  onChange={(e) => setFormToken(e.target.value)}
                />
                <span className="field-hint" style={{ color: '#d97706', display: 'block', marginTop: 4 }}>
                  ⚠️ Lưu ý: Nếu không có token Fanpage hợp lệ, tool sẽ không thể gửi lệnh đăng bài lên Facebook.
                </span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingPage}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={addingPage}
                >
                  {addingPage ? 'Đang kết nối...' : 'Xác nhận kết nối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cập nhật Token */}
      {tokenModalPage && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="modal-icon-wrap" style={{ background: '#fef3c7' }}>
                  <Key size={20} color="#d97706" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Cập nhật Page Access Token</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    {tokenModalPage.name} (ID: {tokenModalPage.id})
                  </p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setTokenModalPage(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateToken} className="modal-body">
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                <strong style={{ fontSize: 14, color: '#b45309' }}>⚠️ Hướng dẫn lấy đúng Page Access Token:</strong><br />
                1. Mở <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}>Graph API Explorer (Bấm vào đây)</a><br />
                2. Tại cột bên phải, bấm vào ô <strong>User or Page</strong> (mặc định đang là <em>User Token</em>) → chuyển sang <strong>chọn Trang &quot;{tokenModalPage.name}&quot;</strong>.<br />
                3. Hoặc bấm <strong>Add a Permission</strong> → chọn 3 quyền: <code>pages_manage_posts</code>, <code>pages_show_list</code>, <code>pages_read_engagement</code>.<br />
                4. Bấm <strong>Generate Access Token</strong> → Cấp quyền nếu hỏi → Copy mã token dán vào ô bên dưới.
              </div>

              <div className="form-group">
                <label className="field-label">
                  Page Access Token <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="field-input font-mono"
                  placeholder="EAAB... (Mã token dài của Facebook)"
                  value={newToken}
                  onChange={(e) => {
                    setNewToken(e.target.value);
                    setTokenVerifyMessage(null);
                  }}
                  required
                  autoFocus
                />
                {newToken.includes('@') && (
                  <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 600 }}>
                    ⚠️ Cảnh báo: Bạn đang nhập mật khẩu cá nhân! Access Token là chuỗi dài bắt đầu bằng EAA... lấy từ Graph API Explorer.
                  </span>
                )}
              </div>

              {tokenVerifyMessage && (
                <div className={`alert-banner ${tokenVerifyMessage.valid ? 'alert-success' : 'alert-error'}`} style={{ padding: '8px 12px', fontSize: 12 }}>
                  {tokenVerifyMessage.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{tokenVerifyMessage.message}</span>
                </div>
              )}

              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={handleVerifyNewToken}
                  disabled={verifyingToken || !newToken.trim()}
                  style={{ fontSize: 13 }}
                >
                  <RefreshCw size={14} className={verifyingToken ? 'spin-icon' : ''} />
                  <span>{verifyingToken ? 'Đang kiểm tra...' : 'Kiểm tra với Facebook'}</span>
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="button button-secondary" onClick={() => setTokenModalPage(null)} disabled={updatingToken}>Hủy</button>
                  <button type="submit" className="button button-primary" disabled={updatingToken} style={{ background: '#d97706' }}>
                    {updatingToken ? 'Đang lưu...' : 'Lưu Token'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đồng bộ nhanh bằng Token Facebook */}
      {showSyncTokenModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="modal-icon-wrap" style={{ background: '#eff6ff' }}>
                  <Key size={20} color="#2563eb" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Đồng bộ Fanpage bằng Token Facebook</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    Nhập User Token hoặc Page Token từ Graph API Explorer
                  </p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowSyncTokenModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSyncWithTokenSubmit} className="modal-body">
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                <strong>Cách lấy nhanh Token:</strong><br />
                1. Mở <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>Graph API Explorer</a><br />
                2. Bấm <strong>Add a Permission</strong> → chọn: <code>pages_show_list</code>, <code>pages_read_engagement</code>, <code>pages_manage_posts</code><br />
                3. Bấm <strong>Generate Access Token</strong> → Cho phép quyền → Copy mã Token dán vào ô dưới đây.<br />
                <em>Hệ thống sẽ tự động quét và kết nối tất cả Fanpage cùng Token đăng bài tương ứng!</em>
              </div>

              <div className="form-group">
                <label className="field-label">
                  Mã Facebook Access Token <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  className="field-input font-mono"
                  rows={4}
                  placeholder="Dán mã Token Facebook (bắt đầu bằng EAA...) vào đây..."
                  value={syncTokenInput}
                  onChange={(e) => setSyncTokenInput(e.target.value)}
                  required
                  autoFocus
                />
                {syncTokenInput.includes('@') && (
                  <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 600 }}>
                    ⚠️ Cảnh báo: Bạn đang nhập mật khẩu cá nhân! Access Token là chuỗi dài bắt đầu bằng EAA...
                  </span>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowSyncTokenModal(false)} disabled={syncingWithToken}>Hủy</button>
                <button type="submit" className="button button-primary" disabled={syncingWithToken}>
                  {syncingWithToken ? 'Đang đồng bộ...' : 'Bắt đầu đồng bộ Fanpage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-channel-card {
          display: flex;
          flex-direction: column;
          padding: 20px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .custom-channel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .channel-title {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 14px 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .channel-category-tag {
          display: inline-block;
          font-size: 12px;
          color: #2563eb;
          background: #eff6ff;
          padding: 3px 8px;
          border-radius: 6px;
          width: fit-content;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .channel-meta-info {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 16px;
        }

        .channel-meta-info code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          color: #334155;
          font-family: monospace;
        }

        .channel-actions-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .btn-action-small {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary-soft {
          background: #2563eb;
          color: #ffffff;
        }

        .btn-primary-soft:hover {
          background: #1d4ed8;
        }

        .btn-action-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action-icon:hover {
          color: #0f172a;
          background: #f1f5f9;
        }

        .btn-danger-soft:hover {
          color: #ef4444;
          background: #fef2f2;
          border-color: #fee2e2;
        }

        .btn-token-soft {
          border-color: #fde68a;
          background: #fffbeb;
          color: #d97706;
        }

        .btn-token-soft:hover {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #b45309;
        }

        .add-card-trigger {
          border: 2px dashed #cbd5e1 !important;
          background: #f8fafc !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          cursor: pointer;
          border-radius: 14px;
          text-align: center;
          transition: all 0.2s;
        }

        .add-card-trigger:hover {
          background: #eff6ff !important;
          border-color: #93c5fd !important;
        }

        .add-card-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #2563eb;
          display: grid;
          place-items: center;
          margin-bottom: 12px;
        }

        .add-card-trigger:hover .add-card-circle {
          background: #2563eb;
          color: #ffffff;
        }

        .alert-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
        }

        .alert-success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .alert-warning {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .alert-error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-box {
          background: #ffffff;
          border-radius: 18px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: modalAppear 0.2s ease-out;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #eff6ff;
          display: grid;
          place-items: center;
        }

        .modal-close-btn {
          border: 0;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .modal-close-btn:hover {
          color: #0f172a;
          background: #f1f5f9;
        }

        .modal-body {
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .field-input {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .field-hint {
          font-size: 11px;
          color: #94a3b8;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }
      `}</style>
    </MainLayout>
  );
}