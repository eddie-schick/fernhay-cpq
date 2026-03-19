// import { PerspectiveCameraProps, Vector3 } from "@react-three/fiber";

import {
  ChargerOptionSchema,
  ColorPickerSectionOptionSchema,
  ConfigurationSectionOptionSchema,
  ConfigurationSectionSchemaV2,
  CustomerSchema,
  NewAddressShape,
  WeightUnit,
} from "~/global/types/types";

export type DepositDetailsShape = {
  depositPercentage: number | string | null;
};

export type GroupModel3dDetailsType = {
  details3d?: {
    perspectiveCameraDetails?: {
      zoom?: number;
      far?: number;
      position?: number | [x: number, y: number, z: number];
    };
  };
  baseModel?: {
    url: string;
  };
  baseModelDetails?: {
    positionCoords?: number[];
  };
  upfit?: {
    url: string;
  };
  upfitDetails?: {
    positionCoords?: number[];
    prioritizeModel?: boolean;
  };
  shelving?: {
    url: string;
  };
  shelvingDetails?: {
    positionCoords?: number[];
  };
};

export type ShipThruFormType = {
  providerName?: string;
  shipThruCode?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};
export type NewQuoteShape = {
  id: string | number;
  fetchId?: number;
  customer: CustomerSchema;
  vehicleId: string | number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleName: string;
  vehicleImage: string | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  vehicleOEMLogoPng?: string;

  vehicleSpecSheets?: {
    title: string;
    link?: string;
    file?: {
      url: string;
    };
  }[];
  vehicleWarrantySpecification?: {
    title: string;
    file?: {
      url: string;
    };
  };
  gvwr?: {
    value: number;
    unit: WeightUnit;
  };
  show_chargers?: boolean;
  totalQuantity: number;
  /*Newly added params to cater requirements */
  vehiclePaint?: string;
  vehicleBatteryEngine?: string;
  vehicleUpfit?: string;
  shelving?: string;
  charger?: string;
  /*above this point */
  groups: {
    id: string | number;
    quantity: number | string;
    name: string;
    description?: string;
    isSelected: boolean;
    paintType?: ColorPickerSectionOptionSchema;
    batteryCapacity?: ConfigurationSectionOptionSchema;
    dashboard?: ConfigurationSectionOptionSchema;
    chassis?: ConfigurationSectionOptionSchema;
    upfit?: ConfigurationSectionOptionSchema;
    shelving?: ConfigurationSectionOptionSchema;
    charger?: ChargerOptionSchema;
    accessories?: ConfigurationSectionOptionSchema[];
    model3dDetails?: GroupModel3dDetailsType;
    quotationIds?: (string | number)[];

    configurationSections?: ConfigurationSectionSchemaV2[];
  }[];
  customerDetailsForm: {
    name: string;
    representativeName: string;
    email: string;
    phone: string;
    addresses: NewAddressShape[];
    address: string;
    city: string;
    state: string;
    zipCode: string | number | null;
    country: string;
    wan?: string;
    deposited?: DepositDetailsShape;

    customer__kontentAi__codename?: string;
  };
  dealerDetailsForm: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    country?: string;
    dealershipName: string;
    jobTitle: string;
  };
  destinationAddressForm: {
    address: string;
    city: string;
    state: string;
    zipCode: string | number;
    country: string;
  };
  shipThruDetailsForm: {
    upfit: ShipThruFormType;
    accessories: ShipThruFormType;
    charger: ShipThruFormType;
  };
  depositDetailsForm: DepositDetailsShape;
  discountApplied: number;
  isDiscountApplied?: boolean;
  quotationId?: string | number;
  isOrdered?: boolean;

  vehicle__kontentAi__id?: string;
  vehicle__kontentAi__codename?: string;
  vehicleModel__kontentAi__codename?: string;
  kontentAi__quoteId?: string;
  kontentAi__quoteIds?: string[];
};
