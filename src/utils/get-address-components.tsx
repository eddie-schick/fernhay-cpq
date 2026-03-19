import Envs from "~/constants/envs";

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface AddressDetails {
  streetNumber: string | null;
  route: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  formattedAddress: string;
  streetAddress?: string;
}

interface GeocodeResponse {
  status: string;
  results: {
    address_components: AddressComponent[];
    formatted_address: string;
  }[];
}

async function getAddressComponents(
  formattedAddress: string,
): Promise<AddressDetails> {
  const apiKey: string = Envs.GOOGLE_MAPS_API_KEY;

  const url: string = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    formattedAddress,
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data: GeocodeResponse = (await response.json()) as GeocodeResponse;

    if (data.status === "OK") {
      const components = data.results[0].address_components;
      const formattedAddress1: string = data.results[0].formatted_address;

      const addressDetails: AddressDetails = {
        streetNumber: null,
        route: null,
        city: null,
        state: null,
        postalCode: null,
        country: null,
        formattedAddress: formattedAddress1,
      };

      components.forEach((component) => {
        if (component.types.includes("street_number")) {
          addressDetails.streetNumber = component.long_name;
        } else if (component.types.includes("route")) {
          addressDetails.route = component.long_name;
        } else if (
          component.types.includes("locality") ||
          component.types.includes("sublocality") ||
          component.types.includes("sublocality_level_1")
        ) {
          addressDetails.city = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          addressDetails.state = component.short_name;
        } else if (component.types.includes("postal_code")) {
          addressDetails.postalCode = component.long_name;
        } else if (component.types.includes("country")) {
          addressDetails.country = component.long_name;
        }
      });

      const neighborhoodComp = components?.find((obj) =>
        obj?.types?.includes("neighborhood"),
      );
      addressDetails.streetAddress =
        (addressDetails?.formattedAddress?.includes(addressDetails?.city || "")
          ? addressDetails?.formattedAddress?.split(addressDetails?.city || "")
          : addressDetails?.formattedAddress?.split(
              neighborhoodComp?.long_name || "",
            ))?.[0]
          ?.trim()
          ?.replace(",", "") || "";

      console.log("%cgetAddressComponents data:", "background-color:gold;", {
        data,
        neighborhoodComp,
      });

      return addressDetails;
    } else {
      throw new Error(`Geocoding failed with status: ${data.status}`);
    }
  } catch (error) {
    console.error("Failed to fetch address components:", error);
    throw error;
  }
}

export default getAddressComponents;
