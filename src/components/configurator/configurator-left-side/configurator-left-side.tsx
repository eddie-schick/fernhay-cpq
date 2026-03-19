import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { EditOutlined } from "@mui/icons-material";
import { Box, Typography, styled } from "@mui/material";

import getVehicleImageFilteredByColor from "~/utils/get-vehicle-image-filtered-by-color";

import { RootState, useAppDispatch, useAppSelector } from "~/store";
import { selectQuoteById, setQuoteById } from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";

import CBackButton from "~/components/common/c-back-button/c-back-button";
import CButton from "~/components/common/cbutton/cbutton";
import ImagesOr3dModel from "~/components/shared/images-or-3d-model/images-or-3d-model";
import MuiBox from "~/components/shared/mui-box/mui-box";
import PdfModal from "~/components/shared/pdf-modal/pdf-modal";
import TooltipWrapper from "~/components/shared/tooltip-wrapper/tooltip-wrapper";
import VehicleDescriptionModal from "~/components/shared/vehicle-description-modal/vehicle-description-modal";

export default function ConfiguratorLeftSide() {
  const storeDispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId");

  const newQuoteById = useAppSelector((state: RootState) =>
    selectQuoteById(state, quoteId!),
  ) as NewQuoteShape;
  const selectedGroup = newQuoteById?.groups?.find(
    (group) => group.isSelected === true,
  ) as NewQuoteShape["groups"][number];
  const selectedChassis = selectedGroup?.configurationSections
    ?.find((section) => section?.title?.toLowerCase() === "chassis")
    ?.options?.find((option) => option?.is_selected);
  const selectedUpfit = selectedGroup?.configurationSections
    ?.find((section) => section?.title?.toLowerCase() === "upfit")
    ?.options?.find((option) => option?.is_selected);
  // Find the selected door configuration option
  const selectedDoorOption = selectedGroup?.configurationSections
    ?.find((section) => section?.title?.toLowerCase() === "door configuration")
    ?.options?.find((option) => option?.is_selected);
  const isRollUpDoorRear = selectedDoorOption?.title === "Roll-Up Door — Rear";

  // Find the last (most specific) non-chassis selected option that has an image.
  // For Interior Upfit images: only show them if Roll-Up Door — Rear is selected,
  // because the shelving images were photographed with roll-up doors.
  // For other door configs, skip upfit images and show the door config image instead.
  const allSelectedWithImages = selectedGroup?.configurationSections
    ?.filter((section) => {
      const sectionTitle = section?.title?.toLowerCase();
      if (sectionTitle === "chassis") return false;
      // Skip interior upfit images when a non-roll-up door is selected
      if (sectionTitle === "interior upfit" && !isRollUpDoorRear) return false;
      return true;
    })
    ?.flatMap((section) => section?.options || [])
    ?.filter((option) => option?.is_selected && option?.additional_images?.some((img) => img?.url));
  const lastSelectedWithImage = allSelectedWithImages?.[allSelectedWithImages.length - 1];
  const selectedUpfitOrChassis = selectedUpfit || lastSelectedWithImage || selectedChassis;
  const vehicleSpecSheet =
    selectedChassis?.spec_sheet?.file?.url ||
    newQuoteById?.vehicleSpecSheets?.[0]?.file?.url;

  const [isDescriptionModalOpen, setIsDescriptionModalOpen] =
    useState<boolean>(false);
  const [isPdfModelOpen, setIsPdfModelOpen] = useState<boolean>(false);

  const onAddDescriptionClick = () => {
    setIsDescriptionModalOpen(true);
  };

  console.log("selected chassis is", selectedUpfitOrChassis, selectedGroup);

  const onSaveDescription = (newValue: string) => {
    storeDispatch(
      setQuoteById({
        quoteId: quoteId!,
        data: {
          ...newQuoteById,
          groups: newQuoteById?.groups?.map((v) =>
            v?.id !== selectedGroup?.id
              ? v
              : {
                  ...v,
                  description: newValue,
                },
          ),
        },
      }),
    );

    setIsDescriptionModalOpen(false);
  };

  return (
    <ConfiguratorLeftSideStyled>
      <MuiBox
        sx={{
          position: "sticky",
          top: "6rem",
        }}
      >
        <CBackButton />

        <MuiBox className="vehicle-model-name-container">
          <Typography className="vehicle-model-name">
            {newQuoteById?.vehicleModel || "Vehicle Model"}
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

        <Typography className="customer-name-text">
          Customer:{" "}
          <span>
            {newQuoteById?.customer?.buyerName || newQuoteById?.customer?.name}
          </span>
        </Typography>

        {selectedGroup?.description ? (
          <MuiBox className="description-text-container">
            <TooltipWrapper title={selectedGroup?.description}>
              <Typography className="description-text">
                Description: <span>{selectedGroup?.description}</span>
              </Typography>
            </TooltipWrapper>

            <EditOutlined
              id="edit-description-icon"
              className="edit-description-icon"
              onClick={onAddDescriptionClick}
            />
          </MuiBox>
        ) : (
          <CButton
            id="add-a-description-button"
            variant="underlinedLink"
            onClick={onAddDescriptionClick}
          >
            Add a Description?
          </CButton>
        )}

        <MuiBox className="images-or-3d-model-container">
          <ImagesOr3dModel
            selectedGroup={selectedGroup}
            selectedImageIndex={0}
            images={selectedUpfitOrChassis?.additional_images
              // ?.concat(selectedUpfitOrChassis?.image)
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
            showThumbs
          />
        </MuiBox>
      </MuiBox>

      {isDescriptionModalOpen && (
        <VehicleDescriptionModal
          isOpen={isDescriptionModalOpen}
          onClose={() => setIsDescriptionModalOpen(false)}
          initialDescription={selectedGroup?.description}
          onSave={onSaveDescription}
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
    </ConfiguratorLeftSideStyled>
  );
}

const ConfiguratorLeftSideStyled = styled(Box)(({ theme }) => ({
  width: "100%",

  ".vehicle-model-name-container": {
    marginTop: "1rem",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
  },

  ".vehicle-model-name": {
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: "normal",
  },

  "#view-spec-sheet-button": {
    fontWeight: 700,
    minWidth: "12.5rem",
  },

  ".customer-name-text": {
    fontSize: "1rem",
    fontWeight: 400,
    color: theme.palette.custom.accentBlack,
    marginTop: "0.25rem",

    span: {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
  },

  ".description-text-container": {
    display: "grid",
    gridTemplateColumns: "max-content 2.2rem",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.25rem",
  },

  ".description-text": {
    fontSize: "1rem",
    fontWeight: 400,
    color: theme.palette.custom.subHeadlines,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    maxWidth: "40rem",

    span: {
      color: theme.palette.custom.accentBlack,
    },
  },

  ".edit-description-icon": {
    cursor: "pointer",
    fontSize: "1.25rem",
  },

  "#add-a-description-button": {
    fontSize: "1rem",
    fontWeight: 400,
    color: theme.palette.custom.subHeadlines,
    marginTop: "0.25rem",
  },

  ".images-or-3d-model-container": {
    marginTop: "1.5rem",

    ".images-or-3d-model": {
      maxWidth: "unset",
    },

    ".swiper__vehicle-main-image": {
      // [theme.breakpoints.up("xl")]: {
      //   maxWidth: "60rem",
      //   maxHeight: "38rem",
      // },

      maxWidth: "40rem",
      maxHeight: "35vh",
      objectFit: "contain",
    },

    ".vehicle-images__swiper .swiper-slide": {
      textAlign: "center",
    },
  },

  "@media screen and (min-height:800px)": {
    ".images-or-3d-model-container": {
      ".swiper__vehicle-main-image": {
        maxHeight: "40vh",
      },
    },
  },

  "@media screen and (min-height:880px)": {
    ".images-or-3d-model-container": {
      ".swiper__vehicle-main-image": {
        maxHeight: "45vh",
      },
    },
  },

  "@media screen and (min-height:950px)": {
    ".images-or-3d-model-container": {
      ".swiper__vehicle-main-image": {
        maxHeight: "50vh",
      },
    },
  },

  "@media screen and (min-height:1080px)": {
    ".images-or-3d-model-container": {
      ".swiper__vehicle-main-image": {
        maxWidth: "60rem",
        maxHeight: "38rem",
      },
    },
  },

  [theme.breakpoints.down("lg")]: {
    ".images-or-3d-model-container": {
      display: "flex",
      justifyContent: "center",

      ".images-or-3d-model": {
        width: "100%",
      },
    },

    ".vehicle-images__swiper-thumbs": {
      height: "12rem !important",
    },

    ".vehicle-images__swiper-thumbs .swiper-wrapper .swiper-slide": {
      maxHeight: "4rem",
    },

    ".swiper-button-prev,.swiper-button-next": {
      top: "75% !important",
    },
  },
}));
