"use client";

import React, { useEffect, useState, useId } from "react";
import katex from "katex";
import mermaid from "mermaid";
import { Copy, Check, Eye, Code as CodeIcon, RefreshCw } from "lucide-react";

// Initialize mermaid once safely on client
if (typeof window !== "undefined") {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose",
      fontFamily: "Inter, Noto Sans, Noto Sans Devanagari, sans-serif",
      themeVariables: {
        primaryColor: "#4f46e5",
        primaryTextColor: "#1e1b4b",
        primaryBorderColor: "#818cf8",
        lineColor: "#6366f1",
        secondaryColor: "#e0e7ff",
        tertiaryColor: "#f5f3ff",
        mainBkg: "#ffffff",
        nodeBorder: "#c7d2fe",
      },
    });
  } catch {
    // Ignore init errors
  }
}

function sanitizeMermaidCode(code: string): string {
  if (!code) return "";
  let clean = code
    .replace(/\u2011/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "-")
    .replace(/\u00a0/g, " ")
    .trim();

  // Auto-quote unquoted node labels with brackets: NodeID[Label with (parens)] -> NodeID["Label with (parens)"]
  // ONLY if not already inside quotes!
  clean = clean.replace(/(?:^|[\s\n>|;])([a-zA-Z0-9_-]+)\s*\[([^"\n\]]+)\]/g, (fullMatch, id, label) => {
    const trimmed = label.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return fullMatch;
    }
    if (/[()"'`:,;/]/.test(trimmed)) {
      const escaped = trimmed.replace(/"/g, "'");
      const prefix = fullMatch.slice(0, fullMatch.indexOf(id));
      return `${prefix}${id}["${escaped}"]`;
    }
    return fullMatch;
  });

  return clean;
}

// Interactive Mermaid Diagram Component
function MermaidDiagram({ code }: { code: string }) {
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [viewSource, setViewSource] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let isMounted = true;
    const cleanCode = sanitizeMermaidCode(code);
    if (!cleanCode) return;

    const renderDiagram = async () => {
      try {
        setError(null);
        const { svg } = await mermaid.render(diagramId, cleanCode);
        if (isMounted) {
          setSvgHtml(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Mermaid render error:", err);
          setError(err?.message || "Could not render visual diagram");
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [code, diagramId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (viewSource || error) {
    return (
      <div className="my-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-slate-300 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Mermaid Diagram Source</span>
          </div>
          <div className="flex items-center gap-2">
            {!error && (
              <button
                type="button"
                onClick={() => setViewSource(false)}
                className="px-2 py-1 rounded-lg bg-indigo-600/40 text-indigo-200 hover:bg-indigo-600/60 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>View Visual Diagram</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Copy diagram code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-amber-950/60 border-b border-amber-800/60 text-amber-200 text-xs font-mono">
            ⚠️ Rendering preview notice: {error}
          </div>
        )}

        <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-indigo-100 bg-gradient-to-b from-white to-slate-50/50 shadow-sm transition-all hover:shadow-md">
      {/* Top Diagram Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50/90 border-b border-slate-100 text-slate-600 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-700">Visual Diagram & Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewSource(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="View Diagram Source Code"
          >
            <CodeIcon className="w-3 h-3" />
            <span>Code</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer transition-all"
            title="Copy diagram code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="p-4 sm:p-6 overflow-x-auto flex justify-center items-center bg-white min-h-[140px]">
        {svgHtml ? (
          <div
            className="mermaid-svg-container max-w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Rendering visual diagram...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Interactive SVG Diagram Component
function SvgDiagram({ code }: { code: string }) {
  const [viewSource, setViewSource] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-slate-600 text-xs">
        <div className="flex items-center gap-2 font-bold text-[11px] text-slate-700">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Interactive Graphical Presentation</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewSource(!viewSource)}
            className="px-2 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            {viewSource ? <Eye className="w-3 h-3" /> : <CodeIcon className="w-3 h-3" />}
            <span>{viewSource ? "Visual View" : "Source"}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {viewSource ? (
        <pre className="p-4 text-xs font-mono bg-slate-900 text-indigo-200 overflow-x-auto">
          <code>{code}</code>
        </pre>
      ) : (
        <div
          className="p-4 sm:p-6 overflow-x-auto flex justify-center items-center [&>svg]:max-w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      )}
    </div>
  );
}

const INLINE_CODE = /(`[^`\n]+`)/g;
const BOLD = /(\*\*[^*\n]+\*\*)/g;
const ITALIC = /(\*[^*\n]+\*)/g;
const LINK = /(\[[^\]]+\]\([^)]+\))/g;
// Math expressions ($...$ and \(...\))
const INLINE_MATH = /(\$(?:\\\$|[^\$\n])+\$|\\\([\s\S]*?\\\))/g;
// Break tags (<br>, <br/>, <br />, &lt;br&gt;)
const BR_TAG = /(<br\s*\/?>|&lt;br\s*\/?>)/gi;
const HEADING = /^(#{1,4})\s+(.*)$/;
const HR = /^(-{3,}|\*{3,})$/;
const BLOCKQUOTE = /^>\s?(.*)$/;
const UL_ITEM = /^\s*[-*+]\s+(.*)$/;
const OL_ITEM = /^\s*(\d+)\.\s+(.*)$/;
const TABLE_SEP = /^\|?[\s:|-]+\|?$/;

function renderKatexMath(mathStr: string, isBlock: boolean = false): React.ReactNode {
  let clean = mathStr.trim();
  if (clean.startsWith("$$") && clean.endsWith("$$")) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith("$") && clean.endsWith("$")) {
    clean = clean.slice(1, -1).trim();
  } else if (clean.startsWith("\\[") && clean.endsWith("\\]")) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith("\\(") && clean.endsWith("\\)")) {
    clean = clean.slice(2, -2).trim();
  }

  try {
    const html = katex.renderToString(clean, {
      displayMode: isBlock,
      throwOnError: false,
      output: "htmlAndMathml",
    });
    return (
      <span
        className={
          isBlock
            ? "block my-3 text-center overflow-x-auto py-2.5 px-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/80 text-indigo-950 shadow-xs"
            : "inline-block px-1 align-baseline text-indigo-950"
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <code className="font-mono text-xs text-indigo-700">{clean}</code>;
  }
}

function renderItalic(text: string, keyPrefix: string): React.ReactNode {
  return text.split(ITALIC).map((seg, k) => {
    if (seg.startsWith("*") && seg.endsWith("*") && seg.length > 2) {
      return (
        <em key={`${keyPrefix}-em${k}`} className="italic">
          {seg.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t${k}`}>{seg}</React.Fragment>;
  });
}

function renderBoldItalic(text: string, keyPrefix: string): React.ReactNode {
  return text.split(INLINE_CODE).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${keyPrefix}-c${i}`}
          className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-mono text-[11px] border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part.split(BOLD).map((seg, j) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return (
          <strong key={`${keyPrefix}-b${i}-${j}`} className="font-bold text-slate-900">
            {renderItalic(seg.slice(2, -2), `${keyPrefix}-bi${i}-${j}`)}
          </strong>
        );
      }
      return renderItalic(seg, `${keyPrefix}-i${i}-${j}`);
    });
  });
}

function renderMathAndText(text: string, keyPrefix: string): React.ReactNode {
  return text.split(INLINE_MATH).map((part, i) => {
    const key = `${keyPrefix}-m${i}`;
    if (
      (part.startsWith("$") && part.endsWith("$") && part.length >= 2) ||
      (part.startsWith("\\(") && part.endsWith("\\)"))
    ) {
      return <React.Fragment key={key}>{renderKatexMath(part, false)}</React.Fragment>;
    }
    return <React.Fragment key={key}>{renderBoldItalic(part, key)}</React.Fragment>;
  });
}

function renderInline(text: string, keyPrefix: string): React.ReactNode {
  // First split by explicit line breaks (<br>, <br/>, <br />)
  return text.split(BR_TAG).map((chunk, brIdx) => {
    const brKey = `${keyPrefix}-br${brIdx}`;
    if (BR_TAG.test(chunk)) {
      return <br key={brKey} className="my-1" />;
    }

    return (
      <React.Fragment key={brKey}>
        {chunk.split(LINK).map((part, i) => {
          const key = `${brKey}-l${i}`;
          if (part.startsWith("[") && part.endsWith(")")) {
            const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (m) {
              return (
                <a
                  key={key}
                  href={m[2]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline decoration-indigo-300 hover:text-indigo-800 font-semibold"
                >
                  {renderInline(m[1], key)}
                </a>
              );
            }
          }
          return renderMathAndText(part, key);
        })}
      </React.Fragment>
    );
  });
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export default function Markdown({ text, content }: { text?: string; content?: string }) {
  const rawText = text ?? content ?? "";
  const lines = (rawText || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let blockKey = 0;

  let inFence = false;
  let fenceLang = "";
  const fenceLines: string[] = [];

  let inMathBlock = false;
  let mathBlockDelim: "\\[" | "$$" | "" = "";
  const mathBlockLines: string[] = [];

  let listItems: { type: "ul" | "ol"; items: string[] } | null = null;
  let tableRows: string[][] | null = null;

  const flushList = () => {
    if (!listItems) return;
    const key = `list-${blockKey++}`;
    if (listItems.type === "ul") {
      blocks.push(
        <ul key={key} className="list-disc pl-5 space-y-1.5 my-2">
          {listItems.items.map((it, k) => (
            <li key={`${key}-${k}`} className="leading-relaxed">
              {renderInline(it, `${key}-${k}`)}
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={key} className="list-decimal pl-5 space-y-1.5 my-2">
          {listItems.items.map((it, k) => (
            <li key={`${key}-${k}`} className="leading-relaxed">
              {renderInline(it, `${key}-${k}`)}
            </li>
          ))}
        </ol>
      );
    }
    listItems = null;
  };

  const flushTable = () => {
    if (!tableRows || tableRows.length < 2) {
      tableRows = null;
      return;
    }
    const key = `table-${blockKey++}`;
    const headers = tableRows[0];
    const body = tableRows.slice(1);
    blocks.push(
      <div key={key} className="overflow-x-auto my-3 rounded-2xl border border-slate-200 shadow-xs">
        <table className="w-full text-xs border-collapse bg-white">
          <thead>
            <tr className="bg-indigo-50/70 border-b border-indigo-100">
              {headers.map((h, k) => (
                <th key={`${key}-th${k}`} className="px-4 py-3 text-left font-black text-slate-800 tracking-wide">
                  {renderInline(h, `${key}-th${k}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, r) => (
              <tr key={`${key}-r${r}`} className={`border-t border-slate-100 transition-colors ${r % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-indigo-50/30`}>
                {row.map((cell, c) => (
                  <td key={`${key}-c${r}-${c}`} className="px-4 py-3 align-top leading-relaxed text-slate-700 font-medium">
                    {renderInline(cell, `${key}-c${r}-${c}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = null;
  };

  const flushFence = () => {
    if (fenceLines.length === 0) return;
    const key = `code-${blockKey++}`;
    const codeContent = fenceLines.join("\n");
    const lang = (fenceLang || "").toLowerCase().trim();

    if (lang === "mermaid") {
      blocks.push(<MermaidDiagram key={key} code={codeContent} />);
    } else if (lang === "svg" || (lang === "xml" && codeContent.trim().startsWith("<svg"))) {
      blocks.push(<SvgDiagram key={key} code={codeContent} />);
    } else if (lang === "math" || lang === "latex" || lang === "katex") {
      blocks.push(
        <div key={key}>
          {renderKatexMath(codeContent, true)}
        </div>
      );
    } else {
      blocks.push(
        <pre
          key={key}
          className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-[11.5px] font-mono overflow-x-auto my-3 leading-relaxed shadow-sm border border-slate-800"
        >
          <code className={fenceLang ? `language-${fenceLang}` : ""}>{codeContent}</code>
        </pre>
      );
    }
    fenceLines.length = 0;
  };

  const flushMathBlock = () => {
    if (mathBlockLines.length === 0) return;
    const key = `mathblock-${blockKey++}`;
    blocks.push(
      <div key={key}>
        {renderKatexMath(mathBlockLines.join("\n"), true)}
      </div>
    );
    mathBlockLines.length = 0;
    inMathBlock = false;
    mathBlockDelim = "";
  };

  const flushParagraph = () => {
    if (tableRows) flushTable();
    if (listItems) flushList();
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    // 1. Code Fence Handling
    if (inFence) {
      if (trimmed.startsWith("```")) {
        flushFence();
        inFence = false;
        fenceLang = "";
      } else {
        fenceLines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      inFence = true;
      fenceLang = trimmed.replace(/```/g, "").trim();
      continue;
    }

    // 2. Multiline Display Math Block Handling (\[ ... \] or $$ ... $$)
    if (inMathBlock) {
      if (mathBlockDelim === "\\[" && trimmed.endsWith("\\]")) {
        const content = trimmed.slice(0, -2).trim();
        if (content) mathBlockLines.push(content);
        flushMathBlock();
      } else if (mathBlockDelim === "$$" && trimmed.endsWith("$$")) {
        const content = trimmed.slice(0, -2).trim();
        if (content) mathBlockLines.push(content);
        flushMathBlock();
      } else {
        mathBlockLines.push(line);
      }
      continue;
    }

    if (trimmed === "\\[") {
      flushParagraph();
      inMathBlock = true;
      mathBlockDelim = "\\[";
      continue;
    }

    if (trimmed.startsWith("\\[") && trimmed.length > 2 && !trimmed.slice(2).includes("\\]")) {
      flushParagraph();
      inMathBlock = true;
      mathBlockDelim = "\\[";
      mathBlockLines.push(trimmed.slice(2).trim());
      continue;
    }

    if (trimmed === "$$") {
      flushParagraph();
      inMathBlock = true;
      mathBlockDelim = "$$";
      continue;
    }

    if (trimmed.startsWith("$$") && trimmed.length > 2 && !trimmed.slice(2).includes("$$")) {
      flushParagraph();
      inMathBlock = true;
      mathBlockDelim = "$$";
      mathBlockLines.push(trimmed.slice(2).trim());
      continue;
    }

    // Single-line display math block \[ ... \] or $$ ... $$
    if (trimmed.startsWith("\\[") && trimmed.endsWith("\\]") && trimmed.length > 2) {
      flushParagraph();
      const key = `mathblock-${blockKey++}`;
      blocks.push(<div key={key}>{renderKatexMath(trimmed, true)}</div>);
      continue;
    }

    if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 2) {
      flushParagraph();
      const key = `mathblock-${blockKey++}`;
      blocks.push(<div key={key}>{renderKatexMath(trimmed, true)}</div>);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const head = trimmed.match(HEADING);
    if (head) {
      flushParagraph();
      const key = `h-${blockKey++}`;
      const content = renderInline(head[2], key);
      const size = head[1].length;
      const cls =
        size === 1
          ? "text-base sm:text-lg font-black text-slate-900 mt-4 mb-2 tracking-tight"
          : size === 2
          ? "text-sm sm:text-base font-extrabold text-slate-900 mt-3 mb-1.5 tracking-tight"
          : "text-xs sm:text-sm font-bold text-slate-800 mt-2.5 mb-1";
      if (size === 1) blocks.push(<h3 key={key} className={cls}>{content}</h3>);
      else if (size === 2) blocks.push(<h4 key={key} className={cls}>{content}</h4>);
      else blocks.push(<h5 key={key} className={cls}>{content}</h5>);
      continue;
    }

    if (trimmed.match(HR)) {
      flushParagraph();
      blocks.push(<hr key={`hr-${blockKey++}`} className="my-4 border-slate-200" />);
      continue;
    }

    if (trimmed.startsWith("|") && tableRows) {
      const cells = parseTableRow(trimmed);
      const isSep = trimmed.match(TABLE_SEP) && /-/.test(trimmed);
      if (isSep) continue;
      tableRows.push(cells);
      continue;
    }

    if (trimmed.startsWith("|") && idx + 1 < lines.length) {
      const next = lines[idx + 1].trim();
      if (next.match(TABLE_SEP) && /-/.test(next)) {
        flushParagraph();
        tableRows = [parseTableRow(trimmed)];
        continue;
      }
    }

    const ul = trimmed.match(UL_ITEM);
    if (ul) {
      if (listItems && listItems.type !== "ul") flushList();
      if (!listItems) listItems = { type: "ul", items: [] };
      listItems.items.push(ul[1]);
      continue;
    }

    const ol = trimmed.match(OL_ITEM);
    if (ol) {
      if (listItems && listItems.type !== "ol") flushList();
      if (!listItems) listItems = { type: "ol", items: [] };
      listItems.items.push(ol[2]);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      const bq = trimmed.match(BLOCKQUOTE);
      const key = `bq-${blockKey++}`;
      blocks.push(
        <blockquote
          key={key}
          className="border-l-4 border-indigo-500 bg-indigo-50/70 rounded-r-xl px-4 py-2.5 my-2.5 text-slate-700 font-medium text-xs sm:text-sm shadow-xs"
        >
          {renderInline(bq ? bq[1] : "", key)}
        </blockquote>
      );
      continue;
    }

    // Paragraph: gather consecutive plain lines
    const para: string[] = [trimmed];
    while (idx + 1 < lines.length) {
      const nx = lines[idx + 1].trim();
      if (
        !nx ||
        nx.startsWith("#") ||
        nx.startsWith("```") ||
        nx.startsWith("|") ||
        nx.startsWith(">") ||
        nx.startsWith("$$") ||
        nx.startsWith("\\[") ||
        nx.match(HR) ||
        nx.match(UL_ITEM) ||
        nx.match(OL_ITEM)
      )
        break;
      para.push(nx);
      idx++;
    }
    const key = `p-${blockKey++}`;
    blocks.push(
      <p key={key} className="my-2 leading-relaxed text-slate-800">
        {para.map((p, k) => (
          <React.Fragment key={`${key}-f${k}`}>
            {k > 0 && <br />}
            {renderInline(p, `${key}-${k}`)}
          </React.Fragment>
        ))}
      </p>
    );
  }

  flushFence();
  flushMathBlock();
  flushParagraph();

  return <div className="text-slate-800 text-xs sm:text-sm font-sans space-y-1">{blocks}</div>;
}
