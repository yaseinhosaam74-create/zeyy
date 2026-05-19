"use client";
// src/components/animations/Marquee.tsx

interface Props {
  items:     string[];
  speed?:    number;
  direction?:"left"|"right";
}

export function Marquee({ items, speed = 25, direction = "left" }: Props) {
  const doubled = [...items, ...items, ...items];
  const dur     = `${items.length * speed}s`;

  return (
    <div
      style={{
        overflow:        "hidden",
        borderTop:       "1px solid var(--color-border)",
        borderBottom:    "1px solid var(--color-border)",
        padding:         "14px 0",
        background:      "var(--color-bg)",
      }}
    >
      <div
        style={{
          display:     "flex",
          whiteSpace:  "nowrap",
          animation:   `marquee-${direction} ${dur} linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily:    "Cormorant Garamond, serif",
              fontStyle:     "italic",
              fontSize:      "13px",
              letterSpacing: "0.05em",
              color:         "var(--color-text)",
              opacity:       0.5,
              marginInline:  "28px",
            }}
          >
            {item}
            <span style={{ marginInline: "28px", opacity: 0.3 }}>·</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee-left  { from { transform: translateX(0); }        to { transform: translateX(-33.33%); } }
        @keyframes marquee-right { from { transform: translateX(-33.33%); }  to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
