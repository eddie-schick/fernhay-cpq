/**
 * Order Service — localStorage-based order management
 * Merges demo seed data with user-submitted quotes at runtime.
 */

import {
  OrderWithPipeline,
  ORDER_PIPELINE_STAGES,
  getDemoOrders,
} from "~/data/demo-orders";
import { OrderStatusValue } from "~/global/types/types";

export { ORDER_PIPELINE_STAGES, getDemoOrders };
export type { OrderWithPipeline };
export type { PipelineStage } from "~/data/demo-orders";

const LS_KEY = "fernhay_cpq_orders";
const LS_COUNTER_KEY = "fernhay_cpq_order_counter";

// Data version — bump this to clear stale user-created quotes on next app load
const LS_DATA_VERSION_KEY = "fernhay_cpq_data_version";
const CURRENT_DATA_VERSION = "3"; // Bumped to reflect pricing + order number updates

(function clearStaleData() {
  try {
    const storedVersion = localStorage.getItem(LS_DATA_VERSION_KEY);
    if (storedVersion !== CURRENT_DATA_VERSION) {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(LS_COUNTER_KEY);
      localStorage.setItem(LS_DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    }
  } catch { /* ignore */ }
})();

/** Map pipeline stage (1-12) to the status values the existing UI understands */
export function pipelineStageToStatus(stage: number): OrderStatusValue {
  if (stage <= 1) return "Quote Generated";
  if (stage === 2) return "Quote Accepted";
  if (stage <= 4) return "Order Processing";
  if (stage <= 9) return "In Production";
  if (stage <= 11) return "In Transit";
  return "Delivered";
}

/** Get the next order ID (FH-XXXX) */
export function getNextOrderId(): string {
  const current = parseInt(localStorage.getItem(LS_COUNTER_KEY) || "30", 10);
  const next = current + 1;
  localStorage.setItem(LS_COUNTER_KEY, String(next));
  return `FH-${String(next).padStart(4, "0")}`;
}

/** Save a new order to localStorage */
export function saveOrder(order: OrderWithPipeline): void {
  const existing = getLocalOrders();
  existing.push(order);
  localStorage.setItem(LS_KEY, JSON.stringify(existing));
}

/** Get orders saved by the user (not seed data) */
export function getLocalOrders(): OrderWithPipeline[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OrderWithPipeline[];
  } catch {
    return [];
  }
}

/** Merge seed data + localStorage orders, sorted by createdAt desc */
export function getAllOrders(): OrderWithPipeline[] {
  const seed = getDemoOrders();
  const local = getLocalOrders();
  const all = [...seed, ...local];
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return all;
}

/** Build pipeline history for a new order (just stage 1 completed, with estimated dates for all stages) */
export function buildInitialPipelineHistory(submittedAt: string) {
  const DEFAULT_DAYS = [0, 3, 2, 3, 14, 5, 2, 21, 5, 3, 5, 1];
  let cursor = new Date(submittedAt);

  return ORDER_PIPELINE_STAGES.map((s, i) => {
    const estDays = DEFAULT_DAYS[i] ?? 3;
    const estDate = new Date(cursor);
    estDate.setDate(estDate.getDate() + estDays);

    const item = {
      stage: s.stage,
      name: s.name,
      responsible: s.responsible,
      completedAt: s.stage === 1 ? submittedAt : null,
      daysInStage: s.stage === 1 ? 0 : null,
      estimatedDate: s.stage === 1 ? submittedAt : estDate.toISOString().split("T")[0],
    };

    cursor = estDate;
    return item;
  });
}

/** Generate an OEM order number for orders reaching "Order Received" stage */
export function generateOemOrderNo(formattedId: string): string {
  const year = new Date().getFullYear();
  const num = formattedId.replace("FH-", "");
  return `ORD-${year}-${num}`;
}

/** Update an order in localStorage by id */
export function updateLocalOrder(orderId: string | number, updates: Partial<OrderWithPipeline>): void {
  const orders = getLocalOrders();
  const idx = orders.findIndex((o) => String(o.id) === String(orderId) || o.formattedId === String(orderId));
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...updates };
    localStorage.setItem(LS_KEY, JSON.stringify(orders));
  }
}
