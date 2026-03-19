import { ImageMetadataType } from "~/global/types/types";

import { NewQuoteShape } from "~/store/slices/quotes/types";

export default function getVehicleImageFilteredByColor({
  image,
  selectedGroup,
}: {
  image: ImageMetadataType;
  selectedGroup?: NewQuoteShape["groups"][number];
}) {
  if (!selectedGroup?.paintType?.hexCode) return true;

  const itemColorCode = image?.name?.split("__")[1]?.split(".")?.[0];

  const doesItemColorCodeMatch =
    itemColorCode === selectedGroup?.paintType?.hexCode;

  const checksToPass = [doesItemColorCodeMatch];

  const isShaedWrapperPaintTypeSelected = String(
    selectedGroup?.paintType?.kontentAi__item__codename,
  )?.startsWith("shaed_wrapper");
  if (isShaedWrapperPaintTypeSelected) {
    checksToPass.push(
      Boolean(image?.name?.toLowerCase()?.startsWith("shaed-wrapper")),
    );
  } else {
    checksToPass.push(!image?.name?.toLowerCase()?.startsWith("shaed-wrapper"));
  }

  return checksToPass?.every((val) => Boolean(val));
}
