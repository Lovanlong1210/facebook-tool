import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, List, Plus } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import postApi from '../../services/postApi';

const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    postApi.getPostsList({ limit: 100 }).then((data) => setPosts(data.posts || [])).catch((requestError) => setError(requestError.response?.data?.message || 'Không thể tải lịch đăng.'));
  }, []);

  const cells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((offset + dayCount) / 7) * 7;
    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(year, month, index - offset + 1);
      return { date, inMonth: date.getMonth() === month };
    });
  }, [currentMonth]);

  const postsByDay = useMemo(() => posts.reduce((groups, post) => {
    if (!post.scheduled_at) return groups;
    const key = new Date(post.scheduled_at).toLocaleDateString('en-CA');
    groups[key] = [...(groups[key] || []), post];
    return groups;
  }, {}), [posts]);

  const shiftMonth = (amount) => setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() + amount, 1));
  const monthLabel = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <MainLayout title="Lịch đăng" actions={<><Link href="/post-planner/list" className="button button-secondary"><List size={15} /> Danh sách</Link><Link href="/post-planner/compose" className="button button-primary"><Plus size={15} /> Tạo bài</Link></>}>
      <section className="panel calendar-panel">
        <div className="filter-bar"><div className="calendar-switch"><button className="segment-button is-selected" type="button">Lịch thủ công</button><button className="segment-button" type="button">Tự động SOS</button></div><div className="calendar-controls"><button className="icon-button" onClick={() => shiftMonth(-1)} type="button" aria-label="Tháng trước"><ChevronLeft size={17} /></button><strong>{monthLabel}</strong><button className="icon-button" onClick={() => shiftMonth(1)} type="button" aria-label="Tháng sau"><ChevronRight size={17} /></button><button className="button button-secondary" onClick={() => setCurrentMonth(new Date())} type="button">Hôm nay</button></div></div>
        {error && <div className="notice" style={{ margin: 12 }}>{error}</div>}
        <div className="calendar-grid">{weekdays.map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}{cells.map(({ date, inMonth }, index) => {
          const key = date.toLocaleDateString('en-CA');
          const dayPosts = postsByDay[key] || [];
          const today = date.toDateString() === new Date().toDateString();
          return <div className={`calendar-cell${inMonth ? '' : ' is-outside'}`} key={`${key}-${index}`}><span className={`calendar-day${today ? ' is-today' : ''}`}>{date.getDate()}</span>{dayPosts.slice(0, 3).map((post) => <div className={`calendar-event ${post.status || 'pending'}`} key={post.id} title={post.content}>{post.content || `Bài #${post.id}`}</div>)}{dayPosts.length > 3 && <small className="muted">+{dayPosts.length - 3} bài khác</small>}</div>;
        })}</div>
      </section>
    </MainLayout>
  );
}