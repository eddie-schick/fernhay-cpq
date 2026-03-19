import { tooltipClasses } from "@mui/material";

const muiModalBaseStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 0,
};

const muiTooltipStyles = {
  popper: {
    sx: {
      [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: "192px",
        backgroundColor: "#464646",
        color: "#ffffff",
        fontWeight: 400,
        fontSize: "1.4rem",
      },
      [`& .${tooltipClasses.arrow}`]: {
        color: "#464646",
      },
    },
  },
};

export { muiModalBaseStyles, muiTooltipStyles };
