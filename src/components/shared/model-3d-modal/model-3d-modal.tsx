import { useEffect } from "react";

import Close from "@mui/icons-material/Close";
import { Modal, Typography, styled } from "@mui/material";

import { useAppSelector } from "~/store";
import { NewQuoteShape } from "~/store/slices/quotes/types";
import { rootSelector } from "~/store/slices/root/slice";

import CircularLoader from "../circular-loader/circular-loader";
import ModelWrapper from "../model-wrapper/model-wrapper";
import MuiBox from "../mui-box/mui-box";
import useModel3dActionButtons from "../use-model-3d-action-buttons/use-model-3d-action-buttons";

const modalStyle = {
  zIndex: 1000,
  top: "50%",
  left: "50%",
  height: "85vh",
  width: "80vw",
  transform: "translate(-50%,-50%)",
  background: "white",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
};

type Props = {
  selectedGroup: NewQuoteShape["groups"][number];
  isOpen: boolean;
  onClose?: () => void;
  isLoading?: boolean;
};
export default function Model3dModal(props: Props) {
  const { isOpen, onClose, selectedGroup, isLoading } = props;

  const { allowPlaying3dModelAnimations } = useAppSelector(rootSelector);

  const {
    isModelAnimationPlayingRef,
    modelAnimationTimeScaleRef,
    Model3dActionButtons,
    resetAnimationState,
  } = useModel3dActionButtons({ allowPlaying3dModelAnimations });

  useEffect(() => {
    // Reset animation state whenever Chassis or Upfit selection is changed
    resetAnimationState();
  }, [
    selectedGroup?.upfit?.id,
    selectedGroup?.chassis?.id,
    resetAnimationState,
  ]);

  const renderModel = () => {
    try {
      return (
        <ModelWrapper
          selectedGroup={selectedGroup}
          isModelAnimationPlaying={isModelAnimationPlayingRef}
          modelAnimationTimeScale={modelAnimationTimeScaleRef}
        />
      );
    } catch (error) {
      (() => {})();
    }
  };

  return (
    <Model3dModalStyled open={isOpen} onClose={onClose}>
      <MuiBox sx={modalStyle}>
        <MuiBox component="header" className="modal-header">
          <Typography className="modal-title">3D Model</Typography>

          <Close className="close-icon" onClick={onClose} />
        </MuiBox>

        <MuiBox className="modal-main">
          {isLoading ? (
            <CircularLoader size="40px" />
          ) : (
            <MuiBox className="model-3d-container">
              <Model3dActionButtons />
              {renderModel()}
            </MuiBox>
          )}
        </MuiBox>
      </MuiBox>
    </Model3dModalStyled>
  );
}

const Model3dModalStyled = styled(Modal)(({ theme }) => ({
  ".modal-header": {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #dbdbdb",
    paddingBlock: "20px 28px",
    paddingInline: "30px",
  },

  ".modal-title": {
    fontSize: "1.25rem",
    color: "#000",
    fontWeight: 600,
  },

  ".close-icon": {
    width: "2rem",
    height: "2rem",
    color: "#9A9393",
    cursor: "pointer",
  },

  ".modal-main": {
    padding: "2rem",
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    [theme.breakpoints.down("sm")]: {
      padding: "0.5rem",
    },

    ".model-3d-action-buttons": {
      alignSelf: "flex-start",
    },
  },

  ".model-3d-container": {
    display: "grid",
    height: "95%",
    width: "100%",
  },
}));
