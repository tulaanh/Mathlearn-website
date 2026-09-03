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
    if (str[pos] === '\\' && pos + 1 < str.length) {
      pos += 2; // Skip escaped characters (\{ \} \\ etc.)
      continue;
    }
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

function extractImages(text) {
  let mainImage = undefined;
  const allImages = [];
  const regex = /\\image\{[^}]*\}\{[^}]*\}\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    allImages.push(match[1]);
  }
  if (allImages.length > 0) {
    mainImage = allImages[0];
  }
  const cleanText = text.replace(/\\image\{[^}]*\}\{[^}]*\}\{[^}]+\}/g, '').trim();
  return { cleanText, mainImage, allImages };
}

function extractDifficulty(text) {
  let difficulty = null;
  const match1 = text.match(/\[(NB|MỨC ĐỘ 1|Nhận biết)\]/i);
  if (match1) { difficulty = 'nhan_biet'; text = text.replace(match1[0], ''); }
  else {
    const match2 = text.match(/\[(TH|MỨC ĐỘ 2|Thông hiểu)\]/i);
    if (match2) { difficulty = 'thong_hieu'; text = text.replace(match2[0], ''); }
    else {
      const match3 = text.match(/\[(VD|MỨC ĐỘ 3|Vận dụng)\]/i);
      if (match3) { difficulty = 'van_dung'; text = text.replace(match3[0], ''); }
      else {
        const match4 = text.match(/\[(VDC|MỨC ĐỘ 4|Vận dụng cao)\]/i);
        if (match4) { difficulty = 'van_dung_cao'; text = text.replace(match4[0], ''); }
      }
    }
  }
  return { newText: text, extractedDiff: difficulty };
}

function cleanTextLabel(text) {
  return text.replace(/^(?:\\textbf\{)?(?:Câu|Bài)\s*\d+[:.][\s}]*/i, '')
             .replace(/^\[KID\]\s*/i, '')
             .trim();
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

  const diffResult = extractDifficulty(text);
  text = diffResult.newText;
  let extractedDiff = diffResult.extractedDiff;

  text = cleanTextLabel(text);

  const imgRes = extractImages(text);
  text = imgRes.cleanText;
  const imageFileName = imgRes.mainImage;

  const expImgRes = extractImages(explanation);
  explanation = expImgRes.cleanText;
  const explanationImageFileName = expImgRes.mainImage;
  const explanationImages = expImgRes.allImages;

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
  if (extractedDiff) {
    difficulty = extractedDiff;
  } else {
    if (count > 15 && count <= 35) difficulty = 'thong_hieu';
    if (count > 35) difficulty = 'van_dung';
  }

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
  if (explanationImages.length > 1) q.explanationImages = explanationImages;

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

    let tfText = rawTfText.trim();
    let tfExp = rawTfExp.trim();
    const tfPoints = parseInt(tfPointsStr.trim(), 10) || 1;

    const diffResult = extractDifficulty(tfText);
    tfText = diffResult.newText;
    let extractedDiff = diffResult.extractedDiff || 'van_dung_cao'; // fallback

    tfText = cleanTextLabel(tfText);

    const imgRes = extractImages(tfText);
    tfText = imgRes.cleanText;
    const tfImageFileName = imgRes.mainImage;

    const expImgRes = extractImages(tfExp);
    tfExp = expImgRes.cleanText;
    const tfExpImage = expImgRes.mainImage;
    const tfExpImagesAll = expImgRes.allImages;

    tfText = cleanLatexLineBreaks(tfText).trim();
    tfExp = cleanLatexLineBreaks(tfExp).trim();

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
      difficulty: extractedDiff,
      grade,
      topicIds,
      statements,
      points: tfPoints,
      explanation: tfExp || undefined
    };

    if (tfImageFileName) tfQ.imageFileName = tfImageFileName;
    if (tfExpImage) tfQ.explanationImageFileName = tfExpImage;
    if (tfExpImagesAll.length > 1) tfQ.explanationImages = tfExpImagesAll;

    questions.push(tfQ);
    tfSearchPos = tfEnd + '\\end{truefalse}'.length;
  }
}

// Short Answer
// \shortanswer{Đề bài}{Đáp án}{Điểm}{Giải thích}
if (tex.includes('\\shortanswer{')) {
  let saSearchPos = 0;
  while (true) {
    const saStart = tex.indexOf('\\shortanswer{', saSearchPos);
    if (saStart === -1) break;

    let p = saStart + '\\shortanswer'.length;
    const [rawText, p1] = extractBraced(tex, p); p = p1;
    const [rawAnswer, p2] = extractBraced(tex, p); p = p2;
    const [rawPoints, p3] = extractBraced(tex, p); p = p3;
    const [rawExp, p4] = extractBraced(tex, p); p = p4;

    let text = rawText.trim();
    let correctAnswer = rawAnswer.trim();
    let explanation = rawExp.trim();
    const points = parseInt(rawPoints.trim(), 10) || 1;

    const diffResult = extractDifficulty(text);
    text = diffResult.newText;
    let extractedDiff = diffResult.extractedDiff || 'van_dung_cao'; // fallback

    text = cleanTextLabel(text);

    const imgRes = extractImages(text);
    text = imgRes.cleanText;
    const imageFileName = imgRes.mainImage;

    const expImgRes = extractImages(explanation);
    explanation = expImgRes.cleanText;
    const explanationImageFileName = expImgRes.mainImage;
    const explanationImagesAll = expImgRes.allImages;

    text = cleanLatexLineBreaks(text).trim();
    explanation = cleanLatexLineBreaks(explanation).trim();

    const saQ = {
      text,
      type: 'short_answer',
      difficulty: extractedDiff,
      grade,
      topicIds,
      correctAnswer,
      points,
      explanation: explanation || undefined
    };

    if (imageFileName) saQ.imageFileName = imageFileName;
    if (explanationImageFileName) saQ.explanationImageFileName = explanationImageFileName;
    if (explanationImagesAll.length > 1) saQ.explanationImages = explanationImagesAll;

    questions.push(saQ);
    saSearchPos = p;
  }
}

// Essay
// \essay{Đề bài}{Điểm}{Lời giải}
if (tex.includes('\\essay{')) {
  let esSearchPos = 0;
  while (true) {
    const esStart = tex.indexOf('\\essay{', esSearchPos);
    if (esStart === -1) break;

    let p = esStart + '\\essay'.length;
    const [rawText, p1] = extractBraced(tex, p); p = p1;
    const [rawPoints, p2] = extractBraced(tex, p); p = p2;
    const [rawExp, p3] = extractBraced(tex, p); p = p3;

    let text = rawText.trim();
    let explanation = rawExp.trim();
    const points = parseInt(rawPoints.trim(), 10) || 1;

    const diffResult = extractDifficulty(text);
    text = diffResult.newText;
    let extractedDiff = diffResult.extractedDiff || 'van_dung_cao';

    text = cleanTextLabel(text);

    const imgRes = extractImages(text);
    text = imgRes.cleanText;
    const imageFileName = imgRes.mainImage;

    const expImgRes = extractImages(explanation);
    explanation = expImgRes.cleanText;
    const explanationImageFileName = expImgRes.mainImage;
    const explanationImagesAll = expImgRes.allImages;

    text = cleanLatexLineBreaks(text).trim();
    explanation = cleanLatexLineBreaks(explanation).trim();

    const esQ = {
      text,
      type: 'essay',
      difficulty: extractedDiff,
      grade,
      topicIds,
      points,
      explanation: explanation || undefined
    };

    if (imageFileName) esQ.imageFileName = imageFileName;
    if (explanationImageFileName) esQ.explanationImageFileName = explanationImageFileName;
    if (explanationImagesAll.length > 1) esQ.explanationImages = explanationImagesAll;

    questions.push(esQ);
    esSearchPos = p;
  }
}

const output = {
  version: 1,
  kind: 'question_bank',
  questions
};

fs.writeFileSync(outputJson, JSON.stringify(output, null, 2), 'utf8');
console.log(`✅ Đã xuất thành công ${questions.length} câu hỏi vào: ${outputJson}`);
