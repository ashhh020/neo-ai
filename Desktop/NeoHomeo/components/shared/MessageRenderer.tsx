"use client";

import React from "react";

// Renders AI messages: plain prose, tables, remedy blocks, aphorism blocks
// No markdown hashtags or raw asterisks — all structure is explicit

interface TableData {
  headers: string[];
  rows: string[][];
}

interface RemedyBlock {
  remedy: string;
  grade?: string;
  keynotes: string[];
  modalities?: { better?: string[]; worse?: string[] };
}

function parseTable(raw: string): TableData | null {
  const lines = raw.trim().split("\n").filter(l => l.includes("|"));
  if (lines.length < 2) return null;
  const parse = (l: string) => l.split("|").map(c => c.trim()).filter(Boolean);
  const headers = parse(lines[0]);
  const rows = lines.slice(2).map(parse); // skip separator line
  return { headers, rows };
}

function TableBlock({ data }: { data: TableData }) {
  return (
    <div className="overflow-x-auto my-3 rounded-2xl" style={{ border: "1px solid var(--glass-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(78,115,223,0.06)" }}>
            {data.headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 font-bold font-mono-neo text-xs"
                style={{ color: "var(--accent-mineral)", borderBottom: "1px solid var(--glass-border)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < data.rows.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
              background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.3)" }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-xs" style={{ color: "var(--text-obsidian)" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RemedyCard({ remedy }: { remedy: RemedyBlock }) {
  return (
    <div className="my-2 p-4 rounded-2xl" style={{ background: "rgba(78,115,223,0.06)", border: "1px solid rgba(78,115,223,0.12)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-extrabold text-sm" style={{ color: "var(--accent-mineral)" }}>{remedy.remedy}</span>
        {remedy.grade && (
          <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
            style={{ background: "rgba(78,115,223,0.12)", color: "var(--accent-mineral)" }}>
            Grade {remedy.grade}
          </span>
        )}
      </div>
      {remedy.keynotes.length > 0 && (
        <ul className="space-y-1 mb-2">
          {remedy.keynotes.map((k, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-obsidian)" }}>
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-mineral)" }} />
              {k}
            </li>
          ))}
        </ul>
      )}
      {remedy.modalities && (
        <div className="flex gap-4 text-[11px] font-mono-neo">
          {remedy.modalities.better && remedy.modalities.better.length > 0 && (
            <div>
              <span style={{ color: "#10b981", fontWeight: 600 }}>Better: </span>
              <span style={{ color: "var(--text-dim)" }}>{remedy.modalities.better.join(", ")}</span>
            </div>
          )}
          {remedy.modalities.worse && remedy.modalities.worse.length > 0 && (
            <div>
              <span style={{ color: "#ef4444", fontWeight: 600 }}>Worse: </span>
              <span style={{ color: "var(--text-dim)" }}>{remedy.modalities.worse.join(", ")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AphorismBlock({ text, number }: { text: string; number?: string }) {
  return (
    <blockquote className="my-3 pl-4 py-3 rounded-r-2xl" style={{ borderLeft: "3px solid #4ECDC4", background: "rgba(78,205,196,0.06)" }}>
      {number && (
        <p className="text-[10px] font-mono-neo font-bold mb-1" style={{ color: "#4ECDC4" }}>§{number}</p>
      )}
      <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-obsidian)" }}>{text}</p>
    </blockquote>
  );
}

function renderParagraph(text: string, key: number) {
  // Bold: **text** → <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p key={key} className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-obsidian)" }}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} style={{ color: "var(--text-obsidian)" }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </p>
  );
}

export function MessageRenderer({ content }: { content: string }) {
  const segments = content.split(/\n\n+/);

  const elements: React.ReactNode[] = [];

  segments.forEach((seg, si) => {
    const trimmed = seg.trim();

    // Section heading (lines starting with # stripped to styled div)
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ")) {
      const level = trimmed.startsWith("## ") ? 2 : 1;
      const text = trimmed.replace(/^#+\s+/, "");
      elements.push(
        <p key={si} className={level === 1 ? "font-extrabold text-base mt-3 mb-1" : "font-bold text-sm mt-2 mb-1"}
          style={{ color: "var(--text-obsidian)", letterSpacing: level === 1 ? "-0.02em" : undefined }}>
          {text}
        </p>
      );
      return;
    }

    // Table (contains | pipes)
    if (trimmed.includes("|") && trimmed.split("\n").length > 2) {
      const tbl = parseTable(trimmed);
      if (tbl) { elements.push(<TableBlock key={si} data={tbl} />); return; }
    }

    // Bullet list
    const bulletLines = trimmed.split("\n").filter(l => l.match(/^[-•*]\s/));
    if (bulletLines.length > 0 && bulletLines.length === trimmed.split("\n").length) {
      elements.push(
        <ul key={si} className="space-y-1.5 my-2">
          {bulletLines.map((line, li) => (
            <li key={li} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-obsidian)" }}>
              <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-mineral)" }} />
              {line.replace(/^[-•*]\s/, "")}
            </li>
          ))}
        </ul>
      );
      return;
    }

    // Numbered list
    const numLines = trimmed.split("\n").filter(l => l.match(/^\d+\./));
    if (numLines.length > 0 && numLines.length === trimmed.split("\n").length) {
      elements.push(
        <ol key={si} className="space-y-1.5 my-2">
          {numLines.map((line, li) => (
            <li key={li} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-obsidian)" }}>
              <span className="flex-shrink-0 font-mono-neo font-bold text-xs mt-0.5 w-5 text-right"
                style={{ color: "var(--accent-mineral)" }}>{li + 1}.</span>
              {line.replace(/^\d+\.\s*/, "")}
            </li>
          ))}
        </ol>
      );
      return;
    }

    // Aphorism / blockquote
    if (trimmed.startsWith(">")) {
      const text = trimmed.replace(/^>\s*/, "");
      const match = text.match(/^§(\d+)\s*:?\s*([\s\S]*)/);
      elements.push(<AphorismBlock key={si} text={match ? match[2] : text} number={match ? match[1] : undefined} />);
      return;
    }

    // Plain paragraph (strip lone # that leaked through)
    const cleaned = trimmed.replace(/^#{1,6}\s+/, "");
    if (cleaned) {
      elements.push(renderParagraph(cleaned, si));
    }
  });

  return <div className="leading-relaxed">{elements}</div>;
}
