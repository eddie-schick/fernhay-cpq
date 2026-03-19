import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";

import { getLeadTimeInDays, getWeightInLbs } from "~/utils/date-utils";
import getBuildLeadTimeFromTimeGivenInDays from "~/utils/misc";

import { RootState } from "~/store";

import { NewQuoteShape } from "./types";

type QuotesInitState = {
  newQuotes: NewQuoteShape[];
};
const initialState: QuotesInitState = {
  newQuotes: [],
};
const quotesSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    setNewQuotes: (
      state,
      action: PayloadAction<QuotesInitState["newQuotes"]>,
    ) => {
      state.newQuotes = action.payload;
    },
    createNewQuote: (state, action: PayloadAction<NewQuoteShape>) => {
      state.newQuotes = [action.payload];
    },
    setQuoteById: (
      state,
      action: PayloadAction<{
        quoteId: string | number;
        data: NewQuoteShape;
      }>,
    ) => {
      const { quoteId, data } = action.payload;

      state.newQuotes = state.newQuotes.map((order) =>
        String(order.id) !== String(quoteId) ? order : data,
      );
    },
    setQuoteGroupById: (
      state,
      action: PayloadAction<{
        quoteId: string | number;
        groupId: string | number;
        data: Partial<NewQuoteShape["groups"][number]>;
      }>,
    ) => {
      const { quoteId, groupId, data } = action.payload;
      console.log("%cinside setQuoteGroupById:", "background-color:aqua;", {
        action,
        newQuotes: [...state.newQuotes],
      });

      state.newQuotes = state.newQuotes.map((order) =>
        String(order.id) !== String(quoteId)
          ? order
          : {
              ...order,
              groups: order?.groups?.map((group) =>
                String(group?.id) !== String(groupId)
                  ? group
                  : { ...group, ...data },
              ),
            },
      );
    },
    setEditedQuote: (
      state,
      action: PayloadAction<{
        data: NewQuoteShape;
      }>,
    ) => {
      const { data } = action.payload;
      state.newQuotes = [data];
    },
    setCustomerDetailsInQuote: (
      state,
      action: PayloadAction<{
        quoteId: string | number;
        data: Partial<NewQuoteShape["customer"]>;
      }>,
    ) => {
      const { quoteId, data } = action.payload;

      state.newQuotes = state.newQuotes.map((order) =>
        String(order.id) !== String(quoteId)
          ? order
          : {
              ...order,
              customer: {
                ...(order?.customer || {}),
                ...data,
              },
            },
      );
    },
    setCustomerFormDetailsInQuote: (
      state,
      action: PayloadAction<{
        quoteId: string | number;
        data: Partial<NewQuoteShape["customerDetailsForm"]>;
      }>,
    ) => {
      const { quoteId, data } = action.payload;

      state.newQuotes = state.newQuotes.map((order) =>
        String(order.id) !== String(quoteId)
          ? order
          : {
              ...order,
              customerDetailsForm: {
                ...(order?.customerDetailsForm || {}),
                ...data,
              },
            },
      );
    },
    setQuoteGroupDetails: (
      state,
      action: PayloadAction<{
        quoteIds: string | number;
        groupId: string | number;
        data: Optional<NewQuoteShape["groups"][number]>;
      }>,
    ) => {
      const { quoteIds, groupId, data } = action.payload;

      state.newQuotes = state.newQuotes.map((order) =>
        order.id !== quoteIds
          ? order
          : {
              ...order,
              groups: order.groups.map((group) =>
                group.id !== groupId
                  ? group
                  : {
                      ...group,
                      ...data,
                    },
              ),
            },
      );
    },
    clearSectionOptionsSelections: (
      state,
      action: PayloadAction<{
        quoteId: string | number;
        groupId: string | number;
        sectionId: string | number;
      }>,
    ) => {
      const { quoteId, groupId, sectionId } = action.payload;

      state.newQuotes = state.newQuotes.map((order) =>
        String(order.id) !== String(quoteId)
          ? order
          : {
              ...order,
              groups: order?.groups?.map((group) =>
                String(group?.id) !== String(groupId)
                  ? group
                  : {
                      ...group,
                      configurationSections: group?.configurationSections?.map(
                        (prevSection) => {
                          if (prevSection?.id !== sectionId) return prevSection;

                          return {
                            ...prevSection,
                            options: prevSection?.options?.map((prevOption) => {
                              return {
                                ...prevOption,
                                is_selected: false,
                              };
                            }),
                          };
                        },
                      ),
                    },
              ),
            },
      );
    },
  },
});

export const {
  setNewQuotes,
  createNewQuote,
  setQuoteById,
  setQuoteGroupById,
  setEditedQuote,
  setCustomerDetailsInQuote,
  setCustomerFormDetailsInQuote,
  setQuoteGroupDetails,
  clearSectionOptionsSelections,
} = quotesSlice.actions;
export default quotesSlice.reducer;
export const quotesSelector = (state: RootState) => state.quotes;

export const shipThruDetailsFormDefaultValues = {
  providerName: "",
  shipThruCode: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};
// Pool of sample customers for demo purposes
const DEMO_CUSTOMERS = [
  { name: "Summit Logistics", rep: "James Crawford", email: "james.crawford@summitlogistics.com", address: "800 Industrial Pkwy", city: "Denver", state: "CO", zip: "80202", phone: "13035550100" },
  { name: "Pacific Fleet Services", rep: "Maria Santos", email: "maria.santos@pacificfleet.com", address: "2200 Harbor Blvd", city: "Long Beach", state: "CA", zip: "90802", phone: "15625550200" },
  { name: "Great Lakes Delivery Co", rep: "Brian Mitchell", email: "brian.m@greatlakesdelivery.com", address: "450 Lakeshore Dr", city: "Chicago", state: "IL", zip: "60611", phone: "13125550300" },
  { name: "Sunbelt Commercial", rep: "Karen Zhao", email: "karen.zhao@sunbeltcommercial.com", address: "1100 Peachtree St", city: "Atlanta", state: "GA", zip: "30309", phone: "14045550400" },
  { name: "Northeast Transport Group", rep: "Robert Olsen", email: "r.olsen@netransport.com", address: "75 Federal St", city: "Boston", state: "MA", zip: "02110", phone: "16175550500" },
  { name: "Cascade Municipal Fleet", rep: "Diana Nguyen", email: "diana.n@cascademunicipal.gov", address: "600 4th Ave", city: "Seattle", state: "WA", zip: "98104", phone: "12065550600" },
  { name: "Heartland EV Solutions", rep: "Michael Rivera", email: "m.rivera@heartlandev.com", address: "900 Main St", city: "Kansas City", state: "MO", zip: "64105", phone: "18165550700" },
  { name: "Lone Star Fleet Management", rep: "Patricia Lindgren", email: "p.lindgren@lonestarfleet.com", address: "300 Congress Ave", city: "Austin", state: "TX", zip: "78701", phone: "15125550800" },
];

const DEMO_DESTINATIONS = [
  { address: "456 Commerce Drive", city: "Los Angeles", state: "CA", zip: "90001" },
  { address: "1200 Distribution Way", city: "Dallas", state: "TX", zip: "75201" },
  { address: "88 Warehouse Rd", city: "Portland", state: "OR", zip: "97201" },
  { address: "550 Logistics Center Dr", city: "Nashville", state: "TN", zip: "37201" },
  { address: "700 Terminal Blvd", city: "Phoenix", state: "AZ", zip: "85001" },
];

function getRandomDemoCustomer() {
  const cust = DEMO_CUSTOMERS[Math.floor(Math.random() * DEMO_CUSTOMERS.length)];
  const dest = DEMO_DESTINATIONS[Math.floor(Math.random() * DEMO_DESTINATIONS.length)];
  return { cust, dest };
}

/** Returns fresh random demo customer defaults — call this each time a new quote is created */
export function getNewQuoteDefaults(): typeof NEW_QUOTE_DEFAULT_VALUES {
  const { cust, dest } = getRandomDemoCustomer();
  return {
    customerDetailsForm: {
      name: cust.name,
      representativeName: cust.rep,
      email: cust.email,
      address: cust.address,
      addresses: [],
      phone: cust.phone,
      city: cust.city,
      state: cust.state,
      country: "United States",
      wan: "",
      zipCode: cust.zip,
      customer__kontentAi__codename: "",
    },
    dealerDetailsForm: {
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      dealershipName: "",
      jobTitle: "",
    },
    shipThruDetailsForm: {
      upfit: shipThruDetailsFormDefaultValues,
      accessories: shipThruDetailsFormDefaultValues,
      charger: shipThruDetailsFormDefaultValues,
    },
    destinationAddressForm: {
      address: dest.address,
      city: dest.city,
      state: dest.state,
      zipCode: dest.zip,
      country: "United States",
    },
    depositDetailsForm: {
      depositPercentage: null,
    },
    discountApplied: 0,
  };
}

export const NEW_QUOTE_DEFAULT_VALUES: Pick<
  NewQuoteShape,
  | "customerDetailsForm"
  | "dealerDetailsForm"
  | "depositDetailsForm"
  | "shipThruDetailsForm"
  | "destinationAddressForm"
  | "discountApplied"
> = (() => {
  const { cust, dest } = getRandomDemoCustomer();
  return {
    customerDetailsForm: {
      name: cust.name,
      representativeName: cust.rep,
      email: cust.email,
      address: cust.address,
      addresses: [],
      phone: cust.phone,
      city: cust.city,
      state: cust.state,
      country: "United States",
      wan: "",
      zipCode: cust.zip,
      customer__kontentAi__codename: "",
    },
    dealerDetailsForm: {
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      dealershipName: "",
      jobTitle: "",
    },
    shipThruDetailsForm: {
      upfit: shipThruDetailsFormDefaultValues,
      accessories: shipThruDetailsFormDefaultValues,
      charger: shipThruDetailsFormDefaultValues,
    },
    destinationAddressForm: {
      address: dest.address,
      city: dest.city,
      state: dest.state,
      zipCode: dest.zip,
      country: "United States",
    },
    depositDetailsForm: {
      depositPercentage: null,
    },
    discountApplied: 0,
  };
})();

const selectQuotes = (state: RootState) => state.quotes.newQuotes;
const selectQuoteId = (_: RootState, quoteId: string | number) => quoteId;
const selectQuoteIdAndGroupId = (
  state: RootState,
  {
    groupId,
    orderId,
    dontReturnText,
  }: {
    groupId: string | number;
    orderId: number | string;
    dontReturnText?: boolean;
  },
) => {
  return { orderId, groupId, dontReturnText };
};

export const selectQuoteById = createSelector(
  [selectQuotes, selectQuoteId],
  (orders, quoteId) => {
    return orders?.find(
      (v) =>
        String(v?.id) === String(quoteId) || Number(v?.id) === Number(quoteId),
    );
  },
);

// Single group's original MSRP per vehicle
export const calculatedSingleGroupMSRPPerVehicleSelector = (
  group: NewQuoteShape["groups"][number] | undefined,
) => {
  if (!group) return undefined;

  let msrp = 0;
  // const defaultChassisPrice = group?.chassis?.price || group?.upfit?.price || 0;
  // const chassisOrUpfitOrModelSectionSelectedOption =
  //   group?.configurationSections
  //     ?.find((section) =>
  //       ["chassis", "upfit", "model", "vintage model", "grit model"].includes(
  //         section?.title?.toLowerCase(),
  //       ),
  //     )
  //     ?.options?.find((option) => option?.is_selected);

  const chassisOrUpfitOrModelSectionSelectedOption =
    group?.configurationSections
      ?.find((section) => section.is_part_of_base_msrp === true)
      ?.options?.find((option) => option?.is_selected);

  const totalPriceList =
    group?.configurationSections?.filter(
      (section) => section.is_part_of_base_msrp === true,
    ) || [];

  const totalPrice = totalPriceList.reduce((a, b) => {
    const selectedObj = b?.options?.find((option) => option?.is_selected);
    return a + (selectedObj?.price || 0);
  }, 0);

  // const defaultChassisPrice =
  //   chassisOrUpfitOrModelSectionSelectedOption?.price || 0;

  msrp += totalPrice;

  const currency =
    chassisOrUpfitOrModelSectionSelectedOption?.price_unit || "$";

  return { value: msrp, currency };
};
// Single group's original MSRP for all vehicles
export const calculatedSingleGroupGrossMSRPSelector = (
  group: NewQuoteShape["groups"][number] | undefined,
) => {
  if (!group) return null;

  let msrp = 0;
  // const defaultChassisPrice =
  //   (group?.chassis?.price || group?.upfit?.price || 0) *
  //   (Number(group?.quantity) || 0);
  const chassisOrUpfitSectionSelectedOption = group?.configurationSections
    ?.find((section) => section?.is_part_of_base_msrp === true)
    ?.options?.find((option) => option?.is_selected);
  const defaultChassisPrice =
    (chassisOrUpfitSectionSelectedOption?.price || 0) *
    (Number(group?.quantity) || 0);

  const totalPriceList =
    group?.configurationSections?.filter(
      (section) => section.is_part_of_base_msrp === true,
    ) || [];

  const totalPrice = totalPriceList.reduce((a, b) => {
    const selectedObj = b?.options?.find((option) => option?.is_selected);
    return a + (selectedObj?.price || 0) * (Number(group?.quantity) || 0);
  }, 0);

  msrp += totalPrice;

  const currency = chassisOrUpfitSectionSelectedOption?.price_unit || "$";

  return { value: msrp, currency };
};
// Single group's total price per vehicle
export const calculatedSingleGroupTotalPricePerVehicleSelector = (
  group: NewQuoteShape["groups"][number] | undefined,
) => {
  if (!group) return null;

  let price = 0;
  let currency: string = "$";
  group?.configurationSections?.forEach((section) => {
    section?.options?.forEach((option) => {
      if (option?.is_selected) {
        price += option?.price;
        if (!currency) {
          currency = option?.price_unit;
        }
      }
    });
  });

  return { value: price, currency };
};
// Single group's total price for all vehicle
export const calculatedSingleGroupGrossTotalPriceSelector = (
  group: NewQuoteShape["groups"][number] | undefined,
) => {
  if (!group) return null;

  let price = 0;
  let currency: string = "$";
  group?.configurationSections?.forEach((section) => {
    section?.options?.forEach((option) => {
      if (option?.is_selected) {
        price += option?.price;
        if (!currency) {
          currency = option?.price_unit;
        }
      }
    });
  });
  price = price * (Number(group?.quantity) || 0);

  return { value: price, currency };
};
// Single group's build price per vehicle
export const calculatedSingleGroupBuildPricePerVehicleSelector = (
  group: NewQuoteShape["groups"][number] | undefined,
) => {
  if (!group) return null;

  let price = 0;
  let currency: string = "$";
  group?.configurationSections?.forEach((section) => {
    if (section?.is_part_of_base_msrp) return;

    section?.options?.forEach((option) => {
      if (option?.is_selected) {
        price += option?.price;
        if (!currency) {
          currency = option?.price_unit;
        }
      }
    });
  });

  return { value: price, currency };
};
// Single group's build price for all vehicle
export const calculatedSingleGroupGrossBuildPriceSelector = (
  group: NewQuoteShape["groups"][number] | undefined,
) => {
  if (!group) return null;

  let price = 0;
  let currency: string = "$";
  group?.configurationSections?.forEach((section) => {
    if (section?.is_part_of_base_msrp) return;

    section?.options?.forEach((option) => {
      if (option?.is_selected) {
        price += option?.price;
        if (!currency) {
          currency = option?.price_unit;
        }
      }
    });
  });
  price = price * (Number(group?.quantity) || 0);

  return { value: price, currency };
};

// Base payload capacity by body type (in lbs)
// These account for chassis base payload (~440 lbs) minus body weight overhead
const BODY_TYPE_BASE_PAYLOAD: Record<string, number> = {
  "vehicle-fernhay-eav-flatbed": 410, // ~400-420 lbs, minimal body weight
  "vehicle-fernhay-eav-standard-box": 350, // ~330-375 lbs, enclosed box
  "vehicle-fernhay-eav-kiosk": 285, // ~265-310 lbs, counters/displays
  "vehicle-fernhay-eav-reefer": 250, // ~220-285 lbs, refrigeration/insulation
};
const DEFAULT_BASE_PAYLOAD = 440; // Bare chassis payload

// Total weight in a single group, for one vehicle
export const calculatedSingleGroupPayloadPerSingleVehicleSelector = (
  group: NewQuoteShape["groups"][number] | undefined,
  order: NewQuoteShape,
) => {
  if (!group) return null;

  const unit = "lbs";

  // Get base payload for this body type
  const vehicleId = order?.vehicleId || order?.vehicle__kontentAi__id || "";
  const basePayload =
    BODY_TYPE_BASE_PAYLOAD[vehicleId as string] || DEFAULT_BASE_PAYLOAD;

  // Subtract only equipment/option weights (skip chassis, body, charger, and color sections)
  let equipmentWeight = 0;

  group?.configurationSections?.forEach((section) => {
    const sectionTitle = section?.title?.toLowerCase() || "";
    // Skip chassis + body sections (flagged is_part_of_base_msrp) — their weight
    // is already accounted for in the body-type base payload
    if (section?.is_part_of_base_msrp) return;
    // Skip charger and exterior color — not physical payload items
    if (sectionTitle === "charger" || sectionTitle === "exterior color") return;

    section?.options?.forEach((option) => {
      if (option?.is_selected) {
        equipmentWeight +=
          getWeightInLbs(option?.weight || 0, option?.weight_unit) || 0;
      }
    });
  });

  const payload = Math.max(basePayload - equipmentWeight, 0);

  return { value: payload, unit };
};

// Total weight in a single group, for all vehicles
export const calculatedSingleGroupGrossPayloadSelector = (
  group: NewQuoteShape["groups"][number] | undefined,
  order: NewQuoteShape,
) => {
  if (!group) return null;

  let weight = 0;
  const unit = group?.chassis?.weight_unit;

  group?.configurationSections?.forEach((section) => {
    if (section?.title?.toLowerCase() === "charger") return;

    section?.options?.forEach((option) => {
      if (option?.is_selected) {
        weight += getWeightInLbs(option?.weight || 0, option?.weight_unit) || 0;
      }
    });
  });
  weight = weight * (Number(group?.quantity) || 1);

  weight =
    (getWeightInLbs(order?.gvwr?.value || 0, order?.gvwr?.unit) || 0) - weight;
  weight = Math.max(weight, 0);

  return { value: weight, unit };
};

export const getBuildLeadTimeForGroupPerVehicle = createSelector(
  [selectQuotes, selectQuoteIdAndGroupId],
  (orders, args) => {
    const { orderId, groupId, dontReturnText } = args;
    const order = orders?.find((v) => String(v.id) === String(orderId));
    const group = order?.groups.find((v) => String(v.id) === String(groupId));

    let totalLeadTime = 0;
    group?.configurationSections?.forEach((section) => {
      if (section?.title?.toLowerCase() === "charger") return;

      section?.options?.forEach((option) => {
        if (option?.is_selected) {
          totalLeadTime +=
            getLeadTimeInDays(option?.leadtime || 0, option?.leadtime_unit) ||
            0;
        }
      });
    });

    if (dontReturnText) {
      return {
        value: totalLeadTime,
        unit: "day",
      };
    }

    console.log("%ctotalLeadTime:", "background-color:aqua;", {
      totalLeadTime,
    });
    const leadTimeText = getBuildLeadTimeFromTimeGivenInDays(totalLeadTime);

    return leadTimeText || "-";
  },
);

export const getChargerBuildLeadTimeForGroupPerVehicle = createSelector(
  [selectQuotes, selectQuoteIdAndGroupId],
  (orders, args) => {
    const { orderId, groupId } = args;
    const order = orders?.find((v) => v.id === orderId);
    const group = order?.groups.find((v) => v.id === groupId);

    const chargerSectionSelectedOption = group?.configurationSections
      ?.find((section) => section?.title?.toLowerCase() === "charger")
      ?.options?.find((option) => option?.is_selected);
    const chargerLeadTimeValue = Number(
      chargerSectionSelectedOption?.leadtime || 0,
    );

    const totalLeadTime = chargerLeadTimeValue;

    const leadTimeText = getBuildLeadTimeFromTimeGivenInDays(totalLeadTime);

    return leadTimeText || "-";
  },
);
