"use client"

import { defineExtension } from "lexical"

import { SvgNode } from "./svg-node"

export const SvgExtension = defineExtension({
  name: "undocx/svg",
  nodes: [SvgNode],
})
