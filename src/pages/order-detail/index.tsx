import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";

import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import RoutePaths from "~/constants/route-paths";
import {
  ORDER_PIPELINE_STAGES,
  getAllOrders,
} from "~/services/order-service";

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const order = useMemo(() => {
    const allOrders = getAllOrders();
    return allOrders.find((o) => o.formattedId === orderId) || null;
  }, [orderId]);

  if (!order) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(RoutePaths.MY_ORDERS)}>
          Back to Orders
        </Button>
        <Typography variant="h5" sx={{ mt: 2 }}>Order not found</Typography>
      </Box>
    );
  }

  const currentStageIndex = order.pipelineStage - 1;
  const daysInCurrentStage = (() => {
    const currentEntry = order.pipelineHistory.find((h) => h.stage === order.pipelineStage);
    if (!currentEntry || currentEntry.completedAt) return 0;
    const lastCompleted = order.pipelineHistory
      .filter((h) => h.completedAt && h.stage < order.pipelineStage)
      .sort((a, b) => b.stage - a.stage)[0];
    if (!lastCompleted?.completedAt) return 0;
    return dayjs().diff(dayjs(lastCompleted.completedAt), "day");
  })();

  const currentStageInfo = ORDER_PIPELINE_STAGES[currentStageIndex];

  const statusColor = (stage: number) => {
    if (stage < order.pipelineStage) return theme.palette.success.main;
    if (stage === order.pipelineStage) return theme.palette.primary.main;
    return theme.palette.grey[400];
  };

  const roleColor = (role: string) => {
    if (role.includes("Dealer")) return "#1E3A5F";
    if (role.includes("Chassis")) return "#3B8C7D";
    if (role.includes("Upfitter")) return "#E67E22";
    return "#666";
  };

  return (
    <OrderDetailStyled>
      <Box className="header">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(RoutePaths.MY_ORDERS)}
          sx={{ mb: 2, color: theme.palette.text.primary }}
        >
          Back to Orders
        </Button>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>{order.formattedId}</Typography>
          <Chip
            label={order.statusV2 || "Quote Generated"}
            sx={{
              bgcolor: statusColor(order.pipelineStage),
              color: "#fff",
              fontWeight: 600,
            }}
          />
          {order.isOverdue && (
            <Chip
              icon={<WarningAmberIcon sx={{ color: "#fff !important" }} />}
              label="Overdue"
              sx={{ bgcolor: "#d32f2f", color: "#fff", fontWeight: 600 }}
            />
          )}
        </Box>
        <Typography variant="body1" color="text.secondary">
          {order.customer?.buyerName} — {order.bodyType || order.model}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ordered: {dayjs(order.createdAt).format("MMM D, YYYY")} | Est. Delivery: {dayjs(order.estimatedDeliveryDate).format("MMM D, YYYY")}
        </Typography>
      </Box>

      {/* Pipeline Timeline */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Order Pipeline</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AccessTimeIcon fontSize="small" />
          <Typography variant="body2">
            Currently at <strong>{currentStageInfo?.name}</strong> — {daysInCurrentStage} day{daysInCurrentStage !== 1 ? "s" : ""} in this stage
          </Typography>
          <Chip
            label={currentStageInfo?.responsible}
            size="small"
            sx={{ bgcolor: roleColor(currentStageInfo?.role || ""), color: "#fff", ml: 1 }}
          />
        </Box>

        <Stepper
          activeStep={order.pipelineStage - 1}
          alternativeLabel
          connector={<StepConnector />}
          sx={{ overflowX: "auto" }}
        >
          {ORDER_PIPELINE_STAGES.map((stage, idx) => {
            const historyEntry = order.pipelineHistory[idx];
            const isComplete = historyEntry?.completedAt != null;
            const isCurrent = stage.stage === order.pipelineStage && !isComplete;

            return (
              <Step key={stage.stage} completed={isComplete}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {isComplete ? (
                        <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                      ) : isCurrent ? (
                        <AccessTimeIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ color: theme.palette.grey[400], fontSize: 28 }} />
                      )}
                    </Box>
                  )}
                >
                  <Typography
                    variant="caption"
                    fontWeight={isCurrent ? 700 : 400}
                    sx={{
                      color: isComplete
                        ? theme.palette.success.main
                        : isCurrent
                          ? theme.palette.primary.main
                          : theme.palette.grey[500],
                      display: "block",
                      lineHeight: 1.2,
                    }}
                  >
                    {stage.name}
                  </Typography>
                  <Chip
                    label={stage.responsible}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      height: 18,
                      mt: 0.5,
                      bgcolor: roleColor(stage.role),
                      color: "#fff",
                    }}
                  />
                  {isComplete && historyEntry?.completedAt && (
                    <Typography variant="caption" sx={{ display: "block", color: theme.palette.grey[500], mt: 0.5 }}>
                      {dayjs(historyEntry.completedAt).format("MMM D")}
                      {historyEntry.daysInStage != null && ` (${historyEntry.daysInStage}d)`}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Vehicle Configuration Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Vehicle Configuration</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <InfoRow label="Make" value="Fernhay" />
          <InfoRow label="Model" value={order.model || "eAV"} />
          <InfoRow label="Body Type" value={order.bodyType || "-"} />
          <InfoRow label="Variant" value={order.variantCodename || "-"} />
          <InfoRow label="Quantity" value={`${order.quantity}`} />
          <InfoRow label="Order Type" value={order.orderType} />
          <InfoRow label="Price" value={`${order.price?.currency || "$"}${Number(order.price?.value || 0).toLocaleString()}`} />
          <InfoRow label="Payload" value={`${order.payload?.value} ${order.payload?.unit}`} />
          <InfoRow label="Lead Time" value={`${order.leadTime?.value} ${order.leadTime?.unit}s`} />
          <InfoRow label="VIN" value={order.vin || "Pending"} />
        </Box>

        {order.configurationSections && Object.keys(order.configurationSections).length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Selected Options</Typography>
            {Object.entries(order.configurationSections).forEach(([key, section]: [string, any]) => {
              if (!section?.options) return null;
              return (
                <Box key={key} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{section.title || key}:</Typography>
                  {section.options?.filter((o: any) => o.is_selected).map((opt: any) => (
                    <Typography key={opt.id} variant="body2" sx={{ ml: 2 }}>
                      — {opt.title} {opt.price > 0 ? `(+$${opt.price})` : "(Included)"}
                    </Typography>
                  ))}
                </Box>
              );
            })}
          </>
        )}
      </Paper>

      {/* Customer & Dealer Info */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Customer</Typography>
          <InfoRow label="Name" value={order.customer?.buyerName || "-"} />
          <InfoRow label="Email" value={order.customer?.email || "-"} />
          <InfoRow label="Phone" value={order.customer?.phone || "-"} />
          <InfoRow label="Address" value={`${order.customer?.address || ""} ${order.customer?.city || ""}, ${order.customer?.state || ""} ${order.customer?.zipCode || ""}`} />
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Dealer</Typography>
          <InfoRow label="Name" value={order.dealer?.name || "-"} />
          <InfoRow label="Dealership" value={order.dealer?.dealershipName || "-"} />
          <InfoRow label="Email" value={order.dealer?.email || "-"} />
          <InfoRow label="Phone" value={order.dealer?.phone || "-"} />
        </Paper>
      </Box>

      {/* Upfitter Info (for relevant stages) */}
      {order.pipelineStage >= 6 && order.pipelineStage <= 10 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Upfitter Details</Typography>
          <InfoRow label="Company" value="EAVX" />
          <InfoRow label="Location" value="Quincy, IL" />
          <InfoRow label="Contact" value="upfit-support@eavx.com" />
          <InfoRow label="Status" value={ORDER_PIPELINE_STAGES[order.pipelineStage - 1]?.name || "-"} />
        </Paper>
      )}

      {/* Documents */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Documents</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {[
            { name: "Invoice", status: order.pipelineStage >= 3 ? "Available" : "Pending" },
            { name: "Build Sheet", status: order.pipelineStage >= 4 ? "Available" : "Pending" },
            { name: "Inspection Report", status: order.pipelineStage >= 10 ? "Available" : "Pending" },
          ].map((doc) => (
            <Paper
              key={doc.name}
              variant="outlined"
              sx={{
                p: 2,
                minWidth: 160,
                textAlign: "center",
                opacity: doc.status === "Pending" ? 0.5 : 1,
                cursor: doc.status === "Available" ? "pointer" : "default",
              }}
            >
              <Typography variant="body2" fontWeight={600}>{doc.name}</Typography>
              <Typography variant="caption" color="text.secondary">{doc.status}</Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </OrderDetailStyled>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ mb: 0.5 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={500}>{value}</Typography>
  </Box>
);

const OrderDetailStyled = styled(Box)({
  padding: "1.5rem",
  maxWidth: 1200,
  margin: "0 auto",
  "& .header": {
    marginBottom: "1.5rem",
  },
});

export default OrderDetail;
