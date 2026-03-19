import { useState } from "react";

import { Box, Typography, styled } from "@mui/material";

import getVehicleImageFilteredByColor from "~/utils/get-vehicle-image-filtered-by-color";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import CButton from "~/components/common/cbutton/cbutton";
import ImagesOr3dModel from "~/components/shared/images-or-3d-model/images-or-3d-model";
import MuiBox from "~/components/shared/mui-box/mui-box";
import PdfModal from "~/components/shared/pdf-modal/pdf-modal";
import TooltipWrapper from "~/components/shared/tooltip-wrapper/tooltip-wrapper";
import VehicleDescriptionModal from "~/components/shared/vehicle-description-modal/vehicle-description-modal";

export default function VehicleDetailsCard() {
  const { newQuoteById, selectedGroup } = useQuotationSummaryPageContextValue();
  const selectedChassis = selectedGroup?.configurationSections
    ?.find((section) => section?.title?.toLowerCase() === "chassis")
    ?.options?.find((option) => option?.is_selected);
  // Find the last (most specific) non-chassis selected option that has an image
  const allSelectedWithImages = selectedGroup?.configurationSections
    ?.filter((section) => section?.title?.toLowerCase() !== "chassis")
    ?.flatMap((section) => section?.options || [])
    ?.filter((option) => option?.is_selected && option?.additional_images?.some((img) => img?.url));
  const lastSelectedWithImage = allSelectedWithImages?.[allSelectedWithImages.length - 1];
  const selectedUpfitOrChassis = lastSelectedWithImage || selectedChassis;
  const vehicleSpecSheet =
    selectedChassis?.spec_sheet?.file?.url ||
    newQuoteById?.vehicleSpecSheets?.[0]?.file?.url;

  const [isDescriptionModalOpen, setIsDescriptionModalOpen] =
    useState<boolean>(false);
  const [isPdfModelOpen, setIsPdfModelOpen] = useState<boolean>(false);

  return (
    <VehicleDetailsCardStyled component="section">
      <MuiBox component="header" className="header">
        <Typography className="vehicle-name">
          {newQuoteById?.vehicleModel || ""}
        </Typography>

        <CButton
          id="view-spec-sheet-button"
          variant="underlinedLink"
          disabled={!vehicleSpecSheet}
          onClick={() => setIsPdfModelOpen(true)}
        >
          {"[View Specification Sheet]"}
        </CButton>
      </MuiBox>

      <MuiBox className="description-text-container">
        <TooltipWrapper title={selectedGroup?.description || ""}>
          <Typography className="description-text">
            Description: <span>{selectedGroup?.description || ""}</span>
          </Typography>
        </TooltipWrapper>

        <CButton
          id="view-full-description-button"
          variant="underlinedLink"
          onClick={() => setIsDescriptionModalOpen(true)}
        >
          View Full
        </CButton>
      </MuiBox>

      <ImagesOr3dModel
        selectedGroup={selectedGroup}
        selectedImageIndex={0}
        images={selectedUpfitOrChassis?.additional_images
          ?.filter((item) => {
            return getVehicleImageFilteredByColor({
              image: item,
              selectedGroup,
            });
          })
          ?.map((imageItem) => ({
            src: imageItem?.url,
            type: "image",
          }))}
      />

      {isDescriptionModalOpen && (
        <VehicleDescriptionModal
          isOpen={isDescriptionModalOpen}
          onClose={() => setIsDescriptionModalOpen(false)}
          initialDescription={selectedGroup?.description}
          isEditable={false}
        />
      )}

      {isPdfModelOpen && vehicleSpecSheet && (
        <PdfModal
          isOpen={isPdfModelOpen}
          onClose={() => {
            setIsPdfModelOpen(false);
          }}
          pdfBlobOrString={vehicleSpecSheet}
        />
      )}
    </VehicleDetailsCardStyled>
  );
}

const VehicleDetailsCardStyled = styled(Box)(({ theme }) => ({
  borderRadius: "0.625rem",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  padding: "24px",

  ".header": {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",

    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },

  ".vehicle-name": {
    fontSize: "1.25rem",
    fontWeight: 700,
    wordBreak: "break-word",
  },

  "#view-spec-sheet-button": {
    fontWeight: 700,
    minWidth: "12rem",
  },

  ".description-text-container": {
    display: "grid",
    gridTemplateColumns: "max-content max-content",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.25rem",
  },

  ".description-text": {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.custom.subHeadlines,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    maxWidth: "25rem",

    span: {
      color: theme.palette.custom.accentBlack,
    },
  },

  "#view-full-description-button": {
    fontWeight: 500,
    fontSize: "0.75rem",
  },

  [theme.breakpoints.up("lg")]: {
    position: "sticky",
    top: "217px",
  },

  [theme.breakpoints.down("lg")]: {
    ".images-or-3d-model": {
      margin: "0 auto",
    },
  },
}));
