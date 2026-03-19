import { Elements } from "@kontent-ai/delivery-sdk";

import {
  Box,
  Typography,
  styled,
  BoxProps,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Close from "@mui/icons-material/Close";
import { useState } from "react";

import useIncrementalIds from "~/global/custom-hooks/useIncrementalIds";

import CButton from "../common/cbutton/cbutton";
import MuiBox from "../shared/mui-box/mui-box";

interface VehicleCardsProps extends BoxProps {
  title: string;
  description?: Elements.RichTextElement;
  imageSrc: string | React.FC<React.SVGProps<SVGSVGElement>>;
  isCustomerSelected?: boolean;
  isBuildEnabled?: boolean;
  isPoolInventoryEnabled?: boolean;
  onBuildClick?: () => void;
  buttonText?: React.ReactNode;
  model: string;
  infoText?: string;
  price?: number;
}

function VehicleCard({
  title,
  imageSrc,
  isBuildEnabled,
  onBuildClick,
  buttonText,
  infoText,
  price,
}: VehicleCardsProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  const imageSvgData: {
    src: React.FC<React.SVGProps<SVGSVGElement>>;
  } = {
    src: imageSrc as React.FC<React.SVGProps<SVGSVGElement>>,
  };

  const id = useIncrementalIds({ ReactElement: BuildVehicleBoxStyled });

  return (
    <BuildVehicleBoxStyled id={`vehicle-card-${id}`}>
      <MuiBox>
        <div className="image-container">
          {imageSrc && (
            <>
              {/* @ts-ignore */}
              {typeof imageSrc === "string" ? (
                <img src={imageSrc} />
              ) : (
                // SVG doesn't render directly like `<imageSrc />`, because in HTML it is rendered as an HTML element <imagesrc />
                <imageSvgData.src />
              )}
            </>
          )}
        </div>
      </MuiBox>
      <Box className="title-price-row">
        <Box className="title-row">
          <Typography className="vehicle-card-title">{title}</Typography>
          {infoText && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setInfoOpen(true);
              }}
              sx={{ padding: 0, marginLeft: "0.25rem" }}
            >
              <InfoOutlined
                sx={(theme) => ({
                  color: theme.palette.primary.main,
                  height: "1.1rem",
                  width: "1.1rem",
                })}
              />
            </IconButton>
          )}
        </Box>
        {price != null && (
          <Typography className="vehicle-card-price">
            ${price.toLocaleString()}
          </Typography>
        )}
      </Box>
      <CButton
        id={`build-vehicle-button-${id}`}
        className="build-btn"
        variant="filled"
        onClick={onBuildClick}
        disabled={!isBuildEnabled}
        // disabled={!isBuildEnabled || !isCustomerSelected}
      >
        {buttonText}
      </CButton>

      {infoText && (
        <Dialog
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "1.25rem",
            }}
          >
            {title}
            <IconButton onClick={() => setInfoOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
              {infoText}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <CButton
              variant="filled"
              onClick={() => {
                setInfoOpen(false);
                onBuildClick?.();
              }}
              disabled={!isBuildEnabled}
            >
              {buttonText}
            </CButton>
          </DialogActions>
        </Dialog>
      )}
    </BuildVehicleBoxStyled>
  );
}

const BuildVehicleBoxStyled = styled(Box)(({ theme }) => ({
  padding: "0.75rem",
  border: `1px solid ${theme.palette.custom.gray_200}`,
  borderRadius: "0.3125rem",
  backgroundColor: "white",
  gap: "1rem",
  display: "flex",
  flexDirection: "column",
  maxWidth: "22rem",

  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },

  ".title-price-row": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  ".title-row": {
    display: "flex",
    alignItems: "center",
  },

  ".vehicle-card-title": {
    fontSize: "1.25rem",
    fontWeight: "700",
  },

  ".vehicle-card-price": {
    fontSize: "1rem",
    fontWeight: "600",
    color: theme.palette.primary.main,
    whiteSpace: "nowrap",
  },

  ".vehicle-description": {
    fontSize: "1.8rem",
    fontWeight: "400",
    textTransform: "capitalize",
    color: theme.palette.custom.baseAccent,
    marginBottom: "3.2rem",
    height: "4.3rem",
  },

  ".image-container": {
    background: theme.palette.custom.backgroundGray,
    height: "18rem",
    width: "100%",
    borderRadius: "0.3125rem",
  },

  ".image-container img, .image-container svg": {
    height: "100%",
    width: "100%",
    objectFit: "contain",
  },

  ".build-btn": {
    transition: ".1s all ease-in-out",
    marginTop: "auto",
  },
}));

export default VehicleCard;
