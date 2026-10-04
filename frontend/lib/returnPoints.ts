import type { StoreBrand } from "@/components/StoreBadge";

export type PointStatus = "working" | "queue" | "broken";

export interface ReturnPoint {
  id: string;
  brand: StoreBrand;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  status: PointStatus;
  accepts: string[];
  lastReport: string;
}

/** Demo location: Tauron Arena Kraków, ul. Stanisława Lema 7. */
export const demoUserLocation = {
  label: "Tauron Arena Kraków",
  latitude: 50.0678,
  longitude: 20.0157,
};

export const returnPoints: ReturnPoint[] = [
  {
    id: "zabka-lema",
    brand: "zabka",
    name: "Żabka Czyżyny",
    address: "ul. Stanisława Lema 7",
    latitude: 50.0689,
    longitude: 20.0141,
    distanceMeters: 180,
    status: "working",
    accepts: ["Bottles", "Cans"],
    lastReport: "4 min ago",
  },
  {
    id: "biedronka-jp2",
    brand: "biedronka",
    name: "Biedronka Jana Pawła II",
    address: "ul. Jana Pawła II 43",
    latitude: 50.0714,
    longitude: 20.0053,
    distanceMeters: 850,
    status: "working",
    accepts: ["Bottles", "Cans", "Glass"],
    lastReport: "22 min ago",
  },
  {
    id: "zabka-pokoju",
    brand: "zabka",
    name: "Żabka Plaza",
    address: "al. Pokoju 67",
    latitude: 50.0661,
    longitude: 19.9997,
    distanceMeters: 1100,
    status: "queue",
    accepts: ["Cans"],
    lastReport: "9 min ago",
  },
  {
    id: "lidl-centralna",
    brand: "lidl",
    name: "Lidl Centralna",
    address: "ul. Centralna 29",
    latitude: 50.0703,
    longitude: 19.9986,
    distanceMeters: 1300,
    status: "working",
    accepts: ["Bottles", "Cans", "Glass"],
    lastReport: "1 h ago",
  },
  {
    id: "biedronka-bora",
    brand: "biedronka",
    name: "Biedronka Bora-Komorowskiego",
    address: "ul. Bora-Komorowskiego 31",
    latitude: 50.0829,
    longitude: 20.0169,
    distanceMeters: 1700,
    status: "working",
    accepts: ["Bottles", "Cans"],
    lastReport: "35 min ago",
  },
  {
    id: "lidl-mogilska",
    brand: "lidl",
    name: "Lidl Mogilska",
    address: "ul. Mogilska 102",
    latitude: 50.0709,
    longitude: 19.9845,
    distanceMeters: 2200,
    status: "broken",
    accepts: ["Bottles", "Cans"],
    lastReport: "2 h ago",
  },
];

export const statusStyles: Record<
  PointStatus,
  { label: string; text: string; background: string; border: string; dot: string }
> = {
  working: {
    label: "Working",
    text: "text-emerald-300",
    background: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    dot: "bg-emerald-400",
  },
  queue: {
    label: "Long queue",
    text: "text-amber-300",
    background: "bg-amber-400/10",
    border: "border-amber-400/30",
    dot: "bg-amber-400",
  },
  broken: {
    label: "Out of order",
    text: "text-red-300",
    background: "bg-red-400/10",
    border: "border-red-400/30",
    dot: "bg-red-400",
  },
};

export function formatDistance(meters: number) {
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
}
