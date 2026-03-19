import { Elements } from "@kontent-ai/delivery-sdk";

import { NewQuoteShape, ShipThruFormType } from "~/store/slices/quotes/types";

import { ConfigurationSection } from "./kontent-ai";

export type ThemeColors = {
  primaryColor: string;
  primaryHoverColor: string;
  secondaryColor: string;
  splashScreenLoaderColor1: string;
  splashScreenLoaderColor2: string;
  splashScreenLoaderColor3: string;
  navLinkActiveColor: string;
  miscActiveColor: string;
};
export type SettingSchema = {
  name: string;
  logoPng: {
    url: string;
  };
  logoSvg: {
    url: string;
  };
  sidebarLogoPng?: {
    url: string;
  };
  sidebarLogoSvg?: {
    url: string;
  };
  splashScreenLogoPng?: {
    url: string;
  };
  splashScreenLogoSvg?: {
    url: string;
  };
  headerLogoPng?: {
    url: string;
  };
  headerLogoSvg?: {
    url: string;
  };
  loginBannerImagePng?: {
    url: string;
  };
  loginBannerImageSvg?: {
    url: string;
  };
  colors: ThemeColors;
};

export type OrderGroup =
  | "All"
  | "Accepted"
  | "Pending"
  | "Closed"
  | "Cancelled";

export type OrderStatusValue =
  | "Quote Generated"
  | "Quote Accepted"
  | "Order Processing"
  | "In Production"
  | "In Transit"
  | "Delivered"
  | "Cancelled";

export type OrderType = "Retail" | "Fleet";

export type OrderStatus = {
  id: string | number;
  group: OrderGroup;
  status: OrderStatusValue;
  createdAt?: string;
  updatedAt?: string;
  kontentAi__item__codename: string;
};

export type DealerSchema = {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  country: string;
  dealershipName: string;
  jobTitle: string;
};

export type SpecSheetType = {
  id?: string;
  title: string;
  file: {
    url: string;
  };
};

export type LeadTimeUnit = "day" | "week";
export type WeightUnit = "kg" | "lbs";
export type ValueAndUnit = {
  value: string | number;
  unit: string;
};
export type ImageMetadataType = {
  url: string;
  name?: string;
};

export type ChargerOptionSchema = {
  id: string | number;
  title: string;
  manufacturer?: string;
  receiver?: string;
  description?: Elements.RichTextElement | string;
  is_included?: boolean;
  is_selected?: boolean;
  price: number;
  price_unit: string;
  weight?: number;
  weight_unit?: WeightUnit;
  leadtime?: number;
  leadtime_unit?: LeadTimeUnit;
  image?: ImageMetadataType;
  option_image?: ImageMetadataType;
  additional_specifications: {
    title: string;
    value: string;
  }[];

  kontentAi__item__codename?: string;
};

export type ConfigurationSectionOptionSchema = {
  id: string | number;
  title: string;
  hexCode?: string;
  receiver?: string;
  description?: Elements.RichTextElement | string;
  manufacturer?: string;
  is_included: boolean;
  is_selected?: boolean;

  image?: ImageMetadataType;
  option_image?: ImageMetadataType;
  additional_images?: ImageMetadataType[];
  paintOptions?: ColorPickerSectionOptionSchema[];
  weight: number;
  weight_unit: WeightUnit;
  price: number;
  price_unit: string;
  leadtime: number;
  leadtime_unit: LeadTimeUnit;
  model_3d?: {
    url: string;
    name: string;
    prioritizeModel?: boolean;
  };
  spec_sheet?: {
    title: string;
    file: {
      url: string;
    };
  };
  always_show?: boolean;
  additional_specifications?: {
    title: string;
    value: string;
  }[];
  option_entity_type?: "chassis" | "upfit";

  kontentAi__item__codename?: string;
};
export type ConfigurationSectionSchema = {
  id: string | number;
  title: string;
  description?: string;
  hide: boolean;
  is_multi_select: boolean;
  options: ConfigurationSectionOptionSchema[];
};
export type ColorPickerSectionOptionSchema = {
  id: string | number;
  title: string;
  hexCode: string;
  is_included: boolean;
  is_selected?: boolean;
  price: number;
  price_unit: string;
  leadtime?: number;
  leadtime_unit?: LeadTimeUnit;

  kontentAi__item__codename?: string;
};
export type ColorPickerSectionSchema = {
  id: string | number;
  title: string;
  description?: string;
  options: ColorPickerSectionOptionSchema[];
};
export type AccessoriesOptionType = ConfigurationSectionOptionSchema & {
  checked: boolean;
};

export type ConfigurationSectionOptionSchemaV2 = {
  id: string | number;
  is_selected: boolean;
  should_hide_details: boolean;
  is_part_of_base_msrp?: boolean;
  option_category: string;
  title: string;
  receiver?: string;
  description?: Elements.RichTextElement | string;
  manufacturer?: string;
  is_included: boolean;
  image?: ImageMetadataType;
  option_image?: ImageMetadataType;
  additional_images?: ImageMetadataType[];
  paintOptions?: ColorPickerSectionOptionSchema[];
  weight: number;
  weight_unit: WeightUnit;
  price: number;
  price_unit: string;
  leadtime: number;
  leadtime_unit: LeadTimeUnit;
  model_3d?: {
    url: string;
    name: string;
    prioritizeModel?: boolean;
  };
  spec_sheet?: {
    title: string;
    file: {
      url: string;
    };
  };
  always_show?: boolean;
  additional_specifications?: {
    title: string;
    value: string;
  }[];
  option_entity_type?: "chassis" | "upfit";

  kontentAi__item__codename: string;

  configuration_sections?: ConfigurationSectionSchemaV2[];
  configuration_sections_original?: Elements.LinkedItemsElement<ConfigurationSection>;
};
export type ConfigurationSectionSchemaV2 = {
  id: string | number;
  title: string;
  description?: string;
  hide: boolean;
  is_multi_select: boolean;
  cannot_deselect?: boolean;
  is_part_of_base_msrp?: boolean;
  is_section_hidden?: boolean;
  options: ConfigurationSectionOptionSchemaV2[];
  selected_option_manufacturer?: string;
  linked_parent_option_id?: string | number;
};

export type DepositDetailsShape = {
  depositPercentage: number | string | null;
};

export type NewAddressShape = {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  type?: string;
  phone?: string;
  country?: string;
  address?: string;
};

export type NewDealerSchema = {
  id: number;
  name: string;
  dealership: string;
  email: string;
};

export type CustomerSchema = {
  id: string | number;
  sameAsDestination?: boolean;
  sourceId?: string;
  email: string;
  userId: string;
  name?: string;
  dealer?: NewDealerSchema;
  representativeName?: string;
  addresses?: NewAddressShape[];
  buyerName: string | undefined;
  coBuyerName: string;
  wan?: string;
  address: string;
  phone: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  deposited?: DepositDetailsShape;
  createdAt?: string;
  updatedAt?: string;
  customerCreatorEmail?: string;
  customer__kontentAi__codename?: string;
};

export type UpdateCustomerSchema = {
  id: string | number;
  buyerName: string;
  sourceId?: string;
  email?: string;
  userId?: string;
  coBuyerName?: string;
  wan?: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  deposited?: DepositDetailsShape;

  customer__kontentAi__codename?: string;
};

export type NewVehicleType = {
  id: number;
  vin: string;
  vinConfirmed: boolean;
  audit: {
    createdAt: string;
    updatedAt: string;
  };
};

export type AddressType = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};
export type ShipThruAddressType = AddressType & {
  entity?: string;
  providerName?: string;
  shipThruCode?: string;
};

export type NewFormatQuoteOrder200ResponseSchema = {
  id: number;
  vin: string;
  vinConfirmed: boolean;
  audit: {
    createdAt: string;
    updatedAt: string;
  };
  quote: {
    deposited?: number;
    destinationAddress?: AddressType;
    id: string | number; //both
    formattedId: string; //both
    vehicleModel?: string;
    customer: CustomerSchema | null; //both
    dealerId: string;
    dealerEmail: string;
    dealerAddress?: string;
    dealerPhone?: string;
    dealerCity?: string;
    dealerState?: string;
    dealerZipCode?: string;
    dealerCountry?: string;
    dealerJobTitle?: string;
    dealership: string;
    dealername: string;
    description: string;
    expirationInDays: number | null;
    status: OrderStatusValue;
    oemOrderNo?: string;
    dealerDomain: string;
    upfitShipThroughAddress?: AddressType;
    accessoriesShipThroughAddress?: AddressType;
    chargerShipThroughAddress?: AddressType;
    bomFileLink: string;
    quoteFileLink: string;
    signedQuoteFileLink: string;
    customizationOptions: {
      paintType: ConfigurationSectionOptionSchema;
    } & { [key: string]: ConfigurationSectionSchemaV2 };
    // customizationOptions: {
    //   batteryCapacity: ConfigurationSectionOptionSchema;
    //   paintType: ConfigurationSectionOptionSchema;
    //   charger: ConfigurationSectionOptionSchema;
    //   shelving: ConfigurationSectionOptionSchema;
    //   dashboard?: ConfigurationSectionOptionSchema;
    //   upfit?: ConfigurationSectionOptionSchema;
    //   chassis?: ConfigurationSectionOptionSchema;
    //   accessories?: ConfigurationSectionOptionSchema[];
    // };
    msrp: {
      value: number;
      currency: string;
    };
    dealerPrice: {
      value: number;
      currency: string;
    };
    payloadCapacity: {
      value: number;
      unit: string;
    };
    leadTime: {
      value: number;
      unit: string;
    };
    audit: {
      createdAt: string;
      updatedAt: string;
    };
    vehicles: {
      id: number;
      vin: string;
      vinConfirmed: boolean;
      audit: {
        createdAt: string;
        updatedAt: string;
      };
    }[];
  };
};

export type QuoteOrder200ResponseSchema = {
  //new schema
  id: string | number; //both
  vehicleQuoteId?: string | number;
  formattedId: string; //both
  vehicleModel?: string;
  customer: CustomerSchema; //both
  description: string; //both
  expirationInDays?: number;
  status?: OrderStatus | OrderStatusValue; //both;
  statusV2?: OrderStatusValue;
  oemOrderNo?: string;
  dealerDomain?: string;
  upfitShipThroughAddress?: AddressType;

  shipThruAddresses?: {
    // both
    upfit?: ShipThruAddressType;
    accessories?: ShipThruAddressType;
    charger?: ShipThruAddressType;
  };
  customizationOptions?: unknown;
  bomFileLink?: string;
  quoteFileLink?: string;
  signedQuoteFileLink?: string;
  msrp?: {
    value: number;
    currency: string;
  };
  price: {
    // both
    value: string | number;
    currency: string;
  }; //both
  payload: {
    value: string | number;
    unit: string;
  }; //both
  leadTime: {
    value: string | number;
    unit: string;
  };
  audit?: {
    createdAt: string;
    updatedAt: string;
  };
  vehicles?: NewVehicleType[];

  //old schema

  timestampId?: string;
  createdAt: string;
  updatedAt: string;
  quantity: number;
  quantityIndex: number;

  model: string;
  vin: string;
  vinConfirmed?: boolean;
  group: string;
  groupQuantity: number;
  groupVehicleIndex: number;

  // paint: {
  //   colorCode: string;
  //   name?: string;

  //   kontentAi__item__codename?: string;
  // };
  // upfits?: ConfigurationSectionOptionSchema[];
  // charger: ChargerOptionSchema;
  // shelving: ConfigurationSectionOptionSchema;
  // accessories?: ConfigurationSectionOptionSchema[];
  // battery: ConfigurationSectionOptionSchema;
  // dashboard?: ConfigurationSectionOptionSchema;

  vehicle?: {
    vehicle__kontentAi__id?: string;
    vehicle__kontentAi__codename?: string;
    vehicleImage?: Elements.AssetsElement;
  };

  dealer: DealerSchema;
  dealerId: string;

  bom: {
    name: string;
    fileLink: string;
  };
  quote: {
    name: string;
    id?: string;
    fileLink: string;
    signedFileLink?: string;
  };
  orderNo: string | null;

  groupId?: string | number;
  orderType: OrderType;

  expiryDurationInDays: number;
  destinationAddress?: AddressType | NewAddressShape;

  configurationSections?: { [key: string]: ConfigurationSectionSchemaV2 };
  // vehicles: QuoteVehicleType[];
};

export type VehicleSchema = {
  id: string | number;
  name: string;
  make?: string;
  model?: string;
  vehicleUniqueName?: string;
  // description: BlocksContent;
  description: Elements.RichTextElement;
  image: ({ url: string } & object)[];
  isBuildEnabled: boolean;
  isPoolInventoryEnabled: boolean;
  customizationOption?: {
    id: string | number;
  };
  createdAt?: string;
  publishedAt?: string;
  updatedAt?: string;
  specSheet?: SpecSheetType[];
  // configuration_options: (
  // 	| ColorPickerSectionSchema
  // 	| ConfigurationSectionSchema
  // )[];
  show_chargers: boolean;
  chargers?: ChargerOptionSchema[];
  warranty_specification?: {
    title: string;
    file?: {
      url: string;
    };
  };
  gvwr: {
    value: number;
    unit: WeightUnit;
  };
  powertrain_options?: ConfigurationSectionOptionSchema[];
  vehicle_chassis?: (ConfigurationSectionOptionSchema & {
    paint_options: ColorPickerSectionOptionSchema[];
    accessories: ConfigurationSectionOptionSchema[];
    shelving: ConfigurationSectionOptionSchema[];
    vehicle_upfit: {
      id: string | number;
      upfits: ConfigurationSectionOptionSchema[];
      shelving: ConfigurationSectionOptionSchema[];
      accessories: ConfigurationSectionOptionSchema[];
    };
  })[];

  vehicle__kontentAi__codename: string;
  vehicle__kontentAi__id: string;
  vehicleModel__kontentAi__codename: string;
};

export const orderStatusToKontentAiCodenameMap: Record<
  OrderStatus["status"],
  string
> = {
  "Quote Generated": "quote_generated",
  "Quote Accepted": "quote_accepted",
  "Order Processing": "order_processing",
  "In Transit": "in_transit",
  "In Production": "in_production",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

export type KontentAiCreateQuoteRequestSchema = {
  order: NewQuoteShape;
  userEmailDomain: string;
  quoteTimestampId?: string;
  group: NewQuoteShape["groups"][number];
  customerDetails?: Partial<NewQuoteShape["customerDetailsForm"]>;
  dealerDetails?: Partial<NewQuoteShape["dealerDetailsForm"]>;
  depositDetails?: NewQuoteShape["depositDetailsForm"];

  miscDetails: {
    dealerId: string | number;
    dealerEmail?: string;
    price: {
      value: string | number;
      currency: string;
    };
    payload: ValueAndUnit;
    leadTime: ValueAndUnit;
    vehicleQuantityIndex: number;

    vehicle__kontentAi__codename?: string;
  };
};
export type KontentAiCreateQuoteResponseSchema = {
  itemId: string;
  formattedId: string;
};

export type KontentAiUpdateQuoteRequestSchema = {
  id: string | number;
  vin: string;
  status: OrderStatus | OrderStatusValue;
  bomFileLink: string;
  quoteFileLink: string;
  signedQuoteFileLink: string;
  orderNo: string;
  destinationAddressDetails?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shipThruDetailsForm?: {
    upfit?: ShipThruFormType;
    accessories?: ShipThruFormType;
    charger?: ShipThruFormType;
  };
  customerDetails?: {
    customer__kontentAi__codename?: string;
  };
};
