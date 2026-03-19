import { useJsApiLoader, Libraries } from "@react-google-maps/api";

import { useState } from "react";

import Envs from "~/constants/envs";

import getAddressComponents from "~/utils/get-address-components";

const libraries: Libraries = ["places"];

export default function useGoogleAddress({
  handleAddressChange,
}: {
  handleAddressChange: (
    address: string,
    zipCode: string,
    city: string,
    state: string,
    country: string,
  ) => void;
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: Envs.GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const handlePlaceSelect = async (
    autocomplete: google.maps.places.Autocomplete,
  ) => {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      console.log("No geometry data for place:", place);
      return;
    }

    setSelectedPlace(place);
    try {
      const components = await getAddressComponents(
        place.formatted_address as string,
      );

      const state = components.state || "";
      const city = components.city || "";
      const zipCode = components.postalCode || "";
      const address =
        components.streetAddress || components.formattedAddress || "";
      const country = components.country || "";
      handleAddressChange(address, zipCode, city, state, country);
    } catch (error) {
      console.error("Error getting address components:", error);
    }
  };

  const initAutocomplete = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (isLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
      );
      autocomplete.addListener("place_changed", () =>
        handlePlaceSelect(autocomplete),
      );
    }
  };

  return { initAutocomplete, selectedPlace };
}
