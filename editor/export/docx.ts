import { esc, mmToTwips } from "./xml";
import type { Block, ExportDoc, Run } from "./model";
import { zip } from "./zip";

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const header = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

const headingSizes = [48, 36, 28, 24, 22, 22];

function styles() {
  const headings = headingSizes
    .map((size, index) => `<w:style w:type="paragraph" w:styleId="Heading${index + 1}"><w:name w:val="heading ${index + 1}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="${index === 0 ? 360 : 280}" w:after="120"/><w:outlineLvl w:val="${index}"/></w:pPr><w:rPr><w:b/>${index === 5 ? "<w:i/>" : ""}<w:sz w:val="${size}"/></w:rPr></w:style>`)
    .join("");
  return `${header}<w:styles ${W}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:lang w:val="en-GB"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>${headings}<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="BBBBBB"/></w:pBdr><w:ind w:left="567"/></w:pPr><w:rPr><w:i/><w:color w:val="555555"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="60"/></w:pPr></w:style><w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr></w:style><w:style w:type="character" w:styleId="CodeChar"><w:name w:val="Code"/><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:sz w:val="20"/><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/></w:rPr></w:style><w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:basedOn w:val="TableNormal"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/></w:tblBorders><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;
}

function numbering(orderedLists: number) {
  const level = (index: number, format: string, text: string) => `<w:lvl w:ilvl="${index}"><w:start w:val="1"/><w:numFmt w:val="${format}"/><w:lvlText w:val="${text}"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${720 + index * 360}" w:hanging="360"/></w:pPr></w:lvl>`;
  const bullets = Array.from({ length: 9 }, (_, index) => level(index, "bullet", ["•", "◦", "▪"][index % 3])).join("");
  const decimals = Array.from({ length: 9 }, (_, index) => level(index, "decimal", `%${index + 1}.`)).join("");
  const nums = Array.from({ length: orderedLists }, (_, index) => `<w:num w:numId="${index + 2}"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>`).join("");
  return `${header}<w:numbering ${W}><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>${bullets}</w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>${decimals}</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>${nums}</w:numbering>`;
}

export function compileDocx(doc: ExportDoc): Uint8Array<ArrayBuffer> {
  const links = new Map<string, string>();
  let orderedLists = 0;
  const linkId = (url: string) => {
    if (!links.has(url)) links.set(url, `rId${10 + links.size}`);
    return links.get(url)!;
  };

  const runXml = (run: Run, forceBold = false) => {
    const props = [run.code && '<w:rStyle w:val="CodeChar"/>', run.href && '<w:rStyle w:val="Hyperlink"/>', (run.bold || forceBold) && "<w:b/>", run.italic && "<w:i/>", run.strike && "<w:strike/>", run.underline && '<w:u w:val="single"/>', run.sup && '<w:vertAlign w:val="superscript"/>'].filter(Boolean);
    const body = run.text
      .split("\n")
      .map((line) => `<w:t xml:space="preserve">${esc(line)}</w:t>`)
      .join("<w:br/>");
    return `<w:r>${props.length ? `<w:rPr>${props.join("")}</w:rPr>` : ""}${body}</w:r>`;
  };

  const contentXml = (runs: Run[], forceBold = false) => {
    let out = "";
    for (let index = 0; index < runs.length; ) {
      const href = runs[index].href;
      let end = index;
      while (end < runs.length && runs[end].href === href) end++;
      const group = runs.slice(index, end).map((run) => runXml(run, forceBold)).join("");
      out += href ? `<w:hyperlink r:id="${linkId(href)}" w:history="1">${group}</w:hyperlink>` : group;
      index = end;
    }
    return out;
  };

  const paragraph = (runs: Run[], options: { style?: string; align?: string; num?: { id: number; level: number }; forceBold?: boolean } = {}) => {
    const pPr = [options.style && `<w:pStyle w:val="${options.style}"/>`, options.num && `<w:numPr><w:ilvl w:val="${options.num.level}"/><w:numId w:val="${options.num.id}"/></w:numPr>`, options.align && options.align !== "left" && `<w:jc w:val="${options.align === "justify" ? "both" : options.align}"/>`].filter(Boolean);
    return `<w:p>${pPr.length ? `<w:pPr>${pPr.join("")}</w:pPr>` : ""}${contentXml(runs, options.forceBold)}</w:p>`;
  };

  const textWidth = mmToTwips(doc.page.width - doc.page.left - doc.page.right);

  const block = (item: Block): string => {
    switch (item.type) {
      case "heading":
        return paragraph(item.content, { style: `Heading${item.level}`, align: item.align });
      case "paragraph":
        return paragraph(item.content, { align: item.align });
      case "quote":
        return paragraph(item.content, { style: "Quote" });
      case "list": {
        const id = item.ordered ? 2 + orderedLists++ : 1;
        return item.items.map((entry) => paragraph(entry.content, { style: "ListParagraph", num: { id, level: Math.min(entry.level, 8) } })).join("");
      }
      case "table": {
        const columns = Math.max(1, ...item.rows.map((row) => row.cells.length));
        const width = Math.floor(textWidth / columns);
        const grid = Array.from({ length: columns }, () => `<w:gridCol w:w="${width}"/>`).join("");
        const rows = item.rows
          .map((row) => {
            const cells = Array.from({ length: columns }, (_, index) => row.cells[index] ?? []);
            const tcs = cells.map((cell) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${row.isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="EEEEEE"/>' : ""}</w:tcPr>${paragraph(cell, { forceBold: row.isHeader })}</w:tc>`).join("");
            return `<w:tr>${row.isHeader ? "<w:trPr><w:tblHeader/></w:trPr>" : ""}${tcs}</w:tr>`;
          })
          .join("");
        return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="${width * columns}" w:type="dxa"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${rows}</w:tbl><w:p/>`;
      }
      case "rule":
        return '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>';
      case "pagebreak":
        return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    }
  };

  const blocks: Block[] = [...doc.blocks];
  if (doc.references.length > 0) {
    blocks.push({ type: "heading", level: 2, content: [{ text: "References" }], align: "left" });
    blocks.push({ type: "list", ordered: true, items: doc.references.map((reference) => ({ level: 0, content: [{ text: reference.title, href: reference.url }] })) });
  }

  const body = blocks.map(block).join("");
  const landscape = doc.page.width > doc.page.height ? ' w:orient="landscape"' : "";
  const section = `<w:sectPr><w:footerReference w:type="default" r:id="rId4"/><w:pgSz w:w="${mmToTwips(doc.page.width)}" w:h="${mmToTwips(doc.page.height)}"${landscape}/><w:pgMar w:top="${mmToTwips(doc.page.top)}" w:right="${mmToTwips(doc.page.right)}" w:bottom="${mmToTwips(doc.page.bottom)}" w:left="${mmToTwips(doc.page.left)}" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>`;
  const documentXml = `${header}<w:document ${W}><w:body>${body}${section}</w:body></w:document>`;

  const relationships = [
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>',
    '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>',
    ...[...links].map(([url, id]) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${esc(url)}" TargetMode="External"/>`),
  ].join("");

  const footer = `${header}<w:ftr ${W}><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;

  return zip([
    { name: "[Content_Types].xml", data: `${header}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
    { name: "_rels/.rels", data: `${header}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
    { name: "docProps/core.xml", data: `${header}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(doc.title)}</dc:title><dc:creator>Undocx</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created></cp:coreProperties>` },
    { name: "word/document.xml", data: documentXml },
    { name: "word/_rels/document.xml.rels", data: `${header}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationships}</Relationships>` },
    { name: "word/styles.xml", data: styles() },
    { name: "word/numbering.xml", data: numbering(orderedLists) },
    { name: "word/footer1.xml", data: footer },
  ]);
}
