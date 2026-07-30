import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** App icon / favicon — cardinal-red disc with a gold music note. */
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
          background: "#BC0424",
          color: "#FDB321",
          fontSize: 340,
          fontFamily: "sans-serif",
          borderRadius: 96,
        }}
      >
        ♪
      </div>
    ),
    size,
  );
}
