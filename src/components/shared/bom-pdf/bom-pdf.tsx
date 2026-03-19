/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

//@ts-nocheck
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import RobotoBlack from "~/assets/fonts/Roboto/Roboto-Black.ttf";
import RobotoBold from "~/assets/fonts/Roboto/Roboto-Bold.ttf";
import RobotoItalic from "~/assets/fonts/Roboto/Roboto-Italic.ttf";
import RobotoMedium from "~/assets/fonts/Roboto/Roboto-Medium.ttf";
import Roboto from "~/assets/fonts/Roboto/Roboto-Regular.ttf";
import RobotoThin from "~/assets/fonts/Roboto/Roboto-Thin.ttf";

import { PAGE_BREAKER_TABLE_CONTENT_LIMIT } from "~/constants/constants";

import {
  BoldText,
  CustomText,
  Margin2Top,
  Margin4Top,
  Margin8Bottom,
  Margin8Top,
  ShaedFooter,
} from "~/global/styles/react-pdf-utils";

import { DEFAULT_PDF_HEIGHT, DEFAULT_PDF_WIDTH } from "./data";
import IntroPage from "./intro-page";
import { BomPDFProps } from "./types";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatNumberWithCommas = (price) => {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const BomPDF = (props: BomPDFProps) => {
  const {
    useBomText,
    orderCustomer,
    orderDiscount,
    customizationOptions,
    vehicleDetails,
    logoOEM,
    introPageDetails,
    quotationId,
    pdfWidth,
    pdfHeight,
  } = props;

  console.log("main customizationOptions", customizationOptions);

  const defaultChassisOption = customizationOptions?.find(
    (option) => !option?.sectionTitle,
  );
  // const BOMTotal = introPageDetails?.vehicleDetails?.grandTotal;

  const logoDealer = introPageDetails?.dealerDetails?.logo;
  const pageSize = (() => {
    if (pdfWidth && pdfHeight) {
      return { width: pdfWidth, height: pdfHeight };
    }
    if (pdfWidth) {
      return { width: pdfWidth, height: DEFAULT_PDF_HEIGHT };
    }
    if (pdfHeight) {
      return { width: DEFAULT_PDF_WIDTH, height: pdfHeight };
    }

    return "A4";
  })();
  const isChargerPresent = Boolean(
    customizationOptions?.find(
      (option) => option?.sectionTitle?.toLowerCase() === "charger",
    ),
  );
  console.log("%cBOMPdf:", "background-color:red;color:white", {
    props,
    defaultChassisOption,
  });

  const renderHeader = () => {
    const commonStyles = {
      display: "flex",
      flexDirection: "row",
      alignSelf: "flex-end",
      fontSize: "12px",
      fontWeight: 400,
      textAlign: "right",
    };

    return (
      <View style={styles.header}>
        <View style={styles.headerLogoContainer}>
          {logoOEM && <Image style={styles.headerLogo} src={logoOEM} />}
          {logoDealer && <Image style={styles.dealerLogo} src={logoDealer} />}
        </View>

        <View>
          <BoldText
            style={{
              display: "flex",
              flexDirection: "row",
              alignSelf: "flex-end",
              fontSize: "14px",
            }}
          >
            {introPageDetails?.dealerDetails?.dealership}
          </BoldText>
          <Margin2Top />
          <CustomText style={{ ...commonStyles, width: "272px" }}>
            {introPageDetails?.dealerDetails?.justAddress ||
              introPageDetails?.dealerDetails?.address ||
              "-"}
          </CustomText>
          <Margin2Top />
          <CustomText style={{ ...commonStyles, width: "272px" }}>
            {introPageDetails?.dealerDetails?.city || "-"},{" "}
            {introPageDetails?.dealerDetails?.state || "-"},{" "}
            {introPageDetails?.dealerDetails?.postalCode || "-"}
          </CustomText>
          <Margin2Top />
          <CustomText style={{ ...commonStyles }}>
            Phone:{" "}
            {/* {getFormattedPhoneNumber(introPageDetails?.dealerDetails?.phone)} */}
            {introPageDetails?.dealerDetails?.phone}
          </CustomText>
        </View>
      </View>
    );
  };

  const customizationOptionsFiltered = customizationOptions?.filter(
    (option) => option?.sectionTitle,
  );
  const areNoOfCustomizationOptionsMoreThanWhatSinglePageCanDisplay =
    customizationOptionsFiltered?.length >= PAGE_BREAKER_TABLE_CONTENT_LIMIT;
  const customizationOptionsBelowPageBreakLimit =
    customizationOptionsFiltered?.filter(
      (option, idx) => idx < PAGE_BREAKER_TABLE_CONTENT_LIMIT,
    );
  const customizationOptionsAbovePageBreakLimit =
    customizationOptionsFiltered?.filter(
      (_, idx) => idx >= PAGE_BREAKER_TABLE_CONTENT_LIMIT,
    );

  return (
    <Document>
      {!useBomText && (
        <IntroPage
          logoOEM={logoOEM}
          pdfWidth={pdfWidth}
          pdfHeight={pdfHeight}
          {...introPageDetails}
        />
      )}
      <Page size={pageSize} style={styles.body}>
        <View style={styles.bodyContainer}>
          {renderHeader()}

          <View style={styles.flex2}>
            <View>
              <Text style={styles.flex2shaed}>
                {orderCustomer && capitalizeFirstLetter(orderCustomer)}
              </Text>
              <Margin4Top />

              <Text
                style={{
                  ...styles.address,
                  maxWidth: "300px",
                }}
              >
                {introPageDetails?.customerDetails?.address}
                {introPageDetails?.customerDetails?.city &&
                  `, ${introPageDetails?.customerDetails?.city}`}
                {introPageDetails?.customerDetails?.state &&
                  `, ${introPageDetails?.customerDetails?.state}`}
                {introPageDetails?.customerDetails?.postalCode &&
                  `, ${introPageDetails?.customerDetails?.postalCode}`}
                {introPageDetails?.customerDetails?.country &&
                  `, ${introPageDetails?.customerDetails?.country}`}
              </Text>
              <Margin2Top />

              <Text style={styles.address}>
                Phone #{" "}
                {/* {getFormattedPhoneNumber(
                  introPageDetails?.customerDetails?.phone
                )} */}
                {introPageDetails?.customerDetails?.phone}
              </Text>
              <Margin2Top />

              <Text style={styles.address}>
                {introPageDetails?.customerDetails?.email}
              </Text>
            </View>

            <View>
              <View style={styles.bill}>
                {useBomText ? (
                  <>
                    <Text style={styles.billtext}>BILL OF</Text>
                    <Text style={styles.billtext}>MATERIALS</Text>
                  </>
                ) : (
                  <Text style={styles.billtext}>Quotation</Text>
                )}
                <Margin4Top />
                <Text style={styles.bomtext}>
                  {useBomText ? "BOM #:" : "Quote #:"} {quotationId || "-"}
                </Text>
                <Margin2Top />
                <Text style={styles.bomtext}>
                  Date:{" "}
                  {new Date().toLocaleDateString("en", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>

          {vehicleDetails?.isFleetOrder && (
            <>
              <View>
                {/* <CustomText style={{ fontSize: 10 }}>
                  Group Name:{" "}
                  <BoldText style={{ fontSize: 10 }}>
                    {vehicleDetails?.groupName}
                  </BoldText>
                </CustomText> */}
                {/* <Margin2Top /> */}
                <CustomText style={{ fontSize: 10 }}>
                  Quantity:{" "}
                  <BoldText style={{ fontSize: 10 }}>
                    {Number(vehicleDetails?.quantity).toLocaleString(
                      undefined,
                      {
                        minimumIntegerDigits: 2,
                      },
                    )}
                  </BoldText>
                </CustomText>
              </View>
              <Margin8Bottom />
              <Margin8Bottom />
            </>
          )}

          <View style={styles.table}>
            <View style={{ ...styles.cellCategory, ...styles.headerCell }}>
              <Text>Category</Text>
            </View>
            <View
              style={{
                ...styles.cellComponentDescription,
                ...styles.headerCell,
              }}
            >
              <Text>Component Description</Text>
            </View>
            <View style={{ ...styles.cellEstLeadTime, ...styles.headerCell }}>
              <Text>Est. Lead Time</Text>
            </View>
            <View style={{ ...styles.cellMsrp, ...styles.headerCell }}>
              <Text>MSRP</Text>
            </View>
            <View style={{ ...styles.cellDiscount, ...styles.headerCell }}>
              <Text>Discount</Text>
            </View>
            <View style={{ ...styles.cellQuantity, ...styles.headerCell }}>
              <Text>QTY</Text>
            </View>
            <View style={{ ...styles.headerCell, ...styles.cellSalesPrice }}>
              <Text>Sales Price</Text>
            </View>
          </View>

          {defaultChassisOption && (
            <View style={styles.table}>
              <View style={{ ...styles.bodyCell, ...styles.cellCategory }}>
                <Text>
                  {defaultChassisOption?.title?.toLowerCase() === "chassis only"
                    ? "Chassis"
                    : defaultChassisOption?.title}
                </Text>
              </View>
              <View
                style={{
                  ...styles.bodyCell,
                  ...styles.cellComponentDescription,
                }}
              >
                <Text>
                  {vehicleDetails?.model}
                  <BoldText style={{ fontSize: 10 }}>
                    {orderDiscount ? ` (${orderDiscount}% discount)` : ""}
                  </BoldText>
                </Text>
              </View>
              <View style={{ ...styles.bodyCell, ...styles.cellEstLeadTime }}>
                <Text>{defaultChassisOption?.leadtime || "-"}</Text>
              </View>
              <View style={{ ...styles.bodyCell, ...styles.cellMsrp }}>
                <Text>{vehicleDetails?.originalMSRP}</Text>
              </View>
              <View style={{ ...styles.bodyCell, ...styles.cellDiscount }}>
                <Text>{vehicleDetails?.discountedAmount}</Text>
              </View>
              <View style={{ ...styles.bodyCell, ...styles.cellQuantity }}>
                <Text>{introPageDetails?.vehicleDetails?.quantity}</Text>
              </View>
              <View style={{ ...styles.bodyCell, ...styles.cellSalesPrice }}>
                <Text>{vehicleDetails?.originalMSRPAfterDiscount}</Text>
              </View>
            </View>
          )}

          {customizationOptionsBelowPageBreakLimit?.map((option, index) => {
            const isTotalRow = option?.sectionTitle?.toLowerCase() === "total";
            const isChargerRow =
              option?.sectionTitle?.toLowerCase() === "charger";

            return (
              <View key={index} wrap={false} style={styles.table}>
                <View
                  style={{
                    ...styles.bodyCell,
                    ...styles.cellCategory,
                  }}
                >
                  {isTotalRow ? (
                    <BoldText style={{ fontSize: 10 }}>
                      {option?.sectionTitle}
                    </BoldText>
                  ) : (
                    <Text>{option?.sectionTitle}</Text>
                  )}
                </View>
                <View
                  style={{
                    ...styles.bodyCell,
                    ...styles.cellComponentDescription,
                  }}
                >
                  <Text>{option?.title}</Text>
                </View>
                <View style={{ ...styles.bodyCell, ...styles.cellEstLeadTime }}>
                  <Text>
                    {option?.leadtime
                      ? `${option?.leadtime}${
                          isChargerPresent && isTotalRow ? "**" : ""
                        }`
                      : "-"}
                  </Text>
                </View>
                <View style={{ ...styles.bodyCell, ...styles.cellMsrp }}>
                  <Text>
                    {option?.price?.value
                      ? `$${formatNumberWithCommas(
                          option?.price?.value ?? 0,
                        )}${isChargerPresent && isChargerRow ? "*" : ""}`
                      : "-"}
                  </Text>
                </View>
                <View style={{ ...styles.bodyCell, ...styles.cellDiscount }}>
                  <Text>
                    {isTotalRow ? vehicleDetails?.discountedAmount : "$0.00"}
                  </Text>
                </View>
                <View style={{ ...styles.bodyCell, ...styles.cellQuantity }}>
                  <Text>{isTotalRow ? "" : option?.quantity}</Text>
                </View>
                <View style={{ ...styles.bodyCell, ...styles.cellSalesPrice }}>
                  {isTotalRow ? (
                    <BoldText style={{ fontSize: 10 }}>
                      ${formatNumberWithCommas(option?.lineTotal?.value ?? 0)}
                    </BoldText>
                  ) : (
                    <Text>
                      ${formatNumberWithCommas(option?.lineTotal?.value ?? 0)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          <Margin8Top />

          {isChargerPresent && (
            <>
              <Text style={{ fontSize: 10 }}>
                *Charger Installation price not included
              </Text>
              <Margin4Top />
              <Text style={{ fontSize: 10 }}>
                **Charger Lead Time not included
              </Text>
            </>
          )}

          {/* Sales Total Row Starts */}
          {/* <View wrap={false} style={styles.table}>
						<View
							style={{ ...styles.bodyCell, ...styles.cellCategory, border: "none" }}
						></View>
						<View
							style={{ ...styles.bodyCell, ...styles.cellComponentDescription, border: "none" }}
						></View>
						<View
							style={{ ...styles.bodyCell, ...styles.cellEstLeadTime, border: "none" }}
						></View>
						<View
							style={{
								...styles.bodyCell,
								...styles.cellMsrp,
								width: 60,
								border: "none",
							}}
						></View>
						<View
							style={{
								...styles.bodyCell,
								...styles.cellQuantity,
								width: 69,
								border: "none",
							}}
						>
							<Text>Sales Total</Text>
						</View>
						<View
							style={{
								...styles.bodyCell,
								...styles.cellSalesPrice,
								width: 85,
								borderLeft: 1,
							}}
						>
							<Text>{BOMTotal}</Text>
						</View>
					</View> */}
          {/* Sales Total Row Ends */}

          {/* <View
						style={{
							...styles.flex3,
							...styles.mt0,
							justifyContent: "flex-end",
						}}
					>
						<View style={styles.f3text}>
							<Text>Sales Total</Text>
						</View>
						<View style={styles.f3cell}>
							<Text>{BOMTotal}</Text>
						</View>
					</View> */}

          {/* <Text>Destination Charge - FOB Shipping point</Text> */}

          <ShaedFooter />
        </View>
      </Page>
      {areNoOfCustomizationOptionsMoreThanWhatSinglePageCanDisplay && (
        <Page size={pageSize} style={styles.body} id={"customization-pg-2"}>
          <View style={styles.bodyContainer}>
            {renderHeader()}
            {customizationOptionsAbovePageBreakLimit?.map((option, index) => {
              const isTotalRow =
                option?.sectionTitle?.toLowerCase() === "total";
              const isChargerRow =
                option?.sectionTitle?.toLowerCase() === "charger";

              return (
                <View key={index} wrap={false} style={styles.table}>
                  <View
                    style={{
                      ...styles.bodyCell,
                      ...styles.cellCategory,
                    }}
                  >
                    {isTotalRow ? (
                      <BoldText style={{ fontSize: 10 }}>
                        {option?.sectionTitle}
                      </BoldText>
                    ) : (
                      <Text>{option?.sectionTitle}</Text>
                    )}
                  </View>
                  <View
                    style={{
                      ...styles.bodyCell,
                      ...styles.cellComponentDescription,
                    }}
                  >
                    <Text>{option?.title}</Text>
                  </View>
                  <View
                    style={{ ...styles.bodyCell, ...styles.cellEstLeadTime }}
                  >
                    <Text>
                      {option?.leadtime
                        ? `${option?.leadtime}${
                            isChargerPresent && isTotalRow ? "**" : ""
                          }`
                        : "-"}
                    </Text>
                  </View>
                  <View style={{ ...styles.bodyCell, ...styles.cellMsrp }}>
                    <Text>
                      {option?.price?.value
                        ? `$${formatNumberWithCommas(
                            option?.price?.value ?? 0,
                          )}${isChargerPresent && isChargerRow ? "*" : ""}`
                        : "-"}
                    </Text>
                  </View>
                  <View style={{ ...styles.bodyCell, ...styles.cellDiscount }}>
                    <Text>
                      {isTotalRow ? vehicleDetails?.discountedAmount : "$0.00"}
                    </Text>
                  </View>
                  <View style={{ ...styles.bodyCell, ...styles.cellQuantity }}>
                    <Text>{isTotalRow ? "" : option?.quantity}</Text>
                  </View>
                  <View
                    style={{ ...styles.bodyCell, ...styles.cellSalesPrice }}
                  >
                    {isTotalRow ? (
                      <BoldText style={{ fontSize: 10 }}>
                        ${formatNumberWithCommas(option?.lineTotal?.value ?? 0)}
                      </BoldText>
                    ) : (
                      <Text>
                        ${formatNumberWithCommas(option?.lineTotal?.value ?? 0)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
            <ShaedFooter />
          </View>
        </Page>
      )}

      {!useBomText && (
        <Page size={pageSize} style={styles.body}>
          <View style={styles.bodyContainer}>
            {renderHeader()}

            <View style={styles.acceptanceOfQuotationContainer}>
              <BoldText>Acceptance of Quotation:</BoldText>

              <Margin8Top />
              <Margin8Top />

              <CustomText>
                I,{" "}
                <BoldText>
                  {introPageDetails?.customerDetails?.name || "-"}
                </BoldText>
                , hereby accept the quotation as outlined above and agree to the
                terms and conditions stated.
              </CustomText>

              <Margin8Top />
              <Margin8Top />
              <Margin8Top />
              <Margin8Top />
              <Margin8Top />

              <View style={styles.signatureRow}>
                <CustomText>Signature: ___________________________</CustomText>
                <CustomText>Date: _________________</CustomText>
              </View>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
    },
    {
      src: RobotoItalic,
      fontStyle: "italic",
    },
    {
      src: RobotoMedium,
      fontWeight: 500,
    },
    { src: RobotoBold, fontWeight: 700 },
    {
      src: RobotoBlack,
      fontWeight: 900,
    },
    {
      src: RobotoThin,
      fontWeight: 300,
    },
  ],
});

const styles = StyleSheet.create({
  body: {
    paddingTop: 29,
    // paddingBottom: 65,
    paddingHorizontal: 30,
  },

  bodyContainer: {
    display: "flex",
    flexDirection: "column",
    height: "99%", // used '99%' because bottom element overflowing to next page on '100%'
  },

  dealerLogo: {
    width: "50px",
    height: "50px",
    objectFit: "contain",
  },

  image: {
    width: "200px",
    height: "60px",
    objectFit: "contain",
  },
  header: {
    borderBottomColor: "#C4C4C4",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    paddingBottom: 30,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLogoContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
  },
  headerLogo: {
    width: "100px",
    height: "50px",
    objectFit: "contain",
  },
  flex1: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shaedHeading: {
    fontSize: 44,
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  ml15: {
    marginLeft: 15,
  },
  bill: {
    width: "250pt",
    display: "flex",
    alignItems: "flex-end",
  },
  billtext: {
    fontFamily: "Roboto",
    fontWeight: "medium",
    fontSize: 16,
  },
  bomtext: {
    fontFamily: "Roboto",
    fontSize: 10,
  },
  shaedAbbr: {
    fontFamily: "Roboto",
    fontSize: 11,
    fontWeight: "semibold",
  },

  placeholder: {
    width: "120px",
    height: "120px",
    backgroundColor: "white",
  },

  placeholderImg: {
    width: "120px",
    height: "120px",
  },

  flex2: {
    marginTop: 30,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  flex2shaed: {
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  flex2italic: {
    fontFamily: "Roboto",
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 20,
  },
  vin: {
    fontSize: 12,
    fontFamily: "Roboto",
  },
  address: {
    fontSize: 10,
    fontFamily: "Roboto",
  },

  table: {
    display: "flex",
    flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center"
  },
  bodyCell: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderBottom: 1,
  },
  headerCell: {
    backgroundColor: "black",
    color: "white",
    padding: "5px 6px",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Roboto",
    borderRightColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightStyle: "solid",
  },
  cellCategory: {
    width: 96,
    borderLeft: 1,
    borderRight: 1,
  },
  cellComponentDescription: {
    width: 203,
    borderRight: 1,
  },
  cellEstLeadTime: {
    width: 72,
    borderRight: 1,
  },
  cellMsrp: {
    width: 79,
    textAlign: "right",
    borderRight: 1,
  },
  cellDiscount: {
    width: 69,
    textAlign: "right",
    borderRight: 1,
  },
  cellQuantity: {
    width: 32,
    textAlign: "right",
    borderRight: 1,
  },
  cellSalesPrice: {
    width: 79,
    textAlign: "right",
    borderRight: 1,
  },

  flex3: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  f3text: {
    fontSize: 10,
    textAlign: "right",
    paddingRight: 10,
  },
  f3cell: {
    width: 82.75,
    fontSize: 10,
    borderLeft: 1,
    borderRight: 1,
    borderBottom: 1,
    textAlign: "right",
    padding: "5px",
  },
  mt0: {
    marginTop: -2,
  },

  flex4: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    border: 1.5,
  },
  flex4col2: {
    width: "90%",
    marginLeft: 6,
    padding: "2px 20px 10px 1px",
  },
  flex4head: {
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 2,
    fontFamily: "Roboto",
  },
  flex4text: {
    fontSize: 11,
    fontFamily: "Roboto",
  },
  image3: {
    margin: 3,
    width: "50px",
    height: "50px",
  },
  image4: {
    margin: 3,
    width: "50px",
    height: "50px",
  },
  footer: {
    position: "absolute",
    bottom: 1,
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    marginBottom: "10px",
    textAlign: "center",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  footerImage: {
    width: "20px",
    marginRight: "10px",
  },

  signatureRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16,
  },

  acceptanceOfQuotationContainer: {
    // borderTopColor: "#C4C4C4",
    // borderTopWidth: 1,
    // borderTopStyle: "dashed",
    // paddingTop: 30,
    marginTop: 30,
    marginBottom: 20,
  },
});

export { BomPDF };
