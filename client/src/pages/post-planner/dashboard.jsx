import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import postApi from '../../services/postApi';
import { CalendarDays, Eye, FileSpreadsheet, Send, UsersRound } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    published: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(14);
  const [insightData, setInsightData] = useState({ available: false, metrics: [] });
  const [insightMessage, setInsightMessage] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await postApi.getStats();
        setStats(data.stats);
      } catch (err) {
        console.error("Lỗi tải thông tin Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    let active = true;
    setInsightLoading(true);
    postApi.getInsights(period)
      .then((result) => {
        if (!active) return;
        setInsightData(result);
        setInsightMessage(result.message || '');
      })
      .catch((error) => {
        if (!active) return;
        setInsightData({ available: false, metrics: [] });
        setInsightMessage(error.response?.data?.message || 'Facebook Insights chưa sẵn sàng.');
      })
      .finally(() => { if (active) setInsightLoading(false); });
    return () => { active = false; };
  }, [period]);

  const chartMetric = insightData.metrics.find((metric) => metric.name === 'page_post_engagements' && metric.values?.length)
    || insightData.metrics.find((metric) => metric.values?.length);
  const chartValues = (chartMetric?.values || []).filter((item) => typeof item.value === 'number');
  const maxChartValue = Math.max(1, ...chartValues.map((item) => item.value));
  const chartLabels = chartValues.length
    ? [0, Math.floor((chartValues.length - 1) / 2), chartValues.length - 1].map((index) => new Date(chartValues[index].endTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }))
    : [];

  const metrics = [
    { label: 'Bài đăng', value: stats.total, icon: Send, color: 'blue' },
    { label: 'Đang chờ', value: stats.pending, icon: CalendarDays, color: 'amber' },
    { label: 'Đã xuất bản', value: stats.published, icon: Eye, color: 'green' },
    { label: 'Thất bại', value: stats.failed, icon: UsersRound, color: 'red' }
  ];

  return (
    <MainLayout title="Báo cáo">
      <section className="metric-grid">
        {metrics.map(({ label, value, icon: Icon, color }) => <article className="panel metric-card" key={label}>
          <div className="metric-label"><Icon size={16} /> {label}</div>
          <div className="metric-value" style={{ color: color === 'red' ? 'var(--red)' : color === 'green' ? 'var(--green)' : color === 'amber' ? 'var(--amber)' : 'var(--ink)' }}>{loading ? '—' : value}</div>
          <div className="metric-foot">Tổng quan lịch đăng</div>
        </article>)}
      </section>
      <section className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-heading"><h2>{chartMetric?.name === 'page_post_engagements' ? 'Tương tác bài viết' : 'Lượt xem trang'}</h2><div className="report-filter">{[7, 14, 30].map((value) => <button className={`segment-button${period === value ? ' is-selected' : ''}`} key={value} onClick={() => setPeriod(value)} type="button">{value}D</button>)}</div></div>
        <div className="report-note">Facebook Insights · {insightMessage || 'Dữ liệu theo ngày'}</div>
        <div className="chart-area"><div className="chart-grid" aria-label={chartMetric?.name || 'Facebook Insights'}>{insightLoading ? <div className="chart-empty">Đang tải Insights…</div> : chartValues.length ? chartValues.map((item, index) => <div className="chart-column" key={`${item.endTime}-${index}`} title={`${new Date(item.endTime).toLocaleDateString('vi-VN')}: ${item.value}`}><div className="chart-bar" style={{ height: `${Math.max(3, item.value / maxChartValue * 100)}%` }} /></div>) : <div className="chart-empty">{insightMessage || 'Facebook chưa trả dữ liệu Insights cho khoảng thời gian này.'}</div>}</div><div className="chart-labels">{chartLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div></div>
      </section>
      <div className="home-columns">
        <section className="panel"><div className="panel-heading"><h2>Trạng thái lịch đăng</h2></div><div className="panel-body">
          <div style={{ display: 'flex', height: 11, overflow: 'hidden', borderRadius: 8, background: '#edf1f6' }}>
            <span style={{ width: `${stats.total ? stats.published / stats.total * 100 : 0}%`, background: 'var(--green)' }} />
            <span style={{ width: `${stats.total ? stats.pending / stats.total * 100 : 0}%`, background: '#eab34b' }} />
            <span style={{ width: `${stats.total ? stats.failed / stats.total * 100 : 0}%`, background: 'var(--red)' }} />
          </div>
          <p className="muted">{stats.total ? Math.round(stats.published / stats.total * 100) : 0}% bài đăng đã xuất bản</p>
        </div></section>
        <section className="panel"><div className="panel-heading"><h2>Tác vụ nhanh</h2></div><div className="panel-body quick-links">
          <a className="quick-link" href="/post-planner/compose"><span className="quick-icon"><Send size={17} /></span><span><strong>Viết bài</strong><small>Tạo nội dung mới</small></span></a>
          <a className="quick-link" href="/post-planner/bulk-upload"><span className="quick-icon"><FileSpreadsheet size={17} /></span><span><strong>Tải Excel</strong><small>Lên lịch hàng loạt</small></span></a>
        </div></section>
      </div>
    </MainLayout>
  );
}