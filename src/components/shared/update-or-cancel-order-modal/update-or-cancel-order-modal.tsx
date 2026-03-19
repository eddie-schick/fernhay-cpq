// import { useGetWHBucketSignedUrlMutation } from "@store/endpoints/misc";

// import { updateQuoteById } from "@store/slices/quotes/slice";
import axios from "axios";
import { useState } from "react";

import {
  ArrowRightAlt,
  Close,
  InsertDriveFileOutlined,
} from "@mui/icons-material";
import {
  CircularProgress,
  Divider,
  Modal,
  TextField,
  Typography,
  styled,
} from "@mui/material";

import { QUOTE_ORDER_STATUSES } from "~/constants/constants";
import LocalStorageKeys from "~/constants/local-storage-keys";

import { DropzoneFileCutIcon } from "~/global/icons";
import { muiModalBaseStyles } from "~/global/styles/mui-styles";
import {
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import { useAppDispatch } from "~/store";
import { useGetBucketWriteSignedUrlMutation } from "~/store/endpoints/misc/misc";
import {
  useUpdateGeneratedQuoteStatusMutation,
  useUpdateQuoteMutation,
} from "~/store/endpoints/quotes/quotes";
import { updateOrderById } from "~/store/slices/my-orders/slice";

import CButton from "~/components/common/cbutton/cbutton";

import MuiBox from "../mui-box/mui-box";
import StatusBadge from "../status-badge/status-badge";
import FileDropzone from "../ui/file-dropzone/file-dropzone";
import useCustomToast from "../use-custom-toast/use-custom-toast";

interface UpdateOrCancelOrderModalProps {
  details: {
    customerName: string;
    status: {
      from?: OrderStatusValue | null;
      to?: OrderStatusValue | null;
    };
  };
  order: QuoteOrder200ResponseSchema | null;
  open: boolean;
  onClose?: () => void;
}

function UpdateOrCancelOrderModal({
  open,
  onClose,
  details,
  order,
}: UpdateOrCancelOrderModalProps) {
  const { triggerToast } = useCustomToast();

  const storeDispatch = useAppDispatch();

  const [signedQuote, setSignedQuote] = useState<File | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [getSignedUrl, { isLoading: isSignedUrlLoading }] =
    useGetBucketWriteSignedUrlMutation();

  const [updateQuote, { isLoading: isQuoteUpdateLoading }] =
    useUpdateQuoteMutation();
  const [updateQuoteToAccepted, { isLoading: isQuotetoAcceptedUpdateLoading }] =
    useUpdateGeneratedQuoteStatusMutation();
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);

  const onSaveClick = async () => {
    if (!order) return;

    if (!order?.id) {
      triggerToast({
        message: `No ID found!`,
        variant: "error",
      });

      return;
    }

    const triggerUpdateQuoteSuccessMessage = () => {
      triggerToast({
        variant: "success",
        message: "Quote updated successfully!",
      });
    };
    const triggerUpdateQuoteFailureMessage = () => {
      triggerToast({
        variant: "error",
        message: "Request failed! Somer error occurred",
      });
    };

    if (signedQuote) {
      const signedQuoteName = signedQuote.name.split(".")[0] + "-signed.pdf";
      const signedQuoteNameChanged = new File([signedQuote], signedQuoteName, {
        type: "application/pdf",
      });
      const signedUrlRes = await getSignedUrl({
        data: { fileName: signedQuoteName, type: "POST" },
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            LocalStorageKeys.TOKEN,
          )}`,
        },
      }).unwrap();

      setIsFileUploading(true);
      await axios({
        method: "PUT",
        url: signedUrlRes.url,
        data: signedQuoteNameChanged,
        headers: {
          "Content-Type": "application/pdf",
        },
      });
      setIsFileUploading(false);

      const signedQuoteLink = signedUrlRes.url.split("?")[0];

      try {
        if (details?.status?.to === QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED) {
          await updateQuoteToAccepted({
            id: order?.id,
            data: {
              signedQuoteFileLink: signedQuoteLink,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
            },
          }).unwrap();
        } else {
          await updateQuote({
            id: order?.id,
            data: {
              signedQuoteFileLink: signedQuoteLink,
              status: details?.status?.to as OrderStatusValue,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
            },
          }).unwrap();
        }

        triggerUpdateQuoteSuccessMessage();

        closeModal();

        storeDispatch(
          updateOrderById({
            id: order?.id,
            data: {
              status: details?.status?.to || undefined,
              quote: {
                ...(order?.quote || {}),
                signedFileLink: signedQuoteLink,
              },
            },
          }),
        );
      } catch (error) {
        console.log(
          "%cupdateQuote error:",
          "background-color:red;color:white;",
          {
            error,
          },
        );
        triggerUpdateQuoteFailureMessage();
      }

      return;
    }

    try {
      const payloadForUpdateQuote = {
        ...(orderNo && {
          oemOrderNo: orderNo,
        }),
        status: details?.status?.to as OrderStatusValue,
      };
      await updateQuote({
        id: order?.id,
        data: payloadForUpdateQuote,
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            LocalStorageKeys.TOKEN,
          )}`,
        },
      }).unwrap();
      closeModal();
      triggerUpdateQuoteSuccessMessage();

      storeDispatch(
        updateOrderById({
          id: order?.id,
          data: payloadForUpdateQuote,
        }),
      );
    } catch (error) {
      console.log("%cupdateQuote error:", "background-color:red;color:white;", {
        error,
      });

      triggerUpdateQuoteFailureMessage();
    }
  };

  const isConfirmingQuote =
    // details.status?.to?.status === QUOTE_ORDER_STATUSES.ORDER_PROCESSING ||
    details.status?.to === QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED;
  const isConfirmingOrder =
    details.status?.to === QUOTE_ORDER_STATUSES.IN_PRODUCTION;
  const isCancelingOrder =
    details.status?.to === QUOTE_ORDER_STATUSES.CANCELLED;

  const isSaveDisabled =
    (isConfirmingQuote && !signedQuote) || (isConfirmingOrder && !orderNo);

  const closeModal = () => {
    if (onClose) onClose();
    setSignedQuote(null);
    setOrderNo(null);
  };

  return (
    <UpdateOrCancelOrderModalStyled open={open} onClose={closeModal}>
      <MuiBox
        sx={(theme) => ({
          ...muiModalBaseStyles,
          borderRadius: "1rem",
          width: "80vw",

          maxWidth: "30rem",

          [theme.breakpoints.down("md")]: {
            width: "95vw",
          },
        })}
      >
        <MuiBox component="header" className="modal-header">
          <Typography className="title">
            {isCancelingOrder ? "Cancel Order" : "Update Status"}
          </Typography>

          <Close className="close-icon" onClick={closeModal} />
        </MuiBox>

        <MuiBox component="main" className="modal-main">
          <MuiBox component="main" className="modal-top-content">
            <Typography className="message">
              {isCancelingOrder
                ? "Are you sure you want to cancel this order? This action cannot be undone. Please review the details below carefully."
                : "Are you sure you want to update the status for selected quote? Please review the details below carefully."}
            </Typography>

            <MuiBox className="details">
              <MuiBox className="details-row">
                <Typography className="details-label">
                  Customer Name:
                </Typography>
                <Typography className="details-value">
                  {details.customerName}
                </Typography>
              </MuiBox>

              <MuiBox className="details-row-status">
                <Typography className="details-label">Status :</Typography>
                <MuiBox className="status-update-container">
                  {details.status?.from && (
                    <StatusBadge
                      row={order!}
                      status={details.status?.from}
                      readOnly
                    />
                  )}
                  <ArrowRightAlt />
                  {details.status?.to && (
                    <StatusBadge
                      row={order!}
                      status={details.status?.to}
                      readOnly
                    />
                  )}
                </MuiBox>
              </MuiBox>
            </MuiBox>
          </MuiBox>

          {(isConfirmingQuote || isConfirmingOrder) && (
            <Divider orientation="horizontal" />
          )}
          {isConfirmingQuote && (
            <>
              <Typography className="message">
                To proceed, please upload the signed copy of the quote from the
                customer.
              </Typography>
              {signedQuote ? (
                <MuiBox className="uploaded-file">
                  <InsertDriveFileOutlined /> {signedQuote.name.split(".")[0]}
                  <MuiBox
                    className="close-btn"
                    onClick={() => setSignedQuote(null)}
                  >
                    <DropzoneFileCutIcon className="dropzone-file-cut-icon" />
                  </MuiBox>
                </MuiBox>
              ) : (
                <FileDropzone
                  context="my-orders"
                  id="signed-quote-input"
                  onFileUploaded={(file: File) => {
                    console.log(file.name);
                    setSignedQuote(file);
                  }}
                  allowedFileMimeTypes={["application/pdf"]}
                />
              )}
            </>
          )}
          {isConfirmingOrder && (
            <>
              <Typography className="message">
                To proceed, please enter the OEM Order# :
              </Typography>
              <TextField
                type="number"
                className="order-no-text-field"
                value={orderNo}
                placeholder="Add OEM Order#"
                onKeyDown={(evt) =>
                  (evt.key === "e" || evt.key === "." || evt.key === "-") &&
                  evt.preventDefault()
                }
                onChange={(e) => {
                  if (Number(e.target.value) < 0) {
                    e.preventDefault();
                    return;
                  }
                  setOrderNo(e.target.value);
                }}
              />
            </>
          )}
        </MuiBox>
        <MuiBox component="footer" className="modal-footer">
          <MuiBox className="action-buttons-container">
            <CButton
              style={{
                padding: "0.5rem 0.85rem",
                fontSize: "0.875rem",
                borderWidth: "2px",
                fontWeight: 700,
              }}
              id="cancel-button"
              variant="outlined"
              onClick={closeModal}
            >
              Cancel
            </CButton>
            <CButton
              id="save-button"
              disabled={
                isSaveDisabled ||
                isQuoteUpdateLoading ||
                isQuotetoAcceptedUpdateLoading ||
                isSignedUrlLoading ||
                isFileUploading
              }
              style={
                isSaveDisabled ||
                isQuoteUpdateLoading ||
                isQuotetoAcceptedUpdateLoading ||
                isSignedUrlLoading ||
                isFileUploading
                  ? {
                      background: "#ababab",
                      border: "none",
                      padding: "0.5rem 0.85rem",
                      fontSize: "0.875rem",
                      borderWidth: "2px",
                      fontWeight: 700,
                    }
                  : {
                      padding: "0.5rem 0.85rem",
                      fontSize: "0.875rem",
                      borderWidth: "2px",
                      fontWeight: 700,
                    }
              }
              onClick={() => void onSaveClick()}
            >
              {isQuoteUpdateLoading ||
              isQuotetoAcceptedUpdateLoading ||
              isSignedUrlLoading ||
              isFileUploading ? (
                <CircularProgress sx={{ color: "white" }} size={32} />
              ) : (
                "Save"
              )}
            </CButton>
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </UpdateOrCancelOrderModalStyled>
  );
}

export default UpdateOrCancelOrderModal;

const UpdateOrCancelOrderModalStyled = styled(Modal)(({ theme }) => ({
  ".modal-header": {
    padding: "1.04rem 1.3rem", // Reduced from 1.6rem 2rem
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `0.65px solid #E6E6E6`, // Adjusted for proportionality
  },

  ".title": {
    fontSize: "1rem",
    color: theme.palette.custom.accentBlack,
    fontWeight: 700,
  },

  ".close-icon": {
    cursor: "pointer",
    color: theme.palette.custom.greyAccent,
    height: "1.3rem", // Reduced from 2rem
    width: "1.3rem", // Reduced from 2rem
  },

  ".modal-main": {
    padding: "1.3rem", // Reduced from 2rem
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem", // Reduced from 3rem
  },

  ".modal-top-content": {
    display: "flex",
    flexDirection: "column",
    gap: "1.3rem", // Reduced from 2rem
  },

  ".message": {
    fontSize: "0.875rem", // Reduced from 1.6rem
    color: theme.palette.custom.accentBlack,
    fontWeight: 400,
    lineHeight: "normal",
  },

  ".modal-footer": {
    padding: "1.04rem 1.3rem", // Reduced from 1.6rem 2rem
    display: "flex",
    justifyContent: "flex-end",
    borderTop: `0.65px solid #E6E6E6`, // Adjusted for proportionality
  },

  ".action-buttons-container": {
    display: "flex",
    gap: "0.65rem", // Reduced from 1rem

    button: {
      borderRadius: "0.33rem", // Reduced from 0.5rem
      fontSize: "1.04rem", // Reduced from 1.6rem
      padding: "0.78rem 1.04rem", // Reduced from 0.6rem 1.6rem
      textTransform: "unset",
    },
  },

  ".status-update-container": {
    display: "flex",
    gap: "0.65rem", // Reduced from 1rem
    alignItems: "center",
    color: theme.palette.custom.greyAccent,
  },

  ".details": {
    display: "flex",
    flexDirection: "column",
    gap: "0.98rem", // Reduced from 1.5rem
  },

  ".details-row": {
    display: "flex",
    gap: "0.65rem", // Reduced from 1rem
    alignItems: "center",

    ".details-label": {
      fontWeight: 700,
    },

    ".details-label, .details-value": {
      fontSize: "0.875rem",
      color: theme.palette.custom.accentBlack,
    },
  },

  ".details-row-status": {
    display: "flex",
    gap: "0.65rem", // Reduced from 1rem
    flexDirection: "row",
    alignItems: "center",

    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "flex-start",
    },

    ".details-label": {
      fontWeight: 700,
      fontSize: "0.875rem",
      color: theme.palette.custom.accentBlack,
    },

    ".details-label, .details-value": {
      fontSize: "0.875rem", // Reduced from 1.6rem
      color: theme.palette.custom.accentBlack,
    },
  },

  ".uploaded-file": {
    width: "fit-content",
    position: "relative",
    display: "flex",
    gap: "0.33rem", // Reduced from 0.5rem
    alignItems: "center",
    fontSize: "0.875rem", // Reduced from 1.5rem
    color: theme.palette.primary.main,
    fontWeight: 500,
    border: `0.65px solid ${theme.palette.primary.main}`, // Adjusted for proportionality
    padding: "0.33rem 0.78rem", // Reduced from 0.5rem 1.2rem
    borderRadius: "1.17rem", // Reduced from 1.5rem

    ".close-btn": {
      position: "absolute",
      top: -15, // Adjusted for proportionality
      right: -5, // Adjusted for proportionality
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: theme.palette.custom.white,
      borderRadius: "0.83rem", // Reduced from 1.5rem
      backgroundColor: theme.palette.primary.main,
      padding: "0.1rem", // Reduced from 0.2rem

      ".dropzone-file-cut-icon": {
        ".dropzone-file-cut-icon_svg__filler": {
          fill: theme.palette.primary.main,
        },
      },
    },
  },

  ".order-no-text-field": {
    marginTop: "-0.65rem", // Adjusted for proportionality
    width: "60%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    input: {
      fontSize: "0.875rem", // Reduced from 1.6rem
      padding: "0.8rem 1rem", // Reduced from 1.6rem 2rem
    },
  },
}));
