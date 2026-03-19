import { useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { useNavigate, useSearchParams } from "react-router-dom";

import Close from "@mui/icons-material/Close";
import { Modal, Tab, Tabs, Theme, Typography, styled } from "@mui/material";

import { PAGE_BREAKER_TABLE_CONTENT_LIMIT } from "~/constants/constants";
import RoutePaths from "~/constants/route-paths";

import { downloadFile } from "~/utils/misc";

import { muiModalBaseStyles } from "~/global/styles/mui-styles";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import CButton from "~/components/common/cbutton/cbutton";
import MuiBox from "~/components/shared/mui-box/mui-box";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};
const QuotePdfTabValues = {
  "Cover Letter": "cover-letter",
  "Specification Sheet": "specification-sheet",
  "Warranty Statement": "warranty-statement",
  BOM: "bom",
  Acceptance: "acceptance",
} as const;
const PdfPageIndexToIdMap = [
  "cover-letter",
  "specification-sheet",
  "warranty-statement",
  "bom",
  "acceptance",
] as const;

type QuotePdfTabValuesType =
  (typeof QuotePdfTabValues)[keyof typeof QuotePdfTabValues];

export default function PreviewQuoteModal(props: Props) {
  const { isOpen, onClose } = props;

  const {
    onPrintQuotePdfClick,
    fullPdfBlob,
    bomPdfBlob,
    noOfSpecSheetPages,
    customizationOptionsTableRowCount,
  } = useQuotationSummaryPageContextValue();

  const isTabSelectedManually = useRef<boolean>(false);

  const [quotePdfSelectedTab, setQuotePdfSelectedTab] =
    useState<QuotePdfTabValuesType>("cover-letter");
  const [quotePdfMaxPages, setQuotePdfMaxPages] = useState<number>(0);
  console.log("%cpreview-quote-modal:", "background-color:yellow;", {
    quotePdfMaxPages,
    quotePdfSelectedTab,
    noOfSpecSheetPages,
  });

  const onQuotePdfTabChange:
    | ((
        event: React.SyntheticEvent<Element, Event>,
        value: QuotePdfTabValuesType,
      ) => void)
    | undefined = (_, value) => {
    setQuotePdfSelectedTab(value);
  };

  const onTabClick = (tabId: (typeof PdfPageIndexToIdMap)[number]) => {
    const elem = document.querySelector(`#${tabId}`);

    if (elem) {
      isTabSelectedManually.current = true;

      elem.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const onPdfContainerScroll = () => {
    if (isTabSelectedManually.current) {
      setTimeout(() => {
        isTabSelectedManually.current = false;
      }, 1000);
      return;
    }

    const parentContainer = document
      .getElementById("pdf-container")
      ?.getBoundingClientRect();

    const pdfPageContainers = document.querySelectorAll(".pdf-page-container");
    const pdfPageContainersArrayfied = [...pdfPageContainers];

    const boundingRects = pdfPageContainersArrayfied?.map((elem) =>
      elem?.getBoundingClientRect(),
    );
    let boundingRectsArrayfied = [...boundingRects];
    boundingRectsArrayfied = boundingRectsArrayfied?.map((obj) => ({
      ...obj,
      top: obj?.top - (parentContainer?.top || 0),
    }));
    const indexOfTabToSet =
      boundingRectsArrayfied?.length -
      1 -
      boundingRectsArrayfied?.reverse()?.findIndex((v) => v?.top <= 250);
    const elem = pdfPageContainersArrayfied[indexOfTabToSet];

    if (elem?.id) {
      setQuotePdfSelectedTab(elem?.id as QuotePdfTabValuesType);
    }

    console.log({
      pdfPageContainers,
      pdfPageContainersArrayfied,
      boundingRects,
      boundingRectsArrayfied,
      parentContainer,
      indexOfTabToSet,
      elem,
    });
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

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const navigate = useNavigate();

  return (
    <PreviewQuoteModalStyled
      open={Boolean(isOpen)}
      onClose={() => {
        // completed customer already coming from my orders would be redirected back to my orders on close
        if (mode === "preview") {
          navigate(RoutePaths.MY_ORDERS, { replace: true });
        }
        if (typeof onClose === "function") {
          onClose();
        }
      }}
    >
      <MuiBox
        sx={{
          ...muiModalBaseStyles,
          width: "100%",
          height: "100%",
          padding: "0 100px",
        }}
      >
        <MuiBox className="modal-header" component="header">
          <Typography className="modal-heading">Preview Quote</Typography>
          <Close
            id="close-preview-quote-icon"
            className="close-icon"
            onClick={() => {
              // completed customer already coming from my orders would be redirected back to my orders on close
              if (mode === "preview") {
                navigate(RoutePaths.MY_ORDERS, { replace: true });
              }
              if (typeof onClose === "function") {
                onClose();
              }
            }}
          />
        </MuiBox>

        <MuiBox component="main" className="modal-main">
          <MuiBox className="quote-pdf-container">
            <Tabs
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              value={quotePdfSelectedTab}
              onChange={onQuotePdfTabChange}
              sx={(theme: Theme) => ({
                border: `1px solid ${theme.palette.custom.tertiary}`,
                borderRadius: "0.625rem 0.625rem 0 0",

                ".MuiTabScrollButton-root": {
                  width: "max-content",
                },

                ".MuiTab-root": {
                  textTransform: "capitalize",
                },
              })}
            >
              {Object.keys(QuotePdfTabValues)
                .filter((tabTitle) => {
                  if (
                    (tabTitle as keyof typeof QuotePdfTabValues) !==
                    "Specification Sheet"
                  )
                    return true;

                  return noOfSpecSheetPages > 0;
                })
                .map((tabTitle, index) => {
                  const titleTyped = tabTitle as keyof typeof QuotePdfTabValues;

                  return (
                    <Tab
                      key={index}
                      label={titleTyped}
                      value={QuotePdfTabValues[titleTyped]}
                      onClick={() => onTabClick(QuotePdfTabValues[titleTyped])}
                    />
                  );
                })}
            </Tabs>

            <MuiBox
              id="pdf-container"
              className="pdf-container"
              onScroll={onPdfContainerScroll}
            >
              {fullPdfBlob && (
                <Document
                  file={fullPdfBlob}
                  onLoadSuccess={(doc) => {
                    setQuotePdfMaxPages(doc?.numPages);
                  }}
                >
                  {Array.from({ length: quotePdfMaxPages }).map((_, i) => {
                    const coverLetterStartIndex = 0;
                    const specSheetStartIndex = 1;
                    const warrantyStatementStartIndex =
                      specSheetStartIndex + noOfSpecSheetPages;
                    const bomStartIndex = warrantyStatementStartIndex + 2;
                    const acceptanceStartIndex =
                      customizationOptionsTableRowCount! >
                      PAGE_BREAKER_TABLE_CONTENT_LIMIT
                        ? bomStartIndex + 2
                        : bomStartIndex + 1;

                    const indexToUseForPdfPageToIdMap = (() => {
                      if (i === coverLetterStartIndex) return 0;
                      if (i === specSheetStartIndex) {
                        if (noOfSpecSheetPages > 0) {
                          return 1;
                        }
                      }
                      if (i === warrantyStatementStartIndex) return 2;
                      if (i === bomStartIndex) return 3;
                      if (i === acceptanceStartIndex) return 4;

                      return null;
                    })();

                    return (
                      <MuiBox
                        key={i}
                        id={
                          indexToUseForPdfPageToIdMap != null
                            ? PdfPageIndexToIdMap[indexToUseForPdfPageToIdMap]
                            : ""
                        }
                        className="pdf-page-container"
                      >
                        <Page pageNumber={i + 1} />
                      </MuiBox>
                    );
                  })}
                </Document>
              )}
            </MuiBox>
          </MuiBox>

          <MuiBox className="action-buttons-container">
            <CButton
              id="preview-quote-export-quote-button"
              onClick={onExportQuoteAsPdfClick}
            >
              Export Quote as PDF
            </CButton>
            <CButton
              id="preview-quote-export-bom-button"
              variant="outlined"
              onClick={onExportBomAsPdfClick}
            >
              Export BOM as PDF
            </CButton>
            <CButton
              id="preview-quote-print-button"
              variant="outlined"
              onClick={onPrintClick}
            >
              Print
            </CButton>
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </PreviewQuoteModalStyled>
  );
}

const PreviewQuoteModalStyled = styled(Modal)(({ theme }) => ({
  ".modal-header": {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 100px",
    borderBottom: `1px solid ${theme.palette.custom.tertiary}`,
    marginInline: "-100px",
  },

  ".modal-heading": {
    fontSize: "1.5rem",
    fontWeight: 700,
  },

  ".close-icon": {
    color: theme.palette.custom.greyAccent,
    fontSize: "2rem",
    cursor: "pointer",
  },

  ".modal-main": {
    display: "flex",
    justifyContent: "space-between",
    columnGap: "3.3125rem",
    marginTop: "1.5rem",
    maxWidth: "80rem",
    marginInline: "auto",
  },

  ".quote-pdf-container": {
    flex: 1,
  },

  ".react-pdf__Document": {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  ".react-pdf__Page__textContent": {
    display: "none",
  },

  ".react-pdf__Page__annotations": {
    display: "none",
  },

  ".react-pdf__Page__canvas": {
    height: "100% !important",
    width: "100% !important",
  },

  ".pdf-container": {
    height: "75vh",
    overflowY: "auto",
  },

  ".pdf-page-container": {
    border: `0.735px solid ${theme.palette.custom.greyAccent}`,
    borderRadius: "0.25rem",
  },

  ".action-buttons-container": {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",

    button: {
      fontWeight: 700,
      paddingBlock: "0.8125rem",
      width: "18.25rem",
    },
  },

  [theme.breakpoints.down("lg")]: {
    ".modal-main": {
      flexDirection: "column-reverse",
      alignItems: "center",
      gap: "1rem",
    },
  },
}));
