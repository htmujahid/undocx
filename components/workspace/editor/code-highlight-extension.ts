"use client"

import { $nodesOfType, configExtension, defineExtension } from "lexical"

import { CodeNode } from "@lexical/code"
import { CodeShikiExtension, ShikiTokenizer } from "@lexical/code-shiki"
import { getExtensionDependencyFromEditor } from "@lexical/extension"

const LIGHT_THEME = "github-light"
const DARK_THEME = "github-dark"

function isDarkMode(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  )
}

function currentTheme(): string {
  return isDarkMode() ? DARK_THEME : LIGHT_THEME
}

export const CodeHighlightExtension = defineExtension({
  name: "undocx/code-highlight",
  dependencies: [configExtension(CodeShikiExtension, { disabled: true })],
  afterRegistration(editor) {
    const { output } = getExtensionDependencyFromEditor(
      editor,
      CodeShikiExtension
    )

    output.tokenizer.value = {
      ...ShikiTokenizer,
      defaultTheme: currentTheme(),
    }
    output.disabled.value = false

    const applyThemeToAllCodeNodes = () => {
      const theme = currentTheme()
      editor.update(() => {
        for (const node of $nodesOfType(CodeNode)) {
          node.setTheme(theme)
        }
      })
    }

    applyThemeToAllCodeNodes()

    if (typeof document === "undefined") {
      return () => {
        output.disabled.value = true
      }
    }

    const observer = new MutationObserver(applyThemeToAllCodeNodes)
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
