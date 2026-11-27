import type { Align, Block, ExportDoc, Run } from "./model";
import { charWidth, fonts, toWinAnsi, type FontKey } from "./pdf-fonts";

const PT = 72 / 25.4;
const BODY = 11;
const LEADING = 1.35;
const headingSizes = [24, 18, 14, 12, 11, 11];

type Color = readonly [number, number, number];
type Token = { kind: "word" | "space" | "break"; text: string; codes: number[]; font: FontKey; size: number; width: number; rise: number; underline: boolean; strike: boolean; href?: string; color?: Color };
type Line = { tokens: Token[]; width: number; height: number };
type Link = { x: number; y: number; width: number; height: number; href: string };
type Page = { ops: string[]; links: Link[] };

const BLUE: Color = [0.02, 0.39, 0.76];
const GREY: Color = [0.33, 0.33, 0.33];

function fontOf(run: Run, base: FontKey): FontKey {
  if (run.code) return "mono";
  const isBold = run.bold || base === "bold" || base === "boldItalic";
  const isItalic = run.italic || base === "italic" || base === "boldItalic";
  return isBold ? (isItalic ? "boldItalic" : "bold") : isItalic ? "italic" : "regular";
}

function tokenize(runs: Run[], baseFont: FontKey, baseSize: number, baseColor?: Color): Token[] {
  const tokens: Token[] = [];
  for (const run of runs) {
    const font = fontOf(run, baseFont);
    const size = run.sup ? baseSize * 0.7 : baseSize;
    for (const match of run.text.matchAll(/(\n)|([ \t]+)|([^\s]+)/g)) {
      const text = match[0];
      const codes = match[1] ? [] : [...(match[2] ? " " : text)].map((char) => toWinAnsi(char.codePointAt(0) ?? 63));
      const width = (codes.reduce((total, code) => total + charWidth(code, font), 0) * size) / 1000;
      tokens.push({ kind: match[1] ? "break" : match[2] ? "space" : "word", text, codes, font, size, width, rise: run.sup ? baseSize * 0.38 : 0, underline: Boolean(run.underline || run.href), strike: Boolean(run.strike), href: run.href, color: run.href ? BLUE : baseColor });
    }
  }
  return tokens;
}

function splitWord(token: Token, room: number): Token[] {
  const pieces: Token[] = [];
  let codes: number[] = [];
  let width = 0;
  for (const code of token.codes) {
    const w = (charWidth(code, token.font) * token.size) / 1000;
    if (codes.length > 0 && width + w > room) {
      pieces.push({ ...token, codes, width });
      codes = [];
      width = 0;
    }
    codes.push(code);
    width += w;
  }
  pieces.push({ ...token, codes, width });
  return pieces;
}

function wrap(tokens: Token[], maxWidth: number, size: number): Line[] {
  const lines: Line[] = [];
  let line: Token[] = [];
  let width = 0;
  const push = () => {
    while (line.length > 0 && line[line.length - 1].kind === "space") line.pop();
    const used = line.reduce((total, token) => total + token.width, 0);
    lines.push({ tokens: line, width: used, height: Math.max(size, ...line.map((token) => token.size)) * LEADING });
    line = [];
    width = 0;
  };
  for (const token of tokens) {
    if (token.kind === "break") push();
    else if (token.kind === "space") {
      if (line.length > 0) {
        line.push(token);
        width += token.width;
      }
    } else {
      const parts = token.width > maxWidth ? splitWord(token, maxWidth) : [token];
      for (const part of parts) {
        if (line.length > 0 && width + part.width > maxWidth) push();
        line.push(part);
        width += part.width;
      }
    }
  }
  if (line.length > 0 || lines.length === 0) push();
  return lines;
}

const hex = (codes: number[]) => codes.map((code) => code.toString(16).padStart(2, "0")).join("");
const num = (value: number) => value.toFixed(2).replace(/\.?0+$/, "") || "0";
const rgb = (color: Color) => `${color.map(num).join(" ")} rg`;

export function compilePdf(doc: ExportDoc): Uint8Array<ArrayBuffer> {
  const width = doc.page.width * PT;
  const height = doc.page.height * PT;
  const left = doc.page.left * PT;
  const right = width - doc.page.right * PT;
  const top = height - doc.page.top * PT;
  const bottom = doc.page.bottom * PT;
  const available = right - left;

  const pages: Page[] = [];
  let page: Page;
  let y = 0;
  const newPage = () => {
    page = { ops: [], links: [] };
    pages.push(page);
    y = top;
  };
  newPage();
  const ensure = (needed: number) => {
    if (y - needed < bottom && y < top) newPage();
  };
  const gap = (amount: number) => {
    if (y < top) y -= amount;
  };

  const drawLine = (line: Line, x: number, baseline: number, maxWidth: number, align: Align) => {
    let at = x + (align === "center" ? (maxWidth - line.width) / 2 : align === "right" ? maxWidth - line.width : 0);
    for (const token of line.tokens) {
      if (token.kind === "word") {
        const rise = token.rise;
        page.ops.push(`BT ${token.color ? rgb(token.color) : "0 g"} /${fonts[token.font].id} ${num(token.size)} Tf 1 0 0 1 ${num(at)} ${num(baseline + rise)} Tm <${hex(token.codes)}> Tj ET`);
        if (token.underline) page.ops.push(`${token.color ? token.color.map(num).join(" ") + " RG" : "0 G"} 0.5 w ${num(at)} ${num(baseline - 1.5)} m ${num(at + token.width)} ${num(baseline - 1.5)} l S`);
        if (token.strike) page.ops.push(`0 G 0.5 w ${num(at)} ${num(baseline + token.size * 0.3)} m ${num(at + token.width)} ${num(baseline + token.size * 0.3)} l S`);
      } else if (token.underline && token.kind === "space" && token.href) {
        page.ops.push(`${BLUE.map(num).join(" ")} RG 0.5 w ${num(at)} ${num(baseline - 1.5)} m ${num(at + token.width)} ${num(baseline - 1.5)} l S`);
      }
      if (token.href) page.links.push({ x: at, y: baseline - 2, width: token.width, height: token.size + 2, href: token.href });
      at += token.width;
    }
  };

  const paragraph = (runs: Run[], options: { font?: FontKey; size?: number; indent?: number; align?: Align; color?: Color; bar?: boolean; marker?: number[]; after?: number }) => {
    const size = options.size ?? BODY;
    const indent = options.indent ?? 0;
    const maxWidth = available - indent;
    const lines = wrap(tokenize(runs, options.font ?? "regular", size, options.color), maxWidth, size);
    lines.forEach((line, index) => {
      ensure(line.height);
      const baseline = y - size * 1.0;
      if (options.bar) page.ops.push(`0.78 g ${num(left + indent - 8)} ${num(y - line.height)} 2 ${num(line.height)} re f`);
      if (index === 0 && options.marker) page.ops.push(`BT 0 g /${fonts.regular.id} ${num(size)} Tf 1 0 0 1 ${num(left + indent - 16)} ${num(baseline)} Tm <${hex(options.marker)}> Tj ET`);
      drawLine(line, left + indent, baseline, maxWidth, options.align ?? "left");
      y -= line.height;
    });
    y -= options.after ?? 6;
  };

  const table = (rows: { isHeader: boolean; cells: Run[][] }[]) => {
    const columns = Math.max(1, ...rows.map((row) => row.cells.length));
    const columnWidth = available / columns;
    const pad = 4;
    const measure = (row: (typeof rows)[number]) => {
      const cells = Array.from({ length: columns }, (_, index) => wrap(tokenize(row.cells[index] ?? [], row.isHeader ? "bold" : "regular", BODY), columnWidth - pad * 2, BODY));
      return { cells, height: Math.max(...cells.map((lines) => lines.reduce((total, line) => total + line.height, 0))) + pad * 2 };
    };
    const draw = (row: (typeof rows)[number], measured: ReturnType<typeof measure>) => {
      measured.cells.forEach((lines, index) => {
        const x = left + index * columnWidth;
        if (row.isHeader) page.ops.push(`0.93 g ${num(x)} ${num(y - measured.height)} ${num(columnWidth)} ${num(measured.height)} re f`);
        page.ops.push(`0.75 G 0.5 w ${num(x)} ${num(y - measured.height)} ${num(columnWidth)} ${num(measured.height)} re S`);
        let cursor = y - pad;
        for (const line of lines) {
          drawLine(line, x + pad, cursor - BODY, columnWidth - pad * 2, "left");
          cursor -= line.height;
        }
      });
      y -= measured.height;
    };
    const header = rows[0]?.isHeader ? rows[0] : null;
    for (const row of rows) {
      const measured = measure(row);
      const before = page;
      ensure(measured.height);
      if (header && row !== header && page !== before) draw(header, measure(header));
      draw(row, measured);
    }
    y -= 10;
  };

  const block = (item: Block) => {
    switch (item.type) {
      case "heading": {
        const size = headingSizes[item.level - 1];
        gap(size * 0.6);
        ensure(size * LEADING + BODY * LEADING * 2);
        paragraph(item.content, { font: "bold", size, align: item.align, after: size * 0.25 });
        break;
      }
      case "paragraph":
        paragraph(item.content, { align: item.align });
        break;
      case "quote":
        paragraph(item.content, { font: "italic", indent: 18, color: GREY, bar: true });
        break;
      case "list": {
        const counters: number[] = [];
        for (const entry of item.items) {
          counters.length = entry.level + 1;
          counters[entry.level] = (counters[entry.level] ?? 0) + 1;
          const marker = item.ordered ? [...`${counters[entry.level]}.`].map((char) => toWinAnsi(char.charCodeAt(0))) : [0x95];
          paragraph(entry.content, { indent: 20 * (entry.level + 1), marker, after: 2 });
        }
        y -= 4;
        break;
      }
      case "table":
        table(item.rows);
        break;
      case "rule":
        ensure(14);
        page.ops.push(`0.6 G 0.75 w ${num(left)} ${num(y - 6)} m ${num(right)} ${num(y - 6)} l S`);
        y -= 14;
        break;
      case "pagebreak":
        newPage();
        break;
    }
  };

  const blocks: Block[] = [...doc.blocks];
  if (doc.references.length > 0) {
    blocks.push({ type: "heading", level: 2, content: [{ text: "References" }], align: "left" });
    blocks.push({ type: "list", ordered: true, items: doc.references.map((reference) => ({ level: 0, content: [{ text: reference.title, href: reference.url }] })) });
  }
  blocks.forEach(block);

  const total = pages.length;
  pages.forEach((current, index) => {
    const label = [...`${index + 1} / ${total}`].map((char) => toWinAnsi(char.charCodeAt(0)));
    const labelWidth = (label.reduce((sum, code) => sum + charWidth(code, "regular"), 0) * 9) / 1000;
    current.ops.push(`BT 0.45 g /${fonts.regular.id} 9 Tf 1 0 0 1 ${num((width - labelWidth) / 2)} ${num(Math.max(bottom / 2, 14))} Tm <${hex(label)}> Tj ET`);
  });

  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };
  const fontIds = Object.values(fonts);
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("");
  const fontRefs = fontIds.map((font) => add(`<< /Type /Font /Subtype /Type1 /BaseFont /${font.name} /Encoding /WinAnsiEncoding >>`));
  const title = [...doc.title].flatMap((char) => (char.codePointAt(0)! > 0xffff ? [0xfffd] : [char.charCodeAt(0)])).map((unit) => unit.toString(16).padStart(4, "0")).join("");
  const info = add(`<< /Title <FEFF${title}> /Producer (Undocx) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}Z) >>`);
  const pageIds: number[] = [];
  const resources = `<< /Font << ${fontIds.map((font, index) => `/${font.id} ${fontRefs[index]} 0 R`).join(" ")} >> >>`;
  for (const current of pages) {
    const stream = current.ops.join("\n");
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const annots = current.links.map((link) => add(`<< /Type /Annot /Subtype /Link /Rect [${[link.x, link.y, link.x + link.width, link.y + link.height].map(num).join(" ")}] /Border [0 0 0] /A << /S /URI /URI (${encodeURI(link.href).replace(/[()\\]/g, (char) => `\\${char}`)}) >> >>`));
    pageIds.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(width)} ${num(height)}] /Contents ${contentId} 0 R /Resources ${resources}${annots.length ? ` /Annots [${annots.map((id) => `${id} 0 R`).join(" ")}]` : ""} >>`));
  }
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(out.length);
    out += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Uint8Array.from(out, (char) => char.charCodeAt(0) & 0xff);
}
