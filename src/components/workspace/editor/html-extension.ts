import { defineExtension } from "lexical"

import { HtmlNode } from "./html-node"

export const HtmlExtension = defineExtension({
  name: "renderical/html",
  nodes: [HtmlNode],
})
