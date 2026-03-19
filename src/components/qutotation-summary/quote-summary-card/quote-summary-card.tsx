import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Typography,
  styled,
} from "@mui/material";
import { useMemo } from "react";

import { getLocaleFormattedNumber } from "~/utils/misc";

import { useAppSelector } from "~/store";
import {
  calculatedSingleGroupGrossTotalPriceSelector,
  calculatedSingleGroupTotalPricePerVehicleSelector,
} from "~/store/slices/quotes/slice";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import MuiBox from "~/components/shared/mui-box/mui-box";

type LineItem = {
  sectionTitle: string;
  optionTitle: string;
  price: number;
  currency: string;
};

export default function QuoteSummaryCard() {
  const { newQuoteById, selectedGroup } = useQuotationSummaryPageContextValue();

  const singleVehicleTotalPrice = useAppSelector(() =>
    calculatedSingleGroupTotalPricePerVehicleSelector(selectedGroup),
  );
  const totalPrice = useAppSelector(() =>
    calculatedSingleGroupGrossTotalPriceSelector(selectedGroup),
  );

  // Base MSRP = per-vehicle total + $3,000
  const baseMsrp = (singleVehicleTotalPrice?.value ?? 0) + 3000;
  const currency = singleVehicleTotalPrice?.currency || "$";

  // Build itemized line items from configuration sections
  const lineItems: LineItem[] = useMemo(() => {
    if (!selectedGroup?.configurationSections) return [];

    const items: LineItem[] = [];
    selectedGroup.configurationSections.forEach((section) => {
      // Skip hidden sections and sections with no title
      if (section?.is_section_hidden || !section?.title) return;
      // Skip exterior color if price is 0
      const sectionTitle = section.title;

      section?.options?.forEach((option) => {
        if (!option?.is_selected) return;
        items.push({
          sectionTitle,
          optionTitle: option.title || "Selected",
          price: option.price || 0,
          currency: option.price_unit || "$",
        });
      });
    });
    return items;
  }, [selectedGroup?.configurationSections]);

  return (
    <QuoteSummaryCardStyled disableGutters defaultExpanded>
      <AccordionSummary
        id="quote-summary-card-accordion-header"
        expandIcon={<ExpandMore />}
      >
        <Typography className="heading">Quote Summary</Typography>

        <Typography className="total-price-text">
          Total Price:{" "}
          <span>
            {currency}
            {getLocaleFormattedNumber(totalPrice?.value)}
          </span>
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Typography className="no-of-vehicles-text">
          No. of Vehicles <br />
          <span>x{newQuoteById?.totalQuantity}</span>
        </Typography>

        {/* Base MSRP */}
        <MuiBox className="detail-row msrp-row">
          <Typography className="detail-title detail-title--bold">
            Base MSRP
          </Typography>
          <Typography className="detail-value detail-value--bold">
            {currency}
            {getLocaleFormattedNumber(baseMsrp)}
          </Typography>
        </MuiBox>

        {/* Itemized line items */}
        <MuiBox className="line-items">
          {lineItems.map((item, idx) => (
            <MuiBox className="line-item" key={`${item.sectionTitle}-${idx}`}>
              <MuiBox className="line-item-left">
                <Typography className="line-item-section">
                  {item.sectionTitle}
                </Typography>
                <Typography className="line-item-option">
                  {item.optionTitle}
                </Typography>
              </MuiBox>
              <Typography className="line-item-price">
                {item.price > 0
                  ? `${item.currency}${getLocaleFormattedNumber(item.price)}`
                  : "Included"}
              </Typography>
            </MuiBox>
          ))}
        </MuiBox>

        {/* Total */}
        <MuiBox className="detail-row detail-row--top-border">
          <Typography className="detail-title detail-title--bold">
            Total Price
          </Typography>
          <Typography className="detail-value detail-value--bold">
            {totalPrice?.currency}
            {getLocaleFormattedNumber(totalPrice?.value)}
          </Typography>
        </MuiBox>
      </AccordionDetails>
    </QuoteSummaryCardStyled>
  );
}

const QuoteSummaryCardStyled = styled(Accordion)(({ theme }) => ({
  borderRadius: "0.625rem",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  padding: "8px 4px",
  boxShadow: "none",

  ".MuiAccordionSummary-content": {
    display: "flex",
    flexDirection: "column",
  },

  ".heading": {
    fontSize: "0.875rem",
    fontWeight: 700,
  },

  ".total-price-text": {
    fontSize: "1rem",
    fontWeight: 700,
    marginTop: "0.375rem",

    span: {
      color: theme.palette.primary.main,
    },
  },

  ".no-of-vehicles-text": {
    fontSize: "0.875rem",
    fontWeight: 400,
    paddingBottom: "1rem",
    borderBottom: `1px solid ${theme.palette.custom.greyAccent}`,

    span: {
      color: theme.palette.primary.main,
    },
  },

  ".msrp-row": {
    marginTop: "1rem",
    paddingBottom: "0.75rem",
    borderBottom: `1px solid ${theme.palette.custom.greyAccent}`,
  },

  ".line-items": {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "0.75rem",
  },

  ".line-item": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },

  ".line-item-left": {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  ".line-item-section": {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: theme.palette.custom.lightGray || "#999",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },

  ".line-item-option": {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: theme.palette.custom.accentBlack || "#333",
  },

  ".line-item-price": {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: theme.palette.primary.main,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  ".detail-row": {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
  },
  ".detail-row--top-border": {
    borderTop: `1px solid ${theme.palette.custom.greyAccent}`,
    paddingTop: "1rem",
  },

  ".detail-title,.detail-value": {
    fontSize: "0.875rem",
    fontWeight: 400,

    "&--bold": {
      fontWeight: 700,
    },
  },
}));
