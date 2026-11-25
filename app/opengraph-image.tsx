import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Undocx. AI drafts it. You decide every paragraph.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(process.cwd(), "assets/fonts");
const [newsreader, newsreaderItalic, geist] = await Promise.all([
  readFile(join(fontsDir, "newsreader-500.ttf")),
  readFile(join(fontsDir, "newsreader-500-italic.ttf")),
  readFile(join(fontsDir, "geist-400.ttf")),
]);

const paper = "#FAF7F2";
const ink = "#1C1A17";
const red = "#C8321E";
const rule = "#E5DED2";
const muted = "#6B655C";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: paper, color: ink, fontFamily: "Geist" }}>
        <div style={{ width: 72, display: "flex", borderRight: `1px solid ${rule}` }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px 56px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: 44, letterSpacing: -1 }}>
              <span>Undocx</span>
              <span style={{ color: red }}>.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, letterSpacing: 4, color: muted }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: red }} />
              FREE TO START
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Newsreader", fontSize: 96, lineHeight: 1.02, letterSpacing: -3, whiteSpace: "nowrap" }}>
            <span>AI drafts it. You decide</span>
            <div style={{ display: "flex" }}>
              <span style={{ fontStyle: "italic", color: red }}>every paragraph</span>
              <span>.</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: "100%", borderTop: `1px solid ${rule}`, paddingTop: 24, fontSize: 24, color: muted }}>
            <span>Rewrite one paragraph. Lock another. Export when it reads like you.</span>
            <span style={{ color: ink }}>undocx.app</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: newsreader, weight: 500, style: "normal" },
        { name: "Newsreader", data: newsreaderItalic, weight: 500, style: "italic" },
        { name: "Geist", data: geist, weight: 400, style: "normal" },
      ],
    },
  );
}
