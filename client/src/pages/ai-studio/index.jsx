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
  HelpCircle,
  Settings,
  Cpu,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sliders,
  X
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

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Miễn phí & Rất thông minh (Khuyên dùng)',
    defaultModel: 'gemini-3.5-flash-lite',
    keyHelp: 'Lấy API Key Gemini miễn phí tại aistudio.google.com',
    keyUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    badge: 'GPT-4o / GPT-4o-mini',
    defaultModel: 'gpt-4o-mini',
    keyHelp: 'Lấy API Key tại platform.openai.com/api-keys',
    keyUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    badge: 'deepseek-chat (Chi phí siêu rẻ)',
    defaultModel: 'deepseek-chat',
    keyHelp: 'Lấy API Key tại platform.deepseek.com',
    keyUrl: 'https://platform.deepseek.com'
  },
  {
    id: 'groq',
    name: 'Groq (Llama 3.3)',
    badge: 'Phản hồi tức thì, siêu tốc',
    defaultModel: 'llama-3.3-70b-versatile',
    keyHelp: 'Lấy API Key tại console.groq.com',
    keyUrl: 'https://console.groq.com/keys'
  },
  {
    id: 'custom',
    name: 'Custom Agent / Dify / Ollama',
    badge: 'Tùy biến Endpoint API riêng',
    defaultModel: 'custom-model',
    keyHelp: 'Hỗ trợ OpenAI-compatible API hoặc Dify Agent',
    keyUrl: ''
  }
];

export default function AIStudioPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý AI Content Marketing & Chăm sóc khách hàng (được kết nối với Google Gemini AI). Tôi đã sẵn sàng đồng hành cùng bạn sáng tạo nội dung độc đáo, viết bài bán hàng theo đúng ngành nghề và giải đáp mọi thắc mắc. Bạn muốn tôi hỗ trợ chủ đề gì hôm nay?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('attractive');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Cấu hình AI Agent
  const [serverStatus, setServerStatus] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3.5-flash-lite',
    baseUrl: '',
    systemPrompt: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Load trạng thái từ server & cấu hình từ localStorage khi khởi tạo
  useEffect(() => {
    aiApi.status()
      .then((res) => {
        if (res && res.configured) {
          setServerStatus(res);
        }
      })
      .catch(() => {});

    try {
      const saved = localStorage.getItem('pageflow_ai_agent_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAiConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleProviderChange = (providerId) => {
    const p = PROVIDERS.find((item) => item.id === providerId);
    setAiConfig((prev) => ({
      ...prev,
      provider: providerId,
      model: p?.defaultModel || prev.model,
      baseUrl: providerId === 'deepseek'
        ? 'https://api.deepseek.com'
        : providerId === 'groq'
        ? 'https://api.groq.com/openai/v1'
        : providerId === 'custom'
        ? prev.baseUrl || 'http://localhost:11434/v1'
        : ''
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!aiConfig.apiKey.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra!' });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await aiApi.testConnection(aiConfig);
      setTestResult({ success: true, message: res.message || 'Kết nối thành công!' });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Không thể kết nối tới Agent.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('pageflow_ai_agent_config', JSON.stringify(aiConfig));
      setShowConfigModal(false);
      setTestResult(null);
      // Thông báo vào chat
      const providerObj = PROVIDERS.find((p) => p.id === aiConfig.provider);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `✅ **Đã kết nối thành công với Agent: ${providerObj?.name || 'AI'} (${aiConfig.model})**!\nTừ bây giờ, mọi câu hỏi và yêu cầu của bạn sẽ được xử lý trực tiếp bởi Agent này với sự thông minh và đa dạng văn phong tối đa. Hãy thử nhập một câu hỏi nhé!`
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

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
      const res = await aiApi.chat(query, historyPayload, selectedTone, aiConfig);

      if (res && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: res.reply,
            agent: res.agent
          }
        ]);
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
          text: `⚠️ Lỗi kết nối AI: ${err.response?.data?.message || err.message}. Vui lòng kiểm tra lại API Key hoặc cấu hình Agent!`
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

  const isAgentConnected = Boolean((aiConfig.apiKey && aiConfig.apiKey.trim().length > 10) || serverStatus?.configured);
  const currentProviderObj = PROVIDERS.find((p) => p.id === (aiConfig.apiKey ? aiConfig.provider : 'gemini'));
  const agentDisplayName = (aiConfig.apiKey && aiConfig.apiKey.trim().length > 10)
    ? `${currentProviderObj?.name} (${aiConfig.model})`
    : (serverStatus?.configured ? `${serverStatus.provider} (${serverStatus.model})` : 'Smart Engine v3.0');

  return (
    <MainLayout title="AI Marketing Studio & Chatbot Agent">
      <div className="ai-studio-container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 'calc(100vh - 120px)' }}>
        {/* CỘT TRÁI: TEMPLATES & TONE SELECTOR */}
        <aside className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Card trạng thái Agent */}
          <div style={{
            padding: 12,
            borderRadius: 10,
            background: isAgentConnected ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${isAgentConnected ? '#a7f3d0' : '#fde68a'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: isAgentConnected ? '#065f46' : '#92400e' }}>
                {isAgentConnected ? '🟢 ĐÃ NỐI AGENT' : '🟡 CHẾ ĐỘ DỰ PHÒNG'}
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isAgentConnected ? '#059669' : '#d97706',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: 0
                }}
              >
                <Settings size={12} />
                <span>Cấu hình</span>
              </button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
              {agentDisplayName}
            </div>
            <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 8px', lineHeight: 1.3 }}>
              {isAgentConnected
                ? 'Đang gọi trực tiếp model LLM với hội thoại thông minh đa ngữ cảnh.'
                : 'Chưa nối API Key riêng. Bạn có thể bấm "Nối Agent" để kết nối Gemini/ChatGPT.'}
            </p>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 6,
                background: isAgentConnected ? '#059669' : '#FF6B00',
                color: '#ffffff',
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5
              }}
            >
              <Cpu size={13} />
              <span>{isAgentConnected ? 'Thay đổi AI Agent' : '🔌 Nối AI Agent ngay'}</span>
            </button>
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
              Gợi ý câu lệnh mẫu
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
        </aside>

        {/* CỘT PHẢI: KHUNG TRÒ CHUYỆN CHÍNH */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
          {/* Header Chat */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
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
                <strong style={{ fontSize: 15, color: '#0F172A', display: 'block' }}>
                  {isAgentConnected ? `Agent: ${agentDisplayName}` : 'AI Marketing Assistant'}
                </strong>
                <span style={{ fontSize: 11, color: isAgentConnected ? '#059669' : '#10B981', fontWeight: 700 }}>
                  ● {isAgentConnected ? 'Đã kết nối trực tiếp mô hình AI' : 'Sẵn sàng sáng tạo nội dung đa ngành'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowConfigModal(true)}
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: '#FF6B00', color: '#FF6B00' }}
              >
                <Cpu size={13} />
                <span>{isAgentConnected ? 'Đổi Agent' : 'Nối Agent'}</span>
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleResetChat}
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={13} />
                <span>Làm mới</span>
              </button>
            </div>
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
                  className="animate-fade-up"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                    animationDuration: '0.25s'
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
                    {isUser ? 'Bạn' : msg.agent ? `🤖 ${msg.agent}` : 'Trợ lý AI Gemini'}
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
                    wordBreak: 'break-word',
                    transition: 'all 0.2s ease'
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
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
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
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
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
              <div className="animate-fade-scale" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748B', fontSize: 13, padding: '10px 0' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(115deg, #FF8B00, #FF2E74)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(255, 107, 0, 0.35)',
                  animation: 'floatSlow 2s ease-in-out infinite'
                }}>
                  <Bot size={16} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '8px 14px' }}>
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                    {isAgentConnected ? `Agent ${currentProviderObj?.name || 'AI'} đang xử lý...` : 'AI đang tạo nội dung...'}
                  </span>
                  <div className="typing-dots">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
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
              placeholder="Nhập yêu cầu hoặc câu hỏi bất kỳ (Ví dụ: Viết bài bán cơm trưa sườn nướng mật ong hấp dẫn...)"
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

      {/* MODAL CẤU HÌNH & NỐI AI AGENT / LLM */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 10000,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 580,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            {/* Header Modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #FF8B00 0%, #FF2E74 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff'
                }}>
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    Kết nối AI Agent / Mô hình Ngôn ngữ
                  </h3>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    Nối trực tiếp Gemini, OpenAI, DeepSeek hoặc Agent riêng
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Chọn Nhà cung cấp (Provider) */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  1. Chọn AI Provider / Loại Agent
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {PROVIDERS.map((p) => {
                    const isSelected = aiConfig.provider === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleProviderChange(p.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: `2px solid ${isSelected ? '#FF6B00' : '#E2E8F0'}`,
                          background: isSelected ? 'rgba(255, 107, 0, 0.05)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#FF6B00' : '#0F172A' }}>
                            {p.name}
                          </span>
                          {isSelected && <Check size={14} color="#FF6B00" />}
                        </div>
                        <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 2 }}>
                          {p.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nhập API Key */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                    2. API Key ({currentProviderObj?.name})
                  </label>
                  {currentProviderObj?.keyUrl && (
                    <a
                      href={currentProviderObj.keyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span>Lấy API Key {currentProviderObj.name}</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder={currentProviderObj?.id === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                    value={aiConfig.apiKey}
                    onChange={(e) => {
                      setAiConfig((prev) => ({ ...prev, apiKey: e.target.value }));
                      setTestResult(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      borderRadius: 10,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                      fontFamily: showApiKey ? 'inherit' : 'monospace'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B'
                    }}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <small style={{ color: '#64748B', fontSize: 11, marginTop: 4, display: 'block' }}>
                  {currentProviderObj?.keyHelp}
                </small>
              </div>

              {/* Tên Model */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  3. Tên Model
                </label>
                <input
                  type="text"
                  value={aiConfig.model}
                  onChange={(e) => setAiConfig((prev) => ({ ...prev, model: e.target.value }))}
                  placeholder="Ví dụ: gemini-1.5-flash, gpt-4o-mini, deepseek-chat..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Base URL (chỉ hiện khi custom hoặc deepseek/groq) */}
              {(aiConfig.provider === 'custom' || aiConfig.provider === 'deepseek' || aiConfig.provider === 'groq') && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Custom Base URL / Endpoint
                  </label>
                  <input
                    type="text"
                    value={aiConfig.baseUrl}
                    onChange={(e) => setAiConfig((prev) => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://api.openai.com/v1 hoặc http://localhost:11434/v1"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* Kết quả kiểm tra kết nối */}
              {testResult && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: testResult.success ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${testResult.success ? '#A7F3D0' : '#FECACA'}`,
                  color: testResult.success ? '#065F46' : '#991B1B'
                }}>
                  {testResult.success ? <CheckCircle2 size={16} color="#059669" /> : <AlertCircle size={16} color="#DC2626" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Nút hành động */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 8,
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: testingConnection ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Zap size={14} color="#FF6B00" />
                  <span>{testingConnection ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: 8,
                      background: '#fff',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 20px',
                      borderRadius: 8,
                      background: 'linear-gradient(115deg, #FF8B00 0%, #FF5230 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)'
                    }}
                  >
                    Lưu & Kích hoạt Agent
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}