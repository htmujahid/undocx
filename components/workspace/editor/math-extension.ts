"use client"

import { defineExtension } from "lexical"

import { MathNode } from "./math-node"

export const MathExtension = defineExtension({
  name: "undocx/math",
  nodes: [MathNode],
})
