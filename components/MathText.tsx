import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// Cache kết quả render KaTeX: tránh parse lại cùng một công thức khi mount lại trang
const katexCache = new Map<string, string>();
const KATEX_CACHE_MAX = 500;

function renderKatex(latex: string, displayMode: boolean): string {
  const key = `${displayMode ? 1 : 0}|${latex}`;
  const cached = katexCache.get(key);
  if (cached !== undefined) return cached;
  let html: string;
  try {
    html = katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
      output: "html",
    });
  } catch {
    return latex;
  }
  if (katexCache.size >= KATEX_CACHE_MAX) {
    katexCache.delete(katexCache.keys().next().value as string);
  }
  katexCache.set(key, html);
  return html;
}

function renderInline(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const pattern = /\$([^$\n]+?)\$|\*\*([^\*]+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[1] !== undefined) {
      // Inline math $...$
      elements.push(
        <span
          key={key++}
          className="inline-block mx-0.5"
          dangerouslySetInnerHTML={{ __html: renderKatex(match[1], false) }}
        />
      );
    } else if (match[2] !== undefined) {
      // Bold text **...**
      elements.push(<strong key={key++} className="font-bold text-slate-900 dark:text-white">{match[2]}</strong>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    elements.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }
  return elements;
}

function splitDisplayMath(text: string): { type: "text" | "block"; value: string }[] {
  const segments: { type: "text" | "block"; value: string }[] = [];
  const pattern = /\$\$([\s\S]+?)\$\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "block", value: match[1] });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  return segments;
}

const MathText = React.memo(function MathText({ text, className }: { text: string; className?: string }) {
  const cleanText = (text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const hasBlockElements = cleanText.includes("\n") || /^#|^[\*\-\+•]|\\item/m.test(cleanText) || cleanText.includes("$$");

  if (!hasBlockElements) {
    return <span className={className}>{renderInline(cleanText)}</span>;
  }

  // Splitting by display math blocks
  const segments = splitDisplayMath(cleanText);
  let globalLineIdx = 0;

  return (
    <div className={className}>
      {segments.map((seg, segIdx) => {
        if (seg.type === "block") {
          return (
            <span
              key={`block-${segIdx}`}
              className="my-3 block overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: renderKatex(seg.value, true) }}
            />
          );
        }

        const lines = seg.value.split("\n");
        return lines.map((line) => {
          globalLineIdx++;
          const currentLineIdx = globalLineIdx;
          const trimmedLine = line.trim();

          if (!trimmedLine) {
            return <div key={`empty-${currentLineIdx}`} className="h-3" />;
          }

          // Heading 1
          const h1Match = /^#\s+(.+)$/.exec(trimmedLine);
          if (h1Match) {
            return (
              <h1 key={`h1-${currentLineIdx}`} className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-6 mb-3 block border-b border-slate-100 pb-1.5 dark:border-slate-800">
                {renderInline(h1Match[1])}
              </h1>
            );
          }

          // Heading 2
          const h2Match = /^##\s+(.+)$/.exec(trimmedLine);
          if (h2Match) {
            return (
              <h2 key={`h2-${currentLineIdx}`} className="text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5 block border-b border-slate-100/50 pb-1 dark:border-slate-800/50">
                {renderInline(h2Match[1])}
              </h2>
            );
          }

          // Heading 3
          const h3Match = /^###\s+(.+)$/.exec(trimmedLine);
          if (h3Match) {
            return (
              <h3 key={`h3-${currentLineIdx}`} className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2 block">
                {renderInline(h3Match[1])}
              </h3>
            );
          }

          // Heading 4
          const h4Match = /^####\s+(.+)$/.exec(trimmedLine);
          if (h4Match) {
            return (
              <h4 key={`h4-${currentLineIdx}`} className="text-lg font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5 block">
                {renderInline(h4Match[1])}
              </h4>
            );
          }

          // Bullet List Item (hỗ trợ *, -, +, • và \item)
          const bulletMatch = /^(\s*)(?:[\*\-\+•]|\\item(?:\s*\[[^\]]*\])?)\s+(.+)$/.exec(line);
          if (bulletMatch) {
            const leadingSpaces = bulletMatch[1];
            const indentLevel = leadingSpaces.includes("\t")
              ? leadingSpaces.split("\t").length - 1
              : Math.floor(leadingSpaces.length / 2);
            const plClass = indentLevel >= 2 ? "pl-8" : indentLevel === 1 ? "pl-6" : "pl-4";
            return (
              <div key={`bullet-${currentLineIdx}`} className={`flex items-start gap-2.5 my-1.5 ${plClass}`}>
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span className="text-base leading-7 text-slate-700 dark:text-slate-300">
                  {renderInline(bulletMatch[2])}
                </span>
              </div>
            );
          }

          // Normal Paragraph
          return (
            <p key={`p-${currentLineIdx}`} className="my-1.5 text-base leading-7 text-slate-700 dark:text-slate-300">
              {renderInline(line)}
            </p>
          );
        });
      })}
    </div>
  );
});

export default MathText;