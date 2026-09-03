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
    onload="renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; color: #1e293b; margin: 0; padding: 32px 16px; line-height: 1.6; }
    .container { max-width: 960px; margin: 0 auto; }
    .header { margin-bottom: 24px; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header h1 { margin: 0 0 8px; font-size: 22px; color: #1d4ed8; }
    .card { margin-bottom: 24px; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; }
    .badge-bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
    .badge { display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 600; border-radius: 9999px; }
    .badge-diff { background: #dbeafe; color: #1e40af; }
    .badge-topic { background: #fef3c7; color: #92400e; }
    .badge-grade { background: #e2e8f0; color: #475569; }
    .badge-ans { background: #dcfce7; color: #166534; font-weight: 700; }
    .question-title { font-weight: 600; font-size: 16px; margin: 12px 0 16px; color: #0f172a; line-height: 1.7; }
    .stem-img-box { margin: 16px 0; text-align: center; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px dashed #cbd5e1; }
    .stem-img-box img { max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0; background: white; }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; }
    .option-item { padding: 10px 14px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 15px; }
    .option-correct { background: #dcfce7; border-color: #86efac; color: #166534; font-weight: 600; }
    .explanation { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.75; white-space: pre-wrap; margin-top: 16px; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
    .exp-title { font-weight: 700; color: #1d4ed8; margin-bottom: 8px; display: block; }
    .exp-img-container { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; justify-content: center; }
    .exp-img-box { background: white; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .exp-img-box img { max-width: 100%; max-height: 380px; object-fit: contain; border-radius: 4px; }
    .img-label { font-size: 11px; color: #64748b; margin-top: 6px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 MathLearn - Kiểm Tra Ngân Hàng Câu Hỏi</h1>
      <div style="font-size: 14px; color: #64748b;">Tổng số: <strong style="color: #0f172a;">${questions.length} câu hỏi</strong> | File nguồn: <code>${path.basename(jsonPath)}</code></div>
    </div>
`;

questions.forEach((q, idx) => {
  const qNum = idx + 1;
  // Stem image
  const stemImg = q.imageFileName;
  const stemImgPath = stemImg ? path.relative(path.dirname(outHtml), path.join(imagesDir, stemImg)).replace(/\\/g, '/') : null;

  // Solution images
  let expImgs = [];
  if (Array.isArray(q.explanationImages) && q.explanationImages.length > 0) {
    expImgs = q.explanationImages;
  } else if (q.explanationImageFileName) {
    expImgs = [q.explanationImageFileName];
  }

  html += `
  <div class="card">
    <div>
      <span class="badge badge-diff">${q.difficulty || 'vận dụng'}</span>
      <span class="badge badge-topic">${(q.topicIds || []).join(', ')}</span>
      <span class="badge">${q.grade || 'Lớp 12'}</span>
      ${q.correctAnswer ? `<span class="badge badge-topic" style="background:#dcfce7;color:#166534;">Đáp án: ${q.correctAnswer}</span>` : ''}
    </div>
    
    <div class="question-title">Câu ${qNum}: ${q.text || ''}</div>
  `;

  if (stemImgPath) {
    html += `
    <div style="margin:12px 0;text-align:center;background:#f8fafc;padding:12px;border-radius:8px;border:1px dashed #cbd5e1;">
      <img src="${stemImgPath}" alt="${stemImg}" style="max-width:100%;max-height:350px;border-radius:6px;border:1px solid #cbd5e1;background:white;" onerror="this.outerHTML='<div style=\\'color:#ef4444;font-size:12px;\\'>⚠️ Không tìm thấy ảnh đề: ${stemImg}</div>'">
      <div style="font-size:12px;color:#64748b;margin-top:4px;"><code>Ảnh đề bài: ${stemImg}</code></div>
    </div>
    `;
  }

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
    html += `
    <div class="explanation">
      <strong>Lời giải chi tiết:</strong><br>${q.explanation}
    `;

    if (expImgs.length > 0) {
      html += `<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;justify-content:center;">`;
      expImgs.forEach(fName => {
        const eRel = path.relative(path.dirname(outHtml), path.join(imagesDir, fName)).replace(/\\/g, '/');
        html += `
        <div style="background:white;padding:8px;border-radius:8px;border:1px solid #cbd5e1;text-align:center;">
          <img src="${eRel}" alt="${fName}" style="max-width:100%;max-height:350px;border-radius:6px;border:1px solid #e2e8f0;" onerror="this.outerHTML='<div style=\\'color:#ef4444;font-size:12px;\\'>⚠️ Không tìm thấy ảnh lời giải: ${fName}</div>'">
          <div style="font-size:11px;color:#64748b;margin-top:4px;"><code>Ảnh lời giải: ${fName}</code></div>
        </div>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
  }

  html += `</div>`;
});

html += `
  </div>
</body>
</html>
`;

fs.writeFileSync(outHtml, html, 'utf8');
console.log(`✅ Đã tạo thành công trang Preview tại: ${outHtml}`);
