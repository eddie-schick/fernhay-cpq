import { useMemo } from "react";

import { Typography } from "@mui/material";

import { useCatalog, type ChassisItem } from "~/context/catalog-provider/catalog-provider";

import InventoryTable, { type ColumnDef } from "./inventory-table";

const COLUMNS: ColumnDef<ChassisItem>[] = [
  {
    key: "modelName",
    header: "Model Name",
    type: "text",
    editable: false,
    getValue: (r) => r.modelName,
    applyValue: () => ({}),
  },
  {
    key: "typeClass",
    header: "Type / Class",
    type: "text",
    editable: false,
    getValue: (r) => r.typeClass,
    applyValue: () => ({}),
  },
  {
    key: "gvwr",
    header: "GVWR",
    type: "number",
    editable: true,
    getValue: (r) => r.gvwr.value,
    applyValue: (v) => ({ gvwr: { value: Number(v) || 0, unit: "lbs" } }),
  },
  {
    key: "basePrice",
    header: "Cost",
    type: "currency",
    editable: true,
    getValue: (r) => r.basePrice,
    applyValue: (v) => ({ basePrice: Number(v) || 0 }),
  },
  {
    key: "msrp",
    header: "MSRP",
    type: "currency",
    editable: true,
    getValue: (r) => r.msrp ?? r.basePrice,
    applyValue: (v) => ({ msrp: Number(v) || 0 }),
  },
  {
    key: "leadTime",
    header: "Lead Time (wks)",
    type: "number",
    editable: true,
    getValue: (r) => r.leadTime,
    applyValue: (v) => ({ leadTime: Number(v) || 0 }),
  },
  {
    key: "payloadCapacity",
    header: "Payload Capacity",
    type: "number",
    editable: true,
    getValue: (r) => r.payloadCapacity.value,
    applyValue: (v) => ({ payloadCapacity: { value: Number(v) || 0, unit: "lbs" } }),
  },
  {
    key: "manufacturer",
    header: "Manufacturer",
    type: "text",
    editable: true,
    getValue: (r) => r.manufacturer,
    applyValue: (v) => ({ manufacturer: String(v) }),
  },
  {
    key: "status",
    header: "Status",
    type: "dropdown",
    editable: true,
    dropdownOptions: ["Active", "Discontinued", "Coming Soon"],
    getValue: (r) => r.status,
    applyValue: (v) => ({ status: v as ChassisItem["status"] }),
  },
  {
    key: "lastUpdated",
    header: "Last Updated",
    type: "text",
    editable: false,
    getValue: (r) => r.lastUpdated,
    applyValue: () => ({}),
  },
];

export default function ChassisTab() {
  const { chassis, updateChassis, getChassisOverrides } = useCatalog();
  const overrides = getChassisOverrides();

  const renderExpanded = useMemo(
    () => (row: ChassisItem) => (
      <>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 0.5 }}>
          Description
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
          {row.description || "No description available."}
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mt: 1, mb: 0.5 }}>
          Compatible Bodies
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
          {row.compatibleBodies?.join(", ") || "—"}
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mt: 1, mb: 0.5 }}>
          Manufacturer
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
          {row.manufacturer || "—"}
        </Typography>
      </>
    ),
    [],
  );

  return (
    <InventoryTable<ChassisItem>
      data={chassis}
      columns={COLUMNS}
      overrides={overrides}
      onUpdate={updateChassis}
      renderExpandedRow={renderExpanded}
      searchPlaceholder="Search chassis..."
    />
  );
}
