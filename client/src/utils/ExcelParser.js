import * as XLSX from 'xlsx';

export const parseExcelPreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames.includes('MAIN SHEET') 
          ? 'MAIN SHEET' 
          : workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        const formattedData = rawJson.map((row, index) => {
          // Xử lý đếm số lượng media links
          const rawMedia = row['Media Link'] || '';
          const mediaCount = rawMedia ? rawMedia.split(',').length : 0;

          // Xử lý lọc lấy Page ID từ Channel
          let channelName = row['Channel'] || 'N/A';
          const match = channelName.match(/^(.*?)\|/);
          if (match) channelName = match[1].trim();

          return {
            key: index,
            rowIndex: index + 2,
            channel: channelName,
            content: row['Content'] || '(Không có nội dung)',
            schedule: row['Schedule'] || 'Đăng ngay',
            mediaType: row['Media Type'] || 'text',
            mediaCount: mediaCount,
            comment1: row['Comment 1'] || '-',
            comment2: row['Comment 2'] || '-'
          };
        });

        resolve(formattedData);
      } catch (err) {
        reject(new Error('Khổng thể đọc file Excel. Vui lòng kiểm tra lại cấu trúc file mẫu!'));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};