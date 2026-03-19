import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, styled } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useState } from "react";

import CButton from "~/components/common/cbutton/cbutton";
import MuiBox from "~/components/shared/mui-box/mui-box";

import { getLocaleFormattedNumber } from "~/utils/misc";

import type { OptionsType } from "../list-view-options";

type OptionsDetailViewCarouselModalProps = {
  isOpen: boolean;
  onClose: () => void;
  options?: OptionsType[];
  initialSlideIndex?: number;
  heading?: string;
  isMultiSelect?: boolean;
  areAllDeselectable?: boolean;
  onBtnClick?: (option: OptionsType) => void;
};

export default function OptionsDetailViewCarouselModal({
  isOpen,
  onClose,
  options = [],
  initialSlideIndex = 0,
  heading = "",
  isMultiSelect = false,
  areAllDeselectable = false,
  onBtnClick,
}: OptionsDetailViewCarouselModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const currentOption = options[currentIndex];

  if (!currentOption) return null;

  // Resolve image: could be an ImageMetadataType object with .url or a plain string
  const imageUrl =
    typeof currentOption.image === "string"
      ? currentOption.image
      : currentOption.image?.url || "";

  // Resolve description: could be an Elements.RichTextElement object with .value, or a plain string
  const descriptionText =
    typeof currentOption.description === "string"
      ? currentOption.description
      : (currentOption.description as any)?.value || "";

  const goToPrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const goToNext = () => setCurrentIndex((prev) => Math.min(options.length - 1, prev + 1));

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <CarouselModalStyled>
        <DialogTitle className="modal-header">
          <Typography className="modal-title">{heading}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="modal-content">
          {imageUrl && (
            <MuiBox className="image-container">
              <img src={imageUrl} alt={currentOption.title || ""} />
            </MuiBox>
          )}

          <Typography className="option-title">{currentOption.title}</Typography>

          {descriptionText && (
            <Typography
              className="option-description"
              dangerouslySetInnerHTML={{ __html: descriptionText }}
            />
          )}

          <MuiBox className="details-grid">
            {Boolean(currentOption.price) && (
              <MuiBox className="detail-row">
                <Typography className="detail-label">Price</Typography>
                <Typography className="detail-value">
                  {currentOption.price_unit}{getLocaleFormattedNumber(currentOption.price)}
                </Typography>
              </MuiBox>
            )}
            {Boolean(currentOption.weight) && (
              <MuiBox className="detail-row">
                <Typography className="detail-label">Weight</Typography>
                <Typography className="detail-value">
                  {currentOption.weight} {currentOption.weight_unit}
                </Typography>
              </MuiBox>
            )}
            {Boolean(currentOption.leadtime) && (
              <MuiBox className="detail-row">
                <Typography className="detail-label">Lead Time</Typography>
                <Typography className="detail-value">
                  {currentOption.leadtime} {currentOption.leadtime_unit}
                </Typography>
              </MuiBox>
            )}
            {currentOption.manufacturer && (
              <MuiBox className="detail-row">
                <Typography className="detail-label">Manufacturer</Typography>
                <Typography className="detail-value">{currentOption.manufacturer}</Typography>
              </MuiBox>
            )}
          </MuiBox>

          {onBtnClick && (
            <MuiBox className="action-container">
              <CButton
                id="detail-modal-select-btn"
                variant="filled"
                onClick={() => onBtnClick(currentOption)}
              >
                {isMultiSelect ? "Toggle Selection" : "Select"}
              </CButton>
            </MuiBox>
          )}

          {options.length > 1 && (
            <MuiBox className="navigation-container">
              <CButton
                id="detail-modal-prev-btn"
                variant="link"
                onClick={goToPrev}
                disabled={currentIndex === 0}
              >
                Previous
              </CButton>
              <Typography className="nav-counter">
                {currentIndex + 1} / {options.length}
              </Typography>
              <CButton
                id="detail-modal-next-btn"
                variant="link"
                onClick={goToNext}
                disabled={currentIndex === options.length - 1}
              >
                Next
              </CButton>
            </MuiBox>
          )}
        </DialogContent>
      </CarouselModalStyled>
    </Dialog>
  );
}

const CarouselModalStyled = styled(Box)(({ theme }) => ({
  ".modal-header": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ".modal-title": {
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  ".modal-content": {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  ".image-container": {
    width: "100%",
    maxHeight: "300px",
    display: "flex",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "0.5rem",
    img: {
      maxWidth: "100%",
      maxHeight: "300px",
      objectFit: "contain",
    },
  },
  ".option-title": {
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  ".option-description": {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
  ".details-grid": {
    display: "grid",
    gap: "0.5rem",
  },
  ".detail-row": {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  ".detail-label": {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
  ".detail-value": {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  ".action-container": {
    display: "flex",
    justifyContent: "center",
    marginTop: "0.5rem",
  },
  ".navigation-container": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5rem",
  },
  ".nav-counter": {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
}));
