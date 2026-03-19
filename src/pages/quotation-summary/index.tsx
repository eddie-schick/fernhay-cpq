import { PDFViewer } from "@react-pdf/renderer";

import { useRef } from "react";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";

import { Box, styled } from "@mui/material";

import RoutePaths from "~/constants/route-paths";

import { RootState, useAppSelector } from "~/store";
import { quotationSummarySelector } from "~/store/slices/quotation-summary/slice";

import MainLayout from "~/layout/main-layout/main-layout";

import CBackButton from "~/components/common/c-back-button/c-back-button";
import CustomerInfoCard from "~/components/qutotation-summary/customer-info-card/customer-info-card";
import DestinationAddress from "~/components/qutotation-summary/destination-address-card/destination-address-card";
import LeadtimeSummaryCard from "~/components/qutotation-summary/leadtime-summary-card/leadtime-summary-card";
import QuotationSummaryHeader from "~/components/qutotation-summary/quotation-summary-header/quotation-summary-header";
import QuoteSummaryCard from "~/components/qutotation-summary/quote-summary-card/quote-summary-card";
import ShipThruDetailsCard from "~/components/qutotation-summary/ship-thru-details-card/ship-thru-details-card";
import VehicleDetailsCard from "~/components/qutotation-summary/vehicle-details-card/vehicle-details-card";
import MuiBox from "~/components/shared/mui-box/mui-box";

export default function QuotationSummaryPage() {
  const navigate = useNavigate();

  const { isSameAsDestinationAddressSelected } = useAppSelector(
    quotationSummarySelector,
  );

  const customerCardRef = useRef<HTMLDivElement>(null);

  const scrollToCustomerCard = () => {
    if (customerCardRef.current) {
      const offset = -200;
      const elementPosition =
        customerCardRef.current.getBoundingClientRect().top +
        window.pageYOffset;
      const offsetPosition = elementPosition + offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const [searchParams] = useSearchParams();
  const navigation = searchParams.get("navigation");

  // const { user } = useAuthContextValue();

  // const quoteId = searchParams.get("quoteId");

  // const newQuoteById = useAppSelector((state: RootState) =>
  //   selectQuoteById(state, quoteId!),
  // ) as NewQuoteShape;

  // const selectedGroup = newQuoteById?.groups?.find(
  //   (group) => group.isSelected === true,
  // ) as NewQuoteShape["groups"][number];

  // const { bomPdfCommonProps } = useBomPdfProps({
  //   order: newQuoteById,
  //   group: selectedGroup,
  //   user: user!,
  // });

  return (
    <MainLayout
      headerTitle={`${
        navigation === "edit" ? "Edit Order" : "Build My Vehicle"
      }`}
    >
      <QuotationSummaryPageStyled>
        {/* <PDFViewer
          style={{
            height: "50rem",
            width: "37.5rem",
          }}
        >
          <BomPDF {...bomPdfCommonProps} />
        </PDFViewer> */}

        <MuiBox className="header-container">
          <CBackButton
            customText={`${
              navigation === "edit" ? "Manage Orders" : "Build My Vehicle"
            } `}
            onClick={() => {
              {
                if (navigation === "edit") {
                  navigate(RoutePaths.MY_ORDERS);
                } else {
                  navigate(RoutePaths.BUILD_MY_VEHICLE_PAGE);
                }
              }
            }}
          />

          <QuotationSummaryHeader />
        </MuiBox>

        <MuiBox className="summary-details-container">
          <MuiBox className="summary-container" sx={{ flex: 1 }}>
            <QuoteSummaryCard />
            <br />
            <LeadtimeSummaryCard />
            <br />
            <CustomerInfoCard customerCardRef={customerCardRef} />
            <br />
            <ShipThruDetailsCard />
            {!isSameAsDestinationAddressSelected && (
              <>
                <br />
                <DestinationAddress
                  scrollToCustomerCard={scrollToCustomerCard}
                />
              </>
            )}
          </MuiBox>

          <MuiBox className="vehicle-details-container">
            <VehicleDetailsCard />
          </MuiBox>
        </MuiBox>
      </QuotationSummaryPageStyled>
    </MainLayout>
  );
}

const QuotationSummaryPageStyled = styled(Box)(({ theme }) => ({
  padding: "0px 24px 100px 24px",

  ".header-container": {
    position: "sticky",
    top: "70px",
    zIndex: 2,
    backgroundColor: "#ffffff",
    paddingBlock: "24px",

    [theme.breakpoints.down("sm")]: {
      position: "static",
    },
  },

  ".summary-details-container": {
    display: "flex",
    justifyContent: "space-between",
    gap: "1.5rem",
  },

  ".summary-container": {
    flex: 0.475,
  },

  ".vehicle-details-container": {
    flex: 0.525,

    ".images-or-3d-model": {
      maxWidth: "unset",
    },

    ".swiper__vehicle-main-image": {
      maxHeight: "45vh",
      objectFit: "contain",
    },
  },

  "@media screen and (max-height:800px)": {
    ".vehicle-details-container": {
      ".swiper__vehicle-main-image": {
        maxHeight: "35vh",
      },
    },
  },

  "@media screen and (max-height:680px)": {
    ".summary-details-container": {
      flexDirection: "column-reverse",
    },

    ".vehicle-details-container": {
      ".swiper__vehicle-main-image": {
        maxHeight: "30vh",
      },
    },
  },

  [theme.breakpoints.down("lg")]: {
    ".summary-details-container": {
      flexDirection: "column-reverse",
    },

    ".vehicle-details-container": {
      maxWidth: "unset",
    },
  },

  "@media screen and (max-height:900px)": {
    ".summary-container": {
      flex: 0.5,
    },

    ".vehicle-details-container": {
      flex: 0.5,
    },
  },
}));
