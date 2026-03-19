import { useMemo } from "react";

import { Chip, Typography } from "@mui/material";

import { useCatalog, type OptionItem } from "~/context/catalog-provider/catalog-provider";

import InventoryTable, { type ColumnDef } from "./inventory-table";

const COLUMNS: ColumnDef<OptionItem>[] = [
  {
    key: "optionName",
    header: "Option Name",
    type: "text",
    editable: true,
    getValue: (r) => r.displayName || r.optionName,
    applyValue: (v) => ({ displayName: String(v) }),
  },
  {
    key: "manufacturer",
    header: "Manufacturer",
    type: "text",
    editable: true,
    getValue: (r) => r.manufacturer || "EAVX",
    applyValue: (v) => ({ manufacturer: String(v) }),
  },
  {
    key: "category",
    header: "Category",
    type: "dropdown",
    editable: true,
    dropdownOptions: ["Interior", "Exterior", "Safety", "Electrical", "Accessories"],
    getValue: (r) => r.category,
    applyValue: (v) => ({ category: v as OptionItem["category"] }),
  },
  {
    key: "price",
    header: "Price",
    type: "currency",
    editable: true,
    getValue: (r) => r.price,
    applyValue: (v) => ({ price: Number(v) || 0 }),
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
    applyValue: (v) => ({ status: v as OptionItem["status"] }),
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

export default function EquipmentTab() {
  const { options, updateOption, getOptionsOverrides } = useCatalog();
  const overrides = getOptionsOverrides();

  const renderExpanded = useMemo(
    () => (row: OptionItem) => (
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
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {row.compatibleBodies?.map((b) => (
            <Chip key={b} label={b} size="small" sx={{ fontSize: "0.7rem" }} />
          )) || "—"}
        </div>
      </>
    ),
    [],
  );

  return (
    <InventoryTable<OptionItem>
      data={options}
      columns={COLUMNS}
      overrides={overrides}
      onUpdate={updateOption}
      renderExpandedRow={renderExpanded}
      searchPlaceholder="Search equipment & options..."
    />
  );
}
