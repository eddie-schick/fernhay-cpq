import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Document, Page } from "react-pdf";
import { useNavigate } from "react-router";

import AttachmentOutlinedIcon from "@mui/icons-material/AttachmentOutlined";
import Close from "@mui/icons-material/Close";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import {
  Checkbox,
  FormControlLabel,
  Modal,
  Typography,
  styled,
} from "@mui/material";

import { MY_ORDERS_PAGE_PATH } from "~/constants/constants";

import { SuccessIcon } from "~/global/icons";
import { muiModalBaseStyles } from "~/global/styles/mui-styles";

import { useSendPdfByEmailMutation } from "~/store/endpoints/misc/misc";

import { useAuthContextValue } from "~/context/auth-context";
import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import CModal from "~/components/common/c-modal/c-modal";
import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

type FormInputs = {
  fromEmail: string;
  toEmail: string;
  subject: string;
  message: string;
  sendToMySelf: boolean;
};

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};
export default function SendToCustomerModal(props: Props) {
  const { isOpen, onClose } = props;

  const navigate = useNavigate();

  const { triggerToast, triggerGenericErrorMessage } = useCustomToast();

  const { user, token } = useAuthContextValue();
  const { fullPdfBlob, newQuoteById } = useQuotationSummaryPageContextValue();

  const [sendPdfByEmail, sendPdfByEmailMutationState] =
    useSendPdfByEmailMutation();

  const [quotePdfMaxPages, setQuotePdfMaxPages] = useState<number>(0);
  const [quotePdfPageNumber, setQuotePdfPageNumber] = useState<number>(1);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  const { register, handleSubmit, control } = useForm<FormInputs>();

  const onCloseLocal = () => {
    if (sendPdfByEmailMutationState.isLoading) return;

    if (typeof onClose === "function") {
      onClose();
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (!newQuoteById) {
      triggerToast({
        variant: "error",
        message: "Quote not found!",
      });
      return;
    }
    if (!fullPdfBlob) {
      triggerToast({
        variant: "error",
        message: "File not found!",
      });
      return;
    }

    (async () => {
      try {
        const formattedMessage = data?.message?.replace(/\n/g, "<br>");

        await sendPdfByEmail({
          quoteId: String(newQuoteById?.quotationId),
          quote: newQuoteById,
          files: [
            {
              file: fullPdfBlob,
            },
          ],
          miscDetails: {
            sendToMySelf: Boolean(data?.sendToMySelf),
            subject: data?.subject,
            message: formattedMessage,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();

        setIsSuccessModalOpen(true);
      } catch (error) {
        triggerGenericErrorMessage();

        console.log(
          "%csendPdfByEmail error:",
          "background-color:red;color:white;",
          { error },
        );
      }
    })();
  };

  return (
    <SendToCustomerModalStyled open={Boolean(isOpen)} onClose={onCloseLocal}>
      <MuiBox
        sx={{
          ...muiModalBaseStyles,
          width: "95vw",
          maxWidth: "56.5rem",
          height: "90vh",
          borderRadius: "0.625rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MuiBox className="modal-header" component="header">
          <Typography className="modal-heading">Send Quote</Typography>
          <Close
            id="close-send-quote-icon"
            className="close-icon"
            onClick={onCloseLocal}
          />
        </MuiBox>

        <MuiBox component="main" className="modal-main">
          <MuiBox
            className="form"
            component="form"
            id="send-quote-form"
            onSubmit={(e) => {
              e?.preventDefault();

              void handleSubmit(onSubmit)();
            }}
          >
            <MuiBox className="form-control">
              <label htmlFor="send-quote-fromEmail" className="form-label">
                From
              </label>
              <input
                id="send-quote-fromEmail"
                className="input--text"
                placeholder="johndoe@shaed.ai"
                value={user?.user?.email}
                disabled
                {...register("fromEmail")}
              />
            </MuiBox>

            <MuiBox className="form-control">
              <label htmlFor="send-quote-toEmail" className="form-label">
                To
              </label>
              <input
                id="send-quote-toEmail"
                className="input--text"
                placeholder="beltway@shaed.ai"
                value={newQuoteById?.customerDetailsForm?.email}
                disabled
                {...register("toEmail")}
              />
            </MuiBox>

            <MuiBox className="form-control">
              <label htmlFor="send-quote-subject" className="form-label">
                Subject
              </label>
              <input
                id="send-quote-subject"
                className="input--text"
                placeholder="Enter subject..."
                defaultValue={`Request received for Quote # ${newQuoteById?.quotationId}`}
                {...register("subject")}
              />
            </MuiBox>

            <MuiBox className="form-control">
              <label htmlFor="send-quote-message" className="form-label">
                Message
              </label>
              <textarea
                id="send-quote-message"
                className="input--textarea"
                rows={15}
                placeholder="Enter your message..."
                defaultValue={`Dear Customer,\n\nWe are pleased to inform you that we have placed an order on your behalf for the custom configuration you requested.\n\nAttached, you will find the detailed quote document outlining the specifications of your order.\n\nTo proceed further, we kindly request your signature on the attached document. Your signature will indicate your approval of the order and allow us to proceed with processing it.`}
                {...register("message")}
              />
            </MuiBox>

            <MuiBox className="quote-attachment">
              <AttachmentOutlinedIcon />
              <CButton
                id="quote-attachment-link"
                variant="underlinedLink"
                onClick={(e) => {
                  e?.preventDefault();

                  if (!fullPdfBlob) {
                    triggerToast({
                      variant: "error",
                      message: "No file found!",
                    });

                    return;
                  }

                  const modifiedBlob = new Blob([fullPdfBlob], {
                    type: "application/pdf",
                  });
                  const objectUrl = URL.createObjectURL(modifiedBlob);
                  window.open(objectUrl);

                  // File was not downloading if the next line was there, the reason being that since the URL is revoked, the file is actually no longer available.
                  // URL.revokeObjectURL(objectUrl);
                }}
              >
                Quote#{newQuoteById?.quotationId}
              </CButton>
            </MuiBox>

            <FormControlLabel
              id="send-quote-send-a-copy"
              label="Send a copy to myself"
              control={
                <Controller
                  name="sendToMySelf"
                  control={control}
                  render={({ field }) => <Checkbox {...field} />}
                ></Controller>
              }
            />
          </MuiBox>

          <MuiBox className="quote-pdf-container">
            <KeyboardArrowLeft
              className="arrow-icon"
              style={{
                ...(quotePdfPageNumber <= 1 && {
                  opacity: 0.4,
                  pointerEvents: "none",
                }),
              }}
              onClick={() => {
                setQuotePdfPageNumber((prev) => {
                  const newValue = prev - 1;

                  return Math.max(newValue, 1);
                });
              }}
            />

            <MuiBox className="pdf-container">
              <Document
                file={fullPdfBlob}
                onLoadSuccess={(doc) => {
                  setQuotePdfMaxPages(doc?.numPages);
                }}
              >
                <Page pageNumber={quotePdfPageNumber} />
              </Document>

              <Typography className="page-number-text">
                Page {quotePdfPageNumber} of {quotePdfMaxPages}
              </Typography>
            </MuiBox>

            <KeyboardArrowRight
              className="arrow-icon"
              style={{
                ...(quotePdfPageNumber >= quotePdfMaxPages && {
                  opacity: 0.4,
                  pointerEvents: "none",
                }),
              }}
              onClick={() => {
                setQuotePdfPageNumber((prev) => {
                  const newValue = prev + 1;

                  return Math.min(newValue, quotePdfMaxPages);
                });
              }}
            />
          </MuiBox>
        </MuiBox>

        <MuiBox className="modal-footer" component="footer">
          <CButton
            id="send-quote-cancel-button"
            variant="outlined"
            onClick={onCloseLocal}
            disabled={sendPdfByEmailMutationState.isLoading}
          >
            Cancel
          </CButton>
          <CButton
            id="send-quote-send-button"
            form="send-quote-form"
            type="submit"
            disabled={sendPdfByEmailMutationState.isLoading}
          >
            {sendPdfByEmailMutationState.isLoading ? (
              <CircularLoader color="#ffffff" size={20} />
            ) : (
              "Send"
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

                <Typography className="title-text">Quote Sent</Typography>
                <Typography className="description-text">
                  Your quote has been successfully sent to the customer and is
                  now available for viewing in{" "}
                  <CButton
                    id="quote-sent-go-to-my-orders-link"
                    variant="underlinedLink"
                    onClick={() => {
                      navigate(MY_ORDERS_PAGE_PATH);
                    }}
                  >
                    Manage Orders
                  </CButton>
                </Typography>
              </SuccessModalStyled>
            }
          />
        )}
      </MuiBox>
    </SendToCustomerModalStyled>
  );
}

const SendToCustomerModalStyled = styled(Modal)(({ theme }) => ({
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
    flex: 1,
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    columnGap: "2rem",
    overflowY: "auto",
  },

  ".form": {
    flex: 1,
  },

  ".form-control": {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1rem",
  },

  ".form-label": {
    marginBottom: "0.5rem",
    fontWeight: 500,
  },

  ".input--text": {
    fontSize: "0.75rem",
  },

  "#send-quote-message": {
    fontSize: "0.75rem",

    "&::-webkit-scrollbar": {
      width: "0.3125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "linear-gradient(0deg, #BABABA 0%, #BABABA 100%)",
      borderRadius: "0.8125rem",

      "&:hover": {
        background: "linear-gradient(0deg, #8f8b8b  0%, #8f8b8b  100%)",
      },
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#f1f1f1",
    },
  },

  ".quote-attachment": {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",

    svg: {
      transform: "rotateY(180deg) rotate(45deg)",
      color: theme.palette.primary.main,
      fontSize: "1.25rem",
    },

    button: {
      fontSize: "0.75rem",
      fontWeight: 700,
    },
  },

  "#send-quote-send-a-copy": {
    marginTop: "1rem",
  },

  ".quote-pdf-container": {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    flex: 1,
  },

  ".arrow-icon": {
    cursor: "pointer",
    height: "1.625rem",
    width: "1.625rem",
  },

  ".pdf-container": {},

  ".react-pdf__Document": {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  ".react-pdf__Page": {},

  ".react-pdf__Page__canvas": {
    maxWidth: "27.5rem",
    maxHeight: "36.75rem",
  },

  ".react-pdf__Page__textContent": {
    display: "none",
  },

  ".react-pdf__Page__annotations": {
    display: "none",
  },

  ".page-number-text": {
    fontWeight: 400,
    textAlign: "center",
  },

  ".modal-footer": {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.625rem",
    padding: "16px 24px",
    borderTop: `1px solid ${theme.palette.custom.tertiary}`,
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

  "#quote-sent-go-to-my-orders-link": {
    fontWeight: 700,
  },
}));
