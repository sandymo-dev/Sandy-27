import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { event } from "@/data/event";

// The link preview WhatsApp shows when you send the invite.
export const alt = `${event.host.name} ${event.host.age} — ${event.tourName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [anton, marker] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/anton.woff")),
    readFile(join(process.cwd(), "src/assets/permanent-marker.woff")),
  ]);

  const squares = Array.from({ length: 67 }, (_, i) => i);
  const Checker = () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {[0, 1].map((row) => (
        <div key={row} style={{ display: "flex" }}>
          {squares.map((i) => (
            <div key={i} style={{ width: 18, height: 18, background: (i + row) % 2 ? "#0A0A0A" : "#F5F5F0" }} />
          ))}
        </div>
      ))}
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0A0A0A", color: "#F5F5F0" }}>
        <Checker />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
          <div style={{ display: "flex", fontFamily: "Marker", fontSize: 44, transform: "rotate(-3deg)", marginBottom: 10 }}>
            You&apos;re on the list!
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 36 }}>
            <div style={{ display: "flex", fontFamily: "Anton", fontSize: 220, lineHeight: 0.9 }}>{event.host.name.toUpperCase()}</div>
            <div style={{ display: "flex", fontFamily: "Anton", fontSize: 220, lineHeight: 0.9 }}>{event.host.age}</div>
          </div>
          <div style={{ display: "flex", marginTop: 24 }}>
            <div style={{ display: "flex", fontFamily: "Anton", fontSize: 60, background: "#F5F5F0", color: "#0A0A0A", padding: "4px 22px", letterSpacing: 3, transform: "rotate(-1.5deg)" }}>
              {event.tourName}
            </div>
          </div>
        </div>
        <Checker />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, style: "normal", weight: 400 },
        { name: "Marker", data: marker, style: "normal", weight: 400 },
      ],
    },
  );
}
