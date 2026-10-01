import { useEffect, useState } from 'react';
import { Check, Globe2, Plus, RefreshCw } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import useAuth from '../../hooks/useAuth';
import channelApi from '../../services/channelApi';

export default function ChannelsPage() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadChannels = async () => {
    if (!isAuthenticated) {
      setChannels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await channelApi.list();
      setChannels(result.channels || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không tải được danh sách kênh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChannels(); }, [isAuthenticated]);

  return (
    <MainLayout
      title="Kênh đã kết nối"
      actions={
        <button className="button button-secondary" type="button" onClick={loadChannels} disabled={!isAuthenticated || loading}>
          <RefreshCw size={15} /> {isAuthenticated ? 'Đồng bộ Page' : 'Đăng nhập để đồng bộ'}
        </button>
      }
    >
      {error && <div className="notice" style={{ marginBottom: 14 }}>{error}</div>}
      {!isAuthenticated && (
        <div className="notice" style={{ marginBottom: 14 }}>
          Bạn đang ở chế độ xem trước. Đăng nhập để mở khóa Fanpage và tính năng quản lý kênh.
        </div>
      )}
      <div className="channel-grid">
        {channels.map((channel) => <article className="panel channel-card" key={channel.id}><div className="channel-card-head"><div className="channel-avatar"><Globe2 size={23} /></div><span className="channel-connected"><Check size={14} /> Đã kết nối</span></div><h2 style={{ fontSize: 14, margin: '15px 0 4px' }}>{channel.name}</h2><div className="muted" style={{ fontSize: 11 }}>Facebook · {channel.category}</div><div className="muted" style={{ fontSize: 10, marginTop: 8 }}>ID: {channel.id}</div></article>)}
        {isAuthenticated && (
          <button className="panel channel-card" type="button" onClick={loadChannels} disabled={loading} style={{ borderStyle: 'dashed', color: '#728099', cursor: loading ? 'wait' : 'pointer', background: '#fbfcfe' }}><Plus size={22} /><strong style={{ display: 'block', marginTop: 10 }}>Đồng bộ tất cả Page</strong><span className="muted" style={{ fontSize: 11 }}>Từ Facebook account đang đăng nhập</span></button>
        )}
      </div>
      {!isAuthenticated && channels.length === 0 && (
        <section className="panel" style={{ marginTop: 14 }}>
          <div className="panel-body muted">Chưa có Fanpage nào hiển thị ở chế độ xem trước. Đăng nhập để đồng bộ kênh Facebook.</div>
        </section>
      )}
      {loading && isAuthenticated && <section className="panel" style={{ marginTop: 14 }}><div className="panel-body muted">Đang đồng bộ thông tin Page…</div></section>}
      <section className="panel" style={{ marginTop: 14 }}>
        <div className="panel-heading">
          <h2>Trạng thái đồng bộ</h2>
          <button className="button button-secondary" type="button" onClick={loadChannels} disabled={!isAuthenticated || loading}><RefreshCw size={14} /> {isAuthenticated ? 'Làm mới' : 'Đăng nhập để làm mới'}</button>
        </div>
        <div className="panel-body"><div className="tip-line"><Check size={16} className="tip-check" /> {isAuthenticated ? (channels.length ? 'Thông tin Fanpage được tải trực tiếp từ Facebook.' : 'Chưa có kênh Facebook khả dụng.') : 'Chế độ xem trước: đăng nhập để đồng bộ và quản lý Fanpage.'}</div></div>
      </section>
    </MainLayout>
  );
}