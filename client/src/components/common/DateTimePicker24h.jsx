import React, { useMemo } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';

/**
 * Component chọn thời gian chuẩn 24 giờ (00:00 - 23:59)
 * Không dùng AM/PM gây nhầm lẫn.
 */
export default function DateTimePicker24h({ value, onChange, label, disabled = false }) {
  // Parse giá trị hiện tại
  const { datePart, hourPart, minutePart } = useMemo(() => {
    if (!value) {
      const now = new Date(Date.now() + 3600000);
      const YYYY = now.getFullYear();
      const MM = String(now.getMonth() + 1).padStart(2, '0');
      const DD = String(now.getDate()).padStart(2, '0');
      const HH = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      return {
        datePart: `${YYYY}-${MM}-${DD}`,
        hourPart: HH,
        minutePart: mm
      };
    }

    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) throw new Error();
      // Lấy theo local time
      const YYYY = d.getFullYear();
      const MM = String(d.getMonth() + 1).padStart(2, '0');
      const DD = String(d.getDate()).padStart(2, '0');
      const HH = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return {
        datePart: `${YYYY}-${MM}-${DD}`,
        hourPart: HH,
        minutePart: mm
      };
    } catch {
      // Nếu dạng string "2026-10-02T10:08"
      const str = String(value);
      const parts = str.split('T');
      const dPart = parts[0] || '';
      const timePart = (parts[1] || '12:00').slice(0, 5);
      const [h, m] = timePart.split(':');
      return {
        datePart: dPart,
        hourPart: String(h || '12').padStart(2, '0'),
        minutePart: String(m || '00').padStart(2, '0')
      };
    }
  }, [value]);

  const updateDateTime = (newDate, newHour, newMinute) => {
    const formatted = `${newDate}T${newHour}:${newMinute}`;
    if (onChange) {
      onChange(formatted);
    }
  };

  const handleDateChange = (e) => {
    updateDateTime(e.target.value, hourPart, minutePart);
  };

  const handleHourChange = (e) => {
    updateDateTime(datePart, e.target.value, minutePart);
  };

  const handleMinuteChange = (e) => {
    updateDateTime(datePart, hourPart, e.target.value);
  };

  const setQuickTime = (hour, minute) => {
    updateDateTime(datePart, String(hour).padStart(2, '0'), String(minute).padStart(2, '0'));
  };

  // Tạo danh sách 24 giờ: 00, 01, 02, ..., 23
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

  // Tạo danh sách 60 phút: 00, 01, 02, ..., 59
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // Diễn giải giờ cho người dùng dễ hiểu
  const hourNum = parseInt(hourPart, 10);
  const timeDescription = hourNum >= 0 && hourNum < 6
    ? 'Đêm'
    : hourNum >= 6 && hourNum < 11
    ? 'Sáng'
    : hourNum >= 11 && hourNum < 14
    ? 'Trưa'
    : hourNum >= 14 && hourNum < 18
    ? 'Chiều'
    : 'Tối';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{label}</label>
          <span style={{ fontSize: 11, color: '#FF6B00', fontWeight: 800 }}>● Chuẩn 24 Giờ (00:00 - 23:59)</span>
        </div>
      )}

      {/* Control Grid: Chọn Ngày + Chọn Giờ (24h) + Chọn Phút */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: 8,
        alignItems: 'center'
      }}>
        {/* Cột Ngày */}
        <div style={{ position: 'relative' }}>
          <input
            type="date"
            value={datePart}
            onChange={handleDateChange}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              color: '#0F172A',
              fontWeight: 600,
              background: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Cột Giờ (24 Giờ: 00 -> 23) */}
        <div style={{ position: 'relative' }}>
          <select
            value={hourPart}
            onChange={handleHourChange}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              color: '#0F172A',
              fontWeight: 700,
              background: '#ffffff',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h} giờ {parseInt(h, 10) >= 12 ? `(${parseInt(h, 10) - 12 || 12}h tối/chiều)` : `(${parseInt(h, 10)}h sáng)`}
              </option>
            ))}
          </select>
        </div>

        {/* Cột Phút: 00 -> 59 */}
        <div style={{ position: 'relative' }}>
          <select
            value={minutePart}
            onChange={handleMinuteChange}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              color: '#0F172A',
              fontWeight: 700,
              background: '#ffffff',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m} phút
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thanh hiển thị trực quan & Phím tắt giờ vàng */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        padding: '6px 10px',
        background: '#F8FAFC',
        borderRadius: 8,
        border: '1px solid #E2E8F0',
        fontSize: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
          <Clock size={14} color="#FF6B00" />
          <span>Thời gian chọn: <strong style={{ color: '#FF6B00', fontSize: 13 }}>{hourPart}:{minutePart}</strong> ({timeDescription}) ngày <strong>{datePart.split('-').reverse().join('/')}</strong></span>
        </div>

        {/* Nút chọn nhanh khung giờ vàng */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#64748B' }}>Giờ vàng:</span>
          <button
            type="button"
            onClick={() => setQuickTime(8, 30)}
            style={{ padding: '2px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            08:30
          </button>
          <button
            type="button"
            onClick={() => setQuickTime(12, 0)}
            style={{ padding: '2px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            12:00
          </button>
          <button
            type="button"
            onClick={() => setQuickTime(20, 0)}
            style={{ padding: '2px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #FF6B00', background: 'rgba(255,107,0,0.08)', color: '#FF6B00', cursor: 'pointer', fontWeight: 700 }}
          >
            20:00 (Tối)
          </button>
        </div>
      </div>
    </div>
  );
}
