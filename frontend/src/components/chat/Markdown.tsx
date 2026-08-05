import React from "react";

const INLINE_CODE = /(`[^`\n]+`)/g;
const BOLD = /(\*\*[^*\n]+\*\*)/g;
const ITALIC = /(\*[^*\n]+\*)/g;
const LINK = /(\[[^\]]+\]\([^)]+\))/g;
const HEADING = /^(#{1,4})\s+(.*)$/;
const HR = /^(-{3,}|\*{3,})$/;
const BLOCKQUOTE = /^>\s?(.*)$/;
const UL_ITEM = /^\s*[-*+]\s+(.*)$/;
const OL_ITEM = /^\s*(\d+)\.\s+(.*)$/;
const TABLE_SEP = /^\|?[\s:|-]+\|?$/;

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

function renderInline(text: string, keyPrefix: string): React.ReactNode {
  return text.split(LINK).map((part, i) => {
    const key = `${keyPrefix}-l${i}`;
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
    return renderBoldItalic(part, key);
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

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let blockKey = 0;

  let inFence = false;
  let fenceLang = "";
  const fenceLines: string[] = [];

  let listItems: { type: "ul" | "ol"; items: string[] } | null = null;
  let tableRows: string[][] | null = null;

  const flushList = () => {
    if (!listItems) return;
    const key = `list-${blockKey++}`;
    if (listItems.type === "ul") {
      blocks.push(
        <ul key={key} className="list-disc pl-5 space-y-1 my-1.5">
          {listItems.items.map((it, k) => (
            <li key={`${key}-${k}`}>{renderInline(it, `${key}-${k}`)}</li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={key} className="list-decimal pl-5 space-y-1 my-1.5">
          {listItems.items.map((it, k) => (
            <li key={`${key}-${k}`}>{renderInline(it, `${key}-${k}`)}</li>
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
      <div key={key} className="overflow-x-auto my-2 rounded-xl border border-slate-200">
        <table className="w-full text-xs border-collapse bg-white">
          <thead>
            <tr className="bg-slate-100">
              {headers.map((h, k) => (
                <th key={`${key}-th${k}`} className="border-b border-slate-200 px-3 py-2 text-left font-bold text-slate-800">
                  {renderInline(h, `${key}-th${k}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, r) => (
              <tr key={`${key}-r${r}`} className={r % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                {row.map((cell, c) => (
                  <td key={`${key}-c${r}-${c}`} className="border-t border-slate-100 px-3 py-2 align-top">
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
    blocks.push(
      <pre
        key={key}
        className="bg-slate-900 text-slate-100 rounded-xl p-4 text-[11px] font-mono overflow-x-auto my-2 leading-relaxed"
      >
        <code className={fenceLang ? `language-${fenceLang}` : ""}>{fenceLines.join("\n")}</code>
      </pre>
    );
    fenceLines.length = 0;
  };

  const flushParagraph = () => {
    if (tableRows) flushTable();
    if (listItems) flushList();
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

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
          ? "text-base font-extrabold text-slate-900 mt-3 mb-1"
          : size === 2
          ? "text-sm font-extrabold text-slate-900 mt-2.5 mb-1"
          : "text-xs font-bold text-slate-800 mt-2 mb-1";
      if (size === 1) blocks.push(<h3 key={key} className={cls}>{content}</h3>);
      else if (size === 2) blocks.push(<h4 key={key} className={cls}>{content}</h4>);
      else blocks.push(<h5 key={key} className={cls}>{content}</h5>);
      continue;
    }

    if (trimmed.match(HR)) {
      flushParagraph();
      blocks.push(<hr key={`hr-${blockKey++}`} className="my-3 border-slate-200" />);
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
          className="border-l-4 border-indigo-300 bg-indigo-50/60 rounded-r-lg px-3 py-2 my-2 text-slate-700"
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
      if (!nx || nx.startsWith("#") || nx.startsWith("```") || nx.startsWith("|") || nx.startsWith(">") || nx.match(HR) || nx.match(UL_ITEM) || nx.match(OL_ITEM)) break;
      para.push(nx);
      idx++;
    }
    const key = `p-${blockKey++}`;
    blocks.push(
      <p key={key} className="my-1.5 leading-relaxed">
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
  flushParagraph();

  return <div className="text-slate-800">{blocks}</div>;
}
