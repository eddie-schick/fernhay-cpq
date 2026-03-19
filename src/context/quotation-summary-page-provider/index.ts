import { createContext, useContext } from "react";

import { GetGeneralQueryResultType } from "~/store/endpoints/misc/misc";
import { NewQuoteShape } from "~/store/slices/quotes/types";

type InitialValuesType = {
  quoteId: string | null;
  customizationOptionsTableRowCount?: number;
  newQuoteById?: NewQuoteShape;
  selectedGroup?: NewQuoteShape["groups"][number];
  QuotePdf: null | JSX.Element;
  BomPdf: null | JSX.Element;
  onPrintQuotePdfClick: (quotePdfBlob: Blob) => void;
  quotePdfBlob?: null | Blob;
  bomPdfBlob?: null | Blob;
  fullPdfBlob?: null | Blob;
  noOfSpecSheetPages: number;
  isCustomerFormFilled?: boolean;
  isUpfitShipThruFormFilled?: boolean;
  isAccessoriesShipThruFormFilled?: boolean;
  isChargerShipThruFormFilled?: boolean;
  getGeneralForSpecSheetQueryState?: GetGeneralQueryResultType;
  isDestinationAddressFormFilled?: boolean;
  setShouldUpdateQuoteAndBomLinksInQuote?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  shouldUpdateQuoteAndBomLinksInQuote?: boolean;
};
export const initialValue: InitialValuesType = {
  quoteId: null,
  QuotePdf: null,
  BomPdf: null,
  onPrintQuotePdfClick: () => {},
  noOfSpecSheetPages: 0,
};

export const QuotationSummaryPageContext = createContext(initialValue);

export const useQuotationSummaryPageContextValue = () =>
  useContext(QuotationSummaryPageContext);
