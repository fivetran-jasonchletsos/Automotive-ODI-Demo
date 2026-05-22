// ============================================================
// Pinnacle Motors ODI demo — shared types.
// Mirrors gold-layer dbt models on Apache Iceberg:
//   gold.dim_dealers
//   gold.dim_vehicles
//   gold.fct_production_daily
//   gold.fct_dealer_inventory_daily
//   gold.fct_telemetry_health_signals
//   gold.fct_warranty_claims
//   gold.fct_quality_recall_risk_signal
// ============================================================

export interface SummaryStats {
  units_built_ytd: number;
  dealer_count: number;
  connected_vehicles: number;
  oem_csi: number;
  warranty_rate_per_1000: number;
  active_plants: number;
  nameplates: number;
  iceberg_table_count: number;
  bronze_rows: number;
  silver_rows: number;
  gold_rows: number;
  s3_bytes: number;
  last_sync_at: string;
  generated_at: string;
  source: 'live' | 'demo';
}

export interface Plant {
  plant_code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  nameplates: string[];
  units_per_shift: number;
  shifts_per_day: number;
  takt_time_seconds: number;
  oee_pct: number;
  first_time_quality_pct: number;
  backlog_units: number;
  target_units: number;
  status: 'on_pace' | 'ahead' | 'constrained' | 'chip_constrained';
}

export interface ProductionData {
  as_of: string;
  plants: Plant[];
  daily_pace: { date: string; units: number }[];
}

export interface Dealer {
  dealer_id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  region: string;
  days_on_lot: number;
  gross_margin_pct: number;
  csi: number;
  sales_pace_units_mo: number;
  top_grossing_model: string;
}

export interface RegionRollup {
  region: string;
  dealer_count: number;
  avg_csi: number;
  avg_days_on_lot: number;
  avg_gross_margin_pct: number;
  units_per_month: number;
}

export interface DealersData {
  as_of: string;
  dealers: Dealer[];
  region_rollups: RegionRollup[];
  total_count: number;
}

export interface InventoryModelRow {
  model: string;
  segment: string;
  in_transit: number;
  at_port: number;
  on_dealer_lot: number;
  days_supply: number;
  msrp_band: string;
  demand_signal: 'soft' | 'stable' | 'strong' | 'very_strong';
  constraint: string | null;
}

export interface InventoryData {
  as_of: string;
  by_model: InventoryModelRow[];
  bottleneck_story: {
    headline: string;
    detail: string;
    actions: string[];
  };
}

export interface DTC {
  dtc: string;
  name: string;
  model: string;
  model_year: number;
  count: number;
  trend_pct_30d: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

export interface PredictiveAlert {
  alert_type: string;
  vehicles_flagged: number;
  model: string;
  expected_failure_window_days: number;
  confidence: number;
}

export interface ConnectedCarData {
  as_of: string;
  active_vehicles: number;
  telemetry_events_per_day: number;
  ota_program: {
    active_campaigns: number;
    rolling_release_pct: number;
    last_30d_success_rate_pct: number;
    last_30d_attempts: number;
    failed_attempts: number;
    top_failure_reason: string;
  };
  top_dtcs: DTC[];
  predictive_maintenance_alerts: PredictiveAlert[];
  fleet_health: {
    vehicles_with_active_dtc: number;
    vehicles_with_critical_dtc: number;
    avg_uptime_pct: number;
    connectivity_rate_pct: number;
  };
}

export interface PartFamilyClaim {
  part_family: string;
  claims_90d: number;
  cost_per_claim_usd: number;
  rate_per_1000: number;
  trend_pct: number;
}

export interface QualityIssue {
  issue: string;
  model: string;
  model_year: number;
  production_dates: string;
  affected_units: number;
  claim_count: number;
  root_cause_status: string;
  fix: string;
  recall_risk: 'none' | 'low' | 'moderate' | 'high';
}

export interface QualityData {
  as_of: string;
  warranty_rate_per_1000: number;
  warranty_rate_trend_yoy_pct: number;
  jd_power_iqs: {
    industry_avg_pp100: number;
    pinnacle_pp100: number;
    rank_in_segment: number;
    segment_size: number;
    trailing_quarter_change: number;
  };
  claims_by_part_family: PartFamilyClaim[];
  top_issues: QualityIssue[];
}

export interface EVChargingData {
  as_of: string;
  fleet_size_volt_ev: number;
  charging_mix: {
    home_l2_pct: number;
    public_dcfc_pct: number;
    public_l2_pct: number;
    workplace_pct: number;
  };
  avg_session_kwh: {
    home_l2: number;
    public_dcfc: number;
    public_l2: number;
    workplace: number;
  };
  range_anxiety_signals: {
    low_soc_arrivals_at_dcfc_pct: number;
    low_soc_threshold_pct: number;
    median_arrival_soc_pct: number;
    trend_yoy_pct: number;
    narrative: string;
  };
  ota_range_improvements: {
    release: string;
    date: string;
    range_delta_mi: number;
    owners_pct_taken: number;
    notes: string;
  }[];
  nps_by_charging_cluster: {
    cluster: string;
    owners: number;
    nps: number;
    share_pct: number;
  }[];
  headline_insight: string;
}

export interface ConnectorStatus {
  name: string;
  source: string;
  rows_24h: number;
  last_sync: string;
  status: 'ok' | 'lag' | 'failed';
  lag_minutes: number;
  fivetran_id?: string;
  fivetran_url?: string;
}

export interface PipelineLayerStats {
  layer: 'connector' | 'bronze' | 'silver' | 'gold';
  rows_in: number;
  rows_out: number;
  tables: number;
  last_run: string;
  status: 'ok' | 'running' | 'failed';
}

export interface PipelineData {
  as_of: string;
  connectors: ConnectorStatus[];
  layers: PipelineLayerStats[];
}

export interface IcebergTable {
  database: 'bronze' | 'silver' | 'gold';
  table: string;
  rows: number;
  bytes: number;
  partitions: string[];
  source_system: string;
  last_updated_at: string;
  schema_columns: number;
}
