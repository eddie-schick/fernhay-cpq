import { useState } from "react";

import { KeyboardArrowDown } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  MenuItem,
  Select,
  Typography,
  styled,
} from "@mui/material";

import getBuildLeadTimeFromTimeGivenInDays, {
  getLocaleFormattedNumber,
} from "~/utils/misc";

import useIncrementalIds from "~/global/custom-hooks/useIncrementalIds";
import {
  ChargerOptionSchema,
  ConfigurationSectionOptionSchema,
  ConfigurationSectionOptionSchemaV2,
} from "~/global/types/types";

import CButton from "~/components/common/cbutton/cbutton";
import InfoIcon from "~/components/shared/info-icon/info-icon";
import MuiBox from "~/components/shared/mui-box/mui-box";

import OptionsDetailViewCarouselModal from "./options-detail-view-carousel-modal/options-detail-view-carousel-modal";

export type OptionsType = ConfigurationSectionOptionSchemaV2 & {
  // | ChargerOptionSchema
  checked?: boolean;
};
type ListViewOptionsProps = {
  heading: string;
  description?: string;
  isMultiSelect?: boolean;
  areAllDeselectable?: boolean;
  options?: OptionsType[];
  selectedOption?: OptionsType | OptionsType[];
  onChange?: (option: OptionsType) => void;
  selectedGroupByValue?: string;
  onSelectedGroupByValueChange?: (newValue: string) => void;
};
export default function ListViewOptions(props: ListViewOptionsProps) {
  const {
    heading,
    description = "",
    isMultiSelect = false,
    areAllDeselectable = false,
    options,
    selectedOption,
    onChange,
    selectedGroupByValue,
    onSelectedGroupByValueChange,
  } = props;

  const isSelectedOptionAnArray = Array.isArray(selectedOption);
  let manufacturersList = options?.map(
    (v) => v?.manufacturer || "No Manufacturer",
  );
  manufacturersList = [...new Set(manufacturersList)];
  const optionsByManufacturer: Record<string, OptionsType[]> =
    manufacturersList?.reduce((acc: Record<string, OptionsType[]>, cur) => {
      if (!cur) return acc;

      if (!acc[cur]) {
        const optionsFilteredByManufacturer = options?.filter(
          (v) =>
            (!v?.manufacturer ? "" : v?.manufacturer) ===
            (cur === "No Manufacturer" ? "" : cur),
        );
        acc[cur] = optionsFilteredByManufacturer || [];
      }

      return acc;
    }, {});
  const isManufacturersListEmpty =
    manufacturersList?.filter((v) => v?.toLowerCase() !== "no manufacturer")
      ?.length === 0;
  const optionsForRender = !selectedGroupByValue
    ? options
    : optionsByManufacturer[selectedGroupByValue];

  const incrementedId = useIncrementalIds({ ReactElement: ListViewOptions });

  const [isViewDetailsCarouselModalOpen, setIsViewDetailsCarouselModalOpen] =
    useState<boolean>(false);
  const [carouselModalInitialSlideIndex, setCarouselModalInitialSlideIndex] =
    useState<number>(0);

  const openViewDetailsCarouselModal = () => {
    setIsViewDetailsCarouselModalOpen(true);
  };
  const closeViewDetailsCarouselModal = () => {
    setIsViewDetailsCarouselModalOpen(false);
  };

  const onInfoIconClick = (
    _option: ConfigurationSectionOptionSchema | ChargerOptionSchema,
    index: number,
  ) => {
    setCarouselModalInitialSlideIndex(index);

    openViewDetailsCarouselModal();
  };

  const isAnyOptionDetailHidden = optionsForRender?.some(
    (obj) => obj?.should_hide_details === true,
  );

  console.log("render options", optionsForRender, description);

  return (
    <ListViewOptionsStyled>
      <MuiBox className="heading-container">
        <Typography className="option-heading">{heading}</Typography>
        {!isAnyOptionDetailHidden && (
          <MuiBox className="view-details-button-container">
            <CButton
              id={"view-options-details-button-" + incrementedId}
              variant="underlinedLink"
              onClick={() => {
                openViewDetailsCarouselModal();
                setCarouselModalInitialSlideIndex(0);
              }}
            >
              View All Details
            </CButton>
          </MuiBox>
        )}
      </MuiBox>

      {description && (
        <MuiBox className="description-container">
          <Typography className="option-description">{description}</Typography>
        </MuiBox>
      )}

      {!isManufacturersListEmpty && (
        <MuiBox className="category-selection-container">
          <Select
            value={selectedGroupByValue}
            IconComponent={KeyboardArrowDown}
            onChange={(e) => {
              if (typeof onSelectedGroupByValueChange === "function") {
                onSelectedGroupByValueChange(e?.target?.value);
              }
            }}
          >
            {manufacturersList?.map((value) => (
              <MenuItem value={value} key={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </MuiBox>
      )}

      {optionsForRender?.map((option, index) => {
        const isOptionSelected = isSelectedOptionAnArray
          ? selectedOption?.find((v) => v?.id === option?.id)
          : option?.id === selectedOption?.id;

        return (
          <MuiBox
            className={`list-option ${
              isOptionSelected ? "list-option--selected" : ""
            }`}
            onClick={() => (!onChange ? null : onChange(option))}
            key={index}
          >
            <MuiBox className="title-container-wrapper">
              {isMultiSelect && (
                <Checkbox
                  sx={{
                    padding: "0rem ",
                  }}
                  checked={Boolean(isOptionSelected)}
                  onChange={() => (!onChange ? null : onChange(option))}
                />
              )}
              <MuiBox className="title-container">
                <Typography className="title-container__title">
                  {option?.title}
                </Typography>
                {!option?.should_hide_details && (
                  <MuiBox
                    id={`${heading
                      ?.toLowerCase()
                      ?.split(" ")
                      ?.join("-")}__option-info-icon-${index}`}
                    className="title-container__tooltip-container"
                  >
                    <InfoIcon
                      onClick={(e) => {
                        e?.stopPropagation();

                        onInfoIconClick(option, index);
                      }}
                    />
                  </MuiBox>
                )}
                {option?.receiver && (
                  <Typography className="title-container__sub-title">
                    {option?.receiver}
                  </Typography>
                )}
              </MuiBox>
            </MuiBox>

            <MuiBox className="details-container">
              {
                //@ts-ignore
                option?.is_included && !option?.price ? (
                  <Typography className="detail-text detail-text--theme">
                    Included
                  </Typography>
                ) : (
                  <>
                    {Boolean(option?.price) && (
                      <Typography className="detail-text">
                        {option?.price_unit}
                        {getLocaleFormattedNumber(option?.price)}
                      </Typography>
                    )}
                    {Boolean(option?.leadtime) && (
                      <>
                        {["week"].includes(option?.leadtime_unit || "") ? (
                          <Typography className="detail-text">
                            {option?.leadtime}&nbsp;
                            {option?.leadtime === 1 ? "week" : "weeks"}
                          </Typography>
                        ) : (
                          <Typography className="detail-text">
                            {getBuildLeadTimeFromTimeGivenInDays(
                              option?.leadtime,
                            )}
                          </Typography>
                        )}
                      </>
                    )}
                  </>
                )
              }
            </MuiBox>
          </MuiBox>
        );
      })}

      {isViewDetailsCarouselModalOpen && (
        <OptionsDetailViewCarouselModal
          isOpen={isViewDetailsCarouselModalOpen}
          onClose={closeViewDetailsCarouselModal}
          options={optionsForRender}
          initialSlideIndex={carouselModalInitialSlideIndex}
          heading={heading}
          isMultiSelect={isMultiSelect}
          areAllDeselectable={areAllDeselectable}
          //@ts-ignore
          onBtnClick={onChange}
        />
      )}
    </ListViewOptionsStyled>
  );
}

const ListViewOptionsStyled = styled(Box)(({ theme }) => ({
  ".heading-container": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ".description-container": {
    marginBottom: "0.5rem",
  },

  ".option-description": {
    fontSize: "0.875rem",
  },

  ".view-details-button-container": {
    button: {
      color: theme.palette.custom.subHeadlines,
      fontSize: "0.75rem",
      fontWeight: 700,
    },
  },

  ".category-selection-container": {
    marginBottom: "1rem",
    display: "grid",

    ".MuiOutlinedInput-root": {
      maxHeight: "2.3125rem",
      fontSize: "0.875rem",
    },
  },

  ".list-option": {
    padding: "16px",
    border: `1px solid ${theme.palette.custom.tertiary}`,
    borderRadius: "0.3125rem",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    cursor: "pointer",
    gap: "10px",
    alignItems: "center",
  },

  ".list-option--selected": {
    border: `2px solid ${theme.palette.primary.main}`,
    padding: "15px",
  },

  ".title-container": {
    display: "grid",
    alignItems: "center",
    columnGap: "0.5rem",
    // rowGap: "0.25rem",
    gridTemplateAreas: `
    "title tooltip"
    "subTitle subTitle"
    `,
  },

  ".title-container-wrapper": {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },

  ".title-container__title": {
    gridArea: "title",
    fontSize: "0.875rem",
  },

  ".title-container__tooltip-container": {
    gridArea: "tooltip",
  },

  ".title-container__sub-title": {
    gridArea: "subTitle",
    fontSize: "0.875rem",
    color: theme.palette.custom.subHeadlines,
  },

  ".detail-text": {
    fontSize: "0.875rem",
    color: theme.palette.custom.accentBlack,
    fontWeight: 500,
    textAlign: "right",
  },
  ".detail-text--theme": {
    color: theme.palette.primary.main,
  },
}));
