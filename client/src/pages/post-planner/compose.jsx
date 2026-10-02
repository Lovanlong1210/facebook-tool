import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  Eye
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import RichPostEditor from '../../components/planner/RichPostEditor';
import FacebookFeedPreview from '../../components/planner/FacebookFeedPreview';
import DateTimePicker24h from '../../components/common/DateTimePicker24h';
import postApi from '../../services/postApi';

const steps = ['Soạn thảo nội dung', 'Chọn kênh & Lên lịch', 'Kiểm tra & Xuất bản'];

export default function ComposePage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [channelLoading, setChannelLoading] = useState(true);
  const [channelError, setChannelError] = useState('');
  const [publishMode, setPublishMode] = useState('now'); // 'now' | 'schedule'
  const [scheduledAt, setScheduledAt] = useState(() => {
    const date = new Date(Date.now() + 60 * 60 * 1000);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  });
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [comments, setComments] = useState([]);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdPostId, setCreatedPostId] = useState(null);

  useEffect(() => () => {
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
  }, [mediaPreviewUrl]);

  useEffect(() => {
    postApi.getChannels()
      .then((result) => {
        const availableChannels = result.channels || [];
        setChannels(availableChannels);
        setSelectedPageId(availableChannels[0]?.id || '');
      })
      .catch((error) => setChannelError(error.response?.data?.message || 'Không tải được kênh Facebook.'))
      .finally(() => setChannelLoading(false));
  }, []);

  useEffect(() => {
    try {
      const aiDraft = sessionStorage.getItem('pageflow_draft_ai_content');
      if (aiDraft) {
        setContent(aiDraft);
        sessionStorage.removeItem('pageflow_draft_ai_content');
        setNotice('✨ Đã tự động nạp nội dung được tạo từ AI Studio!');
      }
    } catch {}
  }, []);

  const createScheduledPost = async () => {
    if (!selectedPageId) {
      setNotice('Vui lòng chọn một Fanpage trước khi xuất bản.');
      return;
    }
    setSaving(true);
    setNotice('');
    try {
      if (uploadingMedia) throw new Error('Đang tải ảnh/video lên máy chủ, vui lòng đợi trong giây lát...');
      const targetScheduledTime = publishMode === 'now' ? new Date().toISOString() : new Date(scheduledAt).toISOString();
      const result = await postApi.createPost({
        pageId: selectedPageId,
        content: content.trim(),
        mediaType: uploadedMedia?.mediaType || 'text',
        mediaLinks: uploadedMedia ? [uploadedMedia.mediaLink] : [],
        comments,
        scheduledAt: targetScheduledTime
      });
      setCreatedPostId(result.postId);
      setNotice(publishMode === 'now' ? 'Đã gửi yêu cầu đăng bài thành công lên Facebook!' : (result.message || 'Đã lên lịch bài đăng thành công.'));
    } catch (error) {
      setNotice(error.response?.data?.message || 'Không thể tạo lịch đăng: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMediaChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaPreviewUrl(URL.createObjectURL(file));
    setUploadedMedia(null);
    setUploadingMedia(true);
    setNotice('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploaded = await postApi.uploadMedia(formData);
      setUploadedMedia(uploaded);
      setNotice(`Đã tải lên tệp: ${uploaded.fileName}`);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Không tải được tệp media lên máy chủ.');
      setMediaPreviewUrl('');
    } finally {
      setUploadingMedia(false);
      event.target.value = '';
    }
  };

  const currentChannel = channels.find((c) => String(c.id) === String(selectedPageId));
  const currentChannelName = currentChannel?.name || 'Fanpage của bạn';

  return (
    <MainLayout title="Tạo & Soạn thảo bài viết">
      {/* Thanh tiến trình Steps */}
      <div className="step-strip" role="tablist" aria-label="Các bước tạo bài">
        {steps.map((label, index) => (
          <button
            className={`step-button${step === index ? ' is-current' : ''}${step > index ? ' is-done' : ''}`}
            key={label}
            onClick={() => setStep(index)}
            role="tab"
            aria-selected={step === index}
            disabled={index > step}
            type="button"
          >
            <span className="step-number">{index + 1}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Bước 1: Soạn nội dung */}
      {step === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: 24, alignItems: 'start' }}>
          <div className="panel" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Soạn thảo nội dung bài viết</h2>
                <span className="muted" style={{ fontSize: 13 }}>Sử dụng công cụ phông chữ, biểu tượng cảm xúc và hashtag để thu hút tương tác</span>
              </div>
              <span className="status-pill pending">Bản nháp</span>
            </div>

            <label className="field-label" htmlFor="post-title">Tiêu đề bài viết (Ghi chú nội bộ)</label>
            <input
              id="post-title"
              className="field"
              placeholder="Ví dụ: Chiến dịch xả kho hè 2026 - Giảm 50%"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: 18 }}
            />

            <label className="field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Nội dung bài đăng</span>
              <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>Hỗ trợ font Facebook & Emoji</span>
            </label>

            {/* Trình soạn thảo RichPostEditor cao cấp */}
            <RichPostEditor
              value={content}
              onChange={setContent}
              placeholder="Bạn đang nghĩ gì? Bắt đầu viết nội dung bài đăng Facebook hấp dẫn..."
              rows={8}
            />

            {/* Thêm Media hình ảnh / video */}
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <label className="button button-secondary" style={{ cursor: 'pointer' }}>
                <ImagePlus size={16} />
                <span>{uploadingMedia ? 'Đang tải media lên…' : 'Đính kèm Ảnh / Video'}</span>
                <input type="file" accept="image/*,video/*" hidden onChange={handleMediaChange} />
              </label>

              {uploadedMedia && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                    ✅ Đã đính kèm {uploadedMedia.mediaType === 'video' ? 'Video' : 'Ảnh'}
                  </span>
                  <button
                    type="button"
                    className="button button-danger"
                    style={{ padding: '4px 8px', minHeight: 28, fontSize: 11 }}
                    onClick={() => { setUploadedMedia(null); setMediaPreviewUrl(''); }}
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>

            {mediaPreviewUrl && (
              <div style={{ marginTop: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', padding: 8, display: 'flex', justifyContent: 'center' }}>
                {uploadedMedia?.mediaType === 'video' ? (
                  <video src={mediaPreviewUrl} controls style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8 }} />
                ) : (
                  <img src={mediaPreviewUrl} alt="Xem trước media" style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 8 }} />
                )}
              </div>
            )}
          </div>

          {/* Cột Xem trước bài viết thời gian thực chuẩn Facebook */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#475569', fontSize: 13, fontWeight: 700 }}>
              <Eye size={16} color="#2563eb" />
              <span>Bản xem trước trực tiếp trên Facebook</span>
            </div>
            <FacebookFeedPreview
              pageName={currentChannelName}
              content={content}
              mediaUrl={mediaPreviewUrl}
              mediaType={uploadedMedia?.mediaType || 'image'}
            />
          </div>
        </div>
      )}

      {/* Bước 2: Chọn kênh & Lên lịch */}
      {step === 1 && (
        <div className="compose-grid">
          {/* Cột chọn Fanpage */}
          <section className="panel compose-panel">
            <div className="panel-heading">
              <h2>Chọn Fanpage đăng bài</h2>
              <span className="muted">{selectedPageId ? '1' : '0'}/{channels.length} đã chọn</span>
            </div>
            <div className="panel-body">
              {channelLoading && <p className="muted">Đang tải danh sách Fanpage…</p>}
              {channelError && <div className="notice">{channelError}</div>}
              {channels.map((channel) => (
                <label className={`channel-option${selectedPageId === channel.id ? ' is-selected' : ''}`} key={channel.id}>
                  <input
                    type="radio"
                    name="channel"
                    checked={selectedPageId === channel.id}
                    onChange={() => setSelectedPageId(channel.id)}
                  />
                  <span className="fb-mark">f</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.name}</strong>
                      {channel.hasValidToken === false && (
                        <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                          Thiếu Token
                        </span>
                      )}
                    </div>
                    <small>Facebook · ID: {channel.id} · {channel.category || 'Fanpage'}</small>
                  </div>
                </label>
              ))}

              {channels.find((c) => String(c.id) === String(selectedPageId))?.hasValidToken === false && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#92400e', fontSize: 12, lineHeight: 1.5 }}>
                  ⚠️ <strong>Kênh này chưa có Page Access Token:</strong> Vui lòng vào trang <Link href="/channels" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>Kênh đã kết nối</Link> để cập nhật Token trước khi đăng!
                </div>
              )}
              {!channelLoading && channels.length === 0 && !channelError && <p className="muted">Chưa có Fanpage kết nối.</p>}
            </div>
          </section>

          {/* Cột thời gian & Seeding comment */}
          <section className="panel compose-panel">
            <div className="panel-heading">
              <h2>Lên lịch & Xuất bản</h2>
              <span className="muted">{publishMode === 'now' ? 'Đăng ngay' : 'Hẹn giờ'}</span>
            </div>
            <div className="panel-body">
              <label className="field-label">Thời điểm xuất bản</label>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: publishMode === 'now' ? 700 : 500, color: publishMode === 'now' ? '#2563eb' : '#475569' }}>
                  <input type="radio" name="publishMode" checked={publishMode === 'now'} onChange={() => setPublishMode('now')} />
                  <span>🚀 Đăng ngay lập tức</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: publishMode === 'schedule' ? 700 : 500, color: publishMode === 'schedule' ? '#2563eb' : '#475569' }}>
                  <input type="radio" name="publishMode" checked={publishMode === 'schedule'} onChange={() => setPublishMode('schedule')} />
                  <span>⏰ Lên lịch hẹn giờ tự động</span>
                </label>
              </div>

              {publishMode === 'schedule' && (
                <div style={{ marginBottom: 16, padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <DateTimePicker24h
                    label="Ngày & Giờ đăng bài"
                    value={scheduledAt}
                    onChange={setScheduledAt}
                  />
                  <small style={{ color: '#64748b', marginTop: 8, display: 'block' }}>
                    Hệ thống hàng đợi BullMQ sẽ tự động xuất bản đúng thời điểm đã chọn.
                  </small>
                </div>
              )}

              {/* Bình luận tự động (Seeding) */}
              <div style={{ marginTop: 18, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label className="field-label" style={{ margin: 0 }}>
                    <MessageCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: '#2563eb' }} />
                    Tự động bình luận mồi (Seeding: {comments.length}/5)
                  </label>
                  <button
                    className="button button-secondary"
                    type="button"
                    style={{ minHeight: 28, fontSize: 12, padding: '0 10px' }}
                    onClick={() => setComments((items) => items.length < 5 ? [...items, { content: '', delayMinutes: 0 }] : items)}
                    disabled={comments.length >= 5}
                  >
                    <Plus size={14} /> Thêm comment
                  </button>
                </div>

                {comments.map((comment, index) => (
                  <div className="comment-entry" key={index} style={{ marginBottom: 8 }}>
                    <input
                      className="field"
                      aria-label={`Nội dung comment ${index + 1}`}
                      placeholder={`Nội dung comment ${index + 1} (ví dụ: Inbox shop nhé!)`}
                      value={comment.content}
                      onChange={(event) => setComments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, content: event.target.value } : item))}
                    />
                    <label className="comment-delay">
                      <span className="muted">Sau</span>
                      <input
                        className="field"
                        type="number"
                        min="0"
                        max="10080"
                        style={{ width: 60 }}
                        value={comment.delayMinutes}
                        onChange={(event) => setComments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, delayMinutes: Number(event.target.value) } : item))}
                      />
                      <span className="muted">phút</span>
                    </label>
                    <button
                      className="button button-danger"
                      type="button"
                      aria-label={`Xóa comment ${index + 1}`}
                      onClick={() => setComments((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Xem trước ở Bước 2 */}
          <section className="panel compose-preview">
            <div className="panel-heading"><h2>Xem trước bài đăng</h2></div>
            <div className="panel-body">
              <FacebookFeedPreview
                pageName={currentChannelName}
                content={content}
                mediaUrl={mediaPreviewUrl}
                mediaType={uploadedMedia?.mediaType || 'image'}
              />
            </div>
          </section>
        </div>
      )}

      {/* Bước 3: Kiểm tra & Xuất bản */}
      {step === 2 && (
        <section className="panel" style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Kiểm tra bài viết trước khi xuất bản</h2>
            <p className="muted" style={{ margin: 0 }}>
              Đăng lên Fanpage: <strong>{currentChannelName}</strong> · Thời gian: <strong>{publishMode === 'now' ? 'Xuất bản ngay' : scheduledAt}</strong>
            </p>
          </div>

          <FacebookFeedPreview
            pageName={currentChannelName}
            content={content}
            mediaUrl={mediaPreviewUrl}
            mediaType={uploadedMedia?.mediaType || 'image'}
          />

          {notice && (
            <div style={{
              marginTop: 18,
              padding: '14px 16px',
              borderRadius: 8,
              background: notice.includes('thành công') ? '#ecfdf5' : '#fef2f2',
              color: notice.includes('thành công') ? '#065f46' : '#991b1b',
              border: `1px solid ${notice.includes('thành công') ? '#a7f3d0' : '#fecaca'}`,
              fontWeight: 600,
              fontSize: 14,
              textAlign: 'center'
            }}>
              {notice}
            </div>
          )}

          {createdPostId && (
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <Link href="/post-planner/list" className="button button-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
                Xem bài #{createdPostId} trong Danh sách lịch đăng →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Footer các nút chuyển bước */}
      <div className="compose-footer" style={{ marginTop: 24 }}>
        {notice && step !== 2 && <span className="notice">{notice}</span>}
        <button
          className="button button-secondary"
          type="button"
          onClick={() => { setStep(Math.max(0, step - 1)); setNotice(''); }}
          disabled={step === 0}
        >
          <ArrowLeft size={15} /> Quay lại
        </button>

        {step < 2 && (
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              if (step === 0 && !content.trim()) {
                setNotice('Vui lòng nhập nội dung bài viết trước khi tiếp tục.');
                return;
              }
              if (step === 1 && !selectedPageId) {
                setNotice('Vui lòng chọn một Fanpage để đăng bài.');
                return;
              }
              setNotice('');
              setStep(step + 1);
            }}
            disabled={step === 1 && (channelLoading || !selectedPageId)}
          >
            Tiếp tục <ArrowRight size={15} />
          </button>
        )}

        {step === 2 && !createdPostId && (
          <button
            className="button button-primary"
            type="button"
            onClick={createScheduledPost}
            disabled={saving || uploadingMedia}
            style={{ minWidth: 180, fontSize: 14 }}
          >
            {saving ? 'Đang gửi bài…' : (publishMode === 'now' ? '🚀 Đăng ngay lên Facebook' : '⏰ Xác nhận lên lịch')}
            <Send size={15} />
          </button>
        )}

        {step === 2 && createdPostId && (
          <Link className="button button-secondary" href="/post-planner/list">
            Mở danh sách lịch đăng <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </MainLayout>
  );
}