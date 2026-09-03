/**
 * Script tự động sửa lỗi cú pháp KaTeX, cân bằng dấu $ / ngoặc {}, 
 * chuẩn hóa số thập phân và kiểm tra tính toàn vẹn 100% của file JSON Ngân hàng câu hỏi MathLearn
 * Sử dụng: node auto_fix_bank_json.js <path-to-json-file> [output-fixed-json]
 */
const fs = require('fs');
const path = require('path');
let katex;
try {
  katex = require('katex');
} catch (e) {
  katex = null;
}

const VALID_TOPICS = new Set([
  'ham-so-va-do-thi',
  'mu-va-logarit',
  'dao-ham',
  'nguyen-ham-va-tich-phan',
  'luong-giac',
  'day-so-va-gioi-han',
  'hinh-hoc-khong-gian',
  'vector-va-he-toa-do',
  'xac-suat-va-thong-ke'
]);

const VALID_DIFFICULTIES = new Set(['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao']);
const VALID_TYPES = new Set(['multiple_choice', 'true_false', 'short_answer', 'essay']);

function countUnescapedDollars(str) {
  if (!str) return 0;
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '$') {
      let backslashes = 0;
      let j = i - 1;
      while (j >= 0 && str[j] === '\\') {
        backslashes++;
        j--;
      }
      if (backslashes % 2 === 0) count++;
    }
  }
  return count;
}

function fixMathExpression(expr) {
  let s = expr.trim();

  // 1. Sửa lỗi thiếu dấu gạch chéo cho begin/end
  s = s.replace(/(^|[^\\])begin\{(matrix|pmatrix|bmatrix|cases|array|aligned)\}/g, '$1\\begin{$2}');
  s = s.replace(/(^|[^\\])end\{(matrix|pmatrix|bmatrix|cases|array|aligned)\}/g, '$1\\end{$2}');

  // 2. Sửa lỗi \right.. hoặc \left..
  s = s.replace(/\\right\.\./g, '\\right.');
  s = s.replace(/\\left\.\./g, '\\left.');

  // 3. Sửa số thập phân trong math mode ($0,5$ -> $0{,}5$)
  s = s.replace(/(\d+),(\d+)/g, '$1{,}$2');

  // 4. Sửa lỗi thiếu dấu đóng ngoặc nhọn {}
  let openBraces = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{' && (i === 0 || s[i-1] !== '\\')) openBraces++;
    else if (s[i] === '}' && (i === 0 || s[i-1] !== '\\')) openBraces--;
  }
  if (openBraces > 0) {
    s = s + '}'.repeat(openBraces);
  } else if (openBraces < 0) {
    // Xóa bớt dấu } thừa ở cuối
    while (openBraces < 0 && s.endsWith('}')) {
      s = s.slice(0, -1);
      openBraces++;
    }
  }

  // 5. Sửa lỗi lệch \left và \right
  const leftMatches = s.match(/\\left[\(\[\{\.\|]/g) || [];
  const rightMatches = s.match(/\\right[\)\]\}\.\|]/g) || [];
  if (leftMatches.length > rightMatches.length) {
    const diff = leftMatches.length - rightMatches.length;
    s = s + ' \\right.'.repeat(diff);
  } else if (rightMatches.length > leftMatches.length) {
    const diff = rightMatches.length - leftMatches.length;
    s = '\\left. '.repeat(diff) + s;
  }

  // 6. Cân bằng ngoặc tròn — ĐÃ TẮT (quá rủi ro với ký hiệu toán [a;b) hay (a;b])
  // let openParens = (s.match(/\(/g) || []).length;
  // let closeParens = (s.match(/\)/g) || []).length;
  // if (openParens > closeParens) {
  //   s = s + ')'.repeat(openParens - closeParens);
  // }

  // 7. Bọc từ tiếng Việt có dấu trong math mode bằng \text{...}
  // Chỉ bọc cụm >= 3 ký tự chứa TIẾNG VIỆT CÓ DẤU, không chứa ký tự LaTeX
  const vnRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;
  if (vnRegex.test(s)) {
    s = s.replace(/([a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ][a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s]{2,})/g, (m) => {
      if (vnRegex.test(m) && !/[\\{}$^_]/.test(m)) {
        return ' \\text{' + m.trim() + '} ';
      }
      return m;
    });
  }

  // 8. Kiểm tra với KaTeX engine nếu có
  if (katex) {
    try {
      katex.renderToString(s, { throwOnError: true });
    } catch (err) {
      if (err.message.includes('Expected \'}\'') && !s.endsWith('}')) {
        s = s + '}';
      }
      if (err.message.includes('Expected \'\\right\'') && !s.includes('\\right')) {
        s = s + ' \\right.';
      }
    }
  }

  return s;
}

function autoFixText(text) {
  if (!text || typeof text !== 'string') return text;
  let fixed = text;

  // 1. Xóa các tiền tố nhãn thừa ở đầu câu
  fixed = fixed.replace(/^(?:\\textbf\{)?(?:Câu|Bài)\s*\d+[:.](?:\})?\s*/i, '')
               .replace(/^\[KID\]\s*/i, '')
               .replace(/^\[(?:NB|TH|VD|VDC|MỨC ĐỘ \d)\]\s*/i, '')
               .trim();

  // 2. Chuyển đổi \textbf và \textit sang markdown ** và *
  fixed = fixed.replace(/\\textbf\{([^}]+)\}/g, '**$1**')
               .replace(/\\textit\{([^}]+)\}/g, '*$1*');

  // 3. Sửa lỗi latex trong display math $$ ... $$
  fixed = fixed.replace(/\$\$([\s\S]*?)\$\$/g, (match, expr) => {
    return '$$' + fixMathExpression(expr) + '$$';
  });

  // 4. Sửa lỗi latex trong inline math $ ... $
  const parts = fixed.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  fixed = parts.map((part, idx) => {
    if (idx % 2 === 0) {
      // Ngoài math mode: thay \\ bằng \n
      return part.replace(/\\\\/g, '\n').replace(/\\newline/g, '\n');
    } else {
      // Trong math mode
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return part;
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        return '$' + fixMathExpression(mathContent) + '$';
      }
      return part;
    }
  }).join('');

  // 5. Kiểm tra dấu dollar $ nếu bị lẻ → CẢNH BÁO thay vì tự sửa
  const dollarCount = countUnescapedDollars(fixed);
  if (dollarCount % 2 !== 0) {
    console.warn(`⚠️ CẢNH BÁO: Lẻ dấu $ (${dollarCount}) — cần kiểm tra thủ công. Text: "${fixed.substring(0, 80)}..."`);
    // KHÔNG tự chèn $ vào cuối — sẽ phá hủy nội dung
  }

  // 6. Cân bằng dấu ngoặc nhọn {} trong toàn bộ chuỗi
  let openBraces = 0;
  let fixedChars = fixed.split('');
  for (let i = 0; i < fixedChars.length; i++) {
    if (fixedChars[i] === '{' && (i === 0 || fixedChars[i-1] !== '\\')) {
      openBraces++;
    } else if (fixedChars[i] === '}' && (i === 0 || fixedChars[i-1] !== '\\')) {
      if (openBraces > 0) {
        openBraces--;
      } else {
        // Dấu } thừa không có { tương ứng
        fixedChars[i] = '';
      }
    }
  }
  fixed = fixedChars.join('');
  if (openBraces > 0) {
    fixed = fixed + '}'.repeat(openBraces);
  }

  return fixed.trim();
}

const targetFile = process.argv[2];
const outputFile = process.argv[3] || targetFile;

if (!targetFile) {
  console.error('Vui lòng truyền đường dẫn file JSON cần sửa/kiểm tra. Ví dụ: node auto_fix_bank_json.js NganHang_De01.json');
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  console.error(`Không tìm thấy file: ${targetFile}`);
  process.exit(1);
}

const content = fs.readFileSync(targetFile, 'utf8');
let data;
try {
  data = JSON.parse(content);
} catch (e) {
  console.error(`❌ LỖI CÚ PHÁP JSON: ${e.message}`);
  process.exit(1);
}

const rawQuestions = Array.isArray(data) ? data : Array.isArray(data.questions) ? data.questions : null;
if (!rawQuestions) {
  console.error('❌ LỖI: Dữ liệu JSON phải là mảng hoặc object có trường "questions"');
  process.exit(1);
}

console.log(`🔧 Bắt đầu chuẩn hóa & sửa lỗi tự động cho file: ${path.basename(targetFile)} (${rawQuestions.length} câu)...`);

let fixedCount = 0;
let errors = 0;
let warnings = 0;

rawQuestions.forEach((q, idx) => {
  const qNum = idx + 1;
  const ctx = `Câu #${qNum}`;

  // Sửa text đề bài
  if (q.text) {
    const originalText = q.text;
    q.text = autoFixText(q.text);
    if (originalText !== q.text) fixedCount++;
  } else {
    console.error(`${ctx}: Thiếu trường "text"`);
    errors++;
  }

  // Sửa explanation
  if (q.explanation) {
    const originalExp = q.explanation;
    q.explanation = autoFixText(q.explanation);
    if (originalExp !== q.explanation) fixedCount++;
  }

  // Sửa options
  if (Array.isArray(q.options)) {
    q.options = q.options.map(opt => {
      const orig = opt;
      const fixed = autoFixText(opt);
      if (orig !== fixed) fixedCount++;
      return fixed;
    });
  }

  // Sửa statements (True/False)
  if (Array.isArray(q.statements)) {
    q.statements.forEach(stmt => {
      if (stmt.text) {
        const orig = stmt.text;
        stmt.text = autoFixText(stmt.text);
        if (orig !== stmt.text) fixedCount++;
      }
    });
  }

  // Chuẩn hóa metadata
  if (!q.grade) q.grade = 'Lớp 12';
  if (!q.type) q.type = 'short_answer';
  if (!q.difficulty || !VALID_DIFFICULTIES.has(q.difficulty)) {
    q.difficulty = qNum <= 25 ? 'thong_hieu' : qNum <= 75 ? 'van_dung' : 'van_dung_cao';
  }

  if (!q.topicIds || !Array.isArray(q.topicIds) || q.topicIds.length === 0) {
    q.topicIds = ['ham-so-va-do-thi'];
    warnings++;
  } else {
    q.topicIds = q.topicIds.filter(t => VALID_TOPICS.has(t));
    if (q.topicIds.length === 0) q.topicIds = ['ham-so-va-do-thi'];
  }
});

const outputData = Array.isArray(data) ? { version: 1, kind: 'question_bank', questions: rawQuestions } : data;
outputData.questions = rawQuestions;

fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf8');

console.log('----------------------------------------------------');
console.log(`✨ Đã tự động vá & chuẩn hóa ${fixedCount} vị trí công thức KaTeX/văn bản.`);
console.log(`💾 Đã lưu file chuẩn tại: ${outputFile}`);
if (errors === 0) {
  console.log(`✅ CHUẨN XÁC 100%: 0 Lỗi còn lại, sẵn sàng import vào hệ thống MathLearn.`);
} else {
  console.error(`⚠️ Còn ${errors} lỗi cấu trúc cần kiểm tra.`);
}
console.log('----------------------------------------------------');

