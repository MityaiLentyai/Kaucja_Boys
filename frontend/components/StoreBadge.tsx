import Image from "next/image";

export type StoreBrand = "lidl" | "zabka" | "biedronka";

export const brands: Record<StoreBrand, { label: string; logo: string }> = {
  lidl: { label: "Lidl", logo: "/brands/lidl.svg" },
  zabka: { label: "Żabka", logo: "/brands/zabka.svg" },
  biedronka: { label: "Biedronka", logo: "/brands/biedronka.svg" },
};

export default function StoreBadge({ brand, size = 44 }: { brand: StoreBrand; size?: number }) {
  const { label, logo } = brands[brand];

  return (
    <Image
      src={logo}
      alt={label}
      width={size}
      height={size}
      className="shrink-0 rounded-full bg-white ring-1 ring-black/20"
    />
  );
}
