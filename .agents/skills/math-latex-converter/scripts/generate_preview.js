/**
 * Script tạo trang xem trước trực quan HTML (2 Cột) kết hợp KaTeX và Ảnh đã crop
 * Sử dụng: node generate_preview.js <path-to-json-file> [images_dir] [output_html_file]
 */
const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2];
const imagesDir = process.argv[3] || path.dirname(jsonPath);
const outHtml = process.argv[4] || path.join(path.dirname(jsonPath), 'preview.html');

if (!jsonPath || !fs.existsSync(jsonPath)) {
  console.error('Vui lòng truyền file JSON hợp lệ. Ví dụ: node generate_preview.js NganHang_De01.json ./figures preview.html');
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const questions = Array.isArray(rawData) ? rawData : rawData.questions || [];

let html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Preview Ngân Hàng Câu Hỏi - MathLearn</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}]});"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .header { max-width: 1100px; margin: 0 auto 24px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header h1 { margin: 0 0 8px; font-size: 24px; color: #2563eb; }
    .card { max-width: 1100px; margin: 0 auto 20px; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; gap: 24px; }
    .content-col { flex: 1; min-width: 0; }
    .image-col { width: 340px; flex-shrink: 0; background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center; }
    .image-col img { max-width: 100%; height: auto; border-radius: 6px; border: 1px solid #cbd5e1; background: white; }
    .badge { display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 600; border-radius: 9999px; margin-right: 6px; }
    .badge-diff { background: #dbeafe; color: #1e40af; }
    .badge-topic { background: #fef3c7; color: #92400e; }
    .question-title { font-weight: 600; font-size: 16px; margin: 12px 0; line-height: 1.6; }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .option-item { padding: 8px 12px; border-radius: 6px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 15px; }
    .option-correct { background: #dcfce7; border-color: #86efac; color: #166534; font-weight: 600; }
    .explanation { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .empty-img { color: #94a3b8; font-size: 13px; font-style: italic; padding: 40px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📚 MathLearn - Kiểm Tra Ngân Hàng Câu Hỏi</h1>
    <div>Tổng số: <strong>${questions.length} câu hỏi</strong> | File nguồn: <code>${path.basename(jsonPath)}</code></div>
  </div>
`;

questions.forEach((q, idx) => {
  const qNum = idx + 1;
  const imageFile = q.imageFileName || q.explanationImageFileName || (q.explanationImages && q.explanationImages[0]);
  const imgRelPath = imageFile ? path.relative(path.dirname(outHtml), path.join(imagesDir, imageFile)).replace(/\\/g, '/') : null;

  html += `
  <div class="card">
    <div class="content-col">
      <div>
        <span class="badge badge-diff">${q.difficulty || 'nhận biết'}</span>
        <span class="badge badge-topic">${(q.topicIds || []).join(', ')}</span>
        <span class="badge">${q.grade || 'Lớp 12'}</span>
      </div>
      <div class="question-title">Câu ${qNum}: ${q.text || ''}</div>
  `;

  if (Array.isArray(q.options) && q.options.length > 0) {
    html += `<div class="options">`;
    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, oIdx) => {
      const isCorrect = q.correctIndex === oIdx;
      html += `<div class="option-item ${isCorrect ? 'option-correct' : ''}"><strong>${labels[oIdx] || oIdx}.</strong> ${opt}</div>`;
    });
    html += `</div>`;
  }

  if (q.explanation) {
    html += `<div class="explanation"><strong>Lời giải chi tiết:</strong><br>${q.explanation}</div>`;
  }

  html += `</div>`;

  // Cột ảnh
  html += `<div class="image-col">`;
  if (imgRelPath) {
    html += `<img src="${imgRelPath}" alt="${imageFile}" onerror="this.outerHTML='<div class=\\'empty-img\\'>⚠️ Chưa tìm thấy ảnh: ${imageFile}</div>'">`;
    html += `<div style="font-size: 12px; color: #64748b; margin-top: 6px;"><code>${imageFile}</code></div>`;
  } else {
    html += `<div class="empty-img">Không có hình vẽ</div>`;
  }
  html += `</div>`;

  html += `</div>`;
});

html += `
</body>
</html>
`;

fs.writeFileSync(outHtml, html, 'utf8');
console.log(`✅ Đã tạo thành công trang Preview tại: ${outHtml}`);
