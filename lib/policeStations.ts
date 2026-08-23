export const POLICE_STATIONS = [
  "AHTU Thana",
  "Other",
  "SC/ST Thana",
  "Kujju OP",
  "Gola",
  "Patratu",
  "Barkakana OP",
  "Barlanga",
  "Basal",
  "Bhadani Nagar OP",
  "Bhurkunda OP",
  "Mahila Thana",
  "Mandu",
  "Rajrappa",
  "Ramgarh",
  "West Bokaro OP",
  "Cyber Thana",
] as const;

export type PoliceStation = (typeof POLICE_STATIONS)[number];

export function isValidPoliceStation(value: string | null | undefined): boolean {
  if (!value) return false;
  return (POLICE_STATIONS as readonly string[]).includes(value);
}
