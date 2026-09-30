const XLSX = require('xlsx');
const { parseSo9Schedule } = require('../../utils/DateParsers');

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findColumn(headers, aliases) {
  const normalizedAliases = aliases.map(normalizeHeader);
  return headers.findIndex((header) => normalizedAliases.includes(normalizeHeader(header)));
}

function cellValue(row, headers, aliases) {
  const index = findColumn(headers, aliases);
  return index < 0 ? null : row[index];
}

function parseMediaLinks(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((link) => link.replace(/\[.*?\]/g, '').trim())
    .filter(Boolean);
}

function normalizeMediaType(value) {
  const type = normalizeHeader(value);
  if (type === 'image' || type === 'photo' || type === 'anh') return 'image';
  if (type === 'video') return 'video';
  return 'text';
}

function parseBulkExcel(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
  if (!workbook.Sheets['MAIN SHEET']) {
    throw new Error('File Excel không hợp lệ. Không tìm thấy "MAIN SHEET"!');
  }

  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets['MAIN SHEET'], {
    header: 1,
    defval: null,
    blankrows: false
  });
  const headerIndex = rawRows.findIndex((row) => {
    const headers = row.map(normalizeHeader);
    return headers.includes('content') && headers.includes('schedule');
  });
  if (headerIndex < 0) {
    throw new Error('Không tìm thấy hàng tiêu đề có cột Content và Schedule trong sheet MAIN SHEET.');
  }

  const headers = rawRows[headerIndex];
  const contentColumn = findColumn(headers, ['Content', 'Nội dung', 'Nội dung bài đăng']);
  const scheduleColumn = findColumn(headers, ['Schedule', 'Thời gian đăng', 'Lịch đăng']);
  if (contentColumn < 0 || scheduleColumn < 0) {
    throw new Error('File Excel cần có cột nội dung và thời gian đăng.');
  }

  const parsedPosts = [];

  rawRows.slice(headerIndex + 1).forEach((row, rowOffset) => {
    const content = cellValue(row, headers, ['Content', 'Nội dung', 'Nội dung bài đăng']);
    const rawSchedule = row[scheduleColumn];
    const channel = cellValue(row, headers, [
      'Channel',
      'Fanpage Channel (Tên | Page ID)',
      'Kênh',
      'Kênh đăng'
    ]);
    const mediaLinks = parseMediaLinks(cellValue(row, headers, ['Media Link', 'Link Media', 'Đường dẫn media']));
    if (!content && mediaLinks.length === 0) return;

    let pageId = null;
    const channelMatch = String(channel || '').match(/\|\s*([a-f0-9]+)/i);
    if (channelMatch) pageId = channelMatch[1];

    const comments = [];
    for (let commentIndex = 1; commentIndex <= 5; commentIndex++) {
      const commentContent = cellValue(row, headers, [
        `Comment ${commentIndex}`,
        `Seeding Comment ${commentIndex}`
      ]);
      if (!commentContent) continue;

      const rawDelay = cellValue(row, headers, [
        `Schedule Comment ${commentIndex}`,
        `Thời gian comment ${commentIndex}`
      ]);
      comments.push({
        commentIndex,
        content: String(commentContent).trim(),
        delayMinutes: normalizeHeader(rawDelay) === 'now' ? 0 : Math.max(0, Number.parseInt(rawDelay, 10) || 0),
        mediaUrl: cellValue(row, headers, [`Media Comment ${commentIndex}`, `Media comment ${commentIndex}`]) || null
      });
    }

    const mediaType = normalizeMediaType(cellValue(row, headers, ['Media Type', 'Loại Media', 'Loại nội dung']));
    parsedPosts.push({
      rowIndex: headerIndex + rowOffset + 2,
      pageId,
      content: String(content || '').trim(),
      scheduledAt: parseSo9Schedule(rawSchedule),
      mediaType,
      mediaLinks,
      mediaThumb: cellValue(row, headers, ['Media Thumb', 'Ảnh đại diện']) || null,
      comments
    });
  });

  if (parsedPosts.length === 0) {
    throw new Error('File Excel không có bài đăng hợp lệ sau hàng tiêu đề.');
  }

  return parsedPosts;
}

module.exports = { parseBulkExcel };