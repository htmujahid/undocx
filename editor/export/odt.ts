import type { Align, Block, ExportDoc, ListItem, Run } from "./model";
import { esc } from "./xml";
import { zip } from "./zip";

const NS =
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"';
const header = '<?xml version="1.0" encoding="UTF-8"?>';
const headingSizes = [24, 18, 14, 12, 11, 11];
const cm = (mm: number) => `${(mm / 10).toFixed(3)}cm`;

function listStyle(name: string, ordered: boolean) {
  const levels = Array.from({ length: 9 }, (_, index) => {
    const left = (index + 1) * 0.9;
    const props = `<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="${left}cm" fo:text-indent="-0.6cm" fo:margin-left="${left}cm"/></style:list-level-properties>`;
    return ordered ? `<text:list-level-style-number text:level="${index + 1}" style:num-suffix="." style:num-format="1">${props}</text:list-level-style-number>` : `<text:list-level-style-bullet text:level="${index + 1}" text:bullet-char="${["•", "◦", "▪"][index % 3]}">${props}</text:list-level-style-bullet>`;
  }).join("");
  return `<text:list-style style:name="${name}">${levels}</text:list-style>`;
}

function textXml(text: string) {
  return text
    .split("\n")
    .map((line) => esc(line).replace(/ {2,}/g, (spaces) => ` <text:s text:c="${spaces.length - 1}"/>`))
    .join("<text:line-break/>");
}

export function compileOdt(doc: ExportDoc): Uint8Array<ArrayBuffer> {
  const spans = new Map<string, string>();
  const paragraphs = new Map<string, string>();
  let tables = 0;

  const spanName = (run: Run, forceBold: boolean) => {
    const props = [(run.bold || forceBold) && 'fo:font-weight="bold"', run.italic && 'fo:font-style="italic"', run.underline && 'style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"', run.strike && 'style:text-line-through-style="solid"', run.sup && 'style:text-position="super 58%"'].filter(Boolean).join(" ");
    const parent = run.code ? ' style:parent-style-name="Source_20_Text"' : "";
    if (!props && !parent) return null;
    const key = `${props}|${parent}`;
    if (!spans.has(key)) spans.set(key, `T${spans.size + 1}`);
    return spans.get(key)!;
  };

  const runXml = (run: Run, forceBold: boolean) => {
    const name = spanName(run, forceBold);
    const inner = name ? `<text:span text:style-name="${name}">${textXml(run.text)}</text:span>` : textXml(run.text);
    return run.href ? `<text:a xlink:type="simple" xlink:href="${esc(run.href)}" text:style-name="Internet_20_link">${inner}</text:a>` : inner;
  };

  const content = (runs: Run[], forceBold = false) => runs.map((run) => runXml(run, forceBold)).join("");

  const paragraphStyle = (parent: string, align: Align) => {
    if (align === "left") return parent;
    const name = `${parent}_${align}`;
    paragraphs.set(name, `<style:style style:name="${name}" style:family="paragraph" style:parent-style-name="${parent}"><style:paragraph-properties fo:text-align="${align === "justify" ? "justify" : align}"/></style:style>`);
    return name;
  };

  const list = (items: ListItem[], ordered: boolean) => {
    const render = (start: number, level: number): [string, number] => {
      let out = `<text:list text:style-name="${ordered ? "LN" : "LB"}">`;
      let index = start;
      while (index < items.length && Math.min(items[index].level, level + 1) >= level) {
        out += `<text:list-item><text:p text:style-name="Standard">${content(items[index].content)}</text:p>`;
        index++;
        if (index < items.length && items[index].level > level) {
          const [nested, next] = render(index, level + 1);
          out += nested;
          index = next;
        }
        out += "</text:list-item>";
      }
      return [`${out}</text:list>`, index];
    };
    let out = "";
    for (let index = 0; index < items.length; ) {
      const [xml, next] = render(index, 0);
      out += xml;
      index = Math.max(next, index + 1);
    }
    return out;
  };

  const textWidth = doc.page.width - doc.page.left - doc.page.right;

  const block = (item: Block): string => {
    switch (item.type) {
      case "heading":
        return `<text:h text:style-name="${paragraphStyle(`Heading_20_${item.level}`, item.align)}" text:outline-level="${item.level}">${content(item.content)}</text:h>`;
      case "paragraph":
        return `<text:p text:style-name="${paragraphStyle("Standard", item.align)}">${content(item.content)}</text:p>`;
      case "quote":
        return `<text:p text:style-name="Quotations">${content(item.content)}</text:p>`;
      case "list":
        return list(item.items, item.ordered);
      case "table": {
        const columns = Math.max(1, ...item.rows.map((row) => row.cells.length));
        const name = `Table${++tables}`;
        const rows = item.rows
          .map((row) => {
            const cells = Array.from({ length: columns }, (_, index) => row.cells[index] ?? []);
            const xml = cells.map((cell) => `<table:table-cell table:style-name="${row.isHeader ? "TCH" : "TC"}" office:value-type="string"><text:p text:style-name="Standard">${content(cell, row.isHeader)}</text:p></table:table-cell>`).join("");
            return row.isHeader ? `<table:table-header-rows><table:table-row>${xml}</table:table-row></table:table-header-rows>` : `<table:table-row>${xml}</table:table-row>`;
          })
          .join("");
        return `<table:table table:name="${name}" table:style-name="Tbl"><table:table-column table:style-name="TCol${columns}" table:number-columns-repeated="${columns}"/>${rows}</table:table><text:p text:style-name="Standard"/>`;
      }
      case "rule":
        return '<text:p text:style-name="Rule"/>';
      case "pagebreak":
        return '<text:p text:style-name="Pagebreak"/>';
    }
  };

  const blocks: Block[] = [...doc.blocks];
  if (doc.references.length > 0) {
    blocks.push({ type: "heading", level: 2, content: [{ text: "References" }], align: "left" });
    blocks.push({ type: "list", ordered: true, items: doc.references.map((reference) => ({ level: 0, content: [{ text: reference.title, href: reference.url }] })) });
  }
  const body = blocks.map(block).join("");

  const columnCounts = new Set(blocks.flatMap((item) => (item.type === "table" ? [Math.max(1, ...item.rows.map((row) => row.cells.length))] : [])));
  const columnStyles = [...columnCounts].map((count) => `<style:style style:name="TCol${count}" style:family="table-column"><style:table-column-properties style:column-width="${(textWidth / 10 / count).toFixed(3)}cm"/></style:style>`).join("");
  const spanStyles = [...spans].map(([key, name]) => {
    const [props, parent] = key.split("|");
    return `<style:style style:name="${name}" style:family="text"${parent}><style:text-properties ${props}/></style:style>`;
  }).join("");

  const contentXml = `${header}<office:document-content ${NS} office:version="1.2"><office:automatic-styles>${spanStyles}${[...paragraphs.values()].join("")}<style:style style:name="Rule" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:border-bottom="0.75pt solid #999999" fo:padding-bottom="0.1cm"/></style:style><style:style style:name="Pagebreak" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:break-before="page"/></style:style>${listStyle("LB", false)}${listStyle("LN", true)}<style:style style:name="Tbl" style:family="table"><style:table-properties style:width="${(textWidth / 10).toFixed(3)}cm" table:align="left"/></style:style>${columnStyles}<style:style style:name="TC" style:family="table-cell"><style:table-cell-properties fo:padding="0.12cm" fo:border="0.5pt solid #bfbfbf"/></style:style><style:style style:name="TCH" style:family="table-cell"><style:table-cell-properties fo:padding="0.12cm" fo:border="0.5pt solid #bfbfbf" fo:background-color="#eeeeee"/></style:style></office:automatic-styles><office:body><office:text>${body}</office:text></office:body></office:document-content>`;

  const headingStyles = headingSizes
    .map((size, index) => `<style:style style:name="Heading_20_${index + 1}" style:display-name="Heading ${index + 1}" style:family="paragraph" style:parent-style-name="Standard" style:next-style-name="Standard" style:default-outline-level="${index + 1}"><style:paragraph-properties fo:margin-top="${index === 0 ? "0.5cm" : "0.45cm"}" fo:margin-bottom="0.2cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="${size}pt" fo:font-weight="bold"${index === 5 ? ' fo:font-style="italic"' : ""}/></style:style>`)
    .join("");
  const landscape = doc.page.width > doc.page.height ? "landscape" : "portrait";
  const stylesXml = `${header}<office:document-styles ${NS} office:version="1.2"><office:styles><style:default-style style:family="paragraph"><style:paragraph-properties fo:line-height="130%" fo:margin-bottom="0.2cm"/><style:text-properties fo:font-size="11pt" fo:language="en" fo:country="GB" fo:font-family="Calibri, Carlito, sans-serif"/></style:default-style><style:style style:name="Standard" style:family="paragraph" style:class="text"/>${headingStyles}<style:style style:name="Quotations" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:margin-left="1cm" fo:padding-left="0.3cm" fo:border-left="1.5pt solid #bbbbbb"/><style:text-properties fo:font-style="italic" fo:color="#555555"/></style:style><style:style style:name="Footer" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="center"/></style:style><style:style style:name="Source_20_Text" style:display-name="Source Text" style:family="text"><style:text-properties fo:font-family="Consolas, 'Liberation Mono', monospace" fo:font-size="10pt" fo:background-color="#f2f2f2"/></style:style><style:style style:name="Internet_20_link" style:display-name="Internet link" style:family="text"><style:text-properties fo:color="#0563c1" style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/></style:style></office:styles><office:automatic-styles><style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="${cm(doc.page.width)}" fo:page-height="${cm(doc.page.height)}" style:print-orientation="${landscape}" fo:margin-top="${cm(doc.page.top)}" fo:margin-bottom="${cm(doc.page.bottom)}" fo:margin-left="${cm(doc.page.left)}" fo:margin-right="${cm(doc.page.right)}"/><style:footer-style><style:header-footer-properties fo:min-height="0.5cm" fo:margin-top="0.3cm"/></style:footer-style></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"><style:footer><text:p text:style-name="Footer"><text:page-number text:select-page="current">1</text:page-number></text:p></style:footer></style:master-page></office:master-styles></office:document-styles>`;

  const manifest = `${header}<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/></manifest:manifest>`;
  const meta = `${header}<office:document-meta ${NS} office:version="1.2"><office:meta><dc:title>${esc(doc.title)}</dc:title><meta:initial-creator>Undocx</meta:initial-creator><meta:creation-date>${new Date().toISOString()}</meta:creation-date></office:meta></office:document-meta>`;

  return zip([
    { name: "mimetype", data: "application/vnd.oasis.opendocument.text" },
    { name: "META-INF/manifest.xml", data: manifest },
    { name: "meta.xml", data: meta },
    { name: "styles.xml", data: stylesXml },
    { name: "content.xml", data: contentXml },
  ]);
}
