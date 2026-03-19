import { Box, Typography, styled } from "@mui/material";

import { APP_NAMES } from "~/constants/constants";
import Envs from "~/constants/envs";

import { getLocaleFormattedNumber } from "~/utils/misc";

import { SheadLogoPng27x32 } from "~/global/icons";

import { NewQuoteShape } from "~/store/slices/quotes/types";

import MuiBox from "~/components/shared/mui-box/mui-box";
import TooltipWrapper from "~/components/shared/tooltip-wrapper/tooltip-wrapper";

export type ColorOption = NewQuoteShape["groups"][number]["paintType"];
type PaintOptionsProps = {
  colorsOptions: ColorOption[] | undefined;
  selectedColorOption?: ColorOption;
  onColorChange?: (colorOption: ColorOption) => void;
};
export default function PaintOptions(props: PaintOptionsProps) {
  const { colorsOptions, selectedColorOption, onColorChange } = props;

  return (
    <PaintOptionsStyled>
      <Typography className="option-heading">Paint</Typography>

      {selectedColorOption && (
        <>
          <Typography className="selected-color-text">
            {selectedColorOption?.title}
          </Typography>
          {selectedColorOption?.is_included ? (
            <Typography className="selected-color-text selected-color-text--included">
              Included
            </Typography>
          ) : [0, null, undefined].includes(selectedColorOption?.price) &&
            Envs.APP_NAME === APP_NAMES.STREET_ROD ? (
            <></>
          ) : (
            <Typography className="selected-color-text">
              +{selectedColorOption?.price_unit}
              {getLocaleFormattedNumber(selectedColorOption?.price)}
            </Typography>
          )}
        </>
      )}
      <MuiBox className="paint-options-container">
        {colorsOptions?.map((option, index) => {
          if (option?.kontentAi__item__codename?.startsWith("shaed_wrapper")) {
            return (
              <TooltipWrapper
                key={index}
                title="SHAED Wrapper"
                placement="bottom"
                tooltipStyles={{
                  fontSize: "0.75rem",
                  padding: "4px 10px",
                }}
              >
                <div>
                  <MuiBox
                    className={`paint-option-color ${
                      option?.id === selectedColorOption?.id
                        ? "paint-option-color--selected"
                        : ""
                    }`}
                    onClick={() =>
                      !onColorChange ? null : onColorChange(option)
                    }
                    sx={{
                      backgroundColor: "#000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      img: {
                        width: "90%",
                        height: "90%",
                        objectFit: "contain",
                      },
                    }}
                  >
                    <img src={SheadLogoPng27x32} />
                  </MuiBox>
                </div>
              </TooltipWrapper>
            );
          }
          return (
            <TooltipWrapper
              key={index}
              title={option?.title || ""}
              placement="bottom"
              tooltipStyles={{
                fontSize: "0.75rem",
                padding: "4px 10px",
              }}
            >
              <div>
                <MuiBox
                  key={index}
                  className={`paint-option-color ${
                    option?.id === selectedColorOption?.id
                      ? "paint-option-color--selected"
                      : ""
                  }`}
                  onClick={() =>
                    !onColorChange ? null : onColorChange(option)
                  }
                  sx={{ backgroundColor: option?.hexCode }}
                />
              </div>
            </TooltipWrapper>
          );
        })}
      </MuiBox>
    </PaintOptionsStyled>
  );
}

const PaintOptionsStyled = styled(Box)(({ theme }) => ({
  ".selected-color-text": {
    fontSize: "0.875rem",
    fontWeight: 400,
    marginBottom: "0.5rem",
  },
  ".selected-color-text--included": {
    color: theme.palette.primary.main,
    fontWeight: 500,
  },

  ".paint-options-container": {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },

  ".paint-option-color": {
    height: "1.875rem",
    width: "1.875rem",
    borderRadius: "100%",
    position: "relative",
    border: "1px solid rgba(0,0,0,0.2)",
    cursor: "pointer",
  },
  ".paint-option-color--selected": {
    boxShadow: `0px 0px 0px 3px #ffffff, 0px 0px 0px 5px ${theme.palette.primary.main}`,

    // "&::before": {
    //   content: "''",
    //   position: "absolute",
    //   height: "100%",
    //   width: "100%",
    //   backgroundColor: "transparent",
    //   border: `1px solid ${theme.palette.primary.main}`,
    //   transform: "scale(1.5)",
    //   borderRadius: "100%",
    // },
  },
}));
