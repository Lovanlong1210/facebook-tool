import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, AtSign, ImagePlus, MapPin, MessageCircle, Plus, Send, Smile, Trash2, Type } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import postApi from '../../services/postApi';

const steps = ['Viết bài', 'Chọn kênh', 'Xem lại & xuất bản'];

export default function ComposePage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [channelLoading, setChannelLoading] = useState(true);
  const [channelError, setChannelError] = useState('');
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

  const createScheduledPost = async () => {
    if (!selectedPageId) {
      setNotice('Chọn một Fanpage trước khi lên lịch.');
      return;
    }
    setSaving(true);
    setNotice('');
    try {
      if (uploadingMedia) throw new Error('Đợi ảnh/video tải lên xong trước khi lưu lịch.');
      const result = await postApi.createPost({
        pageId: selectedPageId,
        content: content.trim(),
        mediaType: uploadedMedia?.mediaType || 'text',
        mediaLinks: uploadedMedia ? [uploadedMedia.mediaLink] : [],
        comments,
        scheduledAt: new Date(scheduledAt).toISOString()
      });
      setCreatedPostId(result.postId);
      setNotice(result.message || 'Đã lên lịch bài đăng.');
    } catch (error) {
      setNotice(error.response?.data?.message || 'Không thể tạo lịch đăng.');
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
      setNotice(`Đã tải lên ${uploaded.fileName}.`);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Không tải được tệp media lên máy chủ.');
      setMediaPreviewUrl('');
    } finally {
      setUploadingMedia(false);
      event.target.value = '';
    }
  };

  return (
    <MainLayout title="Viết bài">
      <div className="step-strip" role="tablist" aria-label="Các bước tạo bài">
        {steps.map((label, index) => <button className={`step-button${step === index ? ' is-current' : ''}${step > index ? ' is-done' : ''}`} key={label} onClick={() => setStep(index)} role="tab" aria-selected={step === index} disabled={index > step} type="button"><span className="step-number">{index + 1}</span>{label}</button>)}
      </div>

      {step === 0 && <div className="panel">
        <div className="panel-heading"><h2>Soạn nội dung</h2><span className="muted">Bản nháp cục bộ</span></div>
        <div className="panel-body">
          <label className="field-label" htmlFor="post-title">Tiêu đề</label>
          <input id="post-title" className="field" placeholder="Nhập tiêu đề bài viết" value={title} onChange={(event) => setTitle(event.target.value)} />
          <div className="panel" style={{ marginTop: 14, padding: 15, background: '#fbfcfe' }}>
            <span className="muted" style={{ fontSize: 11 }}>XEM TRƯỚC TÌM KIẾM</span>
            <div style={{ color: '#254fad', fontWeight: 700, marginTop: 8 }}>{title || 'Tiêu đề bài viết'}</div>
            <div className="muted" style={{ marginTop: 5 }}>https://facebook.com · Bản xem trước</div>
          </div>
          <label className="field-label" htmlFor="post-content" style={{ marginTop: 17 }}>Nội dung</label>
          <div className="compose-toolbar"><button className="tool-chip" type="button" title="Kiểu chữ"><Type size={15} /></button><button className="tool-chip" type="button" title="Emoji"><Smile size={15} /></button><button className="tool-chip" type="button" title="Gắn thẻ"><AtSign size={15} /></button><button className="tool-chip" type="button" title="Vị trí"><MapPin size={15} /></button></div>
          <textarea id="post-content" className="compose-editor" placeholder="Bạn đang nghĩ gì?" value={content} onChange={(event) => setContent(event.target.value)} />
          <div className="compose-bottom"><span className="muted">{content.length} ký tự</span><label className="button button-secondary"><ImagePlus size={15} />{uploadingMedia ? 'Đang tải…' : 'Thêm ảnh/video'}<input type="file" accept="image/*,video/*" hidden onChange={handleMediaChange} /></label></div>
        </div>
      </div>}

      {step === 1 && <div className="compose-grid">
        <section className="panel compose-panel"><div className="panel-heading"><h2>Chọn kênh</h2><span className="muted">{selectedPageId ? '1' : '0'}/{channels.length}</span></div><div className="panel-body">
          {channelLoading && <p className="muted">Đang tải kênh…</p>}
          {channelError && <div className="notice">{channelError}</div>}
          {channels.map((channel) => <label className={`channel-option${selectedPageId === channel.id ? ' is-selected' : ''}`} key={channel.id}>
            <input type="radio" name="channel" checked={selectedPageId === channel.id} onChange={() => setSelectedPageId(channel.id)} />
            <span className="fb-mark">f</span><span><strong>{channel.name}</strong><small>Facebook · {channel.category || 'Fanpage'}</small></span>
          </label>)}
          {!channelLoading && channels.length === 0 && !channelError && <p className="muted">Chưa có Fanpage kết nối.</p>}
        </div></section>
        <section className="panel compose-panel"><div className="panel-heading"><h2>Đăng bài</h2><span className="muted">Facebook</span></div>
          <div className="compose-toolbar"><button className="tool-chip" type="button" title="Kiểu chữ"><Type size={15} /></button><button className="tool-chip" type="button" title="Emoji"><Smile size={15} /></button><button className="tool-chip" type="button" title="Gắn thẻ"><AtSign size={15} /></button><button className="tool-chip" type="button" title="Vị trí"><MapPin size={15} /></button></div>
          <textarea className="compose-editor" placeholder="Nội dung bài đăng" value={content} onChange={(event) => setContent(event.target.value)} />
          <div className="compose-bottom"><span className="muted">{content.length} ký tự</span><label className="button button-secondary"><ImagePlus size={15} />{uploadingMedia ? 'Đang tải…' : 'Tải ảnh/video'}<input type="file" accept="image/*,video/*" hidden onChange={handleMediaChange} /></label></div>
          {mediaPreviewUrl && <div className="preview-media">{uploadedMedia?.mediaType === 'video' ? <video src={mediaPreviewUrl} controls style={{ maxWidth: '100%', maxHeight: 220 }} /> : <img src={mediaPreviewUrl} alt="Xem trước media" style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain' }} />}</div>}
          <div className="panel-body" style={{ paddingTop: 0 }}><label className="field-label" htmlFor="scheduled-at">Thời gian đăng</label><input id="scheduled-at" className="field" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></div>
          <div className="panel-body" style={{ paddingTop: 0 }}>
            <div className="panel-heading" style={{ padding: 0, minHeight: 38 }}><h2><MessageCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Comment seeding ({comments.length}/5)</h2><button className="button button-secondary" type="button" onClick={() => setComments((items) => items.length < 5 ? [...items, { content: '', delayMinutes: 0 }] : items)} disabled={comments.length >= 5}><Plus size={14} /> Thêm comment</button></div>
            {comments.map((comment, index) => <div className="comment-entry" key={index}>
              <input className="field" aria-label={`Nội dung comment ${index + 1}`} placeholder={`Nội dung comment ${index + 1}`} value={comment.content} onChange={(event) => setComments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, content: event.target.value } : item))} />
              <label className="comment-delay"><span className="muted">Sau</span><input className="field" type="number" min="0" max="10080" aria-label={`Độ trễ comment ${index + 1} phút`} value={comment.delayMinutes} onChange={(event) => setComments((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, delayMinutes: Number(event.target.value) } : item))} /><span className="muted">phút</span></label>
              <button className="button button-danger" type="button" aria-label={`Xóa comment ${index + 1}`} onClick={() => setComments((items) => items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={14} /></button>
            </div>)}
          </div>
        </section>
        <section className="panel compose-preview"><div className="panel-heading"><h2>Xem trước</h2></div><div className="panel-body"><div className="preview-paper"><div className="preview-head"><span className="fb-mark" style={{ width: 26, height: 26, fontSize: 15 }}>f</span><strong style={{ fontSize: 12 }}>văn tuấn</strong></div><div className="preview-body">{content || 'Nội dung bài viết sẽ hiển thị tại đây.'}</div></div></div></section>
      </div>}

      {step === 2 && <section className="panel"><div className="panel-heading"><h2>Kiểm tra bài viết</h2></div><div className="panel-body" style={{ maxWidth: 760 }}>
        <div className="preview-paper"><div className="preview-head"><span className="fb-mark" style={{ width: 26, height: 26, fontSize: 15 }}>f</span><strong style={{ fontSize: 12 }}>{channels.find((channel) => channel.id === selectedPageId)?.name || 'Fanpage'}</strong></div><div className="preview-body"><strong>{title || 'Bài viết Facebook'}</strong>{'\n\n'}{content || 'Chưa nhập nội dung.'}</div>{mediaPreviewUrl && <div className="preview-media">{uploadedMedia?.mediaType === 'video' ? <video src={mediaPreviewUrl} controls style={{ maxWidth: '100%', maxHeight: 220 }} /> : <img src={mediaPreviewUrl} alt="Xem trước media" style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain' }} />}</div>}</div>
        {notice && <div className="notice" style={{ marginTop: 14 }}>{notice}</div>}
        {createdPostId && <Link href="/post-planner/list" className="button button-secondary" style={{ marginTop: 14 }}>Xem bài #{createdPostId} trong lịch đăng</Link>}
      </div></section>}

      <div className="compose-footer">
        {notice && step !== 2 && <span className="notice">{notice}</span>}
        <button className="button button-secondary" type="button" onClick={() => { setStep(Math.max(0, step - 1)); setNotice(''); }} disabled={step === 0}><ArrowLeft size={15} /> Quay lại</button>
        {step < 2 && <button className="button button-primary" type="button" onClick={() => { if (step === 0 && !content.trim()) { setNotice('Nhập nội dung bài viết trước khi tiếp tục.'); return; } if (step === 1 && !selectedPageId) { setNotice('Chọn ít nhất một kênh đăng.'); return; } setNotice(''); setStep(step + 1); }} disabled={step === 1 && (channelLoading || !selectedPageId)}>Tiếp <ArrowRight size={15} /></button>}
        {step === 2 && !createdPostId && <button className="button button-primary" type="button" onClick={createScheduledPost} disabled={saving || uploadingMedia}>{saving ? 'Đang lưu…' : 'Lên lịch bài'} <Send size={15} /></button>}
        {step === 2 && createdPostId && <Link className="button button-secondary" href="/post-planner/list">Mở lịch đăng <ArrowRight size={15} /></Link>}
      </div>
    </MainLayout>
  );
}