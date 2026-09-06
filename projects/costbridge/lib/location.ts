import type { Location } from "@/lib/types";

const zipCoordinates: Record<string, Pick<Location, "latitude" | "longitude">> = {
  "33602": { latitude: 27.9553, longitude: -82.4563 },
  "33603": { latitude: 27.9857, longitude: -82.4616 },
  "33604": { latitude: 28.0178, longitude: -82.4598 },
  "33605": { latitude: 27.9636, longitude: -82.4332 },
  "33606": { latitude: 27.9338, longitude: -82.4644 },
  "33607": { latitude: 27.9628, longitude: -82.4896 },
  "33610": { latitude: 27.9953, longitude: -82.3949 },
  "33611": { latitude: 27.8918, longitude: -82.5057 },
  "33612": { latitude: 28.0506, longitude: -82.4494 },
  "33614": { latitude: 28.0058, longitude: -82.5054 },
  "33615": { latitude: 28.0081, longitude: -82.5797 },
  "33617": { latitude: 28.0427, longitude: -82.3949 },
  "33618": { latitude: 28.0754, longitude: -82.4925 },
  "33511": { latitude: 27.9146, longitude: -82.2937 },
  "33578": { latitude: 27.8661, longitude: -82.3289 },
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getCoordinatesForZip(zip: string) {
  const known = zipCoordinates[zip];
  if (known) return { ...known, estimated: false };

  const numeric = Number(zip);
  const offsetA = Number.isFinite(numeric) ? ((numeric % 97) - 48) / 700 : 0;
  const offsetB = Number.isFinite(numeric) ? ((numeric % 83) - 41) / 700 : 0;
  return {
    latitude: 27.9506 + offsetA,
    longitude: -82.4572 + offsetB,
    estimated: true,
  };
}

export function calculateDistanceMiles(
  from: Pick<Location, "latitude" | "longitude">,
  to: Pick<Location, "latitude" | "longitude">,
) {
  const earthRadiusMiles = 3958.8;
  const latitudeDifference = toRadians(to.latitude - from.latitude);
  const longitudeDifference = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
