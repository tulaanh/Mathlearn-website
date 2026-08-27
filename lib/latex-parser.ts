import { EditorPreset } from "./document-templates";
import { DocumentFormBlock, QuizQuestion } from "./document-types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripComments(tex: string): string {
  // Bỏ qua comments kiểu % (nhưng giữ lại \%)
  const normalized = tex.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized.split("\n").map(line => line.replace(/(?<!\\)%.*$/, "")).join("\n");
}

function extractBracedArg(tex: string, pos: number): [string, number] {
  if (pos >= tex.length || tex[pos] !== "{") return ["", pos];
  let depth = 0;
  const start = pos + 1;
  let i = pos;
  while (i < tex.length) {
    const ch = tex[i];
    if (ch === "\\" && i + 1 < tex.length) {
      i += 2;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return [tex.slice(start, i), i + 1];
    }
    i++;
  }
  return [tex.slice(start), tex.length];
}

function findEnvironment(tex: string, envName: string): Array<{content: string, start: number, end: number}> {
  const results: Array<{content: string, start: number, end: number}> = [];
  const beginTag = `\\begin{${envName}}`;
  const endTag = `\\end{${envName}}`;
  
  let i = 0;
  while (i < tex.length) {
    const beginPos = tex.indexOf(beginTag, i);
    if (beginPos === -1) break;
    
    const contentStart = beginPos + beginTag.length;
    const endPos = tex.indexOf(endTag, contentStart);
    if (endPos === -1) {
      console.warn(`Thiếu ${endTag}`);
      break;
    }
    
    results.push({
      content: tex.slice(contentStart, endPos),
      start: beginPos,
      end: endPos + endTag.length
    });
    i = endPos + endTag.length;
  }
  return results;
}

function latexToMarkdown(tex: string): string {
  let md = tex.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // \section{...} -> # ...
  md = md.replace(/\\section\*?\{(.+?)\}/g, "# $1\n\n");
  // \subsection{...} -> ## ...
  md = md.replace(/\\subsection\*?\{(.+?)\}/g, "## $1\n\n");
  // \textbf{...} -> **...**
  md = md.replace(/\\textbf\{(.+?)\}/g, "**$1**");
  // \textit{...} -> *...*
  md = md.replace(/\\textit\{(.+?)\}/g, "*$1*");
  // begin/end itemize/enumerate
  md = md.replace(/\\begin\{(itemize|enumerate)\}/g, "");
  md = md.replace(/\\end\{(itemize|enumerate)\}/g, "");
  // \item -> *
  md = md.replace(/\\item(?:\s*\[[^\]]*\])?\s+/g, "* ");
  
  return md.replace(/\n{3,}/g, "\n\n").trim();
}

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
}

/** Lấy tên file (bỏ đường dẫn) từ tham số path của \image để ghép với ảnh cùng thư mục. */
function basename(filePath: string): string {
  const name = filePath.split(/[\\/]/).pop()?.trim() ?? "";
  return name;
}

function extractQuestionImageAndText(rawText: string): { text: string; imageCaption?: string; imageSourceName?: string } {
  const imgRegex = /\\image\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/;
  const match = imgRegex.exec(rawText);
  if (!match) return { text: rawText };
  const caption = match[2]?.trim();
  const sourceName = basename(match[3] ?? "");
  const cleanText = rawText.replace(imgRegex, "").trim();
  return { text: cleanText, imageCaption: caption || undefined, imageSourceName: sourceName || undefined };
}

function extractAllImagesAndCleanText(rawText: string): {
  text: string;
  images: Array<{ caption?: string; sourceName?: string }>;
} {
  const imgRegex = /\\image\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/g;
  const images: Array<{ caption?: string; sourceName?: string }> = [];
  let match;
  while ((match = imgRegex.exec(rawText)) !== null) {
    const caption = match[2]?.trim();
    const sourceName = basename(match[3] ?? "");
    images.push({ caption: caption || undefined, sourceName: sourceName || undefined });
  }
  const cleanText = rawText.replace(imgRegex, "").trim();
  return { text: cleanText, images };
}

function parseMcq(content: string): QuizQuestion {
  let pos = 0;
  while (pos < content.length && /\s/.test(content[pos])) pos++;

  const [rawQuestion, pos1] = extractBracedArg(content, pos); pos = pos1;
  const [correctIdxStr, pos2] = extractBracedArg(content, pos); pos = pos2;
  const [pointsStr, pos3] = extractBracedArg(content, pos); pos = pos3;
  const [rawExplanation, pos4] = extractBracedArg(content, pos); pos = pos4;

  const { text: question, imageCaption, imageSourceName } = extractQuestionImageAndText(rawQuestion);
  const { text: cleanExplanation, images: expImages } = extractAllImagesAndCleanText(rawExplanation);

  const rest = content.slice(pos);
  const options: Array<{id: string, text: string}> = [];
  const OPTION_IDS = ["a", "b", "c", "d", "e", "f"];
  
  const optionRegex = /\\option\{/g;
  let match;
  while ((match = optionRegex.exec(rest)) !== null) {
    const idx = options.length;
    const [optText] = extractBracedArg(rest, match.index + "\\option".length);
    options.push({ id: OPTION_IDS[idx] ?? generateId(), text: optText.trim() });
  }

  const correctIndex = parseInt(correctIdxStr.trim(), 10) || 0;
  let correctOptionId = options[0]?.id || "a";
  if (correctIndex >= 0 && correctIndex < options.length) {
    correctOptionId = options[correctIndex].id;
  }

  const q: QuizQuestion = {
    id: generateId(),
    type: "multiple_choice",
    text: question.trim(),
    options: options.length > 0 ? options : [{ id: "a", text: "" }, { id: "b", text: "" }],
    correctOptionId,
    points: parseFloat(pointsStr) || 1,
    explanation: cleanExplanation.trim() || undefined,
    imageCaption: imageCaption || undefined,
    imageSourceName: imageSourceName || undefined,
    explanationImageCaption: expImages[0]?.caption || undefined,
    explanationImageSourceName: expImages[0]?.sourceName || undefined,
    explanationImages: expImages.map(img => ({ caption: img.caption, sourceName: img.sourceName, file: null })),
    imageFile: null,
    explanationImageFile: null
  };
  return q;
}

function parseTrueFalse(content: string): QuizQuestion {
  let pos = 0;
  while (pos < content.length && /\s/.test(content[pos])) pos++;

  const [rawQuestion, pos1] = extractBracedArg(content, pos); pos = pos1;
  const [pointsStr, pos2] = extractBracedArg(content, pos); pos = pos2;
  const [rawExplanation, pos3] = extractBracedArg(content, pos); pos = pos3;

  const { text: question, imageCaption, imageSourceName } = extractQuestionImageAndText(rawQuestion);
  const { text: cleanExplanation, images: expImages } = extractAllImagesAndCleanText(rawExplanation);

  const rest = content.slice(pos);
  const statements: Array<{id: string, text: string, correctVal: "true" | "false"}> = [];
  
  const stmtRegex = /\\statement\{/g;
  let match;
  while ((match = stmtRegex.exec(rest)) !== null) {
    let curr = match.index + "\\statement".length;
    const [correctStr, curr2] = extractBracedArg(rest, curr); curr = curr2;
    while (curr < rest.length && /\s/.test(rest[curr])) curr++;
    const [text] = extractBracedArg(rest, curr);
    
    const valLower = correctStr.trim().toLowerCase();
    const isTrue = ["true", "đ", "đúng", "d", "t", "1"].includes(valLower);
    statements.push({
      id: generateId(),
      text: text.trim(),
      correctVal: isTrue ? "true" : "false"
    });
  }

  const q: QuizQuestion = {
    id: generateId(),
    type: "true_false",
    text: question.trim(),
    statements,
    points: parseFloat(pointsStr) || 1,
    explanation: cleanExplanation.trim() || undefined,
    imageCaption: imageCaption || undefined,
    imageSourceName: imageSourceName || undefined,
    explanationImageCaption: expImages[0]?.caption || undefined,
    explanationImageSourceName: expImages[0]?.sourceName || undefined,
    explanationImages: expImages.map(img => ({ caption: img.caption, sourceName: img.sourceName, file: null })),
    imageFile: null,
    explanationImageFile: null
  };
  return q;
}

function parseShortAnswer(content: string): QuizQuestion {
  let pos = 0;
  while (pos < content.length && /\s/.test(content[pos])) pos++;

  const [rawQuestion, pos1] = extractBracedArg(content, pos); pos = pos1;
  const [answer, pos2] = extractBracedArg(content, pos); pos = pos2;
  const [pointsStr, pos3] = extractBracedArg(content, pos); pos = pos3;
  const [rawExplanation] = extractBracedArg(content, pos);

  const { text: question, imageCaption, imageSourceName } = extractQuestionImageAndText(rawQuestion);
  const { text: cleanExplanation, images: expImages } = extractAllImagesAndCleanText(rawExplanation);

  return {
    id: generateId(),
    type: "short_answer",
    text: question.trim(),
    correctAnswer: answer.trim(),
    points: parseFloat(pointsStr) || 1,
    explanation: cleanExplanation.trim() || undefined,
    imageCaption: imageCaption || undefined,
    imageSourceName: imageSourceName || undefined,
    explanationImageCaption: expImages[0]?.caption || undefined,
    explanationImageSourceName: expImages[0]?.sourceName || undefined,
    explanationImages: expImages.map(img => ({ caption: img.caption, sourceName: img.sourceName, file: null })),
    imageFile: null,
    explanationImageFile: null
  };
}

function parseShortAnswerCmds(tex: string): QuizQuestion[] {
  const results: QuizQuestion[] = [];
  const regex = /\\shortanswer\{/g;
  let match;
  while ((match = regex.exec(tex)) !== null) {
    let pos = match.index + "\\shortanswer".length;
    const [rawQuestion, p1] = extractBracedArg(tex, pos); pos = p1;
    const [answer, p2] = extractBracedArg(tex, pos); pos = p2;
    const [pointsStr, p3] = extractBracedArg(tex, pos); pos = p3;
    const [rawExplanation, p4] = extractBracedArg(tex, pos);

    const { text: question, imageCaption, imageSourceName } = extractQuestionImageAndText(rawQuestion);
    const { text: cleanExplanation, images: expImages } = extractAllImagesAndCleanText(rawExplanation);

    results.push({
      id: generateId(),
      type: "short_answer",
      text: question.trim(),
      correctAnswer: answer.trim(),
      points: parseFloat(pointsStr) || 1,
      explanation: cleanExplanation.trim() || undefined,
      imageCaption: imageCaption || undefined,
      imageSourceName: imageSourceName || undefined,
      explanationImageCaption: expImages[0]?.caption || undefined,
      explanationImageSourceName: expImages[0]?.sourceName || undefined,
      explanationImages: expImages.map(img => ({ caption: img.caption, sourceName: img.sourceName, file: null })),
      imageFile: null,
      explanationImageFile: null
    });
  }
  return results;
}

function parseEssayCmds(tex: string): QuizQuestion[] {
  const results: QuizQuestion[] = [];
  const regex = /\\essay\{/g;
  let match;
  while ((match = regex.exec(tex)) !== null) {
    let pos = match.index + "\\essay".length;
    const [rawQuestion, p1] = extractBracedArg(tex, pos); pos = p1;
    const [pointsStr, p2] = extractBracedArg(tex, pos); pos = p2;
    const [rawExplanation, p3] = extractBracedArg(tex, pos);

    const { text: question, imageCaption, imageSourceName } = extractQuestionImageAndText(rawQuestion);
    const { text: cleanExplanation, images: expImages } = extractAllImagesAndCleanText(rawExplanation);

    results.push({
      id: generateId(),
      type: "essay",
      text: question.trim(),
      points: parseFloat(pointsStr) || 1,
      explanation: cleanExplanation.trim() || undefined,
      imageCaption: imageCaption || undefined,
      imageSourceName: imageSourceName || undefined,
      explanationImageCaption: expImages[0]?.caption || undefined,
      explanationImageSourceName: expImages[0]?.sourceName || undefined,
      explanationImages: expImages.map(img => ({ caption: img.caption, sourceName: img.sourceName, file: null })),
      imageFile: null,
      explanationImageFile: null
    });
  }
  return results;
}

function parseQuizBlock(content: string): DocumentFormBlock | null {
  let pos = 0;
  while (pos < content.length && /\s/.test(content[pos])) pos++;
  const [title, pos1] = extractBracedArg(content, pos);
  const rest = content.slice(pos1);

  const items: Array<{pos: number, type: string, content: string | null, name?: string}> = [];
  const envRanges: Array<{start: number, end: number}> = [];

  for (const env of findEnvironment(rest, "mcq")) { items.push({pos: env.start, type: "mcq", content: env.content}); envRanges.push({start: env.start, end: env.end}); }
  for (const env of findEnvironment(rest, "truefalse")) { items.push({pos: env.start, type: "truefalse", content: env.content}); envRanges.push({start: env.start, end: env.end}); }
  for (const env of findEnvironment(rest, "shortanswer")) { items.push({pos: env.start, type: "shortanswer_env", content: env.content}); envRanges.push({start: env.start, end: env.end}); }
  
  let match;
  const saRegex = /\\shortanswer\{/g;
  while ((match = saRegex.exec(rest)) !== null) {
    const start = match.index;
    let curr = start + "\\shortanswer".length;
    for (let a = 0; a < 4; a++) {
      while (curr < rest.length && /\s/.test(rest[curr])) curr++;
      const [, p] = extractBracedArg(rest, curr);
      curr = p;
    }
    items.push({pos: start, type: "shortanswer", content: null});
    envRanges.push({start, end: curr});
  }
  
  const esRegex = /\\essay\{/g;
  while ((match = esRegex.exec(rest)) !== null) {
    const start = match.index;
    let curr = start + "\\essay".length;
    for (let a = 0; a < 3; a++) {
      while (curr < rest.length && /\s/.test(rest[curr])) curr++;
      const [, p] = extractBracedArg(rest, curr);
      curr = p;
    }
    items.push({pos: start, type: "essay", content: null});
    envRanges.push({start, end: curr});
  }

  const imgRegex = /\\image\{/g;
  while ((match = imgRegex.exec(rest)) !== null) {
    const isInsideEnv = envRanges.some(r => match!.index >= r.start && match!.index <= r.end);
    if (isInsideEnv) continue; // Ảnh nằm trong môi trường câu hỏi đã được parser riêng xử lý

    let curr = match.index + "\\image".length;
    const [scale, p1] = extractBracedArg(rest, curr); curr = p1;
    const [caption, p2] = extractBracedArg(rest, curr); curr = p2;
    const [path] = extractBracedArg(rest, curr);
    items.push({ pos: match.index, type: "image", content: caption.trim() || "Hình ảnh câu hỏi", name: basename(path) });
  }

  items.sort((a, b) => a.pos - b.pos);

  const shortAnswers = parseShortAnswerCmds(rest);
  const essays = parseEssayCmds(rest);
  let saIdx = 0, esIdx = 0;

  const questions: QuizQuestion[] = [];
  let pendingImageCaption: string | undefined = undefined;
  let pendingImageName: string | undefined = undefined;

  for (const item of items) {
    if (item.type === "image" && item.content !== null) {
      pendingImageCaption = item.content;
      pendingImageName = item.name;
      continue;
    }

    let q: QuizQuestion | null = null;
    if (item.type === "mcq" && item.content) q = parseMcq(item.content);
    else if (item.type === "truefalse" && item.content) q = parseTrueFalse(item.content);
    else if (item.type === "shortanswer_env" && item.content) q = parseShortAnswer(item.content);
    else if (item.type === "shortanswer" && saIdx < shortAnswers.length) q = shortAnswers[saIdx++];
    else if (item.type === "essay" && esIdx < essays.length) q = essays[esIdx++];

    if (q) {
      if (pendingImageCaption && !q.imageCaption) {
        q.imageCaption = pendingImageCaption;
        if (pendingImageName && !q.imageSourceName) q.imageSourceName = pendingImageName;
        pendingImageCaption = undefined;
        pendingImageName = undefined;
      }
      questions.push(q);
    }
  }

  if (questions.length === 0) return null;

  return {
    keyId: generateId(),
    type: "quiz",
    title: title.trim(),
    questions,
    description: ""
  };
}

// ─── Main Parser ────────────────────────────────────────────────────────────

function extractImagesAndText(tex: string): Array<{type: "text", content: string} | {type: "image", scale: string, caption: string, path: string}> {
  const result: Array<{type: "text", content: string} | {type: "image", scale: string, caption: string, path: string}> = [];
  let pos = 0;
  while (pos < tex.length) {
    const imgPos = tex.indexOf("\\image{", pos);
    if (imgPos === -1) {
      if (pos < tex.length) result.push({ type: "text", content: tex.slice(pos) });
      break;
    }
    
    if (imgPos > pos) {
      result.push({ type: "text", content: tex.slice(pos, imgPos) });
    }
    
    let curr = imgPos + "\\image".length;
    const [scale, p1] = extractBracedArg(tex, curr); curr = p1;
    const [caption, p2] = extractBracedArg(tex, curr); curr = p2;
    const [path, p3] = extractBracedArg(tex, curr); curr = p3;
    
    result.push({ type: "image", scale: scale.trim(), caption: caption.trim(), path: path.trim() });
    pos = curr;
  }
  return result;
}

export const SAMPLE_DOCUMENT_LATEX = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}

\\doctitle{TÍNH ĐƠN ĐIỆU CỦA HÀM SỐ}
\\docdesc{Tóm tắt lý thuyết và bài tập về tính đơn điệu của hàm số}
\\docgrade{Lớp 12}
\\docstatus{draft}
\\doctype{normal}
\\doctopics{phuong-trinh}

\\begin{lesson}{PHẦN I. TÓM TẮT LÝ THUYẾT}{Định nghĩa và tính chất cơ bản}
\\textbf{1. Định nghĩa:} Cho hàm số $y = f(x)$ xác định trên khoảng $K$.
\\begin{itemize}
  \\item Hàm số $y = f(x)$ \\textbf{đồng biến} trên $K$ nếu:
  $$\\forall x_1, x_2 \\in K, x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)$$
  \\item Hàm số $y = f(x)$ \\textbf{nghịch biến} trên $K$ nếu:
  $$\\forall x_1, x_2 \\in K, x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$$
\\end{itemize}

\\textbf{2. Dấu hiệu đạo hàm:} Cho hàm số $y = f(x)$ có đạo hàm trên $K$.
\\begin{itemize}
  \\item Nếu $f'(x) > 0, \\forall x \\in K$ thì hàm số \\textbf{đồng biến} trên $K$.
  \\item Nếu $f'(x) < 0, \\forall x \\in K$ thì hàm số \\textbf{nghịch biến} trên $K$.
\\end{itemize}
\\end{lesson}

\\begin{quiz}{PHẦN II. BÀI TẬP VẬN DỤNG}
\\begin{mcq}{Hàm số $y = -x^3 + 3x - 2$ đồng biến trên khoảng nào dưới đây?}{0}{1}{Ta có $y' = -3x^2 + 3 = -3(x^2 - 1)$. Cho $y' > 0 \\Leftrightarrow -1 < x < 1$.}
  \\option{$(-1; 1)$}
  \\option{$(-\\infty; -1)$}
  \\option{$(1; +\\infty)$}
  \\option{$(-\\infty; 1)$}
\\end{mcq}

\\begin{truefalse}{Xét tính đúng/sai của các khẳng định sau:}{1}{Kiểm tra tính đơn điệu qua dấu đạo hàm}
  \\statement{true}{Hàm số $y = x^3 + 3x$ luôn đồng biến trên $\\mathbb{R}$.}
  \\statement{false}{Hàm số $y = \\frac{1}{x}$ nghịch biến trên $\\mathbb{R}$.}
  \\statement{true}{Đạo hàm của hàm hằng bằng 0 trên tập xác định.}
  \\statement{false}{Hàm số bậc hai luôn đơn điệu trên $\\mathbb{R}$.}
\\end{truefalse}

\\begin{shortanswer}{Tìm điểm cực trị của hàm số $y = x^2 - 4x + 3$.}{2}{1}{Ta có $y' = 2x - 4 = 0 \\Rightarrow x = 2$.}
\\end{shortanswer}

\\essay{Tìm các khoảng đơn điệu của hàm số $y = \\frac{x + 1}{x - 1}$.}{2}{Tập xác định $D = \\mathbb{R} \\setminus \\{1\\}$. Đạo hàm $y' = \\frac{-2}{(x-1)^2} < 0, \\forall x \\neq 1$. Do đó hàm số nghịch biến trên từng khoảng $(-\\infty; 1)$ và $(1; +\\infty)$.}
\\end{quiz}
`;

export function parseLatexToPreset(texRaw: string): { ok: true; data: EditorPreset } | { ok: false; error: string } {
  try {
    const tex = stripComments(texRaw);

    const preset: EditorPreset = {
      title: "",
      description: "",
      grade: "Lớp 8",
      status: "draft",
      documentType: "normal",
      selectedTopics: [],
      blocks: [],
    };

    // Metadata
    const titleMatch = tex.match(/\\doctitle\{(.+?)\}/) || tex.match(/\\title\{(.+?)\}/);
    if (titleMatch) preset.title = titleMatch[1].trim();

    const descMatch = tex.match(/\\docdesc\{(.+?)\}/) || tex.match(/\\description\{(.+?)\}/);
    if (descMatch) preset.description = descMatch[1].trim();

    const gradeMatch = tex.match(/\\docgrade\{(.+?)\}/) || tex.match(/\\grade\{(.+?)\}/);
    if (gradeMatch) preset.grade = gradeMatch[1].trim();

    const statusMatch = tex.match(/\\docstatus\{(.+?)\}/) || tex.match(/\\status\{(.+?)\}/);
    if (statusMatch && ["draft", "published"].includes(statusMatch[1].trim())) {
      preset.status = statusMatch[1].trim() as any;
    }

    const typeMatch = tex.match(/\\doctype\{(.+?)\}/) || tex.match(/\\type\{(.+?)\}/);
    if (typeMatch && ["normal", "test"].includes(typeMatch[1].trim())) {
      preset.documentType = typeMatch[1].trim() as any;
    }

    const topicsMatch = tex.match(/\\doctopics\{(.+?)\}/) || tex.match(/\\topics\{(.+?)\}/);
    if (topicsMatch) {
      const validTopics = ["hang-dang-thuc", "phan-tich-da-thuc", "phan-thuc-dai-so", "phuong-trinh", "tam-giac-vuong"];
      preset.selectedTopics = topicsMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter((t) => validTopics.includes(t));
    }

    // Blocks
    const items: Array<{ pos: number; type: string; data: any }> = [];
    const envRanges: Array<{ start: number; end: number }> = [];

    const addEnvs = (envs: Array<{ content: string; start: number; end: number }>, type: string) => {
      for (const env of envs) {
        items.push({ pos: env.start, type, data: env.content });
        envRanges.push({ start: env.start, end: env.end });
      }
    };

    addEnvs(findEnvironment(tex, "textblock"), "textblock");
    addEnvs(findEnvironment(tex, "lesson"), "lesson");
    addEnvs(findEnvironment(tex, "quiz"), "quiz");

    const imgRegex = /\\image\{/g;
    let match;
    while ((match = imgRegex.exec(tex)) !== null) {
      const isInsideEnv = envRanges.some((r) => match!.index >= r.start && match!.index <= r.end);
      if (isInsideEnv) continue; // Bỏ qua vì sẽ được xử lý bên trong extractImagesAndText

      let pos = match.index + "\\image".length;
      const [scale, p1] = extractBracedArg(tex, pos);
      pos = p1;
      const [caption, p2] = extractBracedArg(tex, pos);
      pos = p2;
      const [path] = extractBracedArg(tex, pos);
      items.push({
        pos: match.index,
        type: "image",
        data: { scale: scale.trim(), caption: caption.trim(), path: path.trim() },
      });
    }

    items.sort((a, b) => a.pos - b.pos);

    for (const item of items) {
      if (item.type === "textblock" && item.data.trim()) {
        const parts = extractImagesAndText(item.data);
        for (const part of parts) {
          if (part.type === "text") {
            const md = latexToMarkdown(part.content.trim());
            if (md) preset.blocks.push({ keyId: generateId(), type: "text", content: md });
          } else if (part.type === "image") {
            preset.blocks.push({
              keyId: generateId(),
              type: "image",
              altText: part.caption || "Hình ảnh",
              caption: part.caption,
              file: null,
              storagePath: undefined,
              sourceName: basename(part.path) || undefined,
            });
          }
        }
      } else if (item.type === "lesson") {
        let pos = 0;
        while (pos < item.data.length && /\s/.test(item.data[pos])) pos++;
        const [title, p1] = extractBracedArg(item.data, pos);
        pos = p1;
        const [desc, p2] = extractBracedArg(item.data, pos);
        pos = p2;
        const content = item.data.slice(pos).trim();

        if (title.trim() && content) {
          const parts = extractImagesAndText(content);
          let lessonCreated = false;

          for (const part of parts) {
            if (part.type === "text") {
              const md = latexToMarkdown(part.content.trim());
              if (!lessonCreated) {
                preset.blocks.push({
                  keyId: generateId(),
                  type: "lesson",
                  title: title.trim(),
                  description: desc.trim(),
                  content: md,
                });
                lessonCreated = true;
              } else if (md) {
                preset.blocks.push({ keyId: generateId(), type: "text", content: md });
              }
            } else if (part.type === "image") {
              if (!lessonCreated) {
                preset.blocks.push({
                  keyId: generateId(),
                  type: "lesson",
                  title: title.trim(),
                  description: desc.trim(),
                  content: "",
                });
                lessonCreated = true;
              }
              preset.blocks.push({
                keyId: generateId(),
                type: "image",
                altText: part.caption || "Hình ảnh",
                caption: part.caption,
                file: null,
                storagePath: undefined,
                sourceName: basename(part.path) || undefined,
              });
            }
          }
        }
      } else if (item.type === "image") {
        preset.blocks.push({
          keyId: generateId(),
          type: "image",
          altText: item.data.caption || "Hình ảnh",
          caption: item.data.caption,
          file: null,
          storagePath: undefined,
          sourceName: basename(item.data.path) || undefined,
        });
      } else if (item.type === "quiz") {
        const block = parseQuizBlock(item.data);
        if (block) preset.blocks.push(block);
      }
    }

    // Dự phòng: nếu không tìm thấy khối đặc thù nào (textblock, lesson, quiz), đọc nội dung văn bản trong document
    if (preset.blocks.length === 0) {
      let bodyContent = tex;
      const docEnv = findEnvironment(tex, "document");
      if (docEnv.length > 0) {
        bodyContent = docEnv[0].content;
      }
      // Lọc bỏ các dòng khai báo metadata và header
      bodyContent = bodyContent
        .replace(/\\(doctitle|title|docdesc|description|docgrade|grade|docstatus|status|doctype|type|doctopics|topics)\{[^}]*\}/g, "")
        .replace(/\\(documentclass|usepackage|newenvironment|newcommand|setboolean|newboolean)\b[^\n]*/g, "")
        .trim();

      if (bodyContent) {
        const parts = extractImagesAndText(bodyContent);
        for (const part of parts) {
          if (part.type === "text") {
            const md = latexToMarkdown(part.content);
            if (md) preset.blocks.push({ keyId: generateId(), type: "text", content: md });
          } else if (part.type === "image") {
            preset.blocks.push({
              keyId: generateId(),
              type: "image",
              altText: part.caption || "Hình ảnh",
              caption: part.caption,
              file: null,
              storagePath: undefined,
              sourceName: basename(part.path) || undefined,
            });
          }
        }
      }
    }

    if (!preset.title) {
      preset.title = "Tài liệu Toán (LaTeX)";
    }

    if (preset.blocks.length === 0) {
      return { ok: false, error: "Không tìm thấy nội dung hợp lệ nào trong file hoặc mã LaTeX." };
    }

    return { ok: true, data: preset };
  } catch (err: any) {
    return { ok: false, error: "Lỗi phân tích LaTeX: " + err.message };
  }
}
