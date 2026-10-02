import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import useAuth from '../../hooks/useAuth';
import channelApi from '../../services/channelApi';
import postApi from '../../services/postApi';
import {
  BarChart3,
  CalendarDays,
  Clock3,
  Eye,
  FileSpreadsheet,
  Heart,
  Play,
  Send,
  ThumbsUp,
  UsersRound,
  Download,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';

const insightMetrics = [
  { name: 'page_views_total', label: 'Lượt xem hồ sơ', detail: 'Lần mở hồ sơ Page', icon: Eye },
  { name: 'page_post_engagements', label: 'Tương tác', detail: 'Reaction, bình luận, chia sẻ và hơn nữa', icon: Heart },
  { name: 'page_video_views', label: 'Lượt xem video', detail: 'Lượt phát video từ 3 giây', icon: Play },
  { name: 'page_video_view_time', label: 'Thời gian xem video', detail: 'Tổng thời lượng xem video', icon: Clock3, duration: true },
  { name: 'page_total_media_view_unique', label: 'Người xem nội dung', detail: 'Lượt xem duy nhất nội dung Page', icon: UsersRound, latest: true },
  { name: 'page_follows', label: 'Người theo dõi', detail: 'Số người theo dõi Page gần nhất', icon: UsersRound, latest: true }
];

const viewSeriesConfig = [
  { key: 'total', label: 'Lượt xem', color: '#39c981' },
  { key: 'paid', label: 'Lượt xem trả phí', color: '#5738bd' },
  { key: 'organic', label: 'Lượt xem tự nhiên', color: '#3478f6' },
  { key: 'followers', label: 'Lượt xem từ người theo dõi', color: '#f2684f' },
  { key: 'nonFollowers', label: 'Lượt xem từ người lạ', color: '#ffb400' }
];

const emptyStats = { total: 0, pending: 0, published: 0, failed: 0 };
const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value);

function scalarValue(value) {
  if (Number.isFinite(Number(value))) return Number(value);
  if (!value || typeof value !== 'object') return null;
  for (const key of ['total', 'value', 'all', 'unpaid', 'organic']) {
    if (Number.isFinite(Number(value[key]))) return Number(value[key]);
  }
  return null;
}

function metricSum(metric) {
  return (metric?.values || []).reduce((total, item) => total + (scalarValue(item.value) ?? 0), 0);
}

function latestMetric(metric) {
  const values = metric?.values || [];
  return values.length ? scalarValue(values[values.length - 1].value) : null;
}

function findSplitValue(metric, terms) {
  const values = metric?.values || [];
  const nested = values.flatMap((item) => {
    const value = item.value;
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value)) return value.map((part) => [String(part.name || part.key || ''), scalarValue(part.value)]);
    return Object.entries(value).map(([key, part]) => [key, scalarValue(part)]);
  });
  const match = nested.find(([key]) => terms.some((term) => key.toLowerCase().includes(term)));
  return match ? match[1] : null;
}

function formatDuration(milliseconds) {
  if (milliseconds === null || !Number.isFinite(milliseconds)) return '—';
  const seconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes} phút ${seconds % 60} giây` : `${seconds} giây`;
}

function breakdownValue(item, dimension) {
  const value = item.value;
  const details = value && typeof value === 'object' ? value : item;
  const count = Number(details.value ?? value);
  const bucket = String(details[dimension] ?? item[dimension] ?? '').toLowerCase();
  return { count, bucket };
}

function matchesBreakdown(bucket, dimension, included) {
  if (!bucket) return false;
  const normalized = bucket.replace(/[_\s]/g, '-');
  if (dimension === 'is_from_ads') {
    const paid = ['true', 'paid', 'ad'].includes(normalized);
    const organic = ['false', 'organic', 'non-paid', 'non-ad'].includes(normalized);
    return included ? paid : organic;
  }
  const follower = ['true', 'follower', 'fan'].includes(normalized);
  const nonFollower = ['false', 'non-follower', 'not-follower'].includes(normalized);
  return included ? follower : nonFollower;
}

function sumMetricValues(values = []) {
  return values.reduce((total, item) => total + (Number.isFinite(Number(item.value)) ? Number(item.value) : 0), 0);
}

function sumBreakdownValues(values, dimension, included) {
  if (!values.length) return null;
  return values.reduce((total, item) => {
    const { count, bucket } = breakdownValue(item, dimension);
    return matchesBreakdown(bucket, dimension, included) && Number.isFinite(count) ? total + count : total;
  }, 0);
}

function buildBreakdownSeries(values, dates, dimension, included) {
  if (!values.length) return [];
  const totals = new Map();
  values.forEach((item) => {
    const { count, bucket } = breakdownValue(item, dimension);
    if (!matchesBreakdown(bucket, dimension, included) || !Number.isFinite(count)) return;
    totals.set(item.endTime, (totals.get(item.endTime) || 0) + count);
  });
  return dates.map((date) => ({ endTime: date, value: totals.get(date) || 0 }));
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = Boolean(user);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [workspaceReport, setWorkspaceReport] = useState({ channels: [], accounts: [], contentTypes: { text: 0, image: 0, video: 0 } });
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [period, setPeriod] = useState(14);
  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [channelsError, setChannelsError] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [insightData, setInsightData] = useState({ available: false, metrics: [] });
  const [insightMessage, setInsightMessage] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setChannels([]);
      setSelectedPageId('');
      setChannelsError('');
      setChannelsLoading(false);
      setStats(emptyStats);
      setLoading(false);
      setWorkspaceReport({ channels: [], accounts: [], contentTypes: { text: 0, image: 0, video: 0 } });
      setWorkspaceLoading(false);
      return;
    }

    let active = true;
    setChannelsLoading(true);
    setChannelsError('');
    channelApi.list()
      .then((result) => {
        if (!active) return;
        const nextChannels = result.channels || [];
        setChannels(nextChannels);
        setSelectedPageId((current) => nextChannels.some((channel) => String(channel.id) === current)
          ? current
          : String(nextChannels[0]?.id || ''));
      })
      .catch((error) => {
        if (!active) return;
        setChannels([]);
        setSelectedPageId('');
        setChannelsError(error.response?.data?.message || 'Không tải được danh sách Fanpage.');
      })
      .finally(() => { if (active) setChannelsLoading(false); });
    return () => { active = false; };
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setWorkspaceLoading(false);
      return;
    }
    let active = true;
    setWorkspaceLoading(true);
    postApi.getWorkspaceReport()
      .then((result) => { if (active) setWorkspaceReport(result); })
      .catch((error) => { if (active) console.warn('Không thể tải phân tích workspace.', error); })
      .finally(() => { if (active) setWorkspaceLoading(false); });
    return () => { active = false; };
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setStats(emptyStats);
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      try {
        const data = await postApi.getStats();
        setStats(data.stats || emptyStats);
      } catch (err) {
        console.warn('Không thể tải thống kê báo cáo.', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setInsightData({ available: false, metrics: [] });
      setInsightMessage('Đăng nhập để xem dữ liệu Insights của Fanpage.');
      setInsightLoading(false);
      return;
    }
    if (channelsLoading) return;
    if (!selectedPageId) {
      setInsightData({ available: false, metrics: [] });
      setInsightMessage(channelsError || 'Tài khoản chưa có Fanpage được kết nối.');
      setInsightLoading(false);
      return;
    }

    let active = true;
    setInsightLoading(true);
    setInsightMessage('');
    postApi.getInsights(period, selectedPageId)
      .then((result) => {
        if (!active) return;
        setInsightData(result && typeof result === 'object' && Array.isArray(result.metrics) ? result : { available: false, metrics: [], ...result });
        setInsightMessage(result?.message || '');
      })
      .catch((error) => {
        if (!active) return;
        setInsightData({ available: false, metrics: [] });
        setInsightMessage(error.response?.data?.message || 'Facebook Insights chưa sẵn sàng.');
      })
      .finally(() => { if (active) setInsightLoading(false); });
    return () => { active = false; };
  }, [authLoading, channelsError, channelsLoading, isAuthenticated, period, selectedPageId]);

  const metricsList = Array.isArray(insightData?.metrics) ? insightData.metrics : [];
  const viewMetric = metricsList.find((metric) => metric.name === 'page_media_view');
  const viewValues = (viewMetric?.values || []).filter((item) => Number.isFinite(Number(item.value)));
  const breakdowns = insightData?.breakdowns || { ads: [], followers: [] };
  const dateValues = viewValues.map((item) => item.endTime);
  const paidValues = buildBreakdownSeries(breakdowns.ads || [], dateValues, 'is_from_ads', true);
  const organicValues = buildBreakdownSeries(breakdowns.ads || [], dateValues, 'is_from_ads', false);
  const followerValues = buildBreakdownSeries(breakdowns.followers || [], dateValues, 'is_from_followers', true);
  const nonFollowerValues = buildBreakdownSeries(breakdowns.followers || [], dateValues, 'is_from_followers', false);
  const chartSeries = [
    { ...viewSeriesConfig[0], values: viewValues },
    { ...viewSeriesConfig[1], values: paidValues },
    { ...viewSeriesConfig[2], values: organicValues },
    { ...viewSeriesConfig[3], values: followerValues },
    { ...viewSeriesConfig[4], values: nonFollowerValues }
  ];
  const maxViewValue = Math.max(0, ...chartSeries.flatMap((series) => series.values.map((item) => Number(item.value))));
  const chartAxisMaximum = Math.max(4, Math.ceil(maxViewValue / 4) * 4);
  const chartGridValues = Array.from({ length: 5 }, (_, index) => chartAxisMaximum * (4 - index) / 4);
  const chartPoints = (values) => values.map((item, index) => ({
    x: values.length <= 1 ? 70 : 70 + (index / (values.length - 1)) * 900,
    y: 220 - (Number(item.value) / chartAxisMaximum) * 195,
    item
  }));
  const chartLabels = dateValues.length
    ? [...new Set([0, Math.floor((dateValues.length - 1) / 2), dateValues.length - 1])].map((index) => ({
      label: new Date(dateValues[index]).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      x: dateValues.length <= 1 ? 70 : 70 + (index / (dateValues.length - 1)) * 900
    }))
    : [];

  const viewBreakdownCards = [
    { ...viewSeriesConfig[0], value: viewValues.length ? sumMetricValues(viewValues) : null },
    { ...viewSeriesConfig[1], value: sumBreakdownValues(breakdowns.ads || [], 'is_from_ads', true) },
    { ...viewSeriesConfig[2], value: sumBreakdownValues(breakdowns.ads || [], 'is_from_ads', false) },
    { ...viewSeriesConfig[3], value: sumBreakdownValues(breakdowns.followers || [], 'is_from_followers', true) },
    { ...viewSeriesConfig[4], value: sumBreakdownValues(breakdowns.followers || [], 'is_from_followers', false) }
  ];

  const pageCards = insightMetrics.map((metric) => {
    const metricData = metricsList.find((item) => item.name === metric.name);
    const value = metric.latest ? latestMetric(metricData) : metricSum(metricData);
    return { ...metric, value };
  });

  const likesSplit = metricsList.find((metric) => metric.name === 'page_fan_adds_by_paid_non_paid_unique');
  const newLikesOrganic = findSplitValue(likesSplit, ['organic', 'unpaid', 'non_paid']);
  const newLikesPaid = findSplitValue(likesSplit, ['paid']);
  const pageViewsValue = pageCards.find((metric) => metric.name === 'page_views_total')?.value ?? null;
  const engagementValue = pageCards.find((metric) => metric.name === 'page_post_engagements')?.value ?? null;
  const videoViewsValue = pageCards.find((metric) => metric.name === 'page_video_views')?.value ?? null;
  const videoTimeValue = pageCards.find((metric) => metric.name === 'page_video_view_time')?.value ?? null;
  const mediaViewersValue = pageCards.find((metric) => metric.name === 'page_total_media_view_unique')?.value ?? null;
  const followersValue = insightData?.page?.followersCount ?? pageCards.find((metric) => metric.name === 'page_follows')?.value ?? null;

  const detailCards = [
    { label: 'Monitor', value: pageViewsValue, icon: Eye },
    { label: 'Like Page / Followers', value: followersValue, icon: ThumbsUp },
    { label: 'Post engagement', value: engagementValue, icon: Heart },
    { label: 'Video views', value: videoViewsValue, icon: Play },
    { label: 'Video viewing time', value: videoTimeValue === null ? null : formatDuration(videoTimeValue), icon: Clock3, formatted: true },
    { label: 'Total media viewers', value: mediaViewersValue, icon: UsersRound }
  ];

  const statsSafe = stats || emptyStats;
  const postStats = [
    { label: 'Bài đăng', value: statsSafe.total ?? 0, icon: Send },
    { label: 'Đang chờ', value: statsSafe.pending ?? 0, icon: CalendarDays },
    { label: 'Đã xuất bản', value: statsSafe.published ?? 0, icon: Eye },
    { label: 'Thất bại', value: statsSafe.failed ?? 0, icon: UsersRound }
  ];

  // Tính Điểm Sức Khỏe Fanpage (Channel Health Score)
  const healthSuccessRate = statsSafe.total > 0 ? (statsSafe.published / statsSafe.total) * 100 : 100;
  const hasVideoContent = (workspaceReport?.contentTypes?.video || 0) > 0;
  const channelHealthScore = Math.min(100, Math.round(
    (healthSuccessRate * 0.5) +
    (channels.length > 0 ? 30 : 0) +
    (hasVideoContent ? 20 : 10)
  ));

  // Chức năng Xuất dữ liệu CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Mục báo cáo', 'Chỉ số', 'Chi tiết'];
      const rows = [
        ['Tổng bài đăng', statsSafe.total ?? 0, 'Bài trong hệ thống'],
        ['Đã xuất bản thành công', statsSafe.published ?? 0, 'Đã lên Facebook'],
        ['Đang trong hàng đợi', statsSafe.pending ?? 0, 'Đang chờ xuất bản'],
        ['Đăng thất bại', statsSafe.failed ?? 0, 'Lỗi kết nối / nội dung'],
        ['Số kênh kết nối', channels.length, 'Fanpage quản lý'],
        ['Bài chữ', workspaceReport?.contentTypes?.text || 0, 'Nội dung thuần văn bản'],
        ['Bài ảnh', workspaceReport?.contentTypes?.image || 0, 'Nội dung hình ảnh'],
        ['Bài video', workspaceReport?.contentTypes?.video || 0, 'Nội dung video clip'],
      ];

      (workspaceReport?.channels || []).forEach((c) => {
        rows.push([`Kênh ${c.pageName || c.pageId}`, c.total, `Xuất bản: ${c.published}, Chờ: ${c.pending}`]);
      });

      const csvContent = '\uFEFF' + [
        headers.join(','),
        ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Bao_Cao_Fanpage_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('Không thể tạo file CSV: ' + e.message);
    }
  };

  return (
    <MainLayout title="Báo cáo & Phân tích">
      {!authLoading && !isAuthenticated && <div className="notice" style={{ marginBottom: 14 }}>Chế độ xem trước. Đăng nhập để xem số liệu bài đăng và Insights thực tế.</div>}
      {channelsError && isAuthenticated && <div className="notice" style={{ marginBottom: 14 }}>{channelsError}</div>}

      {/* Top Action Bar with Export & Health Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: channelHealthScore >= 80 ? '#E3FCEF' : '#FFF4E5',
            color: channelHealthScore >= 80 ? '#006644' : '#974F00',
            border: `1px solid ${channelHealthScore >= 80 ? '#ABF5D1' : '#FFE2BA'}`,
            padding: '6px 14px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 800
          }}>
            <Activity size={15} />
            <span>Sức khỏe Kênh: {channelHealthScore}/100</span>
            <small style={{ opacity: 0.85 }}>({channelHealthScore >= 80 ? 'Hoạt động xuất sắc' : 'Cần tối ưu'})</small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 10,
              border: '1px solid #DFE1E6',
              background: '#ffffff',
              color: '#172B4D',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)'
            }}
          >
            <Download size={15} color="#FF6B00" />
            <span>Xuất Báo Cáo CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Metric Grid */}
      <section className="metric-grid report-metric-grid" aria-label="Thống kê lượt xem Fanpage">
        {viewBreakdownCards.map(({ key, label, color, value }) => <article className="panel metric-card" key={key}>
          <div className="metric-label"><span className="report-color-dot" style={{ backgroundColor: color }} /> {label}</div>
          <div className="metric-value" title={value === null ? undefined : formatNumber(value)}>{authLoading || channelsLoading || insightLoading ? '—' : value === null ? '—' : formatNumber(value)}</div>
        </article>)}
      </section>

      {/* Chart Section */}
      <section className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-heading">
          <h2>Lượt xem & Tiếp cận</h2>
          <div className="report-header-controls">
            <select className="report-select" aria-label="Chọn Fanpage" value={selectedPageId} onChange={(event) => setSelectedPageId(event.target.value)} disabled={!isAuthenticated || channelsLoading || channels.length === 0}>
              {channels.length === 0 && <option value="">{channelsLoading ? 'Đang tải Fanpage…' : 'Chưa có Fanpage'}</option>}
              {channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
            </select>
            <div className="report-filter">
              {[7, 14, 30, 90].map((value) => (
                <button
                  className={`segment-button${period === value ? ' is-selected' : ''}`}
                  key={value}
                  onClick={() => setPeriod(value)}
                  type="button"
                  disabled={!isAuthenticated}
                >
                  {value} ngày
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="report-note">Facebook Insights{insightData?.page?.name ? ` · ${insightData.page.name}` : ''} · Dữ liệu tương tác thực tế từ Meta API.</div>
        <div className="report-chart-wrap">
          {insightLoading ? <div className="report-empty"><span>Đang tải số liệu Page…</span></div> : viewValues.length ? <>
            <svg className="report-chart" viewBox="0 0 1000 270" role="img" aria-label="Biểu đồ lượt xem theo ngày">
              {chartGridValues.map((value, index) => {
                const y = 25 + index * 48.75;
                return <g key={`${value}-${index}`}><line x1="62" x2="982" y1={y} y2={y} stroke="#e9edf3" /><text className="report-axis-label" x="48" y={y + 4} textAnchor="end">{new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}</text></g>;
              })}
              {chartSeries.map((series) => {
                const points = chartPoints(series.values);
                const path = points.map(({ x, y }, index) => `${index ? 'L' : 'M'}${x},${y}`).join(' ');
                return <g key={series.key}>
                  {points.length > 1 && <path d={path} fill="none" stroke={series.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
                  {points.map(({ x, y, item }) => <circle key={`${series.key}-${item.endTime}`} cx={x} cy={y} r="3.5" fill={series.color}><title>{`${series.label}: ${new Date(item.endTime).toLocaleDateString('vi-VN')} · ${formatNumber(Number(item.value))}`}</title></circle>)}
                </g>;
              })}
              {chartLabels.map(({ label, x }) => <text className="report-axis-label" key={`${label}-${x}`} x={x} y="252" textAnchor="middle">{label}</text>)}
            </svg>
            <div className="report-chart-legend">{chartSeries.map((series) => <span key={series.key}><i style={{ backgroundColor: series.color }} />{series.label}</span>)}</div>
          </> : <div className="report-empty"><strong>Chưa có dữ liệu lượt xem</strong><span>{insightMessage || 'Meta chưa trả dữ liệu lượt xem cho Page này trong kỳ đã chọn.'}</span></div>}
        </div>
      </section>

      {/* NEW FUNCTION: Khung Giờ Vàng Đăng Bài (Best Time to Post AI) */}
      <section className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#FF6B00" />
            <h2>Khung Giờ Vàng Đăng Bài Được Đề Xuất</h2>
          </div>
          <span style={{ fontSize: 12, color: '#6B778C' }}>Dựa trên hành vi người dùng Facebook</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, padding: '16px 0 6px' }}>
          <div style={{ background: '#FAFBFC', border: '1px solid #EBECF0', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🌅</span>
              <strong style={{ fontSize: 14, color: '#172B4D' }}>Khung Buổi Sáng</strong>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#FF6B00', marginBottom: 4 }}>08:30 - 09:30</div>
            <p style={{ fontSize: 12, color: '#6B778C', margin: 0 }}>Lượt tiếp cận mở đầu ngày cao, phù hợp cho tin tức, thông báo, và chia sẻ chào ngày mới.</p>
          </div>
          <div style={{ background: '#FAFBFC', border: '1px solid #EBECF0', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>☀️</span>
              <strong style={{ fontSize: 14, color: '#172B4D' }}>Khung Nghỉ Trưa</strong>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#10B981', marginBottom: 4 }}>11:45 - 13:15</div>
            <p style={{ fontSize: 12, color: '#6B778C', margin: 0 }}>Tỷ lệ click liên kết và tương tác thảo luận cao nhất khi nhân viên văn phòng lướt Feed.</p>
          </div>
          <div style={{ background: '#FAFBFC', border: '1px solid #EBECF0', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🌙</span>
              <strong style={{ fontSize: 14, color: '#172B4D' }}>Khung Buổi Tối (Peak)</strong>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#8B5CF6', marginBottom: 4 }}>19:45 - 21:45</div>
            <p style={{ fontSize: 12, color: '#6B778C', margin: 0 }}>Lượng xem Video Reel và Reaction bùng nổ, phù hợp cho các bài bán hàng và giải trí.</p>
          </div>
        </div>
      </section>

      {/* Secondary Metrics */}
      <section className="report-secondary-metrics">
        <div className="panel-heading"><h2>Phân tích Chi tiết Kênh</h2></div>
        <div className="metric-grid report-detail-grid">
          {detailCards.map(({ label, value, icon: Icon, formatted }) => <article className="panel metric-card" key={label}>
            <div className="metric-label"><Icon size={16} /> {label}</div>
            <div className="metric-value">{authLoading || channelsLoading || insightLoading ? '—' : value === null ? '—' : formatted ? value : formatNumber(value)}</div>
            <div className="metric-foot">{value === null && !authLoading && !channelsLoading && !insightLoading ? 'Meta chưa trả dữ liệu' : insightData?.page?.name || 'Facebook Page'}</div>
          </article>)}
          <article className="panel metric-card report-new-likes">
            <div className="metric-label"><ThumbsUp size={16} /> New likes</div>
            <div className="report-like-values">
              <span>Tự nhiên <strong>{insightLoading || newLikesOrganic === null ? '—' : formatNumber(newLikesOrganic)}</strong></span>
              <span>Trả phí <strong>{insightLoading || newLikesPaid === null ? '—' : formatNumber(newLikesPaid)}</strong></span>
            </div>
          </article>
        </div>
      </section>

      {/* Demographics */}
      <section className="report-demographics" aria-label="Phân bố người theo dõi">
        {[{ key: 'cities', title: 'Thành phố' }, { key: 'countries', title: 'Quốc gia' }].map(({ key, title }) => {
          const rows = insightData?.demographics?.[key] || [];
          return <section className="panel report-data-panel" key={key}>
            <div className="panel-heading"><h2>{title}</h2></div>
            {rows.length ? <div className="report-table-scroll"><table className="report-table">
              <thead><tr><th>{title}</th><th>Số người theo dõi</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={`${key}-${row.name}`}><td>{row.name}</td><td>{formatNumber(row.value)}</td></tr>)}</tbody>
            </table></div> : <div className="report-table-empty">{insightLoading ? 'Đang tải dữ liệu…' : 'Chưa có dữ liệu'}</div>}
          </section>;
        })}
      </section>

      {/* Channel Analysis */}
      <section className="panel report-analysis-panel">
        <div className="panel-heading"><h2>Phân tích hiệu suất theo Kênh</h2></div>
        {(workspaceReport?.channels || []).length ? <div className="report-table-scroll"><table className="report-table report-wide-table">
          <thead><tr><th>Kênh</th><th>Tổng bài</th><th>Đã xuất bản</th><th>Đang chờ</th><th>Thất bại</th></tr></thead>
          <tbody>
            {(workspaceReport.channels || []).map((channel) => <tr key={channel.pageId}><td><strong>{channel.pageName}</strong><small className="report-table-subtitle">Facebook · {channel.pageId}</small></td><td>{formatNumber(channel.total)}</td><td>{formatNumber(channel.published)}</td><td>{formatNumber(channel.pending)}</td><td>{formatNumber(channel.failed)}</td></tr>)}
            <tr className="report-total-row"><td>Tổng</td><td>{formatNumber((workspaceReport.channels || []).reduce((total, channel) => total + channel.total, 0))}</td><td>{formatNumber((workspaceReport.channels || []).reduce((total, channel) => total + channel.published, 0))}</td><td>{formatNumber((workspaceReport.channels || []).reduce((total, channel) => total + channel.pending, 0))}</td><td>{formatNumber((workspaceReport.channels || []).reduce((total, channel) => total + channel.failed, 0))}</td></tr>
          </tbody>
        </table></div> : <div className="report-table-empty">{workspaceLoading ? 'Đang tải dữ liệu…' : isAuthenticated ? 'Chưa có bài đăng theo kênh.' : 'Đăng nhập để xem phân tích kênh.'}</div>}
      </section>

      {/* Account Analysis */}
      <section className="panel report-analysis-panel">
        <div className="panel-heading"><h2>Phân tích theo Tài khoản</h2></div>
        {(workspaceReport?.accounts || []).length ? <div className="report-table-scroll"><table className="report-table report-wide-table">
          <thead><tr><th>Tài khoản</th><th>Tổng bài</th><th>Text</th><th>Ảnh</th><th>Video</th><th>Đã đăng</th></tr></thead>
          <tbody>
            {(workspaceReport.accounts || []).map((account) => <tr key={account.accountId}><td><strong>{account.accountName}</strong></td><td>{formatNumber(account.total)}</td><td>{formatNumber(account.contentTypes?.text || 0)}</td><td>{formatNumber(account.contentTypes?.image || 0)}</td><td>{formatNumber(account.contentTypes?.video || 0)}</td><td>{formatNumber(account.published)}</td></tr>)}
          </tbody>
        </table></div> : <div className="report-table-empty">{workspaceLoading ? 'Đang tải dữ liệu…' : isAuthenticated ? 'Chưa có dữ liệu tài khoản.' : 'Đăng nhập để xem phân tích tài khoản.'}</div>}
      </section>

      {/* Content Breakdown Summary */}
      <section className="report-content-summary">
        <div className="panel-heading"><h2>Phân bổ Loại nội dung</h2></div>
        <div className="metric-grid">
          {[['Bài chữ', workspaceReport?.contentTypes?.text || 0, Send], ['Ảnh', workspaceReport?.contentTypes?.image || 0, Eye], ['Video', workspaceReport?.contentTypes?.video || 0, Play]].map(([label, value, Icon]) => <article className="panel metric-card" key={label}>
            <div className="metric-label"><Icon size={16} /> {label}</div>
            <div className="metric-value">{workspaceLoading || authLoading ? '—' : formatNumber(value)}</div>
            <div className="metric-foot">Số bài trong workspace</div>
          </article>)}
        </div>
      </section>

      {/* Post Summary */}
      <section className="report-post-summary">
        <div className="panel-heading"><h2>Thống kê bài đăng trong Workspace</h2></div>
        <div className="metric-grid">
          {postStats.map(({ label, value, icon: Icon }) => <article className="panel metric-card" key={label}>
            <div className="metric-label"><Icon size={16} /> {label}</div>
            <div className="metric-value">{loading || authLoading ? '—' : formatNumber(value)}</div>
            <div className="metric-foot">{isAuthenticated ? 'Theo lịch đăng của bạn' : 'Đăng nhập để xem số liệu thực'}</div>
          </article>)}
        </div>
      </section>

      <div className="home-columns">
        <section className="panel"><div className="panel-heading"><h2>Tỷ lệ hoàn thành xuất bản</h2></div><div className="panel-body">
          <div style={{ display: 'flex', height: 11, overflow: 'hidden', borderRadius: 8, background: '#edf1f6' }}>
            <span style={{ width: `${statsSafe.total ? statsSafe.published / statsSafe.total * 100 : 0}%`, background: 'var(--green)' }} />
            <span style={{ width: `${statsSafe.total ? statsSafe.pending / statsSafe.total * 100 : 0}%`, background: '#eab34b' }} />
            <span style={{ width: `${statsSafe.total ? statsSafe.failed / statsSafe.total * 100 : 0}%`, background: 'var(--red)' }} />
          </div>
          <p className="muted" style={{ marginTop: 8 }}>{statsSafe.total ? Math.round(statsSafe.published / statsSafe.total * 100) : 0}% bài đăng đã xuất bản thành công</p>
        </div></section>
        <section className="panel"><div className="panel-heading"><h2>Tác vụ nhanh</h2></div><div className="panel-body quick-links">
          <a className="quick-link" href="/post-planner/compose"><span className="quick-icon"><Send size={17} /></span><span><strong>Viết bài mới</strong><small>Soạn & chọn giờ vàng</small></span></a>
          <a className="quick-link" href="/post-planner/bulk-upload"><span className="quick-icon"><FileSpreadsheet size={17} /></span><span><strong>Tải Excel</strong><small>Lên lịch hàng loạt</small></span></a>
        </div></section>
      </div>
    </MainLayout>
  );
}