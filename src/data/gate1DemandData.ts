import { mockCropCatalog, mockDemandPosts, MUNICIPALITIES } from './mockData';
import type {
  CropCatalogItem,
  DemandEvent,
  DemandPost,
  DemandQualificationCheck,
  DemandQualificationResult,
  ServiceArea,
  TargetPriceProfile,
} from '../types';

const DEMAND_STORAGE_KEY = 'ani-market-gate1-demands';
const DEMAND_EVENT_STORAGE_KEY = 'ani-market-gate1-demand-events';
const CROP_CATALOG_STORAGE_KEY = 'ani-market-gate1-crop-catalog';
const SERVICE_AREA_STORAGE_KEY = 'ani-market-gate1-service-areas';

const defaultServiceAreas: ServiceArea[] = Object.entries(MUNICIPALITIES).map(([province, municipalities], index) => ({
  id: `sa-${index + 1}`,
  province,
  municipalities,
  active: true,
}));

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCropCatalog(): CropCatalogItem[] {
  return readJson<CropCatalogItem[]>(CROP_CATALOG_STORAGE_KEY, mockCropCatalog);
}

export function saveCropCatalog(items: CropCatalogItem[]) {
  writeJson(CROP_CATALOG_STORAGE_KEY, items);
}

export function getServiceAreas(): ServiceArea[] {
  return readJson<ServiceArea[]>(SERVICE_AREA_STORAGE_KEY, defaultServiceAreas);
}

export function saveServiceAreas(items: ServiceArea[]) {
  writeJson(SERVICE_AREA_STORAGE_KEY, items);
}

export function getGate1Demands(): DemandPost[] {
  const persisted = readJson<DemandPost[]>(DEMAND_STORAGE_KEY, []);
  const byId = new Map<string, DemandPost>();
  mockDemandPosts.forEach(item => byId.set(item.id, item));
  persisted.forEach(item => byId.set(item.id, item));
  return Array.from(byId.values());
}

export function saveGate1Demand(demand: DemandPost) {
  const persisted = readJson<DemandPost[]>(DEMAND_STORAGE_KEY, []);
  const index = persisted.findIndex(item => item.id === demand.id);
  if (index >= 0) persisted[index] = demand;
  else persisted.push(demand);
  writeJson(DEMAND_STORAGE_KEY, persisted);
}

export function getDemandEvents(demandId?: string): DemandEvent[] {
  const events = readJson<DemandEvent[]>(DEMAND_EVENT_STORAGE_KEY, []);
  return demandId ? events.filter(event => event.demandId === demandId) : events;
}

export function saveDemandEvent(event: DemandEvent) {
  const events = readJson<DemandEvent[]>(DEMAND_EVENT_STORAGE_KEY, []);
  events.push(event);
  writeJson(DEMAND_EVENT_STORAGE_KEY, events);
}

export function formatTargetPrice(profile: TargetPriceProfile | undefined, fallbackPrice = 0): string {
  if (!profile) return `₱${fallbackPrice.toLocaleString()}`;
  if (profile.type === 'Range') {
    return `₱${(profile.minimumPrice ?? 0).toLocaleString()}–₱${(profile.maximumPrice ?? 0).toLocaleString()}`;
  }
  const label = profile.type === 'Approximate' ? 'Approx.' : 'Average';
  return `${label} ₱${(profile.unitPrice ?? fallbackPrice).toLocaleString()}`;
}

export function representativeTargetPrice(profile: TargetPriceProfile): number {
  if (profile.type === 'Range') {
    const minimum = profile.minimumPrice ?? 0;
    const maximum = profile.maximumPrice ?? minimum;
    return (minimum + maximum) / 2;
  }
  return profile.unitPrice ?? 0;
}

export interface DemandQualificationContext {
  buyerTransactionEnabled: boolean;
}

export function qualifyDemand(demand: DemandPost, context: DemandQualificationContext): DemandQualificationResult {
  const catalog = getCropCatalog();
  const serviceAreas = getServiceAreas();
  const enabledCrop = catalog.some(item => item.active && item.name === demand.cropName);
  const area = serviceAreas.find(item => item.active && item.province === demand.province);
  const municipality = demand.municipality ?? demand.location.split(',')[0]?.trim();
  const locationEnabled = Boolean(area && municipality && area.municipalities.includes(municipality));
  const target = demand.targetPriceProfile;
  const targetPriceValid = Boolean(target && (
    target.type === 'Range'
      ? (target.minimumPrice ?? 0) > 0 && (target.maximumPrice ?? 0) >= (target.minimumPrice ?? 0)
      : (target.unitPrice ?? 0) > 0
  ));
  const quantityValid = demand.quantity > 0 && Boolean(demand.unit) && (
    demand.minimumSupplierQuantity === undefined ||
    (demand.minimumSupplierQuantity > 0 && demand.minimumSupplierQuantity <= demand.quantity)
  );
  const fulfillmentDateValid = Boolean(demand.requiredDate) && (
    !demand.fulfillmentWindowEnd || demand.fulfillmentWindowEnd >= demand.requiredDate
  );
  const deadlineValid = Boolean(demand.expirationDate) && Boolean(demand.requiredDate) && demand.expirationDate <= demand.requiredDate;

  const checks: DemandQualificationCheck[] = [
    { key: 'buyer-transaction-enabled', label: 'Buyer transaction access is enabled', passed: context.buyerTransactionEnabled, message: context.buyerTransactionEnabled ? undefined : 'Complete marketplace verification before publishing.' },
    { key: 'commodity-enabled', label: 'Commodity is enabled in the controlled catalog', passed: enabledCrop, message: enabledCrop ? undefined : 'Select an active commodity from the marketplace catalog.' },
    { key: 'quantity-unit-valid', label: 'Quantity, unit, and minimum supplier quantity are valid', passed: quantityValid, message: quantityValid ? undefined : 'Enter a positive quantity and valid minimum supplier quantity.' },
    { key: 'target-price-valid', label: 'Target price uses an approved approximation, average, or range', passed: targetPriceValid, message: targetPriceValid ? undefined : 'Enter a valid approximate, average, or price-range target.' },
    { key: 'fulfillment-date-valid', label: 'Required fulfillment date/window is valid', passed: fulfillmentDateValid, message: fulfillmentDateValid ? undefined : 'Enter a valid required date or fulfillment window.' },
    { key: 'location-service-area-enabled', label: 'Fulfillment location is inside an enabled service area', passed: locationEnabled, message: locationEnabled ? undefined : 'Select an enabled marketplace service area.' },
    { key: 'offer-deadline-valid', label: 'Offer deadline is valid', passed: deadlineValid, message: deadlineValid ? undefined : 'Offer deadline must be on or before the required fulfillment date.' },
    { key: 'buyer-seriousness-declared', label: 'Buyer seriousness and authority declaration is accepted', passed: demand.buyerSeriousnessDeclared === true, message: demand.buyerSeriousnessDeclared ? undefined : 'Confirm authority and genuine procurement intent.' },
  ];

  return {
    status: checks.every(check => check.passed) ? 'Qualified' : 'Needs Correction',
    evaluatedAt: new Date().toISOString(),
    checks,
  };
}

export function createDemandId() {
  return `d-g1-${Date.now()}`;
}
