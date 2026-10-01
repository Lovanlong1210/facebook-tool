import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarRange, CheckCircle2, Globe2, Layers3, PenSquare, Sparkles } from 'lucide-react';

const featureList = [
  'Tạo lịch đăng bài tự động cho nhiều Fanpage',
  'Upload hình ảnh, video và đồng bộ nội dung theo mẫu Excel',
  'Theo dõi hiệu suất, trạng thái và kênh đã kết nối',
  'Quản lý AI Studio, nội dung sáng tạo và workflow nội dung nhanh'
];

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #111827 35%, #1d4ed8 100%)', color: '#f8fafc', padding: '32px 20px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image src="/brand-logo.jpg" alt="SO9 social workspace" width={42} height={42} priority />
            <div>
              <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.8 }}>SO9 SOCIAL WORKSPACE</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Fanpage Automation</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập</Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0f172a', padding: '10px 18px', borderRadius: 999, textDecoration: 'none', fontWeight: 700 }}>
              <Globe2 size={18} /> Tiếp tục với Facebook
            </Link>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(147,197,253,0.3)', borderRadius: 999, padding: '8px 12px', marginBottom: 18 }}>
              <Sparkles size={16} /> Tự động hóa nội dung và fanpage
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: 1.05, margin: '0 0 18px', maxWidth: 620 }}>
              Quản lý xuất bản trên Facebook dễ như một click.
            </h1>
            <p style={{ maxWidth: 600, fontSize: 18, lineHeight: 1.7, color: '#cbd5e1', marginBottom: 28 }}>
              Xây dựng lịch đăng, đồng bộ Fanpage, upload media hàng loạt và theo dõi các bài đã xuất bản từ một không gian làm việc duy nhất.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 26 }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff', padding: '14px 22px', borderRadius: 14, textDecoration: 'none', fontWeight: 700 }}>
                Đăng nhập bằng Facebook <ArrowRight size={18} />
              </Link>
              <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '14px 22px', borderRadius: 14, textDecoration: 'none', fontWeight: 600 }}>
                Vào workspace
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, maxWidth: 620 }}>
              {[
                { label: 'Fanpage', value: '100+' },
                { label: 'Bài/tuần', value: '2.4k' },
                { label: 'Tỷ lệ hoàn tất', value: '94%' }
              ].map((stat) => (
                <div key={stat.label} style={{ background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 16, padding: 18 }}>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: '#cbd5e1' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.52)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 24, padding: 24, boxShadow: '0 24px 80px rgba(15,23,42,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: 2, color: '#93c5fd' }}>WORKFLOW</div>
                <div style={{ fontWeight: 700, fontSize: 24 }}>Quá trình làm việc</div>
              </div>
              <div style={{ background: '#1d4ed8', borderRadius: 10, padding: '8px 10px' }}><Layers3 size={18} /></div>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                { title: 'Kết nối Fanpage', icon: Globe2 },
                { title: 'Viết nội dung & lịch đăng', icon: PenSquare },
                { title: 'Theo dõi và tối ưu', icon: CalendarRange }
              ].map(({ title, icon: Icon }, index) => (
                <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 16, padding: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{index + 1}. {title}</div>
                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>Đồng bộ với tài khoản Facebook đã đăng nhập</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 56, background: 'rgba(15, 23, 42, 0.42)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 26, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <CheckCircle2 color="#34d399" />
            <h2 style={{ margin: 0, fontSize: 28 }}>Tại sao doanh nghiệp lựa chọn</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            {featureList.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(15, 23, 42, 0.35)', borderRadius: 16, padding: 18, border: '1px solid rgba(148,163,184,0.18)' }}>
                <CheckCircle2 size={18} color="#93c5fd" />
                <span style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}