// Utility convert text sang các font chữ Unicode hiển thị được trên Facebook
export const FB_FONTS = [
  { id: 'normal', name: 'Mặc định', sample: 'Aa Bb Cc' },
  { id: 'bold_sans', name: 'In đậm (Sans)', sample: '𝗔𝗮 𝗕𝗯 𝗖𝗰' },
  { id: 'bold_serif', name: 'In đậm (Serif)', sample: '𝐀𝐚 𝐁𝐛 𝐂𝐜' },
  { id: 'italic_sans', name: 'In nghiêng', sample: '𝘈𝘢 𝘉𝘣 𝘊𝘤' },
  { id: 'bold_italic', name: 'Đậm & Nghiêng', sample: '𝘼𝙖 𝘽𝙗 𝘾𝙘' },
  { id: 'monospace', name: 'Máy đánh chữ', sample: '𝙰𝚊 𝙱𝚋 𝙲𝚌' },
  { id: 'bubble', name: 'Ký tự tròn (Bubble)', sample: 'Ⓐⓐ Ⓑⓑ Ⓒⓒ' },
  { id: 'boxed_black', name: 'Ký tự đen tròn', sample: '🅐 🅑 🅒' },
  { id: 'gothic', name: 'Kiểu Gothic cổ điển', sample: '𝔄𝔞 𝔅𝔟 ℭ𝔠' },
  { id: 'strikethrough', name: 'Gạch ngang chữ', sample: 'A̶a̶ B̶b̶ C̶c̶' },
  { id: 'underline', name: 'Gạch chân chữ', sample: 'A̲a̲ B̲b̲ C̲c̲' },
  { id: 'uppercase', name: 'VIẾT HOA TOÀN BỘ', sample: 'AA BB CC' }
];

export function convertFacebookFont(text, fontType) {
  if (!text) return '';
  if (fontType === 'normal') return text;
  if (fontType === 'uppercase') return text.toUpperCase();

  if (fontType === 'strikethrough') {
    return text.split('').map((c) => (c === ' ' || c === '\n' ? c : c + '\u0336')).join('');
  }

  if (fontType === 'underline') {
    return text.split('').map((c) => (c === ' ' || c === '\n' ? c : c + '\u0332')).join('');
  }

  return text.split('').map((char) => {
    const code = char.charCodeAt(0);

    // Bold Sans
    if (fontType === 'bold_sans') {
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + (code - 97));
      if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + (code - 48));
    }

    // Bold Serif
    if (fontType === 'bold_serif') {
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + (code - 97));
      if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7CE + (code - 48));
    }

    // Italic Sans
    if (fontType === 'italic_sans') {
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D608 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D622 + (code - 97));
    }

    // Bold Italic Sans
    if (fontType === 'bold_italic') {
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D63C + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D656 + (code - 97));
    }

    // Monospace
    if (fontType === 'monospace') {
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D670 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D68A + (code - 97));
      if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7F6 + (code - 48));
    }

    // Bubble (Circled)
    if (fontType === 'bubble') {
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + (code - 97));
      if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + (code - 49));
      if (code === 48) return '\u24EA';
    }

    // Boxed Black
    if (fontType === 'boxed_black') {
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F150 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F150 + (code - 97));
    }

    // Gothic (Fraktur)
    if (fontType === 'gothic') {
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D504 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D51E + (code - 97));
    }

    return char;
  }).join('');
}
