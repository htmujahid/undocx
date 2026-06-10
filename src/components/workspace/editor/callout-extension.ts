import { defineExtension } from "lexical"

import { CalloutNode } from "./callout-node"

export const CalloutExtension = defineExtension({
  name: "renderical/callout",
  nodes: [CalloutNode],
})
