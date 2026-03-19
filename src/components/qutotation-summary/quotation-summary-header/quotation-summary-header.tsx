import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { KeyboardArrowDown } from "@mui/icons-material";
import { Box, Menu, Typography, styled } from "@mui/material";

import { downloadFile } from "~/utils/misc";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import CButton from "~/components/common/cbutton/cbutton";
import MuiBox from "~/components/shared/mui-box/mui-box";
import TooltipWrapper from "~/components/shared/tooltip-wrapper/tooltip-wrapper";

import PreviewQuoteModal from "../preview-quote-modal/preview-quote-modal";
import PushToCevModal from "../push-to-cev-modal/push-to-cev-modal";
import SendToCustomerModal from "../send-to-customer-modal/send-to-customer-modal";

export default function QuotationSummaryHeader() {
  const {
    newQuoteById,
    isCustomerFormFilled,
    onPrintQuotePdfClick,
    fullPdfBlob,
    bomPdfBlob,
    getGeneralForSpecSheetQueryState,
  } = useQuotationSummaryPageContextValue();
  const shouldDisablePdfActions =
    !isCustomerFormFilled ||
    getGeneralForSpecSheetQueryState?.isFetching ||
    !fullPdfBlob;

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  const [moreActionsMenuAnchorEl, setMoreActionsMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [isPreviewQuoteModalOpen, setIsPreviewQuoteModalOpen] =
    useState<boolean>(false);
  const [isSendToCustomerModal, setIsSendToCustomerModalOpen] =
    useState<boolean>(false);
  const [isPushToCommercialEvsModalOpen, setIsPushToCommercialEvsModalOpen] =
    useState<boolean>(false);

  const onMoreActionsClick:
    | React.MouseEventHandler<HTMLButtonElement>
    | undefined = (e) => {
    setMoreActionsMenuAnchorEl(e?.currentTarget);
  };

  const onPushToCommercialEvsClick = () => {
    setIsPushToCommercialEvsModalOpen(true);
  };

  const onPreviewQuoteClick = () => {
    setIsPreviewQuoteModalOpen(true);
  };

  const onExportQuoteAsPdfClick = () => {
    if (fullPdfBlob) {
      downloadFile(fullPdfBlob, "Quote");
    }
  };

  const onExportBomAsPdfClick = () => {
    if (bomPdfBlob) {
      downloadFile(bomPdfBlob, "BOM");
    }
  };

  const onPrintClick = () => {
    if (!fullPdfBlob) return;

    onPrintQuotePdfClick(fullPdfBlob);
  };

  useEffect(() => {
    if (mode === "preview") {
      setTimeout(() => {
        onPreviewQuoteClick();
      }, 100);
    }
  }, [mode]);

  const SendToCustomerButton = (
    <CButton
      id="send-to-customer-button"
      disabled={!isCustomerFormFilled}
      onClick={() => setIsSendToCustomerModalOpen(true)}
    >
      Send to Customer
    </CButton>
  );

  return (
    <QuotationSummaryHeaderStyled>
      <MuiBox className="quotation-heading-container">
        <Typography component="h2" className="quotation-heading">
          Quotation
        </Typography>
        <Typography className="customer-name">
          Customer:{" "}
          <span>{newQuoteById?.customer?.buyerName || "New Customer"}</span>
        </Typography>
      </MuiBox>

      <MuiBox className="quotation-actions-container">
        <CButton
          id="more-actions-button"
          variant="outlined"
          onClick={onMoreActionsClick}
        >
          More Actions <KeyboardArrowDown className="more-actions-icon" />
        </CButton>

        <StyledMenu
          open={Boolean(moreActionsMenuAnchorEl)}
          anchorEl={moreActionsMenuAnchorEl}
          onClose={() => setMoreActionsMenuAnchorEl(null)}
        >
          <MuiBox className="quote-action-buttons">
            <CButton
              id="push-to-commercial-evs-button"
              variant="link"
              onClick={onPushToCommercialEvsClick}
            >
              Push to Marketplace
            </CButton>
            <CButton
              id="preview-quote-button"
              variant="link"
              disabled={shouldDisablePdfActions}
              onClick={onPreviewQuoteClick}
            >
              Preview Quote
            </CButton>
            <CButton
              id="export-quote-as-pdf-button"
              variant="link"
              disabled={shouldDisablePdfActions}
              onClick={onExportQuoteAsPdfClick}
            >
              Export Quote as PDF
            </CButton>
            <CButton
              id="export-bom-as-pdf-button"
              variant="link"
              disabled={shouldDisablePdfActions}
              onClick={onExportBomAsPdfClick}
            >
              Export BOM as PDF
            </CButton>
            <CButton
              id="print-quote-button"
              variant="link"
              disabled={shouldDisablePdfActions}
              onClick={onPrintClick}
            >
              Print
            </CButton>
          </MuiBox>
        </StyledMenu>

        {!isCustomerFormFilled ? (
          <TooltipWrapper title="Please fill the required fields in 'Customer Information' form to enable">
            {SendToCustomerButton}
          </TooltipWrapper>
        ) : (
          SendToCustomerButton
        )}
      </MuiBox>

      {isPreviewQuoteModalOpen && (
        <PreviewQuoteModal
          isOpen={isPreviewQuoteModalOpen}
          onClose={() => setIsPreviewQuoteModalOpen(false)}
        />
      )}

      {isSendToCustomerModal && (
        <SendToCustomerModal
          isOpen={isSendToCustomerModal}
          onClose={() => setIsSendToCustomerModalOpen(false)}
        />
      )}

      {isPushToCommercialEvsModalOpen && (
        <PushToCevModal
          isOpen={isPushToCommercialEvsModalOpen}
          onClose={() => setIsPushToCommercialEvsModalOpen(false)}
        />
      )}
    </QuotationSummaryHeaderStyled>
  );
}

const QuotationSummaryHeaderStyled = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "1rem",

  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: "1rem",
  },

  ".quotation-heading": {
    fontSize: "1.5rem",
    fontWeight: 700,
  },

  ".customer-name": {
    fontSize: "1rem",
    fontWeight: 400,
    marginTop: "0.25rem",

    span: {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
  },

  ".quotation-actions-container": {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",

    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
  },

  "#more-actions-button,#send-to-customer-button": {
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
  },

  ".more-actions-icon": {
    color: theme.palette.primary.main,
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  ".quote-action-buttons": {
    display: "flex",
    flexDirection: "column",
    padding: "8px",
    gap: "0.5rem",

    button: {
      textAlign: "left",
      color: theme.palette.custom.accentBlack,
      fontSize: "1rem",
      fontWeight: 500,

      "&:disabled": {
        color: theme.palette.custom.lightGray,
      },
    },
  },
}));
