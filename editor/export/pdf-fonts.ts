export type FontKey = "regular" | "bold" | "italic" | "boldItalic" | "mono";

export const fonts: Record<FontKey, { id: string; name: string }> = {
  regular: { id: "F1", name: "Helvetica" },
  bold: { id: "F2", name: "Helvetica-Bold" },
  italic: { id: "F3", name: "Helvetica-Oblique" },
  boldItalic: { id: "F4", name: "Helvetica-BoldOblique" },
  mono: { id: "F5", name: "Courier" },
};

const regular = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
  667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const bold = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
  667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

const cp1252: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e,
  0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

const special: Record<number, [number, number]> = {
  0x80: [556, 556], 0x85: [1000, 1000], 0x91: [222, 278], 0x92: [222, 278], 0x93: [333, 500], 0x94: [333, 500], 0x95: [350, 350], 0x96: [556, 556], 0x97: [1000, 1000], 0x99: [1000, 1000],
  0xa0: [278, 278], 0xa3: [556, 556], 0xa9: [737, 737], 0xae: [737, 737], 0xb0: [400, 400], 0xb1: [584, 584], 0xd7: [584, 584], 0xf7: [584, 584],
};

export function toWinAnsi(codePoint: number) {
  if (codePoint >= 32 && codePoint <= 126) return codePoint;
  if (codePoint >= 160 && codePoint <= 255) return codePoint;
  if (cp1252[codePoint]) return cp1252[codePoint];
  if (codePoint === 9 || codePoint === 160) return 32;
  return 63;
}

export function charWidth(code: number, font: FontKey) {
  if (font === "mono") return 600;
  const isBold = font === "bold" || font === "boldItalic";
  if (code >= 32 && code <= 126) return (isBold ? bold : regular)[code - 32];
  const known = special[code];
  if (known) return known[isBold ? 1 : 0];
  if (code >= 0xc0) {
    const base = String.fromCharCode(code).normalize("NFD").charCodeAt(0);
    if (base >= 32 && base <= 126) return (isBold ? bold : regular)[base - 32];
  }
  return 556;
}
