import { ImageResponse } from "next/og"

export const alt = "Undocx: AI content. Every format."
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="56"
          height="56"
          fill="none"
          stroke="#fafafa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16M4 10h16M4 14h8M4 18h8" />
          <path d="M19 14l-3 3 3 3" />
          <path d="m22 14-3 3 3 3" />
        </svg>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 600 }}>
          Undocx
        </div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 48,
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
        }}
      >
        AI content. Every format.
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 28,
          maxWidth: 760,
          fontSize: 30,
          color: "rgba(250, 250, 250, 0.55)",
          lineHeight: 1.4,
        }}
      >
        Generate, organize, and edit AI content in adaptive layout formats, all
        in one knowledge base.
      </div>
    </div>,
    {
      ...size,
    }
  )
}
