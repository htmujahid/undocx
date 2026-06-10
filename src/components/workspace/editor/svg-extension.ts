import { defineExtension } from "lexical"

import { SvgNode } from "./svg-node"

export const SvgExtension = defineExtension({
  name: "renderical/svg",
  nodes: [SvgNode],
})
