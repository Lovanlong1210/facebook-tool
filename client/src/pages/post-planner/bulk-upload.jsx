import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Check,
  FileSpreadsheet,
  UploadCloud,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  MessageSquare,
  Image as ImageIcon,
  Video,
  FileText,
  FolderArchive,
  History,
  CheckSquare,
  Square
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import postApi from '../../services/postApi';
import channelApi from '../../services/channelApi';
import DateTimePicker24h from '../../components/common/DateTimePicker24h';

const SAVED_FILES_KEY = 'pageflow_saved_excel_history_v1';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Danh sách bài đã parse từ Excel để xem, sửa, xoá
  const [stagedPosts, setStagedPosts] = useState([]);
  const [selectedTempIds, setSelectedTempIds] = useState([]);
  const [channels, setChannels] = useState([]);

  // Lịch sử file đã lưu
  const [savedFiles, setSavedFiles] = useState([]);

  // Modal Preview & Edit
  const [previewPost, setPreviewPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    channelApi.list()
      .then((res) => {
        setChannels(res.channels || []);
      })
      .catch(() => {});

    // Đọc lịch sử file đã lưu từ localStorage
    try {
      const stored = localStorage.getItem(SAVED_FILES_KEY);
      if (stored) {
        setSavedFiles(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveFileToHistory = (fileName, fileSize, posts) => {
    try {
      const newEntry = {
        fileId: 'file_' + Date.now(),
        fileName: fileName || 'Lịch đăng Excel',
        uploadDate: new Date().toISOString(),
        fileSize: fileSize || 0,
        totalPosts: posts.length,
        posts
      };
      setSavedFiles((prev) => {
        const updated = [newEntry, ...prev.filter((f) => f.fileName !== fileName)].slice(0, 10);
        localStorage.setItem(SAVED_FILES_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };

  const removeFileFromHistory = (fileId, e) => {
    if (e) e.stopPropagation();
    if (confirm('Bạn có chắc muốn xoá tệp này khỏi danh sách đã lưu?')) {
      setSavedFiles((prev) => {
        const updated = prev.filter((f) => f.fileId !== fileId);
        localStorage.setItem(SAVED_FILES_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const loadFromHistory = (saved) => {
    if (!saved || !Array.isArray(saved.posts)) return;
    setStagedPosts(saved.posts);
    setSelectedTempIds(saved.posts.map((p) => p.tempId));
    setStatusMessage(`Đã nạp lại ${saved.posts.length} bài đăng từ tệp "${saved.fileName}". Hãy tick chọn các bài muốn lên lịch!`);
    setErrorMessage('');
    setSuccessInfo(null);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected || null);
    setStatusMessage('');
    setErrorMessage('');
  };

  // Bước 1: Parse file Excel để lấy danh sách hiển thị
  const handleParseExcel = async () => {
    if (!file) {
      alert('Vui lòng chọn file Excel trước!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setParsing(true);
    setStatusMessage('');
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const res = await postApi.parseExcel(formData);
      if (res.success && Array.isArray(res.posts)) {
        setStagedPosts(res.posts);
        // Mặc định chọn tất cả bài đăng
        setSelectedTempIds(res.posts.map((p) => p.tempId));
        saveFileToHistory(file.name, file.size, res.posts);
        setStatusMessage(`Đã đọc và lưu tệp thành công (${res.posts.length} bài đăng). Bạn có thể tick chọn bài muốn đăng, xem, sửa hoặc xoá trước khi xác nhận!`);
      } else {
        setErrorMessage(res.message || 'Không thể đọc nội dung file Excel.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Lỗi đọc file Excel.');
    } finally {
      setParsing(false);
    }
  };

  // Xử lý Chọn tất cả / Bỏ chọn tất cả
  const handleToggleSelectAll = () => {
    if (selectedTempIds.length === stagedPosts.length) {
      setSelectedTempIds([]);
    } else {
      setSelectedTempIds(stagedPosts.map((p) => p.tempId));
    }
  };

  // Xử lý Chọn / Bỏ chọn từng bài
  const handleToggleSelectOne = (tempId) => {
    setSelectedTempIds((prev) =>
      prev.includes(tempId) ? prev.filter((id) => id !== tempId) : [...prev, tempId]
    );
  };

  // Xóa 1 bài khỏi danh sách staged
  const handleDeletePost = (tempId) => {
    if (confirm('Bạn có chắc muốn loại bỏ bài đăng này khỏi danh sách lên lịch?')) {
      setStagedPosts((prev) => prev.filter((p) => p.tempId !== tempId));
      setSelectedTempIds((prev) => prev.filter((id) => id !== tempId));
    }
  };

  // Hủy bỏ toàn bộ
  const handleReset = () => {
    if (confirm('Hủy bỏ danh sách đang duyệt để chọn file khác?')) {
      setStagedPosts([]);
      setSelectedTempIds([]);
      setFile(null);
      setStatusMessage('');
      setErrorMessage('');
      setSuccessInfo(null);
    }
  };

  // Cập nhật Page ID cho 1 bài
  const handlePageChange = (tempId, newPageId) => {
    setStagedPosts((prev) => prev.map((p) => {
      if (p.tempId !== tempId) return p;
      const foundPage = channels.find((c) => String(c.id) === String(newPageId));
      return {
        ...p,
        pageId: newPageId,
        pageName: foundPage ? foundPage.name : `Page ${newPageId}`
      };
    }));
  };

  // Lưu chỉnh sửa bài viết từ Edit Modal
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingPost) return;

    setStagedPosts((prev) => prev.map((p) => (p.tempId === editingPost.tempId ? editingPost : p)));
    setEditingPost(null);
  };

  // Bước 2: Xác nhận và chính thức gửi những bài ĐÃ CHỌN lên lịch
  const handleConfirmAndSchedule = async () => {
    const postsToSchedule = stagedPosts.filter((p) => selectedTempIds.includes(p.tempId));

    if (postsToSchedule.length === 0) {
      alert('Vui lòng chọn ít nhất 1 bài đăng để lên lịch!');
      return;
    }

    setConfirming(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const res = await postApi.confirmBulkPosts(postsToSchedule);
      if (res.success) {
        setSuccessInfo({
          total: postsToSchedule.length,
          createdCount: (res.data || []).length,
          errors: res.errors || []
        });
        // Loại bỏ các bài đã đăng thành công khỏi staged list
        const remaining = stagedPosts.filter((p) => !selectedTempIds.includes(p.tempId));
        setStagedPosts(remaining);
        setSelectedTempIds(remaining.map((p) => p.tempId));
        setFile(null);
      } else {
        setErrorMessage(res.message || 'Không thể xếp lịch bài viết.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Lỗi xác nhận bài viết.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <MainLayout title="Nhập bài đăng hàng loạt từ Excel">
      {/* Thông báo thành công sau khi xác nhận */}
      {successInfo && (
        <section className="panel" style={{ marginBottom: 20, borderLeft: '4px solid #10B981', background: '#F0FDF4' }}>
          <div className="panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle2 size={32} color="#10B981" />
              <div>
                <strong style={{ fontSize: 16, color: '#065F46' }}>Lên lịch thành công!</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#047857' }}>
                  Đã đưa {successInfo.createdCount}/{successInfo.total} bài đăng đã chọn vào hàng đợi xuất bản tự động BullMQ.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/post-planner/list" className="button button-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>Xem danh sách bài</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/post-planner/calendar" className="button button-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} />
                <span>Xem trên Lịch biểu</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Thông báo trạng thái / lỗi */}
      {statusMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#E3FCEF', border: '1px solid #ABF5D1', borderRadius: 10, color: '#006644', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FFEBE6', border: '1px solid #FFBDAD', borderRadius: 10, color: '#DE350B', marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* GIAI ĐOẠN 1: Nếu chưa parse file, hiển thị khung upload và danh sách file đã lưu */}
      {stagedPosts.length === 0 && (
        <div className="upload-layout">
          <section className="panel">
            <div className="panel-heading">
              <h2>Tải tệp lịch đăng Excel</h2>
              <span className="muted">Hỗ trợ .XLSX · .XLS</span>
            </div>
            <div className="panel-body">
              <div className="file-drop" style={{ border: file ? '2px solid #FF6B00' : '2px dashed #DFE1E6', background: file ? 'rgba(255, 107, 0, 0.03)' : '#FAFBFC' }}>
                <div>
                  <span className="file-icon" style={{ color: file ? '#FF6B00' : '#6B778C' }}><UploadCloud size={28} /></span>
                  <strong style={{ fontSize: 15, display: 'block', margin: '8px 0 4px', color: '#172B4D' }}>
                    {file ? file.name : 'Chọn tệp Excel kế hoạch đăng bài'}
                  </strong>
                  <p className="muted" style={{ fontSize: 13 }}>
                    Kéo thả tệp vào đây hoặc <label htmlFor="excel-upload" style={{ color: '#FF6B00', cursor: 'pointer', fontWeight: 700 }}>duyệt tệp từ máy tính</label>
                  </p>
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} id="excel-upload" hidden />
                </div>
              </div>

              <div className="compose-footer" style={{ marginTop: 20 }}>
                <span className="muted">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Dung lượng tối đa 20 MB'}</span>
                <button
                  className="button button-primary"
                  onClick={handleParseExcel}
                  disabled={parsing || !file}
                  type="button"
                  style={{ background: 'linear-gradient(115deg, #FF8B00 0%, #FF5230 100%)', border: 0, padding: '10px 20px', fontWeight: 800 }}
                >
                  <FileSpreadsheet size={16} />
                  <span>{parsing ? 'Đang phân tích dữ liệu...' : 'Đọc & Xem trước nội dung Excel'}</span>
                </button>
              </div>
            </div>
          </section>

          <aside className="panel">
            <div className="panel-heading">
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <History size={16} color="#FF6B00" />
                <h2>Tệp Excel đã lưu gần đây</h2>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>{savedFiles.length} tệp</span>
            </div>
            <div className="panel-body upload-tips">
              {savedFiles.length === 0 ? (
                <p className="muted" style={{ fontSize: 12, margin: '8px 0' }}>
                  Chưa có tệp nào được lưu. Khi bạn tải tệp Excel lên, hệ thống sẽ tự động lưu lại tại đây để bạn mở lại bất cứ lúc nào!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {savedFiles.map((item) => (
                    <div
                      key={item.fileId}
                      onClick={() => loadFromHistory(item)}
                      style={{
                        padding: '10px 12px',
                        background: '#FAFBFC',
                        border: '1px solid #EBECF0',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF6B00'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#EBECF0'}
                    >
                      <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileSpreadsheet size={15} color="#10B981" />
                          <strong style={{ fontSize: 13, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.fileName}
                          </strong>
                        </div>
                        <span style={{ fontSize: 11, color: '#6B778C', display: 'block', marginTop: 2 }}>
                          {item.totalPosts} bài đăng · {new Date(item.uploadDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          className="button button-secondary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={(e) => { e.stopPropagation(); loadFromHistory(item); }}
                        >
                          Mở
                        </button>
                        <button
                          type="button"
                          style={{ background: 'transparent', border: 0, color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                          onClick={(e) => removeFileFromHistory(item.fileId, e)}
                          title="Xóa khỏi lịch sử"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid #EBECF0', paddingTop: 14 }}>
                <a className="button button-secondary" href={postApi.templateUrl} style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                  📥 Tải file mẫu Excel chuẩn
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* GIAI ĐOẠN 2: BẢNG DUYỆT BÀI ĐĂNG (CHỌN BÀI ĐỂ ĐĂNG, XEM, SỬA, XÓA) */}
      {stagedPosts.length > 0 && (
        <section className="panel" style={{ marginTop: 6 }}>
          <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, margin: 0 }}>
                Duyệt bài đăng ({selectedTempIds.length}/{stagedPosts.length} bài được chọn)
              </h2>
              <span className="muted" style={{ fontSize: 12 }}>
                Tick chọn các bài muốn lên lịch, xem trước nội dung hoặc chỉnh sửa trước khi xác nhận.
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleReset}
                disabled={confirming}
                style={{ fontSize: 13 }}
              >
                <RefreshCw size={14} />
                <span>Hủy & Chọn file khác</span>
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={handleConfirmAndSchedule}
                disabled={confirming || selectedTempIds.length === 0}
                style={{
                  background: selectedTempIds.length > 0 ? 'linear-gradient(115deg, #10B981 0%, #059669 100%)' : '#94A3B8',
                  border: 0,
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: selectedTempIds.length > 0 ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
                  cursor: selectedTempIds.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                <CheckCircle2 size={16} />
                <span>{confirming ? 'Đang lên lịch...' : `Xác nhận & Lên lịch (${selectedTempIds.length} bài đã chọn)`}</span>
              </button>
            </div>
          </div>

          {/* Quick Selection Toolbar */}
          <div style={{ padding: '8px 16px', background: '#FAFBFC', borderBottom: '1px solid #EBECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                style={{ background: 'transparent', border: 0, color: '#FF6B00', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {selectedTempIds.length === stagedPosts.length ? <CheckSquare size={16} /> : <Square size={16} />}
                <span>{selectedTempIds.length === stagedPosts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả bài'}</span>
              </button>
              <span style={{ color: '#6B778C' }}>|</span>
              <span style={{ color: '#6B778C' }}>
                Đã chọn: <strong style={{ color: '#172B4D' }}>{selectedTempIds.length}</strong> / {stagedPosts.length} bài
              </span>
            </div>

            <div style={{ color: '#6B778C' }}>
              💡 <em>Các bài không được tick chọn sẽ không đưa vào hàng đợi</em>
            </div>
          </div>

          <div className="report-table-scroll" style={{ maxHeight: 600, overflowY: 'auto' }}>
            <table className="report-table report-wide-table">
              <thead>
                <tr>
                  <th style={{ width: 44, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={stagedPosts.length > 0 && selectedTempIds.length === stagedPosts.length}
                      onChange={handleToggleSelectAll}
                      style={{ cursor: 'pointer' }}
                      title="Chọn tất cả"
                    />
                  </th>
                  <th style={{ width: 60 }}>Dòng</th>
                  <th style={{ width: 200 }}>Fanpage đích</th>
                  <th>Nội dung bài viết</th>
                  <th style={{ width: 100 }}>Định dạng</th>
                  <th style={{ width: 170 }}>Thời gian lên lịch</th>
                  <th style={{ width: 90 }}>Comment</th>
                  <th style={{ width: 120, textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {stagedPosts.map((post, idx) => {
                  const isSelected = selectedTempIds.includes(post.tempId);
                  const mediaCount = (post.mediaLinks || []).length;
                  const commentCount = (post.comments || []).length;

                  return (
                    <tr
                      key={post.tempId}
                      style={{
                        background: isSelected ? 'rgba(255, 107, 0, 0.03)' : '#ffffff',
                        transition: 'background 0.2s'
                      }}
                    >
                      {/* Checkbox chọn từng bài */}
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(post.tempId)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                        />
                      </td>

                      <td>
                        <span style={{ fontWeight: 800, color: '#6B778C' }}>#{post.rowIndex || idx + 1}</span>
                      </td>

                      {/* Chọn Fanpage */}
                      <td>
                        <select
                          className="report-select"
                          value={post.pageId || ''}
                          onChange={(e) => handlePageChange(post.tempId, e.target.value)}
                          style={{ width: '100%', fontSize: 12, padding: '6px 8px' }}
                        >
                          {channels.length === 0 && (
                            <option value={post.pageId || ''}>{post.pageName || 'Fanpage mặc định'}</option>
                          )}
                          {channels.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>

                      {/* Nội dung */}
                      <td>
                        <div style={{
                          maxWidth: 360,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: 13,
                          color: '#172B4D',
                          fontWeight: 600
                        }}>
                          {post.content || <em style={{ color: '#9CA3AF' }}>(Không có nội dung chữ)</em>}
                        </div>
                        {mediaCount > 0 && (
                          <small style={{ color: '#6B778C', display: 'block', marginTop: 2 }}>
                            📎 {mediaCount} tệp đính kèm
                          </small>
                        )}
                      </td>

                      {/* Loại Media */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: post.mediaType === 'video' ? '#EDE9FE' : post.mediaType === 'image' ? '#E0F2FE' : '#F1F5F9',
                          color: post.mediaType === 'video' ? '#7C3AED' : post.mediaType === 'image' ? '#0284C7' : '#475569'
                        }}>
                          {post.mediaType === 'video' ? <Video size={12} /> : post.mediaType === 'image' ? <ImageIcon size={12} /> : <FileText size={12} />}
                          <span>{post.mediaType === 'video' ? 'Video' : post.mediaType === 'image' ? 'Ảnh' : 'Chữ'}</span>
                        </span>
                      </td>

                      {/* Thời gian đăng */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155', fontWeight: 600 }}>
                          <Clock size={13} color="#FF6B00" />
                          <span>{new Date(post.scheduledAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Comments */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: commentCount > 0 ? '#10B981' : '#94A3B8'
                        }}>
                          <MessageSquare size={13} />
                          <span>{commentCount}</span>
                        </span>
                      </td>

                      {/* Nút Hành động */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button
                            type="button"
                            title="Xem trước bài viết"
                            onClick={() => setPreviewPost(post)}
                            style={{ background: 'transparent', border: 0, color: '#3B82F6', cursor: 'pointer', padding: 4 }}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            title="Sửa nội dung"
                            onClick={() => setEditingPost({ ...post })}
                            style={{ background: 'transparent', border: 0, color: '#FF6B00', cursor: 'pointer', padding: 4 }}
                          >
                            <Edit3 size={17} />
                          </button>
                          <button
                            type="button"
                            title="Xóa khỏi danh sách"
                            onClick={() => handleDeletePost(post.tempId)}
                            style={{ background: 'transparent', border: 0, color: '#EF4444', cursor: 'pointer', padding: 4 }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* MODAL 1: XEM TRƯỚC BÀI VIẾT (PREVIEW MODAL) */}
      {previewPost && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 520,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={18} color="#FF6B00" />
                <strong style={{ fontSize: 15, color: '#0F172A' }}>Xem trước bài đăng Newsfeed</strong>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPost(null)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF8B00, #FF2E74)',
                  color: '#fff',
                  fontWeight: 900,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 15
                }}>
                  FB
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: 14, color: '#0F172A' }}>{previewPost.pageName || 'Fanpage Workspace'}</strong>
                  <span style={{ fontSize: 11, color: '#64748B' }}>
                    ⏰ Lên lịch: {new Date(previewPost.scheduledAt).toLocaleString('vi-VN')} · 🌐 Công khai
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 14, color: '#1E293B', whiteSpace: 'pre-wrap', lineHeight: 1.5, marginBottom: 14 }}>
                {previewPost.content}
              </div>

              {(previewPost.mediaLinks || []).length > 0 && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    📎 Tệp media đính kèm ({previewPost.mediaLinks.length}):
                  </span>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#3B82F6' }}>
                    {previewPost.mediaLinks.map((link, lIdx) => (
                      <li key={lIdx} style={{ wordBreak: 'break-all' }}>{link}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(previewPost.comments || []).length > 0 && (
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12, marginTop: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 8 }}>
                    💬 Bình luận tự động kèm theo ({previewPost.comments.length}):
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {previewPost.comments.map((cmt, cIdx) => (
                      <div key={cIdx} style={{ background: '#F1F5F9', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: 2 }}>
                          <strong>Bình luận #{cmt.commentIndex || cIdx + 1}</strong>
                          <span>+{cmt.delayMinutes || 0} phút sau đăng</span>
                        </div>
                        <div style={{ color: '#1E293B' }}>{cmt.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', textAlign: 'right' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setPreviewPost(null)}
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHỈNH SỬA BÀI VIẾT (EDIT MODAL) */}
      {editingPost && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            maxWidth: 600,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={18} color="#FF6B00" />
                <strong style={{ fontSize: 15, color: '#0F172A' }}>
                  Chỉnh sửa bài đăng (Dòng #{editingPost.rowIndex})
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: 20, overflowY: 'auto' }}>
              <div className="form-item" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#1E293B' }}>Fanpage đăng</label>
                <select
                  className="report-select"
                  value={editingPost.pageId || ''}
                  onChange={(e) => {
                    const newPageId = e.target.value;
                    const found = channels.find((c) => String(c.id) === String(newPageId));
                    setEditingPost({
                      ...editingPost,
                      pageId: newPageId,
                      pageName: found ? found.name : `Page ${newPageId}`
                    });
                  }}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div className="form-item" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#1E293B' }}>Nội dung bài đăng</label>
                <textarea
                  className="styled-textarea"
                  rows={5}
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <DateTimePicker24h
                  label="Thời gian lên lịch đăng bài"
                  value={editingPost.scheduledAt}
                  onChange={(newVal) => setEditingPost({ ...editingPost, scheduledAt: newVal })}
                />
              </div>

              <div className="form-item" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#1E293B' }}>Định dạng bài</label>
                <select
                  className="report-select"
                  value={editingPost.mediaType || 'text'}
                  onChange={(e) => setEditingPost({ ...editingPost, mediaType: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="text">Chữ (Text)</option>
                  <option value="image">Ảnh (Image)</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEditingPost(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  style={{ background: 'linear-gradient(115deg, #FF8B00 0%, #FF5230 100%)', border: 0 }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}