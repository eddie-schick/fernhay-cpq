import { useRef, useState } from "react";

import { Pause, PlayArrow, Speed } from "@mui/icons-material";
import {
  Box,
  Popover,
  Switch,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";

import { SheadLogoPng27x32 } from "~/global/icons";

import MuiBox from "../mui-box/mui-box";

type AnimationDetailsType = {
  timeScale: number;
};
type Props = {
  allowPlaying3dModelAnimations?: boolean;
};
const MAX_ANIMATION_SPEED = 2.0;
const DEFAULT_ANIMATION_SPEED = 1.0;
export default function useModel3dActionButtons(props: Props) {
  const { allowPlaying3dModelAnimations } = props;

  // Using `useRef` for model animation properties, since `useState` causes a re-render
  // Re-rendering is causing issues, displays 'Failed to load model' sometimes, the cause is not determined yet.
  const isModelAnimationPlayingRef = useRef<boolean>(false);
  const modelAnimationTimeScaleRef = useRef<number>(DEFAULT_ANIMATION_SPEED);

  const resetAnimationState = () => {
    isModelAnimationPlayingRef.current = false;
    modelAnimationTimeScaleRef.current = DEFAULT_ANIMATION_SPEED;
  };

  function Model3dActionButtons() {
    const [isModelAnimationPlaying, setIsModelAnimationPlaying] =
      useState<boolean>(false);
    const [controlSpeedPopoverAnchorEl, setControlSpeedPopoverAnchorEl] =
      useState<null | HTMLDivElement>(null);
    const [animationDetails, setAnimationDetails] =
      useState<AnimationDetailsType>({
        timeScale: DEFAULT_ANIMATION_SPEED,
      });

    const onPlayPauseButtonClickLocal = () => {
      setIsModelAnimationPlaying((prev) => {
        const newValue = !prev;

        isModelAnimationPlayingRef.current = newValue;

        return newValue;
      });
    };

    const onAnimationTimeScaleChangeLocal = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const newValue = Number(e?.target?.value || 0);

      setAnimationDetails((prev) => ({
        ...prev,
        timeScale: newValue,
      }));

      modelAnimationTimeScaleRef.current = newValue;
    };

    return (
      <Model3dActionButtonsStyled>
        {allowPlaying3dModelAnimations && (
          <Box className="model-3d-action-buttons">
            <MuiBox
              className="action-button"
              onClick={onPlayPauseButtonClickLocal}
            >
              <Tooltip
                title={
                  isModelAnimationPlaying ? "Pause Animation" : "Play Animation"
                }
              >
                {isModelAnimationPlaying ? <Pause /> : <PlayArrow />}
              </Tooltip>
            </MuiBox>

            <MuiBox
              className="action-button"
              onClick={(e) => {
                setControlSpeedPopoverAnchorEl(e?.currentTarget);
              }}
            >
              <Tooltip title={"Change Animation Speed"}>
                <Speed />
              </Tooltip>
            </MuiBox>

            <Popover
              open={Boolean(controlSpeedPopoverAnchorEl)}
              anchorEl={controlSpeedPopoverAnchorEl}
              onClose={() => {
                setControlSpeedPopoverAnchorEl(null);
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <MuiBox
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                }}
              >
                <Typography sx={{ fontSize: "1rem" }}>
                  Animation Speed:&nbsp;&nbsp;
                </Typography>
                <input
                  id="speed-range"
                  type="range"
                  min={0}
                  max={MAX_ANIMATION_SPEED}
                  step={0.1}
                  value={animationDetails.timeScale}
                  onChange={onAnimationTimeScaleChangeLocal}
                />
                <Typography sx={{ fontSize: "1rem", marginLeft: "0.3125rem" }}>
                  {animationDetails.timeScale}
                </Typography>
              </MuiBox>
            </Popover>
          </Box>
        )}
      </Model3dActionButtonsStyled>
    );
  }

  return {
    isModelAnimationPlayingRef,
    modelAnimationTimeScaleRef,
    Model3dActionButtons,
    resetAnimationState,
  };
}

// eslint-disable-next-line react-refresh/only-export-components
const Model3dActionButtonsStyled = styled(Box)(({ theme }) => ({
  ".model-3d-action-buttons": {
    display: "flex",
    gap: "0.5rem",
  },

  ".action-button": {
    borderRadius: "4px",
    border: `1px solid ${theme.palette.primary.main}`,
    width: "max-content",
    height: "max-content",
    padding: "4px 8px",
    cursor: "pointer",

    svg: {
      color: theme.palette.primary.main,
      height: "1.5rem",
      width: "1.5rem",
    },
  },
}));
