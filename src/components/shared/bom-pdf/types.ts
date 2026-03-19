export type IntroPageProps = {
  appName: string;
  logoOEM?: string;
  date?: string;
  dealerDetails?: {
    letterHead?: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    logo?: string;
    justAddress?: string;
    dealership?: string;
  };
  customerDetails?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
  };
  vehicleDetails?: {
    configOptions: {
      model?: string;
      color?: string;
    } & {
      [key: string]: string;
    };
    engine?: string;
    dashboard?: string;
    upfit?: string;
    shelving?: string;
    accessories?: string[];
    charger?: string;
    additionalFeatures?: string | string[];
    unitPrice?: string;
    quantity?: string;
    totalPrice?: string;
    additionalCosts?: string;
    registrationAndLicensing?: string;
    extendedWarranty?: string;
    customModificaitons?: string;
    grandTotal?: string;
    originalMSRPAfterDiscount?: string;
  };
  warrantyDetails?: {
    term?: string;
    coveredParts?: string;
    statement?: string;
    specificationLink?: string;
  };
  paymentDetails?: {
    requiredDepositPercentage?: string;
  };
  quotationValidityDate?: string;
  salesTeamDetails?: {
    phone?: string;
    email?: string;
    representativeName?: string;
    representativeJobTitle?: string;
  };
  pdfWidth: number | null;
  pdfHeight: number | null;
};

export type BomPDFProps = {
  useBomText?: boolean;
  vin: string;
  orderCustomer: string;
  orderDiscount: number;
  customizationOptions: {
    id: string | number;
    title: string;
    sectionTitle: string | null;
    price?: {
      value: number;
      currency: string;
    };
    quantity: number;
    lineTotal?: {
      value: number;
      currency: string;
    };
    leadtime?: string;
  }[];
  vehicleDetails: {
    make: string;
    model: string;
    originalMSRP?: string;
    originalMSRPAfterDiscount?: string;
    discountedAmount?: string;
    quantity: number | string;
    isFleetOrder: boolean;
    groupName: string;
  } & {
    [key: string]: string;
  };
  logoOEM?: string;
  introPageDetails?: Omit<IntroPageProps, "logoOEM" | "pdfWidth" | "pdfHeight">;
  quotationId?: number | string;
  pdfWidth?: number | null;
  pdfHeight?: number | null;
};
