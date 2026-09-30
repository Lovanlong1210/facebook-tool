const moment = require('moment');

function parseSo9Schedule(scheduleStr) {
  if (!scheduleStr) return new Date();
  if (scheduleStr instanceof Date && !Number.isNaN(scheduleStr.getTime())) return scheduleStr;
  if (typeof scheduleStr === 'number') {
    const parsedExcelDate = require('xlsx').SSF.parse_date_code(scheduleStr);
    if (parsedExcelDate) {
      return new Date(parsedExcelDate.y, parsedExcelDate.m - 1, parsedExcelDate.d, parsedExcelDate.H, parsedExcelDate.M, parsedExcelDate.S);
    }
  }
  if (['now', 'đăng ngay'].includes(String(scheduleStr).trim().toLowerCase())) return new Date();

  const value = String(scheduleStr).trim();
  const rangeMatch = value.match(/^(.+_\d{1,2}:\d{2})-\d{1,2}:\d{2}$/);
  const startTimeStr = rangeMatch ? rangeMatch[1] : value;
  const parsedMoment = moment(startTimeStr, [
    'D/M/YYYY_HH:mm',
    'D/M/YYYY HH:mm',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm',
    'YYYY-MM-DDTHH:mm:ss',
    'YYYY-MM-DDTHH:mm'
  ], true);

  if (!parsedMoment.isValid()) {
    throw new Error(`Định dạng thời gian không hợp lệ: ${scheduleStr}. Chuẩn yêu cầu: DD/M/YYYY_HH:mm`);
  }

  return parsedMoment.toDate();
}

module.exports = { parseSo9Schedule };