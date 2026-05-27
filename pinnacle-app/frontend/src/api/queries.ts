// ============================================================
// Pinnacle ODI API helpers — read the gold layer
// built from the gold Iceberg layer.
// ============================================================

import type {
  SummaryStats,
  ProductionData,
  DealersData,
  InventoryData,
  ConnectedCarData,
  QualityData,
  EVChargingData,
  PipelineData,
  IcebergTable,
} from '../types';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

let summaryCache: SummaryStats | null = null;
let productionCache: ProductionData | null = null;
let dealersCache: DealersData | null = null;
let inventoryCache: InventoryData | null = null;
let connectedCache: ConnectedCarData | null = null;
let qualityCache: QualityData | null = null;
let evCache: EVChargingData | null = null;
let pipelineCache: PipelineData | null = null;
let icebergCache: IcebergTable[] | null = null;

export const api = {
  getSummary: async (): Promise<SummaryStats> => {
    if (summaryCache) return summaryCache;
    summaryCache = await fetchJson<SummaryStats>('/data/summary.json');
    return summaryCache;
  },
  getProduction: async (): Promise<ProductionData> => {
    if (productionCache) return productionCache;
    productionCache = await fetchJson<ProductionData>('/data/production.json');
    return productionCache;
  },
  getDealers: async (): Promise<DealersData> => {
    if (dealersCache) return dealersCache;
    dealersCache = await fetchJson<DealersData>('/data/dealers.json');
    return dealersCache;
  },
  getInventory: async (): Promise<InventoryData> => {
    if (inventoryCache) return inventoryCache;
    inventoryCache = await fetchJson<InventoryData>('/data/inventory.json');
    return inventoryCache;
  },
  getConnectedCar: async (): Promise<ConnectedCarData> => {
    if (connectedCache) return connectedCache;
    connectedCache = await fetchJson<ConnectedCarData>('/data/connected_car.json');
    return connectedCache;
  },
  getQuality: async (): Promise<QualityData> => {
    if (qualityCache) return qualityCache;
    qualityCache = await fetchJson<QualityData>('/data/quality.json');
    return qualityCache;
  },
  getEVCharging: async (): Promise<EVChargingData> => {
    if (evCache) return evCache;
    evCache = await fetchJson<EVChargingData>('/data/ev_charging.json');
    return evCache;
  },
  getPipeline: async (): Promise<PipelineData> => {
    if (pipelineCache) return pipelineCache;
    pipelineCache = await fetchJson<PipelineData>('/data/pipeline.json');
    return pipelineCache;
  },
  getIceberg: async (): Promise<IcebergTable[]> => {
    if (icebergCache) return icebergCache;
    const data = await fetchJson<{ tables: IcebergTable[] }>('/data/iceberg.json');
    icebergCache = data.tables;
    return icebergCache;
  },
};

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatNumberShort(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000)     return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)         return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

export function formatCurrencyShort(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)         return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

export function formatBytes(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1024 ** 4) return `${(n / 1024 ** 4).toFixed(2)} TB`;
  if (abs >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  if (abs >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (abs >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
}
