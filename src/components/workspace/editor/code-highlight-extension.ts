import { $isCodeNode } from "@lexical/code"
import { CodeShikiExtension, ShikiTokenizer } from "@lexical/code-shiki"
import { getExtensionDependencyFromEditor } from "@lexical/extension"
import { $getRoot, configExtension, defineExtension } from "lexical"

const LIGHT_THEME = "github-light"
const DARK_THEME = "github-dark"

function isDarkMode(): boolean {
  return typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
}

export const CodeHighlightExtension = defineExtension({
  name: "renderical/code-highlight",
  dependencies: [configExtension(CodeShikiExtension, { disabled: true })],
  afterRegistration(editor) {
    const { output } = getExtensionDependencyFromEditor(editor, CodeShikiExtension)

    // Pick the right default theme before enabling so the first highlight uses
    // the correct palette when the page already starts in dark mode.
    output.tokenizer.value = {
      ...ShikiTokenizer,
      defaultTheme: isDarkMode() ? DARK_THEME : LIGHT_THEME,
    }
    output.disabled.value = false

    // Re-highlight all code nodes whenever the .dark class is toggled on <html>.
    const observer = new MutationObserver(() => {
      const newTheme = isDarkMode() ? DARK_THEME : LIGHT_THEME
      editor.update(() => {
        for (const node of $getRoot().getChildren()) {
          if ($isCodeNode(node)) {
            node.setTheme(newTheme)
          }
        }
      })
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      observer.disconnect()
      output.disabled.value = true
    }
  },
})
