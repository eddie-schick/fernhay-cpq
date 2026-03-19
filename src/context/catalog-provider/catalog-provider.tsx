import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChassisItem {
  id: string;
  modelName: string;
  typeClass: string;
  gvwr: { value: number; unit: string };
  basePrice: number;
  msrp?: number;
  leadTime: number;
  payloadCapacity: { value: number; unit: string };
  status: "Active" | "Discontinued" | "Coming Soon";
  lastUpdated: string;
  description: string;
  compatibleBodies: string[];
  manufacturer: string;
}

export interface BodyItem {
  id: string;
  bodyType: string;
  variantName: string;
  manufacturer: string;
  compatibleChassis: string[];
  basePrice: number;
  leadTime: number;
  weight: { value: number; unit: string };
  status: "Active" | "Discontinued" | "Coming Soon";
  lastUpdated: string;
  description: string;
}

export interface OptionItem {
  id: string;
  optionName: string;
  displayName?: string;
  category: "Interior" | "Exterior" | "Safety" | "Electrical" | "Accessories";
  compatibleBodies: string[];
  price: number;
  leadTime: number;
  weight: { value: number; unit: string };
  status: "Active" | "Discontinued" | "Coming Soon";
  lastUpdated: string;
  description: string;
  manufacturer?: string;
}

interface CatalogContextValue {
  chassis: ChassisItem[];
  bodies: BodyItem[];
  options: OptionItem[];
  isLoading: boolean;
  updateChassis: (id: string, updates: Partial<ChassisItem>) => void;
  updateBody: (id: string, updates: Partial<BodyItem>) => void;
  updateOption: (id: string, updates: Partial<OptionItem>) => void;
  resetChassis: () => void;
  resetBodies: () => void;
  resetOptions: () => void;
  getChassisOverrides: () => Record<string, Partial<ChassisItem>>;
  getBodiesOverrides: () => Record<string, Partial<BodyItem>>;
  getOptionsOverrides: () => Record<string, Partial<OptionItem>>;
}

// ─── LocalStorage Keys ──────────────────────────────────────────────────────

const LS_CHASSIS = "inventory-overrides-chassis";
const LS_BODIES = "inventory-overrides-bodies";
const LS_OPTIONS = "inventory-overrides-options";

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadOverrides<T>(key: string): Record<string, Partial<T>> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Partial<T>>;
  } catch {
    return {};
  }
}

function saveOverrides<T>(key: string, overrides: Record<string, Partial<T>>) {
  localStorage.setItem(key, JSON.stringify(overrides));
}

function mergeData<T extends { id: string }>(
  base: T[],
  overrides: Record<string, Partial<T>>,
): T[] {
  return base.map((item) => {
    const override = overrides[item.id];
    if (!override) return item;
    return { ...item, ...override };
  });
}

// ─── Context ────────────────────────────────────────────────────────────────

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export default function CatalogProvider({ children }: { children: ReactNode }) {
  const [baseChassis, setBaseChassis] = useState<ChassisItem[]>([]);
  const [baseBodies, setBaseBodies] = useState<BodyItem[]>([]);
  const [baseOptions, setBaseOptions] = useState<OptionItem[]>([]);

  const [chassisOverrides, setChassisOverrides] = useState<Record<string, Partial<ChassisItem>>>(
    () => loadOverrides<ChassisItem>(LS_CHASSIS),
  );
  const [bodiesOverrides, setBodiesOverrides] = useState<Record<string, Partial<BodyItem>>>(
    () => loadOverrides<BodyItem>(LS_BODIES),
  );
  const [optionsOverrides, setOptionsOverrides] = useState<Record<string, Partial<OptionItem>>>(
    () => loadOverrides<OptionItem>(LS_OPTIONS),
  );

  const [isLoading, setIsLoading] = useState(true);

  // Fetch base data on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [chassisRes, bodiesRes, optionsRes] = await Promise.all([
          fetch("/data/chassis.json"),
          fetch("/data/bodies.json"),
          fetch("/data/options.json"),
        ]);
        const [chassisData, bodiesData, optionsData] = await Promise.all([
          chassisRes.json() as Promise<ChassisItem[]>,
          bodiesRes.json() as Promise<BodyItem[]>,
          optionsRes.json() as Promise<OptionItem[]>,
        ]);
        setBaseChassis(chassisData);
        setBaseBodies(bodiesData);
        setBaseOptions(optionsData);
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchAll();
  }, []);

  // Merged data
  const chassis = mergeData(baseChassis, chassisOverrides);
  const bodies = mergeData(baseBodies, bodiesOverrides);
  const options = mergeData(baseOptions, optionsOverrides);

  // Update functions
  const updateChassis = useCallback(
    (id: string, updates: Partial<ChassisItem>) => {
      setChassisOverrides((prev) => {
        const next = { ...prev, [id]: { ...(prev[id] || {}), ...updates, lastUpdated: new Date().toISOString().split("T")[0] } };
        saveOverrides(LS_CHASSIS, next);
        return next;
      });
    },
    [],
  );

  const updateBody = useCallback(
    (id: string, updates: Partial<BodyItem>) => {
      setBodiesOverrides((prev) => {
        const next = { ...prev, [id]: { ...(prev[id] || {}), ...updates, lastUpdated: new Date().toISOString().split("T")[0] } };
        saveOverrides(LS_BODIES, next);
        return next;
      });
    },
    [],
  );

  const updateOption = useCallback(
    (id: string, updates: Partial<OptionItem>) => {
      setOptionsOverrides((prev) => {
        const next = { ...prev, [id]: { ...(prev[id] || {}), ...updates, lastUpdated: new Date().toISOString().split("T")[0] } };
        saveOverrides(LS_OPTIONS, next);
        return next;
      });
    },
    [],
  );

  // Reset functions
  const resetChassis = useCallback(() => {
    setChassisOverrides({});
    localStorage.removeItem(LS_CHASSIS);
  }, []);

  const resetBodies = useCallback(() => {
    setBodiesOverrides({});
    localStorage.removeItem(LS_BODIES);
  }, []);

  const resetOptions = useCallback(() => {
    setOptionsOverrides({});
    localStorage.removeItem(LS_OPTIONS);
  }, []);

  // Expose overrides (for highlighting changed cells)
  const getChassisOverrides = useCallback(() => chassisOverrides, [chassisOverrides]);
  const getBodiesOverrides = useCallback(() => bodiesOverrides, [bodiesOverrides]);
  const getOptionsOverrides = useCallback(() => optionsOverrides, [optionsOverrides]);

  return (
    <CatalogContext.Provider
      value={{
        chassis,
        bodies,
        options,
        isLoading,
        updateChassis,
        updateBody,
        updateOption,
        resetChassis,
        resetBodies,
        resetOptions,
        getChassisOverrides,
        getBodiesOverrides,
        getOptionsOverrides,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
