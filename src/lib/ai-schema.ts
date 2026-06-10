import { z } from "zod"

// Compressed Lexical type system injected into the system prompt
// format bitmask: 0=plain 1=bold 2=italic 8=underline 16=code (combinable, e.g. 3=bold+italic)
const LEXICAL_TYPES = `
type TN={type:"text",text:string,format:number,detail:0,mode:"normal",style:"",version:1}
type LN={type:"link",url:string,rel:"noopener",target:null,title:null,children:TN[],direction:"ltr",format:"",indent:0,version:1}
type FN={type:"footnote",text:string,version:1}
type MI={type:"math",display:"inline",html:string,version:1}
type Inline=TN|LN|FN|MI
type PN={type:"paragraph",children:Inline[],direction:"ltr",format:"",indent:number,version:1,textFormat:0,textStyle:""}
type HN={type:"heading",tag:"h1"|"h2"|"h3"|"h4"|"h5"|"h6",children:Inline[],direction:"ltr",format:"",indent:0,version:1}
type QN={type:"quote",children:Inline[],direction:"ltr",format:"",indent:0,version:1}
type HR={type:"horizontalrule",version:1}
type CN={type:"callout",calloutType:"note"|"tip"|"warning"|"danger",children:[PN],direction:"ltr",format:"",indent:0,version:1}
type LI={type:"listitem",value:number,children:Inline[],direction:"ltr",format:"",indent:number,version:1}
type LST={type:"list",listType:"bullet"|"number",tag:"ul"|"ol",children:LI[],direction:"ltr",format:"",indent:0,version:1,start:1}
type CODE={type:"code",language:string,children:[TN],direction:"ltr",format:"",indent:0,version:1}
type TC={type:"tablecell",headerState:0|1,colSpan:1,rowSpan:1,width:null,children:[PN],direction:"ltr",format:"",indent:0,version:1}
type TR={type:"tablerow",children:TC[],height:0,direction:"ltr",format:"",indent:0,version:1}
type TB={type:"table",children:TR[],colWidths:number[],rowStriping:true,direction:"ltr",format:"",indent:0,version:1}
type SVG={type:"svg",html:string,version:1}
type MB={type:"math",display:"block",html:string,version:1}
type Block=PN|HN|QN|HR|CN|LST|CODE|TB|SVG|MB
type Root={type:"root",children:Block[],direction:"ltr",format:"",indent:0,version:1}
`

export const SYSTEM_PROMPT = `You are Renderical Copilot, an expert content generation assistant.

Given a topic and format, generate a comprehensive document and respond with ONLY a valid JSON object (no markdown code fences, no extra text).

Required JSON structure:
{"title":"Document Title","editorState":{"root":{Root node}}}

Node type system — every field is required, use exact values shown:
${LEXICAL_TYPES}
Format instructions (user specifies in their message):
- auto: choose the richest mix of block types for the topic
- table: use TB nodes for comparisons/data, add PN context around them
- mindmap: nested LST nodes with LI at indent:0/1/2 for hierarchy
- flashcard_deck: alternating HN (question) then PN (answer) pairs
- quiz: numbered LST for questions, CN "note" for answers
- outline: h1→h2→h3 structure with brief PN summaries

Document style rules:
- Always begin with an introductory PN before the first heading
- Use HN h1 for main sections, h2 for sub-sections
- Add CN callouts (note/tip/warning/danger) to highlight key insights
- Use HR to separate major sections
- Include at least 4 substantive sections
- Be accurate, thorough, and informative
- Output ONLY the JSON — no markdown fences, no additional text`

// ── Leaf nodes ────────────────────────────────────────────────────────────────

// z.literal() generates {"const":"x"} in Zod 4 which Gemini rejects.
// z.string().describe("must be 'x'") generates {"type":"string","description":"..."} which Gemini accepts.

const TextNode = z.object({
  type: z.string().describe("must be 'text'"),
  text: z.string(),
  format: z.number(),
  detail: z.number(),
  mode: z.string(),
  style: z.string(),
  version: z.number(),
})

const LinkNode = z.object({
  type: z.string().describe("must be 'link'"),
  url: z.string(),
  rel: z.string(),
  target: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  children: z.array(TextNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const FootnoteNode = z.object({
  type: z.string().describe("must be 'footnote'"),
  text: z.string(),
  version: z.number(),
})

const MathNode = z.object({
  type: z.string().describe("must be 'math'"),
  display: z.enum(["inline", "block"]),
  html: z.string(),
  version: z.number(),
})

const InlineNode = z.union([TextNode, LinkNode, FootnoteNode, MathNode])

// ── Block nodes ───────────────────────────────────────────────────────────────

const ParagraphNode = z.object({
  type: z.string().describe("must be 'paragraph'"),
  children: z.array(InlineNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
  textFormat: z.number(),
  textStyle: z.string(),
})

const HeadingNode = z.object({
  type: z.string().describe("must be 'heading'"),
  tag: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]),
  children: z.array(InlineNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const QuoteNode = z.object({
  type: z.string().describe("must be 'quote'"),
  children: z.array(InlineNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const HorizontalRuleNode = z.object({
  type: z.string().describe("must be 'horizontalrule'"),
  version: z.number(),
})

const CalloutNode = z.object({
  type: z.string().describe("must be 'callout'"),
  calloutType: z.enum(["note", "tip", "warning", "danger"]),
  children: z.array(ParagraphNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const ListItemNode = z.object({
  type: z.string().describe("must be 'listitem'"),
  value: z.number(),
  children: z.array(InlineNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const ListNode = z.object({
  type: z.string().describe("must be 'list'"),
  listType: z.enum(["bullet", "number"]),
  tag: z.enum(["ul", "ol"]),
  children: z.array(ListItemNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
  start: z.number(),
})

const CodeNode = z.object({
  type: z.string().describe("must be 'code'"),
  language: z.string(),
  children: z.array(TextNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const TableCellNode = z.object({
  type: z.string().describe("must be 'tablecell'"),
  headerState: z.number(),
  colSpan: z.number(),
  rowSpan: z.number(),
  width: z.number().nullable().optional(),
  children: z.array(ParagraphNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const TableRowNode = z.object({
  type: z.string().describe("must be 'tablerow'"),
  children: z.array(TableCellNode),
  height: z.number(),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const TableNode = z.object({
  type: z.string().describe("must be 'table'"),
  children: z.array(TableRowNode),
  colWidths: z.array(z.number()),
  rowStriping: z.boolean(),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

const SvgNode = z.object({
  type: z.string().describe("must be 'svg'"),
  html: z.string(),
  version: z.number(),
})

const BlockNode = z.union([
  ParagraphNode,
  HeadingNode,
  QuoteNode,
  HorizontalRuleNode,
  CalloutNode,
  ListNode,
  CodeNode,
  TableNode,
  SvgNode,
  MathNode,
])

// ── Root ──────────────────────────────────────────────────────────────────────

const RootNode = z.object({
  type: z.string().describe("must be 'root'"),
  children: z.array(BlockNode),
  direction: z.string(),
  format: z.string(),
  indent: z.number(),
  version: z.number(),
})

export const outputSchema = z.object({
  title: z.string().min(1),
  editorState: z.object({
    root: RootNode,
  }),
})

export type GeneratedOutput = z.infer<typeof outputSchema>
