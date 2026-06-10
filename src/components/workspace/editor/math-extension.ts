import { defineExtension } from "lexical"

import { MathNode } from "./math-node"

export const MathExtension = defineExtension({
  name: "renderical/math",
  nodes: [MathNode],
})
