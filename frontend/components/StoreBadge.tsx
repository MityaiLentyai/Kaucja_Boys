import { Bug } from "lucide-react";

export type StoreBrand = "lidl" | "zabka" | "biedronka";

const brands: Record<
  StoreBrand,
  { label: string; background: string; ring: string; foreground: string; initial: string }
> = {
  lidl: {
    label: "Lidl",
    background: "#0050AA",
    ring: "#FFF000",
    foreground: "#FFFFFF",
    initial: "L",
  },
  zabka: {
    label: "Żabka",
    background: "#00843D",
    ring: "#8DC63F",
    foreground: "#FFFFFF",
    initial: "Ż",
  },
  biedronka: {
    label: "Biedronka",
    background: "#E3000F",
    ring: "#FFD100",
    foreground: "#FFD100",
    initial: "B",
  },
};

export default function StoreBadge({
  brand,
  size = 44,
}: {
  brand: StoreBrand;
  size?: number;
}) {
  const { label, background, ring, foreground, initial } = brands[brand];

  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold"
      style={{
        width: size,
        height: size,
        background,
        color: foreground,
        boxShadow: `inset 0 0 0 2px ${ring}`,
        fontSize: size * 0.45,
      }}
    >
      {brand === "biedronka" ? (
        <Bug style={{ width: size * 0.55, height: size * 0.55 }} />
      ) : (
        initial
      )}
    </span>
  );
}
