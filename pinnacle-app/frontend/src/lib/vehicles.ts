// Vehicle catalog — all Pinnacle Motors nameplates with similarity dimensions.
// Dimensions drive the weighted-Jaccard engine in related.ts.

export interface Vehicle {
  id: string;           // slug, e.g. "ridge"
  name: string;         // full marketing name
  model: string;        // matches inventory.json / DTC keys
  modelYear: number;
  segment: string[];    // e.g. ["suv", "midsize"]
  powertrain: string[]; // e.g. ["v6", "awd"]
  platform: string[];   // e.g. ["lambda2", "rwd_flex"]
  region: string[];     // primary sales region(s)
  fleetCohort: string[];// fleet program tags
  telematicsIssues: string[]; // top DTC codes from connected-car data
}

export const VEHICLES: Vehicle[] = [
  {
    id: "ridge",
    name: "Pinnacle Ridge",
    model: "Pinnacle Ridge",
    modelYear: 2024,
    segment: ["suv", "midsize", "crossover"],
    powertrain: ["v6", "awd", "gasoline"],
    platform: ["lambda2", "rwd_flex"],
    region: ["midwest", "south", "west"],
    fleetCohort: ["consumer", "family"],
    telematicsIssues: ["P0171", "P2096", "P0128"],
  },
  {
    id: "summit",
    name: "Pinnacle Summit SUV",
    model: "Pinnacle Summit SUV",
    modelYear: 2024,
    segment: ["suv", "midsize", "flagship", "crossover"],
    powertrain: ["v6", "awd", "gasoline", "mild_hybrid"],
    platform: ["lambda2", "rwd_flex"],
    region: ["west", "northeast", "south"],
    fleetCohort: ["consumer", "premium"],
    telematicsIssues: ["C1241", "P0128"],
  },
  {
    id: "volt",
    name: "Pinnacle Volt EV",
    model: "Pinnacle Volt EV",
    modelYear: 2025,
    segment: ["ev", "crossover", "midsize"],
    powertrain: ["electric", "awd", "battery_ev"],
    platform: ["bev3", "skateboard"],
    region: ["west", "northeast"],
    fleetCohort: ["consumer", "tech_early_adopter"],
    telematicsIssues: ["U0100", "P1AAA"],
  },
  {
    id: "crest",
    name: "Pinnacle Crest",
    model: "Pinnacle Crest",
    modelYear: 2023,
    segment: ["sedan", "midsize"],
    powertrain: ["i4_turbo", "fwd", "gasoline"],
    platform: ["epsilon3", "fwd_flex"],
    region: ["midwest", "south", "northeast"],
    fleetCohort: ["consumer", "fleet_rental", "corporate"],
    telematicsIssues: ["P0420", "B1318", "P0128"],
  },
  {
    id: "haul_hd",
    name: "Pinnacle Haul HD",
    model: "Pinnacle Haul HD",
    modelYear: 2024,
    segment: ["truck", "fullsize", "body_on_frame"],
    powertrain: ["v8", "rwd", "gasoline", "tow_package"],
    platform: ["t1xx", "rwd_flex"],
    region: ["south", "midwest", "west"],
    fleetCohort: ["commercial", "fleet_work", "consumer"],
    telematicsIssues: ["P0300", "P0128"],
  },
  {
    id: "vista",
    name: "Pinnacle Vista",
    model: "Pinnacle Vista",
    modelYear: 2024,
    segment: ["crossover", "compact", "suv"],
    powertrain: ["i4_turbo", "fwd", "gasoline"],
    platform: ["epsilon3", "fwd_flex"],
    region: ["west", "northeast", "south"],
    fleetCohort: ["consumer", "fleet_rental", "young_buyer"],
    telematicsIssues: ["P0455", "P0128"],
  },
];

export function vehicleById(id: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.id === id);
}
