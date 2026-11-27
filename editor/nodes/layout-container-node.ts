import { $getDocument, addClassNamesToElement, ElementNode, nodeSchema, stringValue, type DOMExportOutput, type EditorConfig, type LexicalNode, type NodeKey, type SerializedElementNode, type Spread } from "lexical";

export type SerializedLayoutContainerNode = Spread<{ templateColumns: string }, SerializedElementNode>;

const schema = nodeSchema<LayoutContainerNode>()({ templateColumns: stringValue() });

export class LayoutContainerNode extends ElementNode {
  __templateColumns: string;

  constructor(templateColumns = "", key?: NodeKey) {
    super(key);
    this.__templateColumns = templateColumns;
  }

  $config() {
    return this.config("layout-container", { extends: ElementNode, json: schema });
  }

  static clone(node: LayoutContainerNode): LayoutContainerNode {
    return new LayoutContainerNode(node.__templateColumns, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = $getDocument().createElement("div");
    dom.style.gridTemplateColumns = this.__templateColumns;
    if (typeof config.theme.layoutContainer === "string") addClassNamesToElement(dom, config.theme.layoutContainer);
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = $getDocument().createElement("div");
    element.style.gridTemplateColumns = this.__templateColumns;
    element.setAttribute("data-lexical-layout-container", "true");
    return { element };
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    if (prevNode.__templateColumns !== this.__templateColumns) dom.style.gridTemplateColumns = this.__templateColumns;
    return false;
  }

  isShadowRoot(): boolean {
    return true;
  }

  canBeEmpty(): boolean {
    return false;
  }

  getTemplateColumns(): string {
    return this.getLatest().__templateColumns;
  }

  setTemplateColumns(templateColumns: string): this {
    const self = this.getWritable();
    self.__templateColumns = templateColumns;
    return self;
  }
}

export function $createLayoutContainerNode(templateColumns = ""): LayoutContainerNode {
  return new LayoutContainerNode(templateColumns);
}

export function $isLayoutContainerNode(node: LexicalNode | null | undefined): node is LayoutContainerNode {
  return node instanceof LayoutContainerNode;
}
