import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, Clock3, Image, MessageSquare, Mic, Send, Sparkles, Video } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import aiApi from '../../services/aiApi';

const tools = [
  { name: 'Text to Image', icon: Image },
  { name: 'Product Shot', icon: Sparkles },
  { name: 'Face Swap', icon: Bot },
  { name: 'Outfit Swap', icon: Sparkles },
  { name: 'Text to Video', icon: Video },
  { name: 'Image to Video', icon: Image },
  { name: 'Motion Control', icon: Video },
  { name: 'Video Outfit Swap', icon: Bot }
];

export default function AIStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);

  useEffect(() => {
    aiApi.status().then((result) => setAiConfigured(result.configured)).catch(() => setAiConfigured(false));
  }, []);

  const sendPrompt = async (value = prompt) => {
    if (!value.trim()) return;
    const message = value.trim();
    const history = messages.map((item) => ({ role: item.role, content: item.text }));
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setPrompt('');
    setSending(true);
    try {
      const result = await aiApi.chat(message, history);
      setMessages((current) => [...current, { role: 'assistant', text: result.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: error.response?.data?.message || 'Không gọi được AI provider.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout title="AI Studio">
      <div className="ai-shell">
        <aside className="ai-sidebar"><h2>AI Studio</h2><input className="field" placeholder="Tìm công cụ..." aria-label="Tìm công cụ AI" /><Link href="/ai-studio" className="ai-tool-link is-active"><MessageSquare size={16} /> AI Chat</Link><div className="eyebrow" style={{ margin: '20px 9px 7px' }}>CÔNG CỤ SÁNG TẠO</div><div className="ai-tool-list">{tools.map(({ name, icon: Icon }) => <button key={name} type="button" className="ai-tool-link"><Icon size={16} />{name}</button>)}</div></aside>
        <section className="ai-chat"><header className="ai-chat-head"><strong><MessageSquare size={17} color="var(--blue)" /> AI Chat</strong><button className="button button-secondary" type="button" onClick={() => setMessages([])}><Clock3 size={15} /> Cuộc trò chuyện mới</button></header>
          <div className="ai-conversation">
            {!messages.length ? <div className="ai-welcome"><h2>Plan, create & schedule smarter with <span>AI Studio</span></h2><p>Trợ lý AI hỗ trợ viết nội dung, lên kịch bản và phát triển ý tưởng.</p><div className="prompt-chips">{['Tối ưu nội dung đăng Facebook', 'Tạo kế hoạch nội dung sản phẩm', 'Viết bài Facebook giới thiệu sản phẩm'].map((text) => <button type="button" className="prompt-chip" key={text} onClick={() => sendPrompt(text)}>{text}</button>)}</div></div> : messages.map((message, index) => <div className={`chat-message ${message.role === 'user' ? 'user' : ''}`} key={`${message.role}-${index}`}>{message.text}</div>)}
          </div>
          <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); sendPrompt(); }}><textarea placeholder="Nhập tin nhắn của bạn..." value={prompt} onChange={(event) => setPrompt(event.target.value)} /><div className="chat-composer-bottom"><button className="tool-chip" type="button" aria-label="Đính kèm hình ảnh"><Image size={15} /></button><span className="chat-disclaimer">{aiConfigured ? 'Tin nhắn gửi tới AI provider đã cấu hình' : 'AI chưa cấu hình · Tin nhắn trả lỗi rõ ràng'}</span><div style={{ display: 'flex', gap: 7 }}><button className="tool-chip" type="button" aria-label="Ghi âm"><Mic size={15} /></button><button className="button button-primary" aria-label="Gửi tin nhắn" type="submit" disabled={sending || !prompt.trim()}><Send size={15} /></button></div></div></form>
        </section>
      </div>
    </MainLayout>
  );
}