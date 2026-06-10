"use client";

import React from "react";

// Renders AI (Dr. Neo) messages from lightweight markdown into clean,
// clinically-structured UI: headings, bullet/numbered lists, tables,
// aphorism blockquotes. All inline markdown is parsed and any stray
// asterisks / hashes are stripped so they never show as raw characters.

interface TableData {
  headers: string[];
  rows: string[][];
}

// ── Inline formatting: **bold**, *italic*/_italic_, strip stray * and # ──
function renderInline(text: string, keyBase = 0): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|__([^_]+)__|_([^_\n]+)_/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = keyBase;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(stripStray(text.slice(last, m.index)));
    const bold = m[1] ?? m[3];
    const ital = m[2] ?? m[4];
    if (bold) nodes.push(<strong key={`b${k++}`} style={{ fontWeight: 700 }}>{stripStray(bold)}</strong>);
    else if (ital) nodes.push(<em key={`i${k++}`}>{stripStray(ital)}</em>);
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(stripStray(text.slice(last)));
  return nodes;
}

function stripStray(s: string): string {
  // Remove leftover markdown emphasis/heading marks that weren't matched as pairs
  return s.replace(/\*+/g, "").replace(/(^|\s)#{1,6}(\s|$)/g, "$1$2");
}

function parseTable(lines: string[]): TableData | null {
  const rows = lines.filter((l) => l.includes("|"));
  if (rows.length < 2) return null;
  const parse = (l: string) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const headers = parse(rows[0]);
  // skip the separator line (---|---) if present
  const bodyStart = /^[\s|:-]+$/.test(rows[1]) ? 2 : 1;
  const body = rows.slice(bodyStart).map(parse).filter((r) => r.some(Boolean));
  if (headers.length === 0) return null;
  return { headers, rows: body };
}

function TableBlock({ data }: { data: TableData }) {
  return (
    <div className="overflow-x-auto my-3 rounded-2xl" style={{ border: "1px solid var(--glass-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(78,115,223,0.06)" }}>
            {data.headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2.5 font-bold font-mono-neo text-xs"
                style={{ color: "var(--accent-mineral)", borderBottom: "1px solid var(--glass-border)" }}>
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < data.rows.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
              background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.3)" }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2.5 text-xs align-top" style={{ color: "var(--text-obsidian)" }}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AphorismBlock({ text, number }: { text: string; number?: string }) {
  return (
    <blockquote className="my-3 pl-4 py-3 rounded-r-2xl" style={{ borderLeft: "3px solid #4ECDC4", background: "rgba(78,205,196,0.06)" }}>
      {number && <p className="text-[10px] font-mono-neo font-bold mb-1" style={{ color: "#4ECDC4" }}>§{number}</p>}
      <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-obsidian)" }}>{renderInline(text)}</p>
    </blockquote>
  );
}

const BULLET_RE = /^\s*[-•*]\s+/;
const NUM_RE = /^\s*\d+[.)]\s+/;
const HEAD_HASH_RE = /^#{1,6}\s+/;

function isHeadingLine(line: string): string | null {
  const t = line.trim();
  if (HEAD_HASH_RE.test(t)) return t.replace(HEAD_HASH_RE, "").replace(/\*+/g, "").trim();
  // Whole line bold: **Heading** or **Heading:**
  const boldWhole = t.match(/^\*\*(.+?)\*\*:?$/);
  if (boldWhole) return boldWhole[1].trim();
  // Short label line ending in colon (e.g. "Keynotes:")
  if (t.length > 0 && t.length <= 48 && /:$/.test(t) && !BULLET_RE.test(t) && !NUM_RE.test(t)) {
    return t.replace(/:$/, "").replace(/\*+/g, "").trim();
  }
  return null;
}

export function MessageRenderer({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    // ── Table: 2+ consecutive lines containing pipes ──
    if (trimmed.includes("|")) {
      const block: string[] = [];
      while (i < lines.length && lines[i].includes("|")) { block.push(lines[i]); i++; }
      if (block.length >= 2) {
        const tbl = parseTable(block);
        if (tbl) { elements.push(<TableBlock key={key++} data={tbl} />); continue; }
      }
      // not a real table — render as paragraphs
      block.forEach((b) => elements.push(
        <p key={key++} className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-obsidian)" }}>{renderInline(b)}</p>
      ));
      continue;
    }

    // ── Blockquote / aphorism ──
    if (trimmed.startsWith(">")) {
      const text = trimmed.replace(/^>\s*/, "");
      const mAph = text.match(/^§?\s*(\d+)\s*:?\s*([\s\S]*)/);
      if (mAph && /§/.test(text)) {
        elements.push(<AphorismBlock key={key++} text={mAph[2]} number={mAph[1]} />);
      } else {
        elements.push(<AphorismBlock key={key++} text={text} />);
      }
      i++;
      continue;
    }

    // ── Heading ──
    const heading = isHeadingLine(trimmed);
    if (heading) {
      elements.push(
        <p key={key++} className="font-bold text-sm mt-3 mb-1.5" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.01em" }}>
          {renderInline(heading)}
        </p>
      );
      i++;
      continue;
    }

    // ── Bullet list (consecutive bullet lines) ──
    if (BULLET_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && BULLET_RE.test(lines[i])) { items.push(lines[i].replace(BULLET_RE, "")); i++; }
      elements.push(
        <ul key={key++} className="space-y-1.5 my-2">
          {items.map((it, li) => (
            <li key={li} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-obsidian)" }}>
              <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-mineral)" }} />
              <span className="leading-relaxed">{renderInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered list ──
    if (NUM_RE.test(line)) {
      const items: string[] = [];
      while (i < lines.length && NUM_RE.test(lines[i])) { items.push(lines[i].replace(NUM_RE, "")); i++; }
      elements.push(
        <ol key={key++} className="space-y-1.5 my-2">
          {items.map((it, li) => (
            <li key={li} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-obsidian)" }}>
              <span className="flex-shrink-0 font-mono-neo font-bold text-xs mt-0.5 w-5 text-right" style={{ color: "var(--accent-mineral)" }}>{li + 1}.</span>
              <span className="leading-relaxed">{renderInline(it)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Plain paragraph (merge consecutive plain lines) ──
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].includes("|") &&
      !lines[i].trim().startsWith(">") &&
      !BULLET_RE.test(lines[i]) &&
      !NUM_RE.test(lines[i]) &&
      !isHeadingLine(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    elements.push(
      <p key={key++} className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-obsidian)" }}>
        {renderInline(para.join(" "))}
      </p>
    );
  }

  return <div className="leading-relaxed">{elements}</div>;
}
