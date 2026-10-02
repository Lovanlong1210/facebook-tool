import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Share2,
  ArrowRight,
  Flame,
  Film,
  Hash,
  MessageCircle,
  Calendar,
  Lightbulb,
  Zap,
  HelpCircle
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import aiApi from '../../services/aiApi';

const QUICK_PROMPTS = [
  {
    icon: Flame,
    title: 'Bài bán hàng khuyến mãi',
    prompt: 'Viết bài bán hàng Facebook khuyến mãi giảm giá 50% theo công thức AIDA cực kỳ thu hút'
  },
  {
    icon: Film,
    title: 'Kịch bản Video Reel 30s',
    prompt: 'Tạo kịch bản video ngắn Reel giữ chân người xem trong 3 giây đầu tiên'
  },
  {
    icon: Hash,
    title: '15 Hashtag thịnh hành',
    prompt: 'Gợi ý 15 hashtag Facebook thịnh hành tiếp cận khách hàng tiềm năng'
  },
  {
    icon: MessageCircle,
    title: '5 Kịch bản Seeding Comment',
    prompt: 'Tạo 5 kịch bản bình luận seeding kéo tương tác tự nhiên và tạo niềm tin cho bài đăng'
  },
  {
    icon: Calendar,
    title: 'Kế hoạch nội dung 7 ngày',
    prompt: 'Lập kế hoạch nội dung Fanpage 7 ngày đa dạng từ tương tác, bán hàng đến giải trí'
  }
];

const TONES = [
  { id: 'attractive', label: 'Thu hút & Năng động 🔥' },
  { id: 'professional', label: 'Chuyên nghiệp & Uy tín 💼' },
  { id: 'urgent', label: 'Cấp bách khuyến mãi ⚡' },
  { id: 'friendly', label: 'Thân thiện & Gần gũi ❤️' }
];

export default function AIStudioPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý AI Content Marketing chuyên nghiệp của PageFlow. Tôi có thể giúp bạn viết bài bán hàng đỉnh cao, lên kịch bản Video Reel, tạo hashtag thịnh hành và kế hoạch nội dung tuần. Bạn muốn tạo nội dung gì hôm nay?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('attractive');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend.trim() : inputPrompt.trim();
    if (!query || loading) return;

    const newMessages = [...messages, { role: 'user', text: query }];
    setMessages(newMessages);
    setInputPrompt('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.text
      }));
      const res = await aiApi.chat(query, historyPayload, selectedTone);

      if (res && res.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: res.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Xin lỗi, không nhận được phản hồi từ AI. Hãy thử lại!' }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ Lỗi kết nối AI: ${err.response?.data?.message || err.message}. Vui lòng thử lại!`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleUseInCompose = (text) => {
    // Chuyển hướng sang trang soạn bài kèm nội dung được tạo bởi AI
    sessionStorage.setItem('pageflow_draft_ai_content', text);
    router.push('/post-planner/compose?fromAI=1');
  };

  const handleResetChat = () => {
    if (confirm('Bắt đầu cuộc trò chuyện mới?')) {
      setMessages([
        {
          role: 'assistant',
          text: 'Đã làm mới cuộc trò chuyện! Tôi đã sẵn sàng, bạn cần hỗ trợ nội dung gì tiếp theo?'
        }
      ]);
    }
  };

  return (
    <MainLayout title="AI Marketing Studio">
      <div className="ai-studio-container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 'calc(100vh - 120px)' }}>
        {/* CỘT TRÁI: TEMPLATES & TONE SELECTOR */}
        <aside className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel-heading" style={{ paddingBottom: 10, borderBottom: '1px solid #EBECF0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#FF6B00" />
              <h2 style={{ fontSize: 16, margin: 0 }}>Công cụ AI</h2>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
              Giọng văn (Tone)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTone(t.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${selectedTone === t.id ? '#FF6B00' : '#E2E8F0'}`,
                    background: selectedTone === t.id ? 'rgba(255, 107, 0, 0.08)' : '#FAFBFC',
                    color: selectedTone === t.id ? '#FF6B00' : '#334155',
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
              Mẫu câu lệnh thịnh hành
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: 10,
                      borderRadius: 10,
                      border: '1px solid #EBECF0',
                      background: '#ffffff',
                      color: '#1E293B',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FF6B00';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#EBECF0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Icon size={16} color="#FF6B00" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 'auto', background: 'rgba(255, 107, 0, 0.05)', border: '1px dashed rgba(255, 107, 0, 0.3)', borderRadius: 10, padding: 12, fontSize: 11, color: '#974F00' }}>
            💡 <strong>Mẹo:</strong> Sau khi AI tạo bài viết ưng ý, bấm nút <strong>"Đưa vào bài viết mới"</strong> để tự động chuyển sang trang lên lịch đăng ngay!
          </div>
        </aside>

        {/* CỘT PHẢI: KHUNG TRÒ CHUYỆN CHÍNH */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
          {/* Header Chat */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #EBECF0',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(115deg, #FF8B00 0%, #FF2E74 100%)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.35)'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <strong style={{ fontSize: 15, color: '#0F172A', display: 'block' }}>PageFlow AI Content Engine</strong>
                <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>● Sẵn sàng tạo nội dung viral</span>
              </div>
            </div>

            <button
              type="button"
              className="button button-secondary"
              onClick={handleResetChat}
              style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={13} />
              <span>Cuộc trò chuyện mới</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 20,
            background: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 4,
                    fontSize: 11,
                    color: '#64748B',
                    fontWeight: 700
                  }}>
                    {isUser ? 'Bạn' : 'PageFlow AI'}
                  </div>

                  <div style={{
                    maxWidth: '85%',
                    padding: '14px 18px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? 'linear-gradient(115deg, #FF8B00 0%, #FF5230 100%)' : '#ffffff',
                    color: isUser ? '#ffffff' : '#1E293B',
                    boxShadow: isUser ? '0 4px 14px rgba(255, 107, 0, 0.25)' : '0 2px 10px rgba(0,0,0,0.04)',
                    border: isUser ? 'none' : '1px solid #E2E8F0',
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.text}
                  </div>

                  {/* Nút thao tác dưới câu trả lời của AI */}
                  {!isUser && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, paddingLeft: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, idx)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: '#ffffff',
                          border: '1px solid #E2E8F0',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedIndex === idx ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                        <span>{copiedIndex === idx ? 'Đã chép' : 'Sao chép'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUseInCompose(msg.text)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'rgba(255, 107, 0, 0.08)',
                          border: '1px solid rgba(255, 107, 0, 0.3)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#FF6B00',
                          cursor: 'pointer'
                        }}
                      >
                        <Zap size={12} />
                        <span>Đưa vào bài viết mới</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748B', fontSize: 13, padding: '10px 0' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(115deg, #FF8B00, #FF2E74)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff'
                }}>
                  <Bot size={15} />
                </div>
                <span>PageFlow AI đang suy nghĩ và sáng tạo nội dung...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Input Area */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{
              padding: '14px 20px',
              background: '#ffffff',
              borderTop: '1px solid #EBECF0',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-end'
            }}
          >
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập yêu cầu sáng tạo nội dung của bạn (Ví dụ: Viết bài khuyến mãi hè 50% sản phẩm thời trang nữ...)"
              rows={2}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                outline: 'none',
                resize: 'none',
                lineHeight: 1.4,
                fontFamily: 'inherit'
              }}
            />

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="button button-primary"
              style={{
                background: inputPrompt.trim() && !loading ? 'linear-gradient(115deg, #FF8B00 0%, #FF5230 100%)' : '#CBD5E1',
                border: 0,
                padding: '12px 18px',
                borderRadius: 12,
                cursor: inputPrompt.trim() && !loading ? 'pointer' : 'not-allowed',
                boxShadow: inputPrompt.trim() && !loading ? '0 4px 12px rgba(255, 107, 0, 0.35)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Send size={16} />
              <span>Gửi</span>
            </button>
          </form>
        </section>
      </div>
    </MainLayout>
  );
}