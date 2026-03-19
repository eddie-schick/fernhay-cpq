import { useState } from "react";

import { Check, Edit, NavigateNext } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Popover,
  TextField,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";

import { ORDER_PIPELINE_STAGES } from "~/data/demo-orders";

import MuiBox from "~/components/shared/mui-box/mui-box";

export interface PipelineHistoryItem {
  stage: number;
  name: string;
  responsible: string;
  completedAt: string | null;
  daysInStage: number | null;
  estimatedDate?: string | null;
}

interface RowDetailsStatusTrackingProps {
  status: string;
  pipelineHistory?: PipelineHistoryItem[];
  pipelineStage?: number;
  estimatedDeliveryDate?: string;
  onStageUpdate?: (newStage: number, updatedHistory: PipelineHistoryItem[]) => void;
}

function RowDetailsStatusTracking({
  status,
  pipelineHistory,
  pipelineStage = 1,
  estimatedDeliveryDate,
  onStageUpdate,
}: RowDetailsStatusTrackingProps) {
  const stages = ORDER_PIPELINE_STAGES;

  const [editAnchor, setEditAnchor] = useState<HTMLElement | null>(null);
  const [editingStageIdx, setEditingStageIdx] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);

  const handleStageClick = (e: React.MouseEvent<HTMLElement>, idx: number) => {
    if (!onStageUpdate) return;
    setEditingStageIdx(idx);
    const item = pipelineHistory?.[idx];
    setEditDate(item?.completedAt || item?.estimatedDate || new Date().toISOString().split("T")[0]);
    setEditAnchor(e.currentTarget);
  };

  const handleSaveDate = () => {
    if (editingStageIdx == null || !pipelineHistory || !onStageUpdate) return;

    const editedStage = pipelineHistory[editingStageIdx];
    const isFutureStage = editedStage.stage > pipelineStage;
    const isCurrentOrPast = !isFutureStage;

    let updated = pipelineHistory.map((item, i) => {
      if (i === editingStageIdx) {
        if (isCurrentOrPast) {
          // Mark completed for current/past stages
          return { ...item, completedAt: editDate, daysInStage: item.daysInStage ?? 0 };
        } else {
          // For future stages, only update the estimated date — don't mark as completed
          return { ...item, estimatedDate: editDate };
        }
      }
      return item;
    });

    // Waterfall: push all subsequent estimated dates forward from the edited stage
    if (editingStageIdx < updated.length - 1) {
      const DEFAULT_DAYS = [0, 3, 2, 3, 14, 5, 2, 21, 5, 3, 5, 1];
      let cursor = new Date(editDate);
      for (let i = editingStageIdx + 1; i < updated.length; i++) {
        // Only push forward stages that aren't already completed
        if (!updated[i].completedAt) {
          const estDays = DEFAULT_DAYS[i] ?? 3;
          cursor = new Date(cursor);
          cursor.setDate(cursor.getDate() + estDays);
          updated[i] = { ...updated[i], estimatedDate: cursor.toISOString().split("T")[0] };
        }
      }
    }

    // Recalculate current stage from completedAt fields only
    let newStage = 1;
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].completedAt) {
        newStage = updated[i].stage + 1;
      }
    }
    if (newStage > 12) newStage = 12;

    onStageUpdate(newStage, updated);
    setEditAnchor(null);
    setEditingStageIdx(null);
  };

  const handleClearDate = () => {
    if (editingStageIdx == null || !pipelineHistory || !onStageUpdate) return;

    const updated = pipelineHistory.map((item, i) => {
      if (i === editingStageIdx) {
        return { ...item, completedAt: null, daysInStage: null };
      }
      return item;
    });

    let newStage = 1;
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].completedAt) {
        newStage = updated[i].stage + 1;
      }
    }
    if (newStage > 12) newStage = 12;

    onStageUpdate(newStage, updated);
    setEditAnchor(null);
    setEditingStageIdx(null);
  };

  const handleAdvanceToNext = () => {
    setShowAdvanceConfirm(true);
  };

  const handleConfirmAdvance = () => {
    setShowAdvanceConfirm(false);
    if (!pipelineHistory || !onStageUpdate || pipelineStage >= 12) return;
    const today = new Date().toISOString().split("T")[0];
    const currentIdx = pipelineStage - 1; // 0-based index of current stage

    let updated = pipelineHistory.map((item) => {
      if (item.stage === pipelineStage) {
        return { ...item, completedAt: today, daysInStage: 0 };
      }
      return item;
    });

    // Waterfall: recalculate estimated dates for all future uncompleted stages
    const DEFAULT_DAYS = [0, 3, 2, 3, 14, 5, 2, 21, 5, 3, 5, 1];
    let cursor = new Date(today);
    for (let i = currentIdx + 1; i < updated.length; i++) {
      if (!updated[i].completedAt) {
        const estDays = DEFAULT_DAYS[i] ?? 3;
        cursor = new Date(cursor);
        cursor.setDate(cursor.getDate() + estDays);
        updated[i] = { ...updated[i], estimatedDate: cursor.toISOString().split("T")[0] };
      }
    }

    onStageUpdate(pipelineStage + 1, updated);
  };

  // Get display date for a stage: actual completion > estimated
  const getDisplayDate = (historyItem?: PipelineHistoryItem) => {
    if (historyItem?.completedAt) return historyItem.completedAt;
    if (historyItem?.estimatedDate) return historyItem.estimatedDate;
    return null;
  };

  return (
    <TimelineContainer>
      <MuiBox className="timeline-header">
        <Typography className="timeline-title">Order Timeline</Typography>
        {onStageUpdate && pipelineStage < 12 && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleAdvanceToNext}
            startIcon={<NavigateNext />}
            sx={{
              fontSize: "0.7rem",
              textTransform: "none",
              padding: "0.15rem 0.5rem",
              borderRadius: "1rem",
              minHeight: 0,
            }}
          >
            Advance to {stages[pipelineStage]?.name || "Next"}
          </Button>
        )}
      </MuiBox>
      <StepsContainer stageCount={stages.length} pipelineStage={pipelineStage}>
        {/* Continuous line behind all dots */}
        <div className="timeline-line" />
        {stages.map((stage, idx) => {
          const historyItem = pipelineHistory?.[idx];
          const isCompleted = stage.stage < pipelineStage;
          const isCurrent = stage.stage === pipelineStage;
          const isUpfitterReceived = stage.stage === 7;
          const isActive = isCompleted || isCurrent;
          const displayDate = getDisplayDate(historyItem);
          const isFutureDate = !historyItem?.completedAt && !!historyItem?.estimatedDate;

          return (
            <Tooltip
              key={stage.stage}
              title={
                <div>
                  <div><strong>{stage.name}</strong></div>
                  <div>Responsible: {stage.responsible}</div>
                  {historyItem?.completedAt && (
                    <div>Completed: {historyItem.completedAt}</div>
                  )}
                  {!historyItem?.completedAt && historyItem?.estimatedDate && (
                    <div>Est. Date: {historyItem.estimatedDate}</div>
                  )}
                  {historyItem?.daysInStage != null && (
                    <div>Duration: {historyItem.daysInStage} day{historyItem.daysInStage !== 1 ? "s" : ""}</div>
                  )}
                  {onStageUpdate && <div style={{ marginTop: 4, fontStyle: "italic" }}>Click to edit date</div>}
                </div>
              }
              arrow
              placement="top"
            >
              <Step
                active={isActive}
                isCurrent={isCurrent}
                isHeroStage={isUpfitterReceived}
                isEditable={!!onStageUpdate}
                onClick={(e) => handleStageClick(e, idx)}
              >
                <div className="step-label">{stage.name}</div>
                <div className="step-responsible">{stage.responsible}</div>
                <div className={`step-icon ${isUpfitterReceived ? "hero-icon" : ""}`}>
                  {isCompleted && <Check />}
                  {isCurrent && !isCompleted && (
                    <div className="current-dot" />
                  )}
                </div>
                <div className={`step-date ${isFutureDate ? "estimated" : ""}`}>
                  {displayDate || "\u00A0"}
                </div>
                {onStageUpdate && (isCompleted || isCurrent) && (
                  <Edit className="edit-icon" sx={{ fontSize: "0.6rem !important" }} />
                )}
              </Step>
            </Tooltip>
          );
        })}
      </StepsContainer>

      <Popover
        open={Boolean(editAnchor)}
        anchorEl={editAnchor}
        onClose={() => setEditAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiBox sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, minWidth: 220 }}>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
            {editingStageIdx != null ? stages[editingStageIdx]?.name : ""}
          </Typography>
          <TextField
            type="date"
            size="small"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            label={
              editingStageIdx != null && pipelineHistory?.[editingStageIdx]
                && pipelineHistory[editingStageIdx].stage > pipelineStage
                ? "Estimated Date"
                : "Completion Date"
            }
            sx={{ fontSize: "0.8rem" }}
          />
          <MuiBox sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSaveDate}
              sx={{ fontSize: "0.7rem", textTransform: "none", flex: 1 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleClearDate}
              sx={{ fontSize: "0.7rem", textTransform: "none" }}
            >
              Clear
            </Button>
          </MuiBox>
        </MuiBox>
      </Popover>

      {/* Advance stage confirmation dialog */}
      <Dialog
        open={showAdvanceConfirm}
        onClose={() => setShowAdvanceConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
          Confirm Stage Advancement
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "0.875rem" }}>
            Are you sure you want to advance this order from{" "}
            <strong>{stages[pipelineStage - 1]?.name}</strong> to{" "}
            <strong>{stages[pipelineStage]?.name || "Next"}</strong>?
            This will mark the current stage as completed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowAdvanceConfirm(false)}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", fontSize: "0.8rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAdvance}
            variant="contained"
            size="small"
            sx={{ textTransform: "none", fontSize: "0.8rem" }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </TimelineContainer>
  );
}

export default RowDetailsStatusTracking;

const TimelineContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  width: "100%",

  ".timeline-header": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },

  ".timeline-title": {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.custom.accentBlack,
  },
}));

const StepsContainer = styled(MuiBox)<{
  stageCount: number;
  pipelineStage: number;
}>(({ theme, stageCount, pipelineStage }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 0,
  overflowX: "auto",
  paddingBottom: "0.5rem",
  position: "relative",

  // Continuous line through all dots — positioned at the vertical center of the step-icon circles
  // Layout: label(2rem) + gap(0.35rem) + responsible(~0.55rem) + marginBottom(0.15rem) + gap(0.35rem) + half-icon(0.55rem)
  ".timeline-line": {
    position: "absolute",
    top: "calc(2rem + 0.35rem + 0.55rem + 0.15rem + 0.35rem + 0.55rem)",
    left: "2.75rem", // half of first step width
    right: "2.75rem", // half of last step width
    height: "2px",
    background: `linear-gradient(to right, ${theme.palette.primary.main} ${((pipelineStage - 1) / (stageCount - 1)) * 100}%, ${theme.palette.custom.greyAccent} ${((pipelineStage - 1) / (stageCount - 1)) * 100}%)`,
    zIndex: 0,
  },

  "&::-webkit-scrollbar": {
    height: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: "10px",
    backgroundColor: "#D6D6D6",
  },

  [theme.breakpoints.down("md")]: {
    padding: "0 0.5rem 0.5rem",
  },
}));

const Step = styled(MuiBox)<{
  active: boolean;
  isCurrent: boolean;
  isHeroStage: boolean;
  isEditable: boolean;
}>(({ theme, active, isCurrent, isHeroStage, isEditable }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  fontSize: "0.7rem",
  gap: "0.35rem",
  fontWeight: 500,
  flex: "1 1 0",
  minWidth: "5.5rem",
  textAlign: "center",
  position: "relative",
  cursor: isEditable ? "pointer" : "default",
  zIndex: 1,

  "&:hover .edit-icon": {
    opacity: 1,
  },

  ".edit-icon": {
    opacity: 0,
    color: theme.palette.primary.main,
    transition: "opacity 0.15s ease",
    position: "absolute",
    bottom: "-0.2rem",
    right: "0.8rem",
  },

  ".step-label": {
    fontSize: "0.65rem",
    fontWeight: isCurrent ? 700 : 500,
    color: active ? theme.palette.custom.accentBlack : theme.palette.custom.greyAccent,
    lineHeight: 1.2,
    minHeight: "2rem",
    display: "flex",
    alignItems: "center",
  },

  ".step-responsible": {
    fontSize: "0.55rem",
    color: theme.palette.custom.lightGray,
    fontWeight: 400,
    marginBottom: "0.15rem",
  },

  ".step-icon": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.1rem",
    height: "1.1rem",
    borderRadius: "50%",
    color: active ? theme.palette.custom.baseWhite : undefined,
    backgroundColor: active
      ? theme.palette.primary.main
      : theme.palette.custom.greyAccent,
    position: "relative",
    transition: "all 0.2s ease",
    zIndex: 2,
    svg: {
      fontSize: "0.75rem !important",
    },

    ".current-dot": {
      width: "0.35rem",
      height: "0.35rem",
      borderRadius: "50%",
      backgroundColor: "#fff",
      animation: "pulse 1.5s infinite",
    },
  },

  // Hero stage (Received at Upfitter) - stage 7
  ".hero-icon": {
    ...(isHeroStage && active && {
      width: "1.4rem",
      height: "1.4rem",
      backgroundColor: "#E65100",
      boxShadow: "0 0 0 3px rgba(230, 81, 0, 0.25)",
    }),
  },

  ".step-date": {
    fontSize: "0.55rem",
    color: active
      ? (isCurrent ? theme.palette.primary.main : theme.palette.custom.lightGray)
      : "#888888",
    fontWeight: isCurrent ? 600 : 400,
    marginTop: "0.1rem",
    minHeight: "0.8rem",

    "&.estimated": {
      fontStyle: "italic",
      opacity: 0.85,
    },
  },

  "@keyframes pulse": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.4 },
    "100%": { opacity: 1 },
  },
}));
