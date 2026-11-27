import { $getDocument, addClassNamesToElement, DecoratorNode, type DOMConversionMap, type DOMExportOutput, type EditorConfig, type LexicalNode, type SerializedLexicalNode } from "lexical";

export type SerializedPageBreakNode = SerializedLexicalNode;

export class PageBreakNode extends DecoratorNode<null> {
  $config() {
    return this.config("page-break", { extends: DecoratorNode });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: (element) => (element.hasAttribute("data-lexical-page-break") ? { conversion: () => ({ node: $createPageBreakNode() }), priority: 2 } : null),
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = $getDocument().createElement("hr");
    dom.setAttribute("data-lexical-page-break", "true");
    if (typeof config.theme.pageBreak === "string") addClassNamesToElement(dom, config.theme.pageBreak);
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = $getDocument().createElement("hr");
    element.style.pageBreakAfter = "always";
    element.setAttribute("data-lexical-page-break", "true");
    return { element };
  }

  getTextContent(): string {
    return "\n";
  }

  isInline(): false {
    return false;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): null {
    return null;
  }
}

export function $createPageBreakNode(): PageBreakNode {
  return new PageBreakNode();
}

export function $isPageBreakNode(node: LexicalNode | null | undefined): node is PageBreakNode {
  return node instanceof PageBreakNode;
}
