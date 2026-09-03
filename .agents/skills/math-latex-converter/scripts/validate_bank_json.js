/**
 * Script kiểm tra tính toàn vẹn và hợp lệ 100% của file JSON Ngân hàng câu hỏi
 * Sử dụng: node validate_bank_json.js <path-to-json-file>
 */
const fs = require('fs');
const path = require('path');

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

function checkBalancedBraces(str, label) {
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{' && (i === 0 || str[i-1] !== '\\')) depth++;
    else if (str[i] === '}' && (i === 0 || str[i-1] !== '\\')) depth--;
    if (depth < 0) return `${label} dư dấu đóng ngoặc nhọn } tại vị trí ${i}`;
  }
  if (depth > 0) return `${label} thiếu ${depth} dấu đóng ngoặc nhọn }`;
  return null;
}

const targetFile = process.argv[2];
if (!targetFile) {
  console.error('Vui lòng truyền đường dẫn file JSON cần kiểm tra. Ví dụ: node validate_bank_json.js NganHang_HamSo_De01.json');
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
  console.error(`LỖI CÚ PHÁP JSON: ${e.message}`);
  process.exit(1);
}

const rawQuestions = Array.isArray(data) ? data : Array.isArray(data.questions) ? data.questions : null;
if (!rawQuestions) {
  console.error('LỖI: Dữ liệu JSON phải là mảng hoặc object có trường "questions"');
  process.exit(1);
}

console.log(`Bắt đầu kiểm tra file: ${path.basename(targetFile)} (${rawQuestions.length} câu hỏi)...`);

let errors = 0;
let warnings = 0;

rawQuestions.forEach((q, idx) => {
  const qNum = idx + 1;
  const ctx = `Câu #${qNum}`;

  if (!q.text || typeof q.text !== 'string' || !q.text.trim()) {
    console.error(`${ctx}: Thiếu trường "text"`);
    errors++;
  } else {
    if (countUnescapedDollars(q.text) % 2 !== 0) {
      console.error(`${ctx} [text]: Lệch dấu dollar $ (tổng số $: ${countUnescapedDollars(q.text)})`);
      errors++;
    }
    const braceErr = checkBalancedBraces(q.text, `${ctx} [text]`);
    if (braceErr) { console.error(braceErr); errors++; }
  }

  if (q.type && !VALID_TYPES.has(q.type)) {
    console.error(`${ctx}: "type" không hợp lệ (${q.type})`);
    errors++;
  }

  if (q.difficulty && !VALID_DIFFICULTIES.has(q.difficulty)) {
    console.error(`${ctx}: "difficulty" không hợp lệ (${q.difficulty})`);
    errors++;
  }

  if (!q.topicIds || !Array.isArray(q.topicIds) || q.topicIds.length === 0) {
    console.warn(`${ctx}: Thiếu hoặc rỗng trường "topicIds"`);
    warnings++;
  } else {
    q.topicIds.forEach(t => {
      if (!VALID_TOPICS.has(t)) {
        console.warn(`${ctx}: topicId không hợp lệ (${t})`);
        warnings++;
      }
    });
  }

  if (q.type === 'multiple_choice' || !q.type) {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      console.error(`${ctx}: Cần ít nhất 2 options`);
      errors++;
    } else {
      q.options.forEach((opt, oIdx) => {
        if (typeof opt !== 'string' || !opt.trim()) {
          console.error(`${ctx} [Option ${oIdx + 1}]: Rỗng`);
          errors++;
        } else {
          if (countUnescapedDollars(opt) % 2 !== 0) {
            console.error(`${ctx} [Option ${oIdx + 1}]: Lệch dấu dollar $`);
            errors++;
          }
          const braceErr = checkBalancedBraces(opt, `${ctx} [Option ${oIdx + 1}]`);
          if (braceErr) { console.error(braceErr); errors++; }
        }
      });

      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        console.error(`${ctx}: correctIndex (${q.correctIndex}) không hợp lệ với tổng số ${q.options.length} options`);
        errors++;
      }
    }
  } else if (q.type === 'true_false') {
    if (!Array.isArray(q.statements) || q.statements.length === 0) {
      console.error(`${ctx}: Cần ít nhất 1 statement cho câu hỏi true_false`);
      errors++;
    } else {
      q.statements.forEach((stmt, sIdx) => {
        if (!stmt.text || typeof stmt.text !== 'string' || !stmt.text.trim()) {
          console.error(`${ctx} [Statement ${sIdx + 1}]: Text rỗng`);
          errors++;
        } else {
          if (countUnescapedDollars(stmt.text) % 2 !== 0) {
            console.error(`${ctx} [Statement ${sIdx + 1}]: Lệch dấu dollar $`);
            errors++;
          }
          const braceErr = checkBalancedBraces(stmt.text, `${ctx} [Statement ${sIdx + 1}]`);
          if (braceErr) { console.error(braceErr); errors++; }
        }
      });
    }
  } else if (q.type === 'short_answer') {
    if (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) {
      console.error(`${ctx}: Thiếu "correctAnswer" cho câu hỏi short_answer`);
      errors++;
    }
  }

  if (!q.explanation || typeof q.explanation !== 'string' || !q.explanation.trim()) {
    console.warn(`${ctx}: Thiếu giải thích (explanation)`);
    warnings++;
  } else {
    if (countUnescapedDollars(q.explanation) % 2 !== 0) {
      console.error(`${ctx} [explanation]: Lệch dấu dollar $ (tổng $: ${countUnescapedDollars(q.explanation)})`);
      errors++;
    }
    const braceErr = checkBalancedBraces(q.explanation, `${ctx} [explanation]`);
    if (braceErr) { console.error(braceErr); errors++; }
  }
});

console.log('------------------------------------');
if (errors === 0) {
  console.log(`✅ HOÀN HẢO: Tất cả ${rawQuestions.length} câu hỏi đều hợp lệ 100% (0 lỗi, ${warnings} cảnh báo).`);
} else {
  console.error(`❌ PHÁT HIỆN: ${errors} lỗi, ${warnings} cảnh báo. Vui lòng sửa lại trước khi nạp vào hệ thống.`);
}
console.log('------------------------------------');
