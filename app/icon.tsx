import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const newsreader = await readFile(join(process.cwd(), "assets/fonts/newsreader-500.ttf"));

export default function Icon() {
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
          border: "1px solid #E5DED2",
          borderRadius: 6,
          color: "#1C1A17",
          fontFamily: "Newsreader",
          fontSize: 26,
          lineHeight: 1,
          paddingBottom: 2,
        }}
      >
        <span style={{ marginLeft: 1 }}>U</span>
        <span style={{ color: "#C8321E" }}>.</span>
      </div>
    ),
    { ...size, fonts: [{ name: "Newsreader", data: newsreader, weight: 500, style: "normal" }] },
  );
}
