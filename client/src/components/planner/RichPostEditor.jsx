import { useState, useRef } from 'react';
import {
  Smile,
  Type,
  Hash,
  FileText,
  Sparkles,
  HelpCircle,
  Check,
  X,
  ChevronDown,
  Copy,
  Wand2
} from 'lucide-react';
import axios from 'axios';
import { FB_FONTS, convertFacebookFont } from '../../utils/facebookFonts';
import { EMOJI_CATEGORIES, TRENDING_HASHTAGS, CTA_TEMPLATES } from '../../utils/emojiData';

export default function RichPostEditor({
  value = '',
  onChange,
  placeholder = 'Bạn đang nghĩ gì? Hãy soạn nội dung bài viết hấp dẫn...',
  rows = 7
}) {
  const textareaRef = useRef(null);
  const [activeTab, setActiveTab] = useState(null); // 'font' | 'emoji' | 'hashtag' | 'cta' | 'ai'
  const [emojiCatIndex, setEmojiCatIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Chèn text vào đúng vị trí con trỏ trong textarea
  const insertTextAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + textToInsert);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const newContent = value.substring(0, start) + textToInsert + value.substring(end);
    onChange(newContent);

    // Đặt lại con trỏ chuột ngay sau ký tự vừa chèn
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 10);
  };

  // Áp dụng Font Facebook (chỉ áp dụng cho đoạn bôi đen hoặc toàn bộ)
  const applyFont = (fontId) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    if (start !== end) {
      // Người dùng bôi đen 1 đoạn text
      const selectedText = value.substring(start, end);
      const converted = convertFacebookFont(selectedText, fontId);
      const newContent = value.substring(0, start) + converted + value.substring(end);
      onChange(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + converted.length);
      }, 10);
    } else {
      // Nếu không bôi đen, convert toàn bộ nội dung hiện tại
      if (!value.trim()) return;
      const converted = convertFacebookFont(value, fontId);
      onChange(converted);
    }
  };

  // Tạo nội dung bằng AI
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/ai/chat',
        {
          message: `Hãy viết một bài đăng Facebook cực kỳ hấp dẫn, chuyên nghiệp, có kèm icon emoji và hashtag phù hợp dựa trên yêu cầu sau: "${aiPrompt.trim()}". Chỉ trả về nội dung bài viết để đăng, không cần lời chào hay giải thích thêm.`
        },
        { withCredentials: true }
      );
      if (res.data?.reply) {
        insertTextAtCursor((value.trim() ? '\n\n' : '') + res.data.reply.trim());
        setActiveTab(null);
        setAiPrompt('');
      } else {
        setAiError('AI không trả về kết quả. Hãy thử lại.');
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'Không thể kết nối AI Studio. Hãy kiểm tra server.');
    } finally {
      setAiLoading(false);
    }
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="rich-editor-box">
      {/* Thanh công cụ Toolbar */}
      <div className="rich-toolbar">
        <div className="toolbar-left">
          {/* Nút Đổi Phông Chữ */}
          <button
            type="button"
            className={`toolbar-btn ${activeTab === 'font' ? 'is-active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'font' ? null : 'font')}
            title="Đổi kiểu chữ Facebook (In đậm, In nghiêng, Gothic, Nghệ thuật...)"
          >
            <Type size={16} />
            <span>Phông chữ</span>
            <ChevronDown size={13} className={activeTab === 'font' ? 'rotate-180' : ''} />
          </button>

          {/* Nút Emoji */}
          <button
            type="button"
            className={`toolbar-btn ${activeTab === 'emoji' ? 'is-active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'emoji' ? null : 'emoji')}
            title="Chèn biểu tượng cảm xúc (Emoji)"
          >
            <Smile size={16} />
            <span>Icon / Emoji</span>
            <ChevronDown size={13} className={activeTab === 'emoji' ? 'rotate-180' : ''} />
          </button>

          {/* Nút Hashtag */}
          <button
            type="button"
            className={`toolbar-btn ${activeTab === 'hashtag' ? 'is-active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'hashtag' ? null : 'hashtag')}
            title="Gợi ý Hashtag thịnh hành"
          >
            <Hash size={16} />
            <span>Hashtag</span>
          </button>

          {/* Nút Mẫu CTA */}
          <button
            type="button"
            className={`toolbar-btn ${activeTab === 'cta' ? 'is-active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'cta' ? null : 'cta')}
            title="Chèn chữ ký liên hệ & Mẫu kêu gọi hành động (CTA)"
          >
            <FileText size={16} />
            <span>Mẫu chữ ký</span>
          </button>

          {/* Nút AI */}
          <button
            type="button"
            className={`toolbar-btn ai-btn ${activeTab === 'ai' ? 'is-active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'ai' ? null : 'ai')}
            title="Viết bài tự động bằng AI"
          >
            <Sparkles size={15} />
            <span>Gợi ý AI</span>
          </button>
        </div>

        <div className="toolbar-right">
          <span className="stats-badge" title="Độ dài bài viết">
            {charCount} ký tự · {wordCount} từ
          </span>
        </div>
      </div>

      {/* Popover Phông Chữ */}
      {activeTab === 'font' && (
        <div className="popover-panel font-popover">
          <div className="popover-header">
            <strong>Kiểu chữ Facebook (Unicode)</strong>
            <span className="hint-text">Mẹo: Bôi đen 1 đoạn văn bản để đổi font riêng đoạn đó!</span>
            <button type="button" onClick={() => setActiveTab(null)} className="popover-close"><X size={15} /></button>
          </div>
          <div className="font-grid">
            {FB_FONTS.map((font) => (
              <button
                key={font.id}
                type="button"
                className="font-item-btn"
                onClick={() => applyFont(font.id)}
              >
                <span className="font-name">{font.name}</span>
                <span className="font-preview">{font.sample}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popover Emoji */}
      {activeTab === 'emoji' && (
        <div className="popover-panel emoji-popover">
          <div className="popover-header">
            <strong>Bảng biểu tượng cảm xúc</strong>
            <button type="button" onClick={() => setActiveTab(null)} className="popover-close"><X size={15} /></button>
          </div>
          <div className="emoji-cat-tabs">
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                className={`emoji-cat-tab ${emojiCatIndex === idx ? 'is-active' : ''}`}
                onClick={() => setEmojiCatIndex(idx)}
                title={cat.name}
              >
                <span>{cat.icon}</span>
                <span className="cat-title">{cat.name}</span>
              </button>
            ))}
          </div>
          <div className="emoji-grid">
            {EMOJI_CATEGORIES[emojiCatIndex].emojis.map((emoji, i) => (
              <button
                key={i}
                type="button"
                className="emoji-btn"
                onClick={() => insertTextAtCursor(emoji + ' ')}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popover Hashtag */}
      {activeTab === 'hashtag' && (
        <div className="popover-panel hashtag-popover">
          <div className="popover-header">
            <strong>Hashtag thịnh hành</strong>
            <span className="hint-text">Bấm vào tag để chèn ngay vào bài</span>
            <button type="button" onClick={() => setActiveTab(null)} className="popover-close"><X size={15} /></button>
          </div>
          <div className="hashtag-chips">
            {TRENDING_HASHTAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className="hashtag-chip"
                onClick={() => insertTextAtCursor(' ' + tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popover CTA */}
      {activeTab === 'cta' && (
        <div className="popover-panel cta-popover">
          <div className="popover-header">
            <strong>Mẫu chữ ký & Hotline</strong>
            <button type="button" onClick={() => setActiveTab(null)} className="popover-close"><X size={15} /></button>
          </div>
          <div className="cta-list">
            {CTA_TEMPLATES.map((tpl, i) => (
              <div key={i} className="cta-card">
                <div className="cta-header">
                  <strong>{tpl.name}</strong>
                  <button
                    type="button"
                    className="button button-quiet"
                    style={{ padding: '3px 10px', fontSize: 12 }}
                    onClick={() => insertTextAtCursor(tpl.text)}
                  >
                    + Chèn mẫu này
                  </button>
                </div>
                <pre className="cta-preview">{tpl.text.trim()}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popover AI */}
      {activeTab === 'ai' && (
        <div className="popover-panel ai-popover">
          <div className="popover-header">
            <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wand2 size={16} color="#2563eb" />
              <span>Trợ lý AI viết bài Facebook</span>
            </strong>
            <button type="button" onClick={() => setActiveTab(null)} className="popover-close"><X size={15} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text"
              className="field"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ví dụ: Viết bài bán áo thun giảm 50% cuối tuần, kèm icon sinh động..."
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateAI(); }}
            />
            {aiError && <div style={{ fontSize: 12, color: '#dc2626' }}>⚠️ {aiError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setActiveTab(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={handleGenerateAI}
                disabled={aiLoading || !aiPrompt.trim()}
              >
                {aiLoading ? 'AI đang viết...' : 'Tạo bài viết ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vùng gõ văn bản */}
      <textarea
        ref={textareaRef}
        className="rich-textarea"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <style jsx>{`
        .rich-editor-box {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          overflow: hidden;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
        }

        .rich-editor-box:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .rich-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          gap: 8px;
          flex-wrap: wrap;
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 7px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .toolbar-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .toolbar-btn.is-active {
          background: #eff6ff;
          color: #2563eb;
          border-color: #93c5fd;
        }

        .toolbar-btn.ai-btn {
          background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
          color: #4f46e5;
          border-color: #c7d2fe;
        }

        .toolbar-btn.ai-btn:hover {
          background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
        }

        .rotate-180 {
          transform: rotate(180deg);
        }

        .stats-badge {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          background: #f1f5f9;
          padding: 4px 8px;
          border-radius: 6px;
        }

        /* Popover panel */
        .popover-panel {
          padding: 14px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          animation: slideDown 0.18s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .popover-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 13px;
          color: #0f172a;
        }

        .hint-text {
          font-size: 12px;
          color: #64748b;
          margin-left: 8px;
        }

        .popover-close {
          border: 0;
          background: transparent;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          border-radius: 4px;
        }

        .popover-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        /* Font Grid */
        .font-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .font-item-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .font-item-btn:hover {
          border-color: #3b82f6;
          background: #f8fbff;
        }

        .font-name {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        .font-preview {
          font-size: 14px;
          color: #0f172a;
          font-weight: 600;
        }

        /* Emoji Popover */
        .emoji-cat-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }

        .emoji-cat-tab {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: #f8fafc;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          color: #475569;
          font-weight: 600;
        }

        .emoji-cat-tab:hover {
          background: #f1f5f9;
        }

        .emoji-cat-tab.is-active {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
          gap: 6px;
          max-height: 180px;
          overflow-y: auto;
        }

        .emoji-btn {
          height: 36px;
          font-size: 19px;
          display: grid;
          place-items: center;
          border-radius: 6px;
          border: 0;
          background: transparent;
          cursor: pointer;
          transition: transform 0.1s ease, background 0.1s ease;
        }

        .emoji-btn:hover {
          background: #f1f5f9;
          transform: scale(1.2);
        }

        /* Hashtag chips */
        .hashtag-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .hashtag-chip {
          padding: 5px 11px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #2563eb;
          font-weight: 600;
          font-size: 13px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .hashtag-chip:hover {
          background: #2563eb;
          color: #ffffff;
        }

        /* CTA list */
        .cta-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 240px;
          overflow-y: auto;
        }

        .cta-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px;
          background: #f8fafc;
        }

        .cta-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .cta-preview {
          margin: 0;
          font-family: inherit;
          font-size: 12px;
          color: #475569;
          white-space: pre-wrap;
          line-height: 1.45;
          background: #ffffff;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #f1f5f9;
        }

        /* Textarea */
        .rich-textarea {
          width: 100%;
          border: 0;
          outline: none;
          padding: 14px 16px;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.6;
          color: #0f172a;
          resize: vertical;
          background: #ffffff;
          box-sizing: border-box;
        }

        .rich-textarea::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
