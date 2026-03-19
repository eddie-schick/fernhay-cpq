/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Elements } from "@kontent-ai/delivery-sdk";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import { ConfigurationSection } from "~/global/types/kontent-ai";
import {
  ColorPickerSectionOptionSchema,
  ConfigurationSectionOptionSchema,
  ConfigurationSectionOptionSchemaV2,
  ConfigurationSectionSchemaV2,
  WeightUnit,
} from "~/global/types/types";

import { RootState, useAppDispatch, useAppSelector } from "~/store";
import { useGetSingleVehicleQuery } from "~/store/endpoints/vehicles/vehicles";
import {
  selectQuoteById,
  setQuoteById,
  setQuoteGroupById,
} from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";

import { useAuthContextValue } from "../auth-context";
import { useCatalog } from "../catalog-provider/catalog-provider";

import { ConfiguratorPageContext, GroupTypeForUpdate } from ".";

// const Models3dMiscDetails = {
//   W56_STRIP_CHASSIS: {
//     fileName: "W56 Chassis Final", // W56 Strip Chassis
//     perspectiveCameraDetails: {
//       position: [-180, 30, 90] as Vector3,
//       zoom: 0.8,
//       far: 200,
//     },
//   },
//   ALL: {
//     fileName: "*",
//     perspectiveCameraDetails: {
//       position: [5, 2, 10] as Vector3,
//       zoom: 1.5,
//       far: 200,
//     },
//   },
// };
export default function ConfiguratorPageProvider(props: PropsWithChildren) {
  const storeDispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId");

  const { user } = useAuthContextValue();
  const { options: catalogOptions, chassis: catalogChassis, bodies: catalogBodies } = useCatalog();

  const newQuoteById = useAppSelector((state: RootState) =>
    selectQuoteById(state, quoteId!),
  ) as NewQuoteShape;
  const selectedGroup = newQuoteById?.groups?.find(
    (group) => group.isSelected === true,
  ) as NewQuoteShape["groups"][number];

  const getVehicleQueryState = useGetSingleVehicleQuery(
    {
      vehicleId: String(newQuoteById.vehicle__kontentAi__id),
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const vehicleItemKontentAi = getVehicleQueryState?.data;

  const [configurationSectionsLocal, setConfigurationSectionsLocal] = useState<
    ConfigurationSectionSchemaV2[]
  >([]);
  useEffect(() => {
    if (selectedGroup?.configurationSections?.length) return;

    const array: ConfigurationSectionSchemaV2[] = [];

    function addSections(
      sections: Elements.LinkedItemsElement<ConfigurationSection>,
      parentOptionId?: string | number,
    ) {
      if (!sections?.linkedItems?.length) return [];

      sections?.linkedItems?.forEach((configSection) => {
        const cannotDeselectAllOptions =
          configSection?.elements?.flags?.value?.find(
            (flag) => flag?.name === "Cannot Deselect",
          )
            ? true
            : false;
        const isMultiSelect = configSection?.elements?.flags?.value?.find(
          (flag) => flag?.name === "Allow Multiselect",
        )
          ? true
          : false;
        const isPartOfBaseMSRP = configSection?.elements?.flags?.value?.find(
          (flag) => flag?.name === "Is part of Base MSRP",
        )
          ? true
          : false;

        const isSectionHidden = configSection?.elements?.flags?.value?.find(
          (flag) => flag?.name === "Hide Section",
        )
          ? true
          : false;

        const section: ConfigurationSectionSchemaV2 = {
          id: configSection?.system?.id,
          hide: false,
          is_multi_select: isMultiSelect,
          cannot_deselect: cannotDeselectAllOptions,
          is_part_of_base_msrp: isPartOfBaseMSRP,
          is_section_hidden: isSectionHidden || false,
          title: configSection?.elements?.title?.value,
          description: configSection?.elements?.description?.value || "",
          options: configSection?.elements?.options?.linkedItems?.map(
            (configOption) => {
              const isOptionIncluded =
                configOption?.elements?.flags?.value?.find(
                  (flag) => flag?.name === "Included",
                )
                  ? true
                  : false;
              const shouldSelectOptionByDefault =
                configOption?.elements?.flags?.value?.find(
                  (flag) => flag?.name === "Should Select By Default",
                )
                  ? true
                  : false;
              const shouldHideDetails =
                configOption?.elements?.flags?.value?.find(
                  (flag) => flag?.name === "Hide Details",
                )
                  ? true
                  : false;

              const priceOptions =
                configOption?.elements?.price_1cad98a?.linkedItems;
              const priceByDealerDomainOrDefault =
                priceOptions?.find(
                  (obj) => obj?.elements?.entity?.value === user?.user?.email,
                ) ||
                priceOptions?.find(
                  (obj) => obj?.elements?.entity?.value === "default",
                );

              const configOptionLocal: ConfigurationSectionOptionSchemaV2 = {
                id: configOption?.system?.id,
                title:
                  configOption?.elements
                    ?.customization_option_basic_details__title?.value,
                description:
                  configOption?.elements
                    ?.customization_option_basic_details__description?.value || "",
                manufacturer:
                  configOption?.elements?.manufacturer?.value?.[0]?.name,
                receiver: configOption?.elements?.receiver?.value,
                additional_specifications:
                  configOption?.elements?.additional_specifications?.linkedItems?.map(
                    (additionalSpecItem) => ({
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      title: additionalSpecItem?.elements?.title?.value,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      value: additionalSpecItem?.elements?.value?.value,
                    }),
                  ),
                is_included: isOptionIncluded,
                is_selected: isOptionIncluded || shouldSelectOptionByDefault,
                should_hide_details: shouldHideDetails,
                is_part_of_base_msrp: isPartOfBaseMSRP,
                weight: configOption?.elements?.weight__value?.value || 0,
                weight_unit: configOption?.elements?.weight__weight_unit
                  ?.value?.[0]?.name as WeightUnit,
                price:
                  priceByDealerDomainOrDefault?.elements?.value?.value || 0,
                price_unit:
                  priceByDealerDomainOrDefault?.elements?.unit?.value?.[0]
                    ?.name || "$",
                leadtime: configOption?.elements?.leadtime__value?.value || 0,
                leadtime_unit: (configOption?.elements?.leadtime__leadtime_unit
                  ?.value?.[0]?.name ||
                  "day") as ConfigurationSectionOptionSchema["leadtime_unit"],
                image: {
                  url: configOption?.elements
                    ?.customization_option_basic_details__image?.value?.[0]
                    ?.url,
                },
                additional_images:
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  configOption?.elements?.customization_option_basic_details__image?.value?.map(
                    (v) => ({
                      url: v?.url,
                      name: v?.name,
                    }),
                  ),
                option_image: {
                  url: configOption?.elements
                    ?.customization_option_basic_details__option_image
                    ?.value?.[0]?.url,
                },
                paintOptions:
                  configOption?.elements?.paint_options?.linkedItems?.map(
                    (linkedItem) => {
                      const priceOptions1 =
                        linkedItem?.elements?.price_dcef68c?.linkedItems;
                      const priceByDealerDomainOrDefault1 =
                        priceOptions1?.find(
                          (obj) =>
                            obj?.elements?.entity?.value === user?.user?.email,
                        ) ||
                        priceOptions1?.find(
                          (obj) => obj?.elements?.entity?.value === "default",
                        );
                      /* eslint-disable @typescript-eslint/no-unsafe-call */

                      return {
                        id: linkedItem?.system?.id,
                        title: linkedItem?.elements?.name?.value,
                        hexCode: linkedItem?.elements?.color_code?.value,
                        is_included: linkedItem?.elements?.flags?.value?.find(
                          (flag) => flag?.name === "Included",
                        )
                          ? true
                          : false,
                        price:
                          priceByDealerDomainOrDefault1?.elements?.value
                            ?.value || 0,
                        price_unit:
                          priceByDealerDomainOrDefault1?.elements?.unit
                            ?.value?.[0]?.name || "$",

                        kontentAi__item__codename: linkedItem?.system?.codename,
                      };
                    },
                  ),
                model_3d: {
                  name: configOption?.elements?.model_3d?.value?.[0]?.name,
                  url: configOption?.elements?.model_3d?.value?.[0]?.url,
                  prioritizeModel: configOption?.elements?.flags?.value?.find(
                    (flag) => flag?.codename === "prioritize_3d_model",
                  )
                    ? true
                    : false,
                },
                spec_sheet: {
                  title:
                    configOption?.elements?.documents?.linkedItems?.[0]
                      ?.elements?.spec_sheet?.value?.[0]?.name,
                  file: {
                    url: configOption?.elements?.documents?.linkedItems?.[0]
                      ?.elements?.spec_sheet?.value?.[0]?.url,
                  },
                },
                option_category:
                  configOption?.elements?.option_category?.value?.[0]?.name,
                configuration_sections_original:
                  configOption?.elements?.configuration_sections,

                kontentAi__item__codename: configOption?.system?.codename,
              };

              return configOptionLocal;
            },
          ),
          linked_parent_option_id: parentOptionId,
        };

        const existingManufacturerInOption = section?.options?.find(
          (option) => option?.manufacturer,
        )?.manufacturer;
        if (existingManufacturerInOption) {
          section.selected_option_manufacturer = existingManufacturerInOption;
        }

        array.push(section);

        section?.options?.forEach((sectionOption) => {
          if (
            sectionOption?.configuration_sections_original?.linkedItems?.length
          ) {
            addSections(
              sectionOption?.configuration_sections_original,
              sectionOption?.id,
            );
          }
        });
      });
    }

    if (
      vehicleItemKontentAi?.elements?.configuration_sections?.linkedItems
        ?.length
    ) {
      addSections(vehicleItemKontentAi?.elements?.configuration_sections);
    }

    console.log("%cFinal Array:", "background-color:green;color:white", {
      array,
    });
    // storeDispatch(setConfigurationSections(array));

    setConfigurationSectionsLocal(array);
  }, [
    selectedGroup?.configurationSections?.length,
    storeDispatch,
    user?.user?.email,
    vehicleItemKontentAi?.elements?.configuration_sections,
  ]);
  // Apply catalog overrides (from Manage Inventory) to configuration options
  const configSectionsWithCatalog = useMemo(() => {
    if (!configurationSectionsLocal?.length) return configurationSectionsLocal;
    if (!catalogOptions?.length && !catalogChassis?.length && !catalogBodies?.length) return configurationSectionsLocal;

    // Build lookup maps by option title (lowercase) for quick matching
    const optionsByTitle = new Map(
      (catalogOptions || []).map((o) => [o.optionName.toLowerCase(), o]),
    );
    const chassisByTitle = new Map(
      (catalogChassis || []).map((c) => [c.modelName.toLowerCase(), c]),
    );
    const bodiesByType = new Map(
      (catalogBodies || []).map((b) => [b.variantName.toLowerCase(), b]),
    );

    return configurationSectionsLocal.map((section) => ({
      ...section,
      options: section.options?.map((option) => {
        const titleLower = option?.title?.toLowerCase() || "";

        // Try matching against catalog options, chassis, then bodies
        const catalogOption = optionsByTitle.get(titleLower);
        const catalogCh = chassisByTitle.get(titleLower);
        const catalogBd = bodiesByType.get(titleLower);

        if (catalogOption) {
          return {
            ...option,
            ...(catalogOption.displayName && { title: catalogOption.displayName }),
            price: catalogOption.price,
            leadtime: catalogOption.leadTime,
            weight: catalogOption.weight.value,
            ...(catalogOption.description && { description: catalogOption.description }),
            ...(catalogOption.manufacturer && { manufacturer: catalogOption.manufacturer }),
          };
        }
        if (catalogCh) {
          return {
            ...option,
            price: catalogCh.msrp ?? catalogCh.basePrice,
            leadtime: catalogCh.leadTime,
            weight: catalogCh.gvwr.value,
            ...(catalogCh.description && { description: catalogCh.description }),
          };
        }
        if (catalogBd) {
          return {
            ...option,
            price: catalogBd.basePrice,
            leadtime: catalogBd.leadTime,
            weight: catalogBd.weight.value,
            ...(catalogBd.description && { description: catalogBd.description }),
          };
        }
        return option;
      }),
    }));
  }, [configurationSectionsLocal, catalogOptions, catalogChassis, catalogBodies]);

  useEffect(() => {
    if (
      configSectionsWithCatalog?.length &&
      newQuoteById?.id &&
      selectedGroup?.id
    ) {
      storeDispatch(
        setQuoteGroupById({
          quoteId: newQuoteById?.id,
          groupId: selectedGroup?.id,
          data: {
            configurationSections: configSectionsWithCatalog,
          },
        }),
      );
    }
  }, [
    configSectionsWithCatalog,
    newQuoteById?.id,
    selectedGroup?.id,
    storeDispatch,
  ]);

  console.log("%cconfigurator-page-provider.tsx:", "background-color:yellow;", {
    vehicleItemKontentAi,
  });

  const selectedChassis = selectedGroup?.configurationSections
    ?.find((section) => section?.title?.toLowerCase() === "chassis")
    ?.options?.find((option) => option?.is_selected);

  const selectedUpfit = selectedGroup?.configurationSections
    ?.find((section) => section?.title?.toLowerCase() === "upfit")
    ?.options?.find((option) => option?.is_selected);

  console.log("selected chassis", selectedChassis);

  const paintTypeOptions = (() => {
    let options: ColorPickerSectionOptionSchema[] = [];

    if (vehicleItemKontentAi) {
      const selectedUpfitOrChassis = selectedUpfit || selectedChassis;
      options = selectedUpfitOrChassis?.paintOptions || [];
    }

    return options;
  })();
  const vehicleGvwr = {
    value: vehicleItemKontentAi?.elements?.gvwr__gvwr_value?.value || 0,
    unit: (vehicleItemKontentAi?.elements?.gvwr__gvwr_unit?.value?.[0]?.name ||
      "lbs") as WeightUnit,
  };

  // Set vehicle meta  if not present
  if (vehicleGvwr?.value && !newQuoteById?.gvwr) {
    storeDispatch(
      setQuoteById({
        quoteId: newQuoteById?.id,
        data: {
          ...newQuoteById,
          gvwr: vehicleGvwr,
        },
      }),
    );
  }

  useEffect(() => {
    if (!selectedChassis && !selectedUpfit) return;

    const specSheetDoc =
      selectedUpfit?.spec_sheet || selectedChassis?.spec_sheet;

    if (
      specSheetDoc?.file?.url &&
      (!newQuoteById?.vehicleSpecSheets ||
        newQuoteById?.vehicleSpecSheets?.length === 0)
    ) {
      const vehicleSpecSheet = {
        title: specSheetDoc?.title,
        file: {
          url: specSheetDoc?.file?.url,
        },
      };
      storeDispatch(
        setQuoteById({
          quoteId: newQuoteById?.id,
          data: {
            ...newQuoteById,
            vehicleSpecSheets: [vehicleSpecSheet],
          },
        }),
      );
    }
  }, [newQuoteById, selectedChassis, selectedUpfit, storeDispatch]);

  // Set default paint if not selected
  useEffect(() => {
    if (
      paintTypeOptions &&
      paintTypeOptions?.length > 0 &&
      selectedGroup &&
      ((!selectedGroup?.paintType && newQuoteById) ||
        !paintTypeOptions?.find(
          (option) => option?.id === selectedGroup?.paintType?.id,
        ))
    ) {
      let defaultOption = paintTypeOptions?.find((opt) => opt?.is_included);
      defaultOption ||= paintTypeOptions[0];

      storeDispatch(
        setQuoteById({
          quoteId: newQuoteById?.id,
          data: {
            ...newQuoteById,
            groups: newQuoteById.groups.map((v) =>
              v.id !== selectedGroup.id
                ? v
                : {
                    ...v,
                    paintType: { ...defaultOption, is_selected: true },
                  },
            ),
          },
        }),
      );
    }
  }, [newQuoteById, paintTypeOptions, selectedGroup, storeDispatch]);

  const onQuantityChange = useCallback(
    (group: GroupTypeForUpdate, quantity: number) => {
      if (!newQuoteById) return;

      storeDispatch(
        setQuoteById({
          quoteId: newQuoteById?.id,
          data: {
            ...newQuoteById,
            totalQuantity: quantity,
            groups: newQuoteById.groups.map((v) =>
              v.id !== group.id
                ? v
                : {
                    ...v,
                    quantity: quantity,
                  },
            ),
          },
        }),
      );
    },
    [newQuoteById, storeDispatch],
  );

  const onPaintColorChange = useCallback(
    (
      colorOption: ColorPickerSectionOptionSchema | undefined,
      group: GroupTypeForUpdate,
    ) => {
      if (!newQuoteById || !colorOption) return;

      console.log("%ccolorOption here:", "background-color:violet", {
        colorOption,
      });

      storeDispatch(
        setQuoteById({
          quoteId: newQuoteById?.id,
          data: {
            ...newQuoteById,
            groups: newQuoteById.groups.map((v) =>
              v.id !== group?.id
                ? v
                : {
                    ...v,
                    paintType: { ...colorOption, is_selected: true },
                  },
            ),
          },
        }),
      );
    },
    [newQuoteById, storeDispatch],
  );

  const providerValue = useMemo(
    () => ({
      newQuoteById,
      selectedGroup,
      getVehicleQueryState,
      vehicleItemKontentAi,
      paintTypeOptions,
      onQuantityChange,
      onPaintColorChange,
    }),
    [
      getVehicleQueryState,
      newQuoteById,
      onPaintColorChange,
      onQuantityChange,
      paintTypeOptions,
      selectedGroup,
      vehicleItemKontentAi,
    ],
  );

  console.log("%cgetVehicleQueryState:", "background-color:blue;", {
    getVehicleQueryState,
    selectedChassis,
    paintTypeOptions,
    selectedUpfit,
    vehicleGvwr,

    configurationSectionsLocal,
  });

  return (
    <ConfiguratorPageContext.Provider value={providerValue}>
      {props.children}
    </ConfiguratorPageContext.Provider>
  );
}
