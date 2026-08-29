/**
 * Script chuyển đổi file LaTeX (.tex) sang file JSON Ngân hàng câu hỏi
 * Sử dụng: node tex_to_bank_json.js <path-to-tex-file> <path-to-output-json>
 */
const fs = require('fs');
const path = require('path');

function extractBraced(str, pos) {
  while (pos < str.length && str[pos] !== '{') pos++;
  if (pos >= str.length) return ["", pos];
  pos++;
  let depth = 1;
  let start = pos;
  while (pos < str.length && depth > 0) {
    if (str[pos] === '{') depth++;
    else if (str[pos] === '}') depth--;
    pos++;
  }
  return [str.substring(start, pos - 1), pos];
}

function cleanLatexLineBreaks(text) {
  if (!text) return text;
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return parts
    .map((part, idx) => {
      if (idx % 2 === 0) {
        return part.replace(/\\\\/g, "\n").replace(/\\newline/g, "\n");
      }
      return part;
    })
    .join("");
}

const inputTex = process.argv[2];
const outputJson = process.argv[3] || inputTex?.replace(/\.tex$/i, '.json');

if (!inputTex || !fs.existsSync(inputTex)) {
  console.error('Vui lòng truyền file .tex hợp lệ. Ví dụ: node tex_to_bank_json.js De_01.tex NganHang_De01.json');
  process.exit(1);
}

const tex = fs.readFileSync(inputTex, 'utf8');
const questions = [];

// Parse grade and topic from preamble if present
let grade = 'Lớp 12';
const gradeMatch = tex.match(/\\docgrade\{([^}]+)\}/);
if (gradeMatch) grade = gradeMatch[1].trim();

let topicIds = ['ham-so-va-do-thi'];
const topicMatch = tex.match(/\\doctopics\{([^}]+)\}/);
if (topicMatch) topicIds = topicMatch[1].split(',').map(t => t.trim()).filter(Boolean);

let searchPos = 0;
let count = 0;

while (true) {
  const mcqStart = tex.indexOf('\\begin{mcq}', searchPos);
  if (mcqStart === -1) break;
  const mcqEnd = tex.indexOf('\\end{mcq}', mcqStart);
  if (mcqEnd === -1) break;

  count++;
  const block = tex.substring(mcqStart + '\\begin{mcq}'.length, mcqEnd);
  
  let p = 0;
  const [rawText, p1] = extractBraced(block, p); p = p1;
  const [correctIdxStr, p2] = extractBraced(block, p); p = p2;
  const [pointsStr, p3] = extractBraced(block, p); p = p3;
  const [rawExplanation, p4] = extractBraced(block, p); p = p4;

  let text = rawText.trim();
  let explanation = rawExplanation.trim();
  const correctIndex = parseInt(correctIdxStr.trim(), 10) || 0;
  const points = parseInt(pointsStr.trim(), 10) || 1;

  let imageFileName = undefined;
  const imgMatch = text.match(/\\image\{[^}]*\}\{[^}]*\}\{([^}]+)\}/);
  if (imgMatch) {
    imageFileName = imgMatch[1];
    text = text.replace(/\\image\{[^}]*\}\{[^}]*\}\{[^}]+\}/g, '').trim();
  }

  let explanationImageFileName = undefined;
  const expImgMatch = explanation.match(/\\image\{[^}]*\}\{[^}]*\}\{([^}]+)\}/);
  if (expImgMatch) {
    explanationImageFileName = expImgMatch[1];
    explanation = explanation.replace(/\\image\{[^}]*\}\{[^}]*\}\{[^}]+\}/g, '').trim();
  }

  text = cleanLatexLineBreaks(text).trim();
  explanation = cleanLatexLineBreaks(explanation).trim();

  const rest = block.substring(p);
  const options = [];
  let optIdx = 0;
  while ((optIdx = rest.indexOf('\\option', optIdx)) !== -1) {
    const [optText, nextPos] = extractBraced(rest, optIdx + '\\option'.length);
    options.push(cleanLatexLineBreaks(optText.trim()).trim());
    optIdx = nextPos;
  }

  let difficulty = 'nhan_biet';
  if (count > 15 && count <= 35) difficulty = 'thong_hieu';
  if (count > 35) difficulty = 'van_dung';

  const q = {
    text,
    type: 'multiple_choice',
    difficulty,
    grade,
    topicIds,
    options,
    correctIndex,
    points,
    explanation: explanation || undefined
  };

  if (imageFileName) q.imageFileName = imageFileName;
  if (explanationImageFileName) q.explanationImageFileName = explanationImageFileName;

  questions.push(q);
  searchPos = mcqEnd + '\\end{mcq}'.length;
}

// True/False
if (tex.includes('\\begin{truefalse}')) {
  let tfSearchPos = 0;
  while (true) {
    const tfStart = tex.indexOf('\\begin{truefalse}', tfSearchPos);
    if (tfStart === -1) break;
    const tfEnd = tex.indexOf('\\end{truefalse}', tfStart);
    if (tfEnd === -1) break;

    const tfBlock = tex.substring(tfStart + '\\begin{truefalse}'.length, tfEnd);
    let p = 0;
    const [rawTfText, p1] = extractBraced(tfBlock, p); p = p1;
    const [tfPointsStr, p2] = extractBraced(tfBlock, p); p = p2;
    const [rawTfExp, p3] = extractBraced(tfBlock, p); p = p3;

    let tfText = cleanLatexLineBreaks(rawTfText.trim()).trim();
    let tfExp = cleanLatexLineBreaks(rawTfExp.trim()).trim();
    const tfPoints = parseInt(tfPointsStr.trim(), 10) || 1;

    let tfImageFileName = undefined;
    const imgMatch = tfText.match(/\\image\{[^}]*\}\{[^}]*\}\{([^}]+)\}/);
    if (imgMatch) {
      tfImageFileName = imgMatch[1];
      tfText = tfText.replace(/\\image\{[^}]*\}\{[^}]*\}\{[^}]+\}/g, '').trim();
    }

    let tfExpImage = undefined;
    const expMatch = tfExp.match(/\\image\{[^}]*\}\{[^}]*\}\{([^}]+)\}/);
    if (expMatch) {
      tfExpImage = expMatch[1];
      tfExp = tfExp.replace(/\\image\{[^}]*\}\{[^}]*\}\{[^}]+\}/g, '').trim();
    }

    const rest = tfBlock.substring(p);
    const statements = [];
    let stmtIdx = 0;
    while ((stmtIdx = rest.indexOf('\\statement', stmtIdx)) !== -1) {
      const [corrStr, pNext1] = extractBraced(rest, stmtIdx + '\\statement'.length);
      const [stmtText, pNext2] = extractBraced(rest, pNext1);
      statements.push({
        text: cleanLatexLineBreaks(stmtText.trim()).trim(),
        correct: corrStr.trim().toLowerCase() === 'true'
      });
      stmtIdx = pNext2;
    }

    const tfQ = {
      text: tfText,
      type: 'true_false',
      difficulty: 'van_dung_cao',
      grade,
      topicIds,
      statements,
      points: tfPoints,
      explanation: tfExp || undefined
    };

    if (tfImageFileName) tfQ.imageFileName = tfImageFileName;
    if (tfExpImage) tfQ.explanationImageFileName = tfExpImage;

    questions.push(tfQ);
    tfSearchPos = tfEnd + '\\end{truefalse}'.length;
  }
}

const output = {
  version: 1,
  kind: 'question_bank',
  questions
};

fs.writeFileSync(outputJson, JSON.stringify(output, null, 2), 'utf8');
console.log(`✅ Đã xuất thành công ${questions.length} câu hỏi vào: ${outputJson}`);
