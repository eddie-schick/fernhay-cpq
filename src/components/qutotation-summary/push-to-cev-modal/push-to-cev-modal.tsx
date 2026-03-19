import { useMemo, useState } from "react";

import Close from "@mui/icons-material/Close";
import { Modal, Theme, Typography, styled } from "@mui/material";

import Envs from "~/constants/envs";

import getVehicleImageFilteredByColor from "~/utils/get-vehicle-image-filtered-by-color";
import { generateRandomVIN, getLocaleFormattedNumber } from "~/utils/misc";

import { SuccessIcon } from "~/global/icons";
import { muiModalBaseStyles } from "~/global/styles/mui-styles";

import { useAppSelector } from "~/store";
import { usePushVehicleToCevsMutation } from "~/store/endpoints/misc/misc";
import { calculatedSingleGroupTotalPricePerVehicleSelector } from "~/store/slices/quotes/slice";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import CModal from "~/components/common/c-modal/c-modal";
import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};
export default function PushToCevModal(props: Props) {
  const { isOpen, onClose } = props;

  const { triggerToast } = useCustomToast();

  const { newQuoteById, selectedGroup } = useQuotationSummaryPageContextValue();
  const selectedChassis = selectedGroup?.configurationSections
    ?.find((section) => section?.title?.toLowerCase() === "chassis")
    ?.options?.find((option) => option?.is_selected);
  const selectedUpfit = selectedGroup?.configurationSections
    ?.find((section) => section?.title?.toLowerCase() === "upfit")
    ?.options?.find((option) => option?.is_selected);
  const selectedUpfitOrChassis = selectedUpfit || selectedChassis;
  const vehicleImages = selectedUpfitOrChassis?.additional_images
    ?.filter((item) => {
      return getVehicleImageFilteredByColor({
        image: item,
        selectedGroup,
      });
    })
    ?.map((imageItem) => ({
      src: imageItem?.url,
      type: "image",
    }));
  const imageDetails = {
    vehicleImage: vehicleImages?.[0]?.src,
    altName: newQuoteById?.vehicleName,
  };

  const singleGroupSingleVehicleTotalPrice = useAppSelector(() =>
    calculatedSingleGroupTotalPricePerVehicleSelector(selectedGroup),
  );
  const singleGroupMSRPPerVehicle = useMemo(() => {
    if (singleGroupSingleVehicleTotalPrice == null) return null;
    return {
      currency: singleGroupSingleVehicleTotalPrice.currency,
      value: (singleGroupSingleVehicleTotalPrice.value ?? 0) + 3000,
    };
  }, [singleGroupSingleVehicleTotalPrice]);

  const [pushVehicleToCevs, pushVehicleToCevsMutationState] =
    usePushVehicleToCevsMutation();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  console.log({ Envs });

  const onCloseLocal = () => {
    if (pushVehicleToCevsMutationState.isLoading) return;

    if (typeof onClose === "function") {
      onClose();
    }
  };

  const onPushClick = () => {
    (async () => {
      try {
        const pushToCevsRes = await pushVehicleToCevs({
          data: {
            make: newQuoteById?.vehicleMake || "-",
            model: newQuoteById?.vehicleModel || "-",
            battery: selectedGroup?.batteryCapacity?.title || "-",
            charger: selectedGroup?.charger?.title || "-",
            upfit: selectedGroup?.upfit?.title || "-",
            color: selectedGroup?.paintType?.title || "-",
            accessories:
              selectedGroup?.accessories?.map((v) => v?.title)?.join(", ") ||
              "-",
            gvwr: String(newQuoteById?.gvwr?.value),
            imageUrl: imageDetails?.vehicleImage || "",
            msrp: String(singleGroupMSRPPerVehicle?.value),
            salePrice: String(singleGroupSingleVehicleTotalPrice?.value),
            vins: (() => {
              const arr = [];
              for (let i = 0; i < (newQuoteById?.totalQuantity || 0); i += 1) {
                arr.push(generateRandomVIN());
              }

              return arr;
            })(),
          },
        }).unwrap();

        console.log("%cpushToCevsRes:", "background-color:yellow;", {
          pushToCevsRes,
        });

        setIsSuccessModalOpen(true);
      } catch (error) {
        triggerToast({
          variant: "error",
          message: "Request failed! Some error occurred. Please try again.",
        });
        console.log(
          "%cpush to cev error:",
          "background-color:red;color:white;",
          { error },
        );
      }
    })();
  };

  return (
    <PushToCevModalStyled open={Boolean(isOpen)} onClose={onCloseLocal}>
      <MuiBox
        sx={{
          ...muiModalBaseStyles,
          width: "95vw",
          maxWidth: "53.8125rem",
          borderRadius: "0.625rem",
        }}
      >
        <MuiBox className="modal-header" component="header">
          <Typography className="modal-heading">Push to Marketplace</Typography>
          <Close
            id="close-push-to-cev-icon"
            className="close-icon"
            onClick={onCloseLocal}
          />
        </MuiBox>

        <MuiBox component="main" className="modal-main">
          <MuiBox className="vehicle-configuration-summary-container">
            {Boolean(selectedGroup?.chassis?.title) && (
              <MuiBox className="detail-row">
                <Typography className="detail-title">Chassis</Typography>
                <Typography className="detail-value">
                  {selectedGroup?.chassis?.is_included && "Included"}

                  <Typography className="detail-value">
                    +{selectedGroup?.chassis?.price_unit}
                    {getLocaleFormattedNumber(selectedGroup?.chassis?.price)}
                  </Typography>
                </Typography>
              </MuiBox>
            )}

            {Boolean(selectedGroup?.paintType?.title) && (
              <MuiBox className="detail-container">
                <Typography className="detail-title">Paint</Typography>

                <MuiBox className="detail-row">
                  <Typography className="detail-subtitle">
                    {selectedGroup?.paintType?.title}
                  </Typography>
                  <Typography className="detail-value">
                    {selectedGroup?.paintType?.is_included ? (
                      "Included"
                    ) : (
                      <>
                        +{selectedGroup?.paintType?.price_unit}
                        {getLocaleFormattedNumber(
                          selectedGroup?.paintType?.price,
                        )}
                      </>
                    )}
                  </Typography>
                </MuiBox>
              </MuiBox>
            )}

            {selectedGroup?.configurationSections
              ?.filter((configSection) => {
                const selectedOptions = configSection?.options?.filter(
                  (configOption) => configOption?.is_selected,
                );

                return Boolean(selectedOptions?.length);
              })
              ?.map((configSection) => {
                const sectionTitle = configSection?.title;
                const isOptionIncluded =
                  configSection?.options?.[0]?.is_included;

                return isOptionIncluded ? (
                  <MuiBox className="detail-row">
                    <Typography className="detail-title">
                      {sectionTitle} <br />
                      <span className="detail-subtitle">
                        {configSection?.options?.[0]?.title}
                      </span>
                    </Typography>
                    <Typography className="detail-value">Included</Typography>
                  </MuiBox>
                ) : (
                  <MuiBox className="detail-container">
                    <Typography className="detail-title">
                      {sectionTitle}
                    </Typography>
                    {configSection?.options
                      ?.filter((configOption) => configOption?.is_selected)
                      ?.map((configOption, index) => (
                        <Typography key={index} className="detail-row">
                          <Typography className="detail-subtitle">
                            {configOption?.title}
                            {Number(selectedGroup?.quantity) > 1 && (
                              <>
                                <br />x{selectedGroup?.quantity || 1}
                              </>
                            )}
                          </Typography>
                          <Typography className="detail-value">
                            +{configOption?.price_unit}
                            {getLocaleFormattedNumber(configOption?.price)}
                          </Typography>
                        </Typography>
                      ))}
                  </MuiBox>
                );
              })}

            <MuiBox
              className="detail-row"
              sx={(theme: Theme) => ({
                borderTop: `1px solid ${theme.palette.custom.tertiary}`,
                paddingTop: "16px",

                ".detail-title,.detail-value": {
                  fontWeight: 700,
                },
              })}
            >
              <Typography className="detail-title">Total Price</Typography>
              <Typography className="detail-value">
                {singleGroupSingleVehicleTotalPrice?.currency}
                {getLocaleFormattedNumber(
                  singleGroupSingleVehicleTotalPrice?.value,
                )}
              </Typography>
            </MuiBox>
          </MuiBox>

          <MuiBox className="vehicle-image-container">
            {typeof imageDetails?.vehicleImage === "string" ? (
              <img
                src={imageDetails?.vehicleImage}
                alt={imageDetails?.altName}
                className="vehicle-image"
              />
            ) : (
              <Typography>No Image</Typography>
            )}
          </MuiBox>
        </MuiBox>

        <MuiBox className="modal-footer" component="footer">
          <CButton
            id="push-to-cev-cancel-button"
            variant="outlined"
            onClick={onCloseLocal}
          >
            Cancel
          </CButton>
          <CButton
            id="push-to-cev-button"
            onClick={onPushClick}
            disabled={
              !Envs.IS_PUSH_TO_MARKETPLACE_ENABLED ||
              pushVehicleToCevsMutationState.isLoading
            }
          >
            {pushVehicleToCevsMutationState.isLoading ? (
              <CircularLoader color="#ffffff" />
            ) : (
              "Push"
            )}
          </CButton>
        </MuiBox>

        {isSuccessModalOpen && (
          <CModal
            open={isSuccessModalOpen}
            handleClose={() => {
              setIsSuccessModalOpen(false);
              onCloseLocal();
            }}
            style={{
              maxWidth: "21.4375rem",
            }}
            title=""
            content={
              <SuccessModalStyled>
                <SuccessIcon className="success-icon" />

                <Typography className="title-text">
                  Pushed to Marketplace
                </Typography>
                <Typography className="description-text">
                  Vehicle successfully pushed to marketplace for listing. You
                  can view it{" "}
                  <CButton
                    id="push-to-cev-success-modal-redirect-link"
                    variant="underlinedLink"
                    onClick={() => {
                      window.open(Envs.PUSH_TO_CEV_SUCCESS_REDIRECT_LINK);
                    }}
                  >
                    here
                  </CButton>
                  .
                </Typography>
              </SuccessModalStyled>
            }
          />
        )}
      </MuiBox>
    </PushToCevModalStyled>
  );
}

const PushToCevModalStyled = styled(Modal)(({ theme }) => ({
  ".modal-header": {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.custom.tertiary}`,
    padding: "16px 24px",
  },

  ".modal-heading": {
    fontSize: "1.125rem",
    fontWeight: 700,
  },

  ".close-icon": {
    color: theme.palette.custom.greyAccent,
    fontSize: "1.5rem",
    cursor: "pointer",
  },

  ".modal-main": {
    padding: "40px",
    display: "flex",
    justifyContent: "space-between",
    gap: "2rem",
  },

  ".vehicle-configuration-summary-container": {
    border: `1px solid ${theme.palette.custom.tertiary}`,
    borderRadius: "0.3125rem",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    flex: 1,
  },

  ".detail-row": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  ".detail-title": {
    fontWeight: 400,
    fontSize: "0.875rem",
  },

  ".detail-subtitle": {
    color: theme.palette.primary.main,
    fontSize: "0.75rem",
    fontWeight: 500,
  },

  ".detail-value": {
    fontWeight: 500,
    fontSize: "0.875rem",
    textAlign: "right",
  },

  ".vehicle-image-container": {
    border: `1px solid ${theme.palette.custom.tertiary}`,
    borderRadius: "0.3125rem",
    gap: "0.5rem",
    maxWidth: "23.125rem",
    maxHeight: "17.6875rem",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  ".vehicle-image": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  ".modal-footer": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderTop: `1px solid ${theme.palette.custom.tertiary}`,
  },

  [theme.breakpoints.down("sm")]: {
    ".modal-main": {
      flexDirection: "column-reverse",
      alignItems: "center",
      paddingInline: "16px",
    },

    ".vehicle-configuration-summary-container": {
      width: "100%",
    },
  },
}));

const SuccessModalStyled = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "2rem",
  padding: "0 20px",

  ".success-icon": {
    ".success_svg__mainCircle": {
      stroke: theme.palette.primary.main,
    },
    ".success_svg__checkMark": {
      fill: theme.palette.primary.main,
    },
  },

  ".title-text": {
    fontWeight: 500,
    fontSize: "1rem",
    marginTop: "0.5rem",
  },

  ".description-text": {
    fontSize: "0.875rem",
    textAlign: "center",
    marginTop: "0.5rem",
    maxWidth: "17.25rem",
  },

  "#push-to-cev-success-modal-redirect-link": {
    fontWeight: 700,
  },
}));
