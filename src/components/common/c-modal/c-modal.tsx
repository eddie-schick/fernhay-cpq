import React from "react";

import { Close } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Modal,
  Typography,
  styled,
  useTheme,
} from "@mui/material";

import MuiBox from "~/components/shared/mui-box/mui-box";

type CModalType = {
  open: boolean;
  style?: object;
  handleClose: () => void;
  content: React.ReactNode;
  title: string;
};

export const CModalFooter = ({
  onSubmit,
  isLoading = false,
  isError = false,
  onCancel,
}: {
  onSubmit?: () => void;
  isLoading?: boolean;
  onCancel?: () => void;
  isError: boolean;
}) => {
  const theme = useTheme();

  return (
    <Footer isError={isError}>
      <Button
        sx={{
          padding: "0.5rem 1.875rem",
          fontWeight: "700",
          textTransform: "none",
        }}
        variant="outlined"
        id="contact-us-cancel"
        onClick={() => onCancel?.()}
      >
        Cancel
      </Button>
      <Button
        sx={{
          padding: "0.5rem 1.875rem",
          textTransform: "none",
          ...(isError && {
            background: theme.palette.custom.greyAccent,
            color: `${theme.palette.custom.white} !important`,
            border: "none",
            "&:hover": {
              background: theme.palette.custom.greyAccent,
              border: "none",
            },
          }),
        }}
        disabled={isError || isLoading}
        variant="contained"
        id="contact-us-send"
        onClick={() => {
          onSubmit?.();
        }}
      >
        {isLoading ? (
          <CircularProgress
            size="1.25rem"
            sx={{ color: theme.palette.custom.white }}
          />
        ) : (
          "Send"
        )}
      </Button>
    </Footer>
  );
};

const CModal = ({
  open,
  handleClose,
  style = {},
  content = <Typography>Content</Typography>,
  title = "Title",
}: CModalType) => {
  const defaultStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    borderRadius: "0.5rem",
    boxShadow: 24,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
    width: "95vw",
    maxWidth: "53.75rem",
  };
  return (
    <StyledModal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <MuiBox
        sx={{
          ...defaultStyle,
          ...style,
          "&:hover": { border: "none", outline: "none" },
        }}
      >
        <Header title={title} onClick={handleClose}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ fontWeight: "bold" }}
          >
            {title}
          </Typography>

          <MuiBox sx={{ cursor: "pointer", pointerEvents: "auto" }}>
            <Close />
          </MuiBox>
        </Header>
        <MuiBox className="main-content">{content}</MuiBox>
      </MuiBox>
    </StyledModal>
  );
};

const Header = styled(MuiBox)<{ title?: string }>(({ theme, title = "" }) => ({
  position: "fixed",
  top: "0.5rem",
  zIndex: 100,
  pointerEvents: "none",
  background: theme.palette.custom.white,
  display: "flex",
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  padding: "0.5rem 1.25rem 1rem 1.25rem",
  borderBottom:
    title !== "" ? `1px solid ${theme.palette.custom.tertiary}` : "unset",
  alignItems: "center",
}));

const Footer = styled(MuiBox)<{ isError?: boolean }>(({ theme }) => ({
  position: "fixed",
  left: "0rem",
  bottom: "0.5rem",
  padding: "1rem 1.25rem 0.5rem 1.25rem",
  background: theme.palette.custom.white,
  display: "flex",
  width: "100%",
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "0.625rem",
  borderTop: `1px solid ${theme.palette.custom.tertiary}`,
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  ".main-content": {
    marginTop: "3rem",
    marginBottom: "3rem",
    minHeight: "10rem",
    overflowY: "auto",
    width: "100%",

    [theme.breakpoints.down("sm")]: {
      maxHeight: "60vh",
    },
  },
}));

export default CModal;
