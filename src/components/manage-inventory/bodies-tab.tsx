import { useMemo } from "react";

import { Chip, Typography } from "@mui/material";

import { useCatalog, type BodyItem } from "~/context/catalog-provider/catalog-provider";

import InventoryTable, { type ColumnDef } from "./inventory-table";

const COLUMNS: ColumnDef<BodyItem>[] = [
  {
    key: "manufacturer",
    header: "Manufacturer",
    type: "text",
    editable: true,
    getValue: (r) => r.manufacturer,
    applyValue: (v) => ({ manufacturer: v }),
  },
  {
    key: "bodyType",
    header: "Body Type",
    type: "text",
    editable: false,
    getValue: (r) => r.bodyType,
    applyValue: () => ({}),
  },
  {
    key: "variantName",
    header: "Variant Name",
    type: "text",
    editable: true,
    getValue: (r) => r.variantName,
    applyValue: (v) => ({ variantName: v }),
  },
  {
    key: "basePrice",
    header: "Base Price",
    type: "currency",
    editable: true,
    getValue: (r) => r.basePrice,
    applyValue: (v) => ({ basePrice: Number(v) || 0 }),
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
    key: "weight",
    header: "Weight (lbs)",
    type: "number",
    editable: true,
    getValue: (r) => r.weight.value,
    applyValue: (v) => ({ weight: { value: Number(v) || 0, unit: "lbs" } }),
  },
  {
    key: "status",
    header: "Status",
    type: "dropdown",
    editable: true,
    dropdownOptions: ["Active", "Discontinued", "Coming Soon"],
    getValue: (r) => r.status,
    applyValue: (v) => ({ status: v as BodyItem["status"] }),
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

export default function BodiesTab() {
  const { bodies, updateBody, getBodiesOverrides } = useCatalog();
  const overrides = getBodiesOverrides();

  const renderExpanded = useMemo(
    () => (row: BodyItem) => (
      <>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 0.5 }}>
          Description
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
          {row.description || "No description available."}
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, mt: 1, mb: 0.5 }}>
          Compatible Chassis
        </Typography>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {row.compatibleChassis?.map((c) => (
            <Chip key={c} label={c} size="small" sx={{ fontSize: "0.7rem" }} />
          )) || "—"}
        </div>
      </>
    ),
    [],
  );

  return (
    <InventoryTable<BodyItem>
      data={bodies}
      columns={COLUMNS}
      overrides={overrides}
      onUpdate={updateBody}
      renderExpandedRow={renderExpanded}
      searchPlaceholder="Search bodies..."
    />
  );
}
