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
  md = md.replace(/\\section\*?\{(.+?)\}/g, "# $1");
  // \subsection{...} -> ## ...
  md = md.replace(/\\subsection\*?\{(.+?)\}/g, "## $1");
  // \textbf{...} -> **...**
  md = md.replace(/\\textbf\{(.+?)\}/g, "**$1**");
  // \textit{...} -> *...*
  md = md.replace(/\\textit\{(.+?)\}/g, "*$1*");
  // begin/end itemize/enumerate
  md = md.replace(/\\begin\{(itemize|enumerate)\}/g, "");
  md = md.replace(/\\end\{(itemize|enumerate)\}/g, "");
  // \item -> *
  md = md.replace(/\\item(?:\s*\[[^\]]*\])?\s+/g, "* ");
  
  return md.split("\n").filter(line => line.trim() !== "").join("\n");
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
  
  const optionRegex = /\\option\{/g;
  let match;
  while ((match = optionRegex.exec(rest)) !== null) {
    const [optText] = extractBracedArg(rest, match.index + "\\option".length);
    options.push({ id: generateId(), text: optText.trim() });
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
    
    statements.push({
      id: generateId(),
      text: text.trim(),
      correctVal: correctStr.trim().toLowerCase() === "true" ? "true" : "false"
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
      points: 0,
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
  while ((match = saRegex.exec(rest)) !== null) items.push({pos: match.index, type: "shortanswer", content: null});
  
  const esRegex = /\\essay\{/g;
  while ((match = esRegex.exec(rest)) !== null) items.push({pos: match.index, type: "essay", content: null});

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

export function parseLatexToPreset(texRaw: string): { ok: true, data: EditorPreset } | { ok: false, error: string } {
  try {
    const tex = stripComments(texRaw);

    const preset: EditorPreset = {
      title: "",
      description: "",
      grade: "Lớp 8",
      status: "draft",
      documentType: "normal",
      selectedTopics: [],
      blocks: []
    };

    // Metadata
    const titleMatch = tex.match(/\\doctitle\{(.+?)\}/);
    if (titleMatch) preset.title = titleMatch[1].trim();

    const descMatch = tex.match(/\\docdesc\{(.+?)\}/);
    if (descMatch) preset.description = descMatch[1].trim();

    const gradeMatch = tex.match(/\\docgrade\{(.+?)\}/);
    if (gradeMatch) preset.grade = gradeMatch[1].trim();

    const statusMatch = tex.match(/\\docstatus\{(.+?)\}/);
    if (statusMatch && ["draft", "published"].includes(statusMatch[1].trim())) {
      preset.status = statusMatch[1].trim() as any;
    }

    const typeMatch = tex.match(/\\doctype\{(.+?)\}/);
    if (typeMatch && ["normal", "test"].includes(typeMatch[1].trim())) {
      preset.documentType = typeMatch[1].trim() as any;
    }

    const topicsMatch = tex.match(/\\doctopics\{(.+?)\}/);
    if (topicsMatch) {
      const validTopics = ["hang-dang-thuc", "phan-tich-da-thuc", "phan-thuc-dai-so", "phuong-trinh", "tam-giac-vuong"];
      preset.selectedTopics = topicsMatch[1].split(",").map(t => t.trim()).filter(t => validTopics.includes(t));
    }

    // Blocks
    const items: Array<{pos: number, type: string, data: any}> = [];
    const envRanges: Array<{start: number, end: number}> = [];

    const addEnvs = (envs: Array<{content: string, start: number, end: number}>, type: string) => {
      for (const env of envs) {
        items.push({pos: env.start, type, data: env.content});
        envRanges.push({start: env.start, end: env.end});
      }
    };

    addEnvs(findEnvironment(tex, "textblock"), "textblock");
    addEnvs(findEnvironment(tex, "lesson"), "lesson");
    addEnvs(findEnvironment(tex, "quiz"), "quiz");

    const imgRegex = /\\image\{/g;
    let match;
    while ((match = imgRegex.exec(tex)) !== null) {
      const isInsideEnv = envRanges.some(r => match!.index >= r.start && match!.index <= r.end);
      if (isInsideEnv) continue; // Bỏ qua vì sẽ được xử lý bên trong extractImagesAndText

      let pos = match.index + "\\image".length;
      const [scale, p1] = extractBracedArg(tex, pos); pos = p1;
      const [caption, p2] = extractBracedArg(tex, pos); pos = p2;
      const [path] = extractBracedArg(tex, pos);
      items.push({pos: match.index, type: "image", data: {scale: scale.trim(), caption: caption.trim(), path: path.trim()}});
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
              sourceName: basename(part.path) || undefined
            });
          }
        }
      } else if (item.type === "lesson") {
        let pos = 0;
        while (pos < item.data.length && /\s/.test(item.data[pos])) pos++;
        const [title, p1] = extractBracedArg(item.data, pos); pos = p1;
        const [desc, p2] = extractBracedArg(item.data, pos); pos = p2;
        const content = item.data.slice(pos).trim();
        
        if (title.trim() && content) {
          const parts = extractImagesAndText(content);
          let lessonCreated = false;
          
          for (const part of parts) {
            if (part.type === "text") {
              const md = latexToMarkdown(part.content.trim());
              if (!lessonCreated) {
                preset.blocks.push({ keyId: generateId(), type: "lesson", title: title.trim(), description: desc.trim(), content: md });
                lessonCreated = true;
              } else if (md) {
                preset.blocks.push({ keyId: generateId(), type: "text", content: md });
              }
            } else if (part.type === "image") {
              if (!lessonCreated) {
                preset.blocks.push({ keyId: generateId(), type: "lesson", title: title.trim(), description: desc.trim(), content: "" });
                lessonCreated = true;
              }
              preset.blocks.push({
                keyId: generateId(),
                type: "image",
                altText: part.caption || "Hình ảnh",
                caption: part.caption,
                file: null,
                storagePath: undefined,
                sourceName: basename(part.path) || undefined
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
          sourceName: basename(item.data.path) || undefined
        });
      } else if (item.type === "quiz") {
        const block = parseQuizBlock(item.data);
        if (block) preset.blocks.push(block);
      }
    }

    if (!preset.title) return { ok: false, error: "Thiếu tiêu đề tài liệu (\\doctitle)" };
    if (preset.blocks.length === 0) return { ok: false, error: "Không tìm thấy nội dung hợp lệ nào." };

    return { ok: true, data: preset };
  } catch (err: any) {
    return { ok: false, error: "Lỗi phân tích LaTeX: " + err.message };
  }
}
