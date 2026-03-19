import { useCallback, useMemo, useState } from "react";

import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  styled,
} from "@mui/material";

import MuiBox from "~/components/shared/mui-box/mui-box";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ColumnType = "text" | "number" | "currency" | "dropdown" | "weight" | "gvwr" | "payload";

export interface ColumnDef<T> {
  key: string;
  header: string;
  type: ColumnType;
  editable?: boolean;
  width?: string;
  dropdownOptions?: string[];
  /** Extract display value from the row */
  getValue: (row: T) => string | number;
  /** Apply edited value back to partial update object */
  applyValue: (value: string) => Partial<T>;
}

interface InventoryTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  overrides: Record<string, Partial<T>>;
  onUpdate: (id: string, updates: Partial<T>) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
  searchPlaceholder?: string;
}

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const color =
    status === "Active"
      ? "#47A580"
      : status === "Coming Soon"
        ? "#FFA629"
        : "#909090";
  return (
    <Box
      sx={{
        display: "inline-block",
        width: "0.5rem",
        height: "0.5rem",
        borderRadius: "50%",
        backgroundColor: color,
        mr: "0.35rem",
      }}
    />
  );
}

// ─── Editable Cell ──────────────────────────────────────────────────────────

function EditableCell<T extends { id: string }>({
  row,
  column,
  isOverridden,
  onSave,
}: {
  row: T;
  column: ColumnDef<T>;
  isOverridden: boolean;
  onSave: (id: string, updates: Partial<T>) => void;
}) {
  const displayValue = column.getValue(row);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(displayValue));

  const handleStartEdit = () => {
    if (!column.editable) return;
    setEditValue(String(displayValue));
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
    if (editValue !== String(displayValue)) {
      onSave(row.id, column.applyValue(editValue));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  };

  if (!column.editable) {
    return (
      <CellContainer isOverridden={false}>
        {column.type === "currency" ? `$${Number(displayValue).toLocaleString()}` : String(displayValue)}
      </CellContainer>
    );
  }

  if (editing) {
    if (column.type === "dropdown") {
      return (
        <Select
          size="small"
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            setEditing(false);
            if (e.target.value !== String(displayValue)) {
              onSave(row.id, column.applyValue(e.target.value));
            }
          }}
          onBlur={handleSave}
          autoFocus
          sx={{ fontSize: "0.8rem", minWidth: "8rem" }}
        >
          {column.dropdownOptions?.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: "0.8rem" }}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      );
    }

    return (
      <TextField
        size="small"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        type={column.type === "number" || column.type === "currency" ? "number" : "text"}
        InputProps={{
          ...(column.type === "currency" && {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }),
        }}
        sx={{
          "& .MuiInputBase-input": { fontSize: "0.8rem", padding: "0.35rem 0.5rem" },
          minWidth: "5rem",
          maxWidth: "8rem",
        }}
      />
    );
  }

  // Display mode
  let formattedValue: string;
  switch (column.type) {
    case "currency":
      formattedValue = `$${Number(displayValue).toLocaleString()}`;
      break;
    case "number":
      formattedValue = `${displayValue}`;
      break;
    default:
      formattedValue = String(displayValue);
  }

  return (
    <CellContainer isOverridden={isOverridden} onClick={handleStartEdit} editable>
      {column.key === "status" && <StatusDot status={String(displayValue)} />}
      {formattedValue}
    </CellContainer>
  );
}

// ─── Main Table ─────────────────────────────────────────────────────────────

export default function InventoryTable<T extends { id: string }>({
  data,
  columns,
  overrides,
  onUpdate,
  renderExpandedRow,
  searchPlaceholder = "Search...",
}: InventoryTableProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const lower = searchText.toLowerCase();
    return data.filter((item) =>
      columns.some((col) =>
        String(col.getValue(item)).toLowerCase().includes(lower),
      ),
    );
  }, [data, searchText, columns]);

  const isFieldOverridden = useCallback(
    (id: string, key: string): boolean => {
      const o = overrides[id];
      if (!o) return false;
      return key in o;
    },
    [overrides],
  );

  return (
    <TableContainer>
      {/* Toolbar */}
      <MuiBox className="table-toolbar">
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: "1.1rem", color: "#999" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: "16rem",
            "& .MuiInputBase-input": { fontSize: "0.85rem" },
          }}
        />
      </MuiBox>

      {/* Table */}
      <MuiBox className="table-scroll-area">
        <table>
          <thead>
            <tr>
              {renderExpandedRow && <th style={{ width: "2.5rem" }} />}
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <TableRow
                key={row.id}
                row={row}
                columns={columns}
                isExpanded={expandedId === row.id}
                onToggleExpand={
                  renderExpandedRow
                    ? () => setExpandedId(expandedId === row.id ? null : row.id)
                    : undefined
                }
                isFieldOverridden={isFieldOverridden}
                onUpdate={onUpdate}
                renderExpandedRow={renderExpandedRow}
              />
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (renderExpandedRow ? 1 : 0)}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      py: 3,
                      color: "#999",
                      fontSize: "0.9rem",
                    }}
                  >
                    No items found
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </MuiBox>
    </TableContainer>
  );
}

// ─── Table Row ──────────────────────────────────────────────────────────────

function TableRow<T extends { id: string }>({
  row,
  columns,
  isExpanded,
  onToggleExpand,
  isFieldOverridden,
  onUpdate,
  renderExpandedRow,
}: {
  row: T;
  columns: ColumnDef<T>[];
  isExpanded: boolean;
  onToggleExpand?: () => void;
  isFieldOverridden: (id: string, key: string) => boolean;
  onUpdate: (id: string, updates: Partial<T>) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
}) {
  return (
    <>
      <tr>
        {onToggleExpand && (
          <td style={{ width: "2.5rem", padding: "0.5rem" }}>
            <IconButton size="small" onClick={onToggleExpand}>
              {isExpanded ? (
                <KeyboardArrowUp sx={{ fontSize: "1rem" }} />
              ) : (
                <KeyboardArrowDown sx={{ fontSize: "1rem" }} />
              )}
            </IconButton>
          </td>
        )}
        {columns.map((col) => (
          <td key={col.key}>
            <EditableCell
              row={row}
              column={col}
              isOverridden={isFieldOverridden(row.id, col.key)}
              onSave={onUpdate}
            />
          </td>
        ))}
      </tr>
      {renderExpandedRow && (
        <tr className="expanded-row">
          <td colSpan={columns.length + 1} style={{ padding: 0 }}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <ExpandedContent>{renderExpandedRow(row)}</ExpandedContent>
            </Collapse>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Styled Components ──────────────────────────────────────────────────────

const CellContainer = styled(Box, {
  shouldForwardProp: (p) => p !== "isOverridden" && p !== "editable",
})<{ isOverridden: boolean; editable?: boolean }>(({ isOverridden, editable }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "0.2rem 0.4rem",
  borderRadius: "0.25rem",
  fontSize: "0.8rem",
  cursor: editable ? "pointer" : "default",
  backgroundColor: "transparent",
  transition: "background-color 0.15s ease",
  minHeight: "1.5rem",
  ...(editable && {
    "&:hover": {
      backgroundColor: "#F5F5F5",
    },
  }),
}));

const ExpandedContent = styled(Box)(({ theme }) => ({
  padding: "1rem 1.5rem 1rem 3.5rem",
  backgroundColor: theme.palette.custom?.blueBackground || "#f8faff",
  borderBottom: `1px solid ${theme.palette.custom?.tertiary || "#e0e0e0"}`,
  fontSize: "0.8rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
}));

const TableContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "hidden",

  ".table-toolbar": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.25rem",
    gap: "1rem",
    marginBottom: "0.75rem",
    flexWrap: "wrap",
  },

  ".table-toolbar-actions": {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },

  ".table-scroll-area": {
    flex: 1,
    overflow: "auto",
    paddingInline: "1.25rem",

    "&::-webkit-scrollbar": {
      width: "0.25rem",
      height: "0.5rem",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "#D6D6D6",
    },
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "auto",
  },

  thead: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background?.default || "#fff",

    th: {
      textAlign: "left",
      fontSize: "0.8rem",
      fontWeight: 600,
      color: theme.palette.custom?.accentBlack || "#333",
      padding: "0.65rem 0.75rem",
      borderBottom: `2px solid ${theme.palette.custom?.tertiary || "#e0e0e0"}`,
      whiteSpace: "nowrap",
    },
  },

  tbody: {
    tr: {
      transition: "background-color 0.15s ease",

      "&:hover": {
        backgroundColor: theme.palette.custom?.blueBackground || "#f5f8ff",
      },

      td: {
        fontSize: "0.8rem",
        color: theme.palette.custom?.accentBlack || "#333",
        padding: "0.5rem 0.75rem",
        borderBottom: `1px solid ${theme.palette.custom?.tertiary || "#e0e0e0"}`,
        whiteSpace: "nowrap",
        verticalAlign: "middle",
      },
    },

    "tr.expanded-row": {
      "&:hover": {
        backgroundColor: "transparent",
      },
      td: {
        padding: 0,
        borderBottom: "none",
      },
    },
  },
}));
