import { useRef, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Typography,
  styled,
} from "@mui/material";
import {
  FileUploadOutlined,
  SyncOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material";

import { useCatalog } from "~/context/catalog-provider/catalog-provider";

import BodiesTab from "~/components/manage-inventory/bodies-tab";
import ChassisTab from "~/components/manage-inventory/chassis-tab";
import EquipmentTab from "~/components/manage-inventory/equipment-tab";
import MuiBox from "~/components/shared/mui-box/mui-box";

const ManageInventory = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [importAnchor, setImportAnchor] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading } = useCatalog();

  const handleCsvUpload = () => {
    setImportAnchor(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: Parse CSV and update catalog
    alert(`CSV file "${file.name}" selected. CSV import will be available in a future release.`);
    e.target.value = "";
  };

  const handleConnectErp = () => {
    setImportAnchor(null);
    // TODO: ERP integration
    alert("ERP integration will be available in a future release. Contact support@shaed.ai for early access.");
  };

  if (isLoading) {
    return (
      <PageStyled>
        <MuiBox
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </MuiBox>
      </PageStyled>
    );
  }

  return (
    <PageStyled>
      {/* Hidden file input for CSV upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Top action bar */}
      <Box className="page-actions">
        <Button
          variant="outlined"
          size="small"
          endIcon={<KeyboardArrowDown />}
          onClick={(e) => setImportAnchor(e.currentTarget)}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8125rem",
            borderColor: "#204993",
            color: "#204993",
            borderRadius: "6px",
            padding: "0.4rem 1rem",
            "&:hover": {
              borderColor: "#193a75",
              backgroundColor: "rgba(32, 73, 147, 0.04)",
            },
          }}
        >
          Import Data
        </Button>
        <Menu
          anchorEl={importAnchor}
          open={Boolean(importAnchor)}
          onClose={() => setImportAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: "0.25rem",
                minWidth: "12rem",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              },
            },
          }}
        >
          <MenuItem onClick={handleCsvUpload} sx={{ fontSize: "0.85rem", py: 1 }}>
            <ListItemIcon>
              <FileUploadOutlined fontSize="small" sx={{ color: "#204993" }} />
            </ListItemIcon>
            <ListItemText>Upload CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleConnectErp} sx={{ fontSize: "0.85rem", py: 1 }}>
            <ListItemIcon>
              <SyncOutlined fontSize="small" sx={{ color: "#204993" }} />
            </ListItemIcon>
            <ListItemText>Connect to ERP</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      <MuiBox className="inventory-container">
        {/* Tabs */}
        <MuiBox className="tabs-container">
          <Tabs
            value={activeTab}
            onChange={(_, v: number) => setActiveTab(v)}
            sx={{
              minHeight: 0,
              "& .MuiTabs-indicator": {
                height: "2px",
              },
            }}
          >
            <StyledTab label="Chassis" />
            <StyledTab label="Bodies" />
            <StyledTab label="Equipment & Options" />
          </Tabs>
        </MuiBox>

        {/* Tab Content */}
        <MuiBox className="tab-content">
          {activeTab === 0 && <ChassisTab />}
          {activeTab === 1 && <BodiesTab />}
          {activeTab === 2 && <EquipmentTab />}
        </MuiBox>
      </MuiBox>
    </PageStyled>
  );
};

export default ManageInventory;

const StyledTab = styled(Tab)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 600,
  textTransform: "none",
  minHeight: "2.5rem",
  padding: "0.5rem 1.25rem",
  color: theme.palette.custom?.lightGray || "#999",
  "&.Mui-selected": {
    color: theme.palette.custom?.accentBlack || "#333",
  },
}));

const PageStyled = styled(MuiBox)(({ theme }) => ({
  padding: "1.5rem",
  height: "calc(100vh - 64px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",

  ".page-actions": {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "0.75rem",
    gap: "0.75rem",
  },

  ".inventory-container": {
    padding: "1.5rem 0",
    border: `1px solid ${theme.palette.custom?.tertiary || "#e0e0e0"}`,
    borderRadius: "10px",
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  },

  ".tabs-container": {
    paddingInline: "1.25rem",
    borderBottom: `1px solid ${theme.palette.custom?.tertiary || "#e0e0e0"}`,
  },

  ".tab-content": {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
}));
