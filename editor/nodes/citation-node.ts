import { $dfs } from "@lexical/utils";
import { $getDocument, addClassNamesToElement, DecoratorNode, nodeSchema, stringValue, type DOMConversionMap, type DOMExportOutput, type EditorConfig, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread } from "lexical";

export type SerializedCitationNode = Spread<{ sourceId: string }, SerializedLexicalNode>;

const schema = nodeSchema<CitationNode>()({ sourceId: stringValue() });

export class CitationNode extends DecoratorNode<null> {
  __sourceId: string;

  constructor(sourceId = "", key?: NodeKey) {
    super(key);
    this.__sourceId = sourceId;
  }

  $config() {
    return this.config("citation", { extends: DecoratorNode, json: schema });
  }

  static clone(node: CitationNode): CitationNode {
    return new CitationNode(node.__sourceId, node.__key);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      sup: (element) =>
        element.hasAttribute("data-source-id")
          ? { conversion: (sup) => ({ node: $createCitationNode(sup.getAttribute("data-source-id") ?? "") }), priority: 2 }
          : null,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = $getDocument().createElement("sup");
    dom.setAttribute("data-source-id", this.__sourceId);
    if (typeof config.theme.citation === "string") addClassNamesToElement(dom, config.theme.citation);
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = $getDocument().createElement("sup");
    element.setAttribute("data-source-id", this.__sourceId);
    element.textContent = String($citationNumber(this));
    return { element };
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): null {
    return null;
  }

  isInline(): true {
    return true;
  }

  getSourceId(): string {
    return this.getLatest().__sourceId;
  }

  setSourceId(sourceId: string): this {
    const self = this.getWritable();
    self.__sourceId = sourceId;
    return self;
  }
}

export function $createCitationNode(sourceId: string): CitationNode {
  return new CitationNode(sourceId);
}

export function $isCitationNode(node: LexicalNode | null | undefined): node is CitationNode {
  return node instanceof CitationNode;
}

export function $citationOrder(): string[] {
  const ids: string[] = [];
  for (const { node } of $dfs()) {
    if ($isCitationNode(node) && !ids.includes(node.getSourceId())) ids.push(node.getSourceId());
  }
  return ids;
}

export function $citationNumber(node: CitationNode): number {
  return $citationOrder().indexOf(node.getSourceId()) + 1;
}
