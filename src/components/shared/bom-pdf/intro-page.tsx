//@ts-nocheck
import { Image, Link, Page, StyleSheet, View } from "@react-pdf/renderer";

import IconFan from "~/assets/icons/iconfan.png";
import IconSnowFlake from "~/assets/icons/iconsnowflake.png";

import { PAGE_BREAKER_TABLE_CONTENT_LIMIT } from "~/constants/constants";

import {
  BoldText,
  CustomText,
  Margin16Top,
  Margin20Top,
  Margin4Top,
  Margin8Top,
  ShaedFooter,
} from "~/global/styles/react-pdf-utils";

import { DEFAULT_PDF_HEIGHT, DEFAULT_PDF_WIDTH } from "./data";
import { IntroPageProps } from "./types";

export default function IntroPageV2(props: IntroPageProps) {
  const {
    appName,
    logoOEM,
    dealerDetails,
    date,
    customerDetails,
    vehicleDetails,
    warrantyDetails,
    quotationValidityDate,
    salesTeamDetails,
    pdfWidth,
    pdfHeight,
  } = props;
  const { model, color, ...restVehicleDetails } =
    vehicleDetails?.configOptions || {};

  const logoDealer = dealerDetails?.logo;
  const appNameToShow = appName || "-";
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
  console.log("%cintro page props:", "background-color:crimson;color:white;", {
    props,
  });

  // If there are more than a certain number of details line items, then the table squeezes to fit the content, causing PDF page to look distorted.
  // To avoid this issue, we split the details into two objects conditionally, and in the second object, put the detail items that are greater than a certain defined threshold limit.
  const splitRestVehicleDetailsIntoTwoParts = () => {
    // Make entries of vehicle details object
    // A key in details object can have value of either "string" or array of strings
    const vehicleDetailsEntries = Object.entries(restVehicleDetails);

    // Each "string" value counts as a detail item, so after a certain number of detail items, we have to split the rest into second object to show them on next page.
    let thresholdLimitToSetDetailsInSecondPart = 0;

    const customizationOptionsBelowPageBreakLimit = {};
    const customizationOptionsAbovePageBreakLimit = {};

    for (const [detailName, detailValue] of vehicleDetailsEntries) {
      thresholdLimitToSetDetailsInSecondPart += Array.isArray(detailValue)
        ? detailValue.length
        : 1;

      const isDetailItemGreaterThanPageBreakLimit =
        thresholdLimitToSetDetailsInSecondPart >
        PAGE_BREAKER_TABLE_CONTENT_LIMIT + 1;
      if (!isDetailItemGreaterThanPageBreakLimit) {
        customizationOptionsBelowPageBreakLimit[detailName] = detailValue;
      } else {
        customizationOptionsAbovePageBreakLimit[detailName] = detailValue;
      }
    }

    return {
      customizationOptionsBelowPageBreakLimit,
      customizationOptionsAbovePageBreakLimit,
    };
  };

  const {
    customizationOptionsBelowPageBreakLimit,
    customizationOptionsAbovePageBreakLimit,
  } = splitRestVehicleDetailsIntoTwoParts();

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
            {dealerDetails?.dealership}
          </BoldText>
          <CustomText style={{ ...commonStyles, width: "272px" }}>
            {dealerDetails?.justAddress || dealerDetails?.address || "-"}
          </CustomText>
          <CustomText style={{ ...commonStyles, width: "272px" }}>
            {dealerDetails?.city || "-"}, {dealerDetails?.state || "-"},{" "}
            {dealerDetails?.postalCode || "-"}
          </CustomText>
          <CustomText style={{ ...commonStyles }}>
            {/* Phone: {getFormattedPhoneNumber(dealerDetails?.phone)} */}
            Phone: {dealerDetails?.phone}
          </CustomText>
        </View>
      </View>
    );
  };

  return (
    <>
      <Page size={pageSize} style={styles.body}>
        <View style={styles.bodyContainer}>
          {renderHeader()}

          <Margin8Top />
          <Margin8Top />
          <Margin16Top />

          {date && <CustomText>{date}</CustomText>}

          <Margin8Top />
          <Margin8Top />

          <View>
            <BoldText>Prepared For:</BoldText>

            <Margin8Top />

            {Boolean(customerDetails?.name) && (
              <CustomText>{customerDetails.name}</CustomText>
            )}
            {Boolean(customerDetails?.address) && (
              <CustomText>{customerDetails.address}</CustomText>
            )}
            <View>
              <CustomText>
                {Boolean(customerDetails?.city) && <>{customerDetails.city}</>}
                {Boolean(customerDetails?.state) && (
                  <>, {customerDetails.state}</>
                )}
                {Boolean(customerDetails?.postalCode) && (
                  <>, {customerDetails.postalCode}</>
                )}
              </CustomText>
            </View>
          </View>

          <Margin8Top />
          <Margin8Top />
          <Margin8Top />

          <CustomText>
            Subject: <BoldText>Commercial Vehicle Quotation</BoldText>
          </CustomText>

          <Margin8Top />
          <Margin8Top />
          <Margin8Top />

          <CustomText>
            Dear <BoldText>{customerDetails?.name}</BoldText>,
          </CustomText>

          <Margin8Top />

          <CustomText>
            We are pleased to provide you with a quotation for {appNameToShow}{" "}
            vehicles sold by{" "}
            <BoldText>{dealerDetails?.dealership || "-"}</BoldText>. We
            appreciate the opportunity to serve your business needs and we are
            committed to offering you the best in terms of quality, price and
            service. The Bill of Materials below outlines the components and
            parts that will be included in your order.
          </CustomText>

          <Margin8Top />

          <Margin8Top />
          <Margin4Top />

          <BoldText>Vehicle Specifications:</BoldText>

          <Margin8Top />

          <View style={styles.vehicleDetailsContainer}>
            <View style={styles.quotationDetailRow}>
              <View style={styles.quotationDetailTitle}>
                <CustomText>Model</CustomText>
              </View>
              <View style={styles.quotationDetailValue}>
                <CustomText>{model || "-"}</CustomText>
              </View>
            </View>

            <View style={styles.quotationDetailRow}>
              <View style={styles.quotationDetailTitle}>
                <CustomText>Color</CustomText>
              </View>
              <View style={styles.quotationDetailValue}>
                <CustomText>{color || "-"}</CustomText>
              </View>
            </View>

            {Object.entries(customizationOptionsBelowPageBreakLimit)?.map(
              ([key, value], index) => {
                return (
                  <View key={index} style={styles.quotationDetailRow}>
                    <View style={styles.quotationDetailTitle}>
                      <CustomText>
                        {key?.charAt(0)?.toUpperCase() + key?.slice(1)}
                      </CustomText>
                    </View>
                    <View style={styles.quotationDetailValue}>
                      {Array.isArray(value) ? (
                        value?.length > 0 ? (
                          value?.map((option, index1, self) => {
                            return (
                              <>
                                <CustomText key={index1}>
                                  {option || "-"}
                                </CustomText>
                                {self?.length > 1 && <Margin4Top />}
                              </>
                            );
                          })
                        ) : (
                          <CustomText>-</CustomText>
                        )
                      ) : (
                        <>
                          <CustomText>{value || "-"}</CustomText>
                        </>
                      )}
                    </View>
                  </View>
                );
              },
            )}

            {/* <View style={styles.quotationDetailRow}>
              <View style={styles.quotationDetailTitle}>
                <CustomText>Powertrain/Battery Capacity</CustomText>
              </View>
              <View style={styles.quotationDetailValue}>
                <CustomText>{vehicleDetails?.engine || "-"}</CustomText>
              </View>
            </View>

            {vehicleDetails?.dashboard && (
              <View style={styles.quotationDetailRow}>
                <View style={styles.quotationDetailTitle}>
                  <CustomText>Dashboard</CustomText>
                </View>
                <View style={styles.quotationDetailValue}>
                  <CustomText>{vehicleDetails?.dashboard}</CustomText>
                </View>
              </View>
            )}

            <View style={styles.quotationDetailRow}>
              <View style={styles.quotationDetailTitle}>
                <CustomText>Upfit</CustomText>
              </View>
              <View style={styles.quotationDetailValue}>
                <CustomText>{vehicleDetails?.upfit || "-"}</CustomText>
              </View>
            </View>

            <View style={styles.quotationDetailRow}>
              <View style={styles.quotationDetailTitle}>
                <CustomText>Shelving</CustomText>
              </View>
              <View style={styles.quotationDetailValue}>
                <CustomText>{vehicleDetails?.shelving || "-"}</CustomText>
              </View>
            </View>

            <View style={styles.quotationDetailRow}>
              <View style={styles.quotationDetailTitle}>
                <CustomText>Accessories</CustomText>
              </View>
              <View style={styles.quotationDetailValue}>
                {vehicleDetails?.accessories &&
                Array.isArray(vehicleDetails?.accessories) &&
                vehicleDetails?.accessories?.length > 0 ? (
                  vehicleDetails?.accessories?.map((accessory, index) => (
                    <>
                      <CustomText key={index}>{accessory || "-"}</CustomText>
                      <Margin4Top />
                    </>
                  ))
                ) : (
                  <CustomText>-</CustomText>
                )}
              </View>
            </View>

            <View style={styles.quotationDetailRow}>
              <View style={styles.quotationDetailTitle}>
                <CustomText>Charger</CustomText>
              </View>
              <View style={styles.quotationDetailValue}>
                <CustomText>{vehicleDetails?.charger || "-"}</CustomText>
              </View>
            </View> */}
          </View>

          <Margin8Top />
          <Margin4Top />

          <ShaedFooter />
        </View>
      </Page>

      <Page size={pageSize} style={styles.body}>
        <View style={styles.bodyContainer}>
          {renderHeader()}

          {Object.keys(customizationOptionsAbovePageBreakLimit).length > 0 &&
            Object.entries(customizationOptionsAbovePageBreakLimit)?.map(
              ([key, value], index, outerSelf) => {
                return (
                  <View
                    key={index}
                    style={{
                      ...styles.quotationDetailRow,
                      ...(index === outerSelf?.length - 1 && {
                        borderBottomWidth: 1,
                      }),
                    }}
                  >
                    <View style={styles.quotationDetailTitle}>
                      <CustomText>
                        {key?.charAt(0)?.toUpperCase() + key?.slice(1)}
                      </CustomText>
                    </View>
                    <View style={styles.quotationDetailValue}>
                      {Array.isArray(value) ? (
                        value?.length > 0 ? (
                          value?.map((option, index1, self) => {
                            return (
                              <>
                                <CustomText key={index1}>
                                  {option || "-"}
                                </CustomText>
                                {self?.length > 1 && <Margin4Top />}
                              </>
                            );
                          })
                        ) : (
                          <CustomText>-</CustomText>
                        )
                      ) : (
                        <>
                          <CustomText>{value || "-"}</CustomText>
                        </>
                      )}
                    </View>
                  </View>
                );
              },
            )}

          <Margin8Top />
          <Margin8Top />
          <Margin8Top />

          <BoldText>Warranty & Services:</BoldText>

          <Margin8Top />

          <View>
            <CustomText>
              All {appNameToShow} vehicles are protected by a {appNameToShow}{" "}
              Limited Warranty, which includes the Base Vehicle, the High
              Voltage Battery, and the Chassis Components. For complete warranty
              information and terms,{" "}
              {warrantyDetails?.specificationLink ? (
                <>
                  refer to our{" "}
                  <BoldText>
                    <Link
                      src={warrantyDetails.specificationLink}
                      style={{
                        color: "black",
                      }}
                    >
                      Warranty Statement
                    </Link>
                  </BoldText>{" "}
                  for the specific vehicles ordered.
                </>
              ) : (
                "please visit our official website."
              )}
            </CustomText>
          </View>

          <Margin8Top />
          <Margin8Top />

          <BoldText>Payment Terms:</BoldText>

          <Margin8Top />

          <CustomText>
            A deposit{" "}
            {/* <BoldText>
              {paymentDetails?.requiredDepositPercentage || "-"}
            </BoldText>{" "} */}
            is required upon acceptance of this quotation, with the balance
            payable upon delivery. We offer a range of financing solutions and
            would be happy to discuss these options with you if needed.
          </CustomText>

          <Margin8Top />
          <Margin8Top />
          <Margin8Top />
          <Margin8Top />

          <CustomText>
            This quotation is valid until{" "}
            <BoldText>{quotationValidityDate || "-"}</BoldText>. If you find
            everything in order, please sign below in the provided space and
            return a copy to us as an acceptance of the quotation. Upon receipt,
            we will coordinate with you for the next steps regarding delivery
            and payment.
          </CustomText>

          <Margin8Top />
          <Margin8Top />
          <Margin4Top />

          <CustomText>
            Please review the Bill of Materials carefully to ensure that all
            specifications align with your requirements and expectations. If you
            have any questions or if there are any adjustments needed, please do
            not hesitate to reach out to our sales team.
          </CustomText>

          <Margin8Top />
          <Margin8Top />
          <Margin4Top />

          <CustomText>
            Once we receive your confirmation of the Bill of Materials, we will
            proceed with processing the order, finalizing the production
            schedule, and confirming delivery details.
          </CustomText>

          <Margin8Top />
          <Margin8Top />
          <Margin4Top />

          <CustomText>
            Thank you for choosing{" "}
            <BoldText>{dealerDetails?.dealership || "us"}</BoldText>. We look
            forward to delivering world-class commercial vehicles that exceed
            your expectations.
          </CustomText>

          <Margin8Top />
          <Margin4Top />

          <View>
            <CustomText>Warm regards,</CustomText>
            {salesTeamDetails?.representativeName && (
              <BoldText>{salesTeamDetails.representativeName}</BoldText>
            )}
            {salesTeamDetails?.representativeJobTitle && (
              <BoldText>{salesTeamDetails.representativeJobTitle}</BoldText>
            )}
            {dealerDetails?.dealership && (
              <BoldText>{dealerDetails?.dealership}</BoldText>
            )}
          </View>

          <Margin20Top />

          <ShaedFooter />
        </View>
      </Page>

      <Page size={pageSize} style={styles.body}>
        <View style={styles.bodyContainer}>
          {renderHeader()}

          <View>
            <View style={styles.flex4}>
              <View>
                <Image style={styles.miscInfoImage} src={IconSnowFlake} />
              </View>

              <View style={styles.flex4col2}>
                <CustomText style={styles.flex4head}>
                  Refrigerated materials shipments
                </CustomText>
                <CustomText style={styles.flex4text}>
                  We strive to deliver refrigerated materials reliably. If this
                  cold delivery would arrive on Friday, be informed we will
                  re-schedule to arrive on the following Monday, to ensure the
                  product arrives at your receiving department with adequate
                  time for you to process
                </CustomText>
              </View>
            </View>

            <View style={styles.flex4}>
              <View>
                <Image style={styles.miscInfoImage} src={IconFan} />
              </View>

              <View style={styles.flex4col2}>
                <CustomText style={styles.flex4head}>
                  Hazardous materials shipments
                </CustomText>
                <CustomText style={styles.flex4text}>
                  Shipment of hazardous materials must comply with safety
                  regulations. Since this custom item contains hazardous
                  materials, please contact our shipping department for further
                  instructions on a safe and reliable delivery.
                </CustomText>
              </View>
            </View>
          </View>

          <ShaedFooter />
        </View>
      </Page>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingTop: 29,
    // paddingBottom: 35,
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

  flex4: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    border: 1.5,
    padding: 10,
  },
  flex4col2: {
    width: "90%",
    marginLeft: 6,
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

  grandTotalRow: {
    borderBottomWidth: 1,
    borderTopWidth: 2,
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

  miscInfoImage: {
    width: "44px",
    height: "44px",
  },

  quotationDetailRow: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    borderBottomWidth: 0,
  },

  quotationDetailTitle: {
    paddingVertical: 8,
    width: 140,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: "black",
  },
  quotationDetailValue: {
    paddingVertical: 8,
    paddingLeft: 10,
    flex: 1,
  },

  separator: {
    height: 4,
    borderTopWidth: 1,
    borderTopColor: "black",
    borderTopStyle: "dashed",
  },

  signatureRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16,
  },

  vehicleDetailsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    borderBottomStyle: "solid",
  },
});
