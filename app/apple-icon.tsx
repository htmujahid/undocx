import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const newsreader = await readFile(join(process.cwd(), "assets/fonts/newsreader-500.ttf"));

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F2",
          color: "#1C1A17",
          fontFamily: "Newsreader",
          fontSize: 136,
          lineHeight: 1,
          paddingBottom: 10,
        }}
      >
        <span style={{ marginLeft: 6 }}>U</span>
        <span style={{ color: "#C8321E" }}>.</span>
      </div>
    ),
    { ...size, fonts: [{ name: "Newsreader", data: newsreader, weight: 500, style: "normal" }] },
  );
}
