/**
 * Script tạo trang xem trước trực quan HTML (2 Cột) thế hệ mới
 * - Render KaTeX hoàn hảo (hỗ trợ cả inline, display và đáp án toán học)
 * - Tự động nhận diện đầy đủ các loại câu hỏi: MCQ, Đúng/Sai, Trả lời ngắn, Tự luận
 * - Giao diện hiện đại (Tailwind-like), có bộ lọc độ khó, lọc ảnh, tìm kiếm câu hỏi
 * - Hỗ trợ Click-to-Zoom xem ảnh phóng to độ nét cao
 * - Nút ẩn/hiện toàn bộ lời giải chi tiết
 * 
 * Sử dụng: node generate_preview.js <path-to-json-file> [images_dir] [output_html_file]
 */
const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2];
const imagesDir = process.argv[3] || path.join(path.dirname(jsonPath), 'figures');
const outHtml = process.argv[4] || path.join(path.dirname(jsonPath), 'preview.html');

if (!jsonPath || !fs.existsSync(jsonPath)) {
  console.error('Vui lòng truyền file JSON hợp lệ. Ví dụ: node generate_preview.js NganHang_CauHoi.json ./figures preview.html');
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const title = rawData.title || 'Kiểm Tra Ngân Hàng Câu Hỏi';
const questions = Array.isArray(rawData) ? rawData : rawData.questions || [];

const diffLabels = {
  nhan_biet: { text: 'Nhận biết', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  thong_hieu: { text: 'Thông hiểu', bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  van_dung: { text: 'Vận dụng', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  van_dung_cao: { text: 'Vận dụng cao', bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
};

const typeLabels = {
  multiple_choice: 'Trắc nghiệm (4 lựa chọn)',
  true_false: 'Trắc nghiệm Đúng / Sai',
  short_answer: 'Trả lời ngắn',
  essay: 'Tự luận',
};

function formatMathText(str) {
  if (!str) return '';
  return str.replace(/\r\n/g, '\n');
}

let html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - MathLearn Preview</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js"></script>
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .top-bar-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .title-box h1 {
      margin: 0;
      font-size: 18px;
      color: var(--primary);
      font-weight: 700;
    }
    .title-box p {
      margin: 2px 0 0;
      font-size: 12px;
      color: var(--text-muted);
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    input[type="text"], select {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      background: white;
    }
    input[type="text"]:focus, select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
    .btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      transition: all 0.15s ease;
    }
    .btn:hover { background: #f1f5f9; }
    .btn-primary { background: var(--primary); color: white; border-color: var(--primary); }
    .btn-primary:hover { background: var(--primary-hover); }
    
    .container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }
    
    .card {
      background: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 20px;
      padding: 20px;
      transition: box-shadow 0.2s ease;
    }
    .card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
    }
    
    @media (max-width: 900px) {
      .card { grid-template-columns: 1fr; }
    }
    
    .meta-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid transparent;
    }
    .badge-id { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
    .badge-grade { background: #e0e7ff; color: #3730a3; }
    .badge-type { background: #f3e8ff; color: #6b21a8; }
    .badge-topic { background: #fef3c7; color: #92400e; }
    
    .question-stem {
      font-size: 15px;
      font-weight: 500;
      color: #0f172a;
      margin-bottom: 14px;
      line-height: 1.65;
      white-space: pre-wrap;
    }
    
    /* Options grid for MCQ */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 14px;
    }
    @media (max-width: 600px) {
      .options-grid { grid-template-columns: 1fr; }
    }
    .option-box {
      padding: 8px 12px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid var(--border);
      font-size: 14px;
      display: flex;
      gap: 6px;
    }
    .option-correct {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #065f46;
      font-weight: 600;
    }
    
    /* Statements for True/False */
    .stmt-box {
      padding: 8px 12px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid var(--border);
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    
    /* Short answer box */
    .ans-box {
      padding: 10px 14px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      font-size: 14px;
      color: #1e40af;
      margin-bottom: 14px;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .ans-content {
      font-weight: 600;
      color: #1d4ed8;
      font-size: 15px;
    }
    
    /* Explanation section */
    .explanation-box {
      background: #f8fafc;
      border-left: 3px solid var(--primary);
      border-radius: 0 8px 8px 0;
      padding: 12px 16px;
      font-size: 14px;
      color: #334155;
      line-height: 1.65;
      white-space: pre-wrap;
      margin-top: 10px;
    }
    .exp-title {
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    /* Image Column */
    .image-col {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .img-wrapper {
      width: 100%;
      text-align: center;
      cursor: zoom-in;
    }
    .img-wrapper img {
      max-width: 100%;
      max-height: 260px;
      object-fit: contain;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: white;
      transition: transform 0.15s ease;
    }
    .img-wrapper img:hover {
      transform: scale(1.02);
    }
    .img-caption {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      font-family: monospace;
    }
    .no-img {
      color: #94a3b8;
      font-size: 13px;
      font-style: italic;
      text-align: center;
      padding: 30px 0;
    }
    
    /* Modal Zoom */
    .modal {
      display: none;
      position: fixed;
      z-index: 100;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(4px);
      justify-content: center;
      align-items: center;
      cursor: zoom-out;
    }
    .modal img {
      max-width: 90%;
      max-height: 90%;
      border-radius: 8px;
      background: white;
      padding: 8px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    
    .hidden { display: none !important; }
  </style>
</head>
<body>

  <div class="top-bar">
    <div class="top-bar-inner">
      <div class="title-box">
        <h1>📚 ${title}</h1>
        <p>Tổng số: <strong id="visible-count">${questions.length}</strong> / <strong>${questions.length} câu hỏi</strong> | File: <code>${path.basename(jsonPath)}</code></p>
      </div>
      <div class="controls">
        <input type="text" id="search-input" placeholder="🔍 Tìm kiếm đề bài / ID..." oninput="filterQuestions()">
        
        <select id="diff-filter" onchange="filterQuestions()">
          <option value="all">Tất cả mức độ</option>
          <option value="nhan_biet">Nhận biết</option>
          <option value="thong_hieu">Thông hiểu</option>
          <option value="van_dung">Vận dụng</option>
          <option value="van_dung_cao">Vận dụng cao</option>
        </select>
        
        <select id="img-filter" onchange="filterQuestions()">
          <option value="all">Tất cả câu hỏi</option>
          <option value="has_img">Chỉ câu có hình ảnh</option>
          <option value="no_img">Câu không có hình ảnh</option>
        </select>

        <button class="btn" onclick="toggleAllExplanations()">👁️ Ẩn/Hiện Lời giải</button>
      </div>
    </div>
  </div>

  <div class="container" id="question-list">
`;

questions.forEach((q, idx) => {
  const qNum = idx + 1;
  const qId = q.id || `ks_${String(qNum).padStart(2, '0')}`;
  const diffInfo = diffLabels[q.difficulty] || { text: q.difficulty || 'Vận dụng', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  const typeText = typeLabels[q.type] || q.type || 'Trả lời ngắn';
  
  // Collect images
  const allImages = [];
  if (q.imageFileName) {
    if (Array.isArray(q.imageFileName)) allImages.push(...q.imageFileName);
    else allImages.push(q.imageFileName);
  }
  if (Array.isArray(q.images)) allImages.push(...q.images);
  if (q.explanationImageFileName) {
    if (Array.isArray(q.explanationImageFileName)) allImages.push(...q.explanationImageFileName);
    else allImages.push(q.explanationImageFileName);
  }
  if (Array.isArray(q.explanationImages)) allImages.push(...q.explanationImages);
  const uniqueImages = [...new Set(allImages.filter(Boolean))];
  const hasImages = uniqueImages.length > 0;

  html += `
    <div class="card question-card" 
         data-id="${qId}" 
         data-diff="${q.difficulty || ''}" 
         data-has-img="${hasImages ? 'true' : 'false'}"
         data-search="${(qId + ' ' + (q.text || '') + ' ' + (q.correctAnswer || '')).toLowerCase().replace(/"/g, '')}">
      
      <div class="content-col">
        <div class="meta-tags">
          <span class="badge badge-id">#${qId}</span>
          <span class="badge badge-grade">${q.grade || 'Lớp 12'}</span>
          <span class="badge badge-type">${typeText}</span>
          <span class="badge" style="background: ${diffInfo.bg}; color: ${diffInfo.color}; border-color: ${diffInfo.border};">${diffInfo.text}</span>
          ${(q.topicIds || []).map(t => `<span class="badge badge-topic">${t}</span>`).join('')}
        </div>
        
        <div class="question-stem"><strong>Câu ${qNum}:</strong> ${formatMathText(q.text || '')}</div>
  `;

  // 1. Multiple Choice Options
  if (Array.isArray(q.options) && q.options.length > 0) {
    html += `<div class="options-grid">`;
    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, oIdx) => {
      const isCorrect = q.correctIndex === oIdx;
      html += `<div class="option-box ${isCorrect ? 'option-correct' : ''}"><strong>${labels[oIdx] || oIdx}.</strong> <span>${opt}</span></div>`;
    });
    html += `</div>`;
  }

  // 2. True / False Statements
  if (Array.isArray(q.statements) && q.statements.length > 0) {
    html += `<div class="statements-list" style="margin-bottom: 14px;">`;
    const stmtLabels = ['a', 'b', 'c', 'd'];
    q.statements.forEach((stmt, sIdx) => {
      const label = stmtLabels[sIdx] || `${sIdx + 1}`;
      const text = typeof stmt === 'string' ? stmt : (stmt.text || '');
      const isCorrect = typeof stmt === 'object' && (stmt.correct === true || stmt.isCorrect === true);
      const isFalse = typeof stmt === 'object' && (stmt.correct === false || stmt.isCorrect === false);
      const statusBadge = isCorrect
        ? `<span style="color: #065f46; font-weight: 700; background: #d1fae5; padding: 2px 8px; border-radius: 4px; font-size: 12px;">ĐÚNG</span>`
        : (isFalse ? `<span style="color: #991b1b; font-weight: 700; background: #fee2e2; padding: 2px 8px; border-radius: 4px; font-size: 12px;">SAI</span>` : '');
      
      html += `
        <div class="stmt-box">
          <div><strong>${label})</strong> <span>${text}</span></div>
          ${statusBadge ? `<div style="margin-left: 12px; flex-shrink: 0;">${statusBadge}</div>` : ''}
        </div>`;
    });
    html += `</div>`;
  }

  // 3. Short Answer / Correct Answer
  if (q.correctAnswer !== undefined && q.correctAnswer !== null && String(q.correctAnswer).trim() !== '') {
    const ansStr = String(q.correctAnswer).trim();
    const hasMath = ansStr.includes('$') || ansStr.includes('\\');
    const formattedAns = hasMath ? (ansStr.startsWith('$') ? ansStr : `$${ansStr}$`) : ansStr;
    
    html += `
      <div class="ans-box">
        <span>🎯 <strong>Đáp số:</strong></span>
        <span class="ans-content">${formattedAns}</span>
      </div>`;
  }

  // 4. Explanation
  if (q.explanation) {
    html += `
      <div class="explanation-box">
        <div class="exp-title">📝 Lời giải chi tiết:</div>
        <div>${formatMathText(q.explanation)}</div>
      </div>`;
  }

  html += `</div>`; // end content-col

  // Image Column
  html += `<div class="image-col">`;
  if (hasImages) {
    uniqueImages.forEach((imgFile) => {
      const imgRelPath = path.relative(path.dirname(outHtml), path.join(imagesDir, imgFile)).replace(/\\/g, '/');
      html += `
        <div class="img-wrapper" onclick="openZoomModal('${imgRelPath}')">
          <img src="${imgRelPath}" alt="${imgFile}" onerror="this.parentElement.innerHTML='<div class=\\'no-img\\'>⚠️ Chưa có file: ${imgFile}</div>'">
          <div class="img-caption">📷 ${imgFile}</div>
        </div>`;
    });
  } else {
    html += `<div class="no-img">Không có hình vẽ</div>`;
  }
  html += `</div>`; // end image-col

  html += `</div>`; // end card
});

html += `
  </div>

  <!-- Zoom Modal -->
  <div id="zoom-modal" class="modal" onclick="closeZoomModal()">
    <img id="modal-img" src="" alt="Zoomed figure">
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\\\[', right: '\\\\]', display: true},
            {left: '\\\\(', right: '\\\\)', display: false}
          ],
          ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
          throwOnError: false
        });
      }
    });

    function filterQuestions() {
      const search = document.getElementById('search-input').value.toLowerCase().trim();
      const diff = document.getElementById('diff-filter').value;
      const imgFilter = document.getElementById('img-filter').value;
      
      const cards = document.querySelectorAll('.question-card');
      let visible = 0;

      cards.forEach(card => {
        const cardSearch = card.getAttribute('data-search') || '';
        const cardDiff = card.getAttribute('data-diff') || '';
        const hasImg = card.getAttribute('data-has-img') === 'true';

        let matchSearch = !search || cardSearch.includes(search);
        let matchDiff = diff === 'all' || cardDiff === diff;
        let matchImg = imgFilter === 'all' || (imgFilter === 'has_img' && hasImg) || (imgFilter === 'no_img' && !hasImg);

        if (matchSearch && matchDiff && matchImg) {
          card.classList.remove('hidden');
          visible++;
        } else {
          card.classList.add('hidden');
        }
      });

      document.getElementById('visible-count').innerText = visible;
    }

    let hideExp = false;
    function toggleAllExplanations() {
      hideExp = !hideExp;
      document.querySelectorAll('.explanation-box').forEach(box => {
        box.style.display = hideExp ? 'none' : 'block';
      });
    }

    function openZoomModal(src) {
      const modal = document.getElementById('zoom-modal');
      const img = document.getElementById('modal-img');
      img.src = src;
      modal.style.display = 'flex';
    }

    function closeZoomModal() {
      document.getElementById('zoom-modal').style.display = 'none';
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(outHtml, html, 'utf8');
console.log(`✅ Đã tạo thành công trang Preview tại: ${outHtml}`);

