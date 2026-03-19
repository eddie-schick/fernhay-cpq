import { MutableRefObject, useEffect } from "react";

import { Box, styled } from "@mui/material";

import {
  ConfigurationSectionOptionSchemaV2,
  ConfigurationSectionSchemaV2,
} from "~/global/types/types";

import { useAppDispatch, useAppSelector } from "~/store";
import {
  headingInUiToTabValueMap,
  selectedGroupByValueSelector,
  setSelectedTab,
} from "~/store/slices/configurator/slice";
import { setQuoteGroupById } from "~/store/slices/quotes/slice";

import { useConfiguratorPageContextValue } from "~/context/configurator-page-provider";

import MuiBox from "~/components/shared/mui-box/mui-box";

import ListViewOptions, {
  OptionsType,
} from "./list-view-options/list-view-options";
import OrderQuantity from "./order-quantity/order-quantity";
import PaintOptions from "./paint-options/paint-options";

type ConfigurationOptionsProps = {
  isTabSelectedManually: MutableRefObject<boolean>;
};
export default function ConfigurationOptions(props: ConfigurationOptionsProps) {
  const { isTabSelectedManually } = props;

  const storeDispatch = useAppDispatch();

  const {
    newQuoteById,
    selectedGroup,
    paintTypeOptions,
    onQuantityChange,
    onPaintColorChange,
  } = useConfiguratorPageContextValue();
  const quoteId = newQuoteById?.id;
  const groupId = selectedGroup?.id;
  const configurationSections =
    selectedGroup?.configurationSections as ConfigurationSectionSchemaV2[];

  const selectedGroupByValueObj = useAppSelector(selectedGroupByValueSelector);

  console.log("%cconfiguration-options.tsx:", "background-color:gold;", {
    newQuoteById,
    selectedGroupByValueObj,
    selectedGroup,
    configurationSections,
  });

  console.log("paints are ", paintTypeOptions);

  useEffect(() => {
    const scrollEventHandler = () => {
      if (isTabSelectedManually.current) {
        isTabSelectedManually.current = false;
        return;
      }

      const configOptionsHeadings =
        document.querySelectorAll(".option-heading");
      const configOptionsHeadingsArrayfied = [...configOptionsHeadings];

      const boundingRects = configOptionsHeadingsArrayfied?.map((elem) =>
        elem?.getBoundingClientRect(),
      );
      const boundingRectsArrayfied = [...boundingRects];

      const indexOfTabToSet =
        boundingRectsArrayfied?.length -
        1 -
        boundingRectsArrayfied?.reverse()?.findIndex((v) => v?.top <= 350);

      const elem = configOptionsHeadingsArrayfied[
        indexOfTabToSet
      ]?.textContent?.toLowerCase() as keyof typeof headingInUiToTabValueMap;

      storeDispatch(setSelectedTab(elem));
    };

    window.addEventListener("scroll", scrollEventHandler);

    return () => window.removeEventListener("scroll", scrollEventHandler);
  }, [isTabSelectedManually, storeDispatch]);

  const onSectionOptionChange = (
    option: OptionsType,
    section: ConfigurationSectionSchemaV2,
  ) => {
    if (!quoteId || !groupId) return;

    const newOptionSelectedValue = !option?.is_selected;
    const selectedPrevOptions = section?.options?.filter((v) => v?.is_selected);
    if (
      // If at least 1 option should be always remain selected
      section?.cannot_deselect &&
      selectedPrevOptions?.length === 1 &&
      !newOptionSelectedValue
    ) {
      return;
    }

    let newValue: ConfigurationSectionSchemaV2[] = structuredClone(
      configurationSections,
    );
    const targetSectionIndex = newValue?.findIndex(
      (sec) => sec?.id === section?.id,
    );
    newValue = newValue?.map((prevSection, prevSectionIndex) => {
      if (
        prevSectionIndex > targetSectionIndex &&
        prevSection?.linked_parent_option_id === option?.id
      ) {
        return {
          ...prevSection,
          options: prevSection?.options?.map((prevOption) => {
            return {
              ...prevOption,
              is_selected: false,
            };
          }),
        };
      }

      if (prevSection?.id !== section?.id) return prevSection;

      return {
        ...prevSection,
        options: prevSection?.options?.map((prevOption) => {
          if (prevOption?.id !== option?.id) {
            return {
              ...prevOption,
              ...(!prevSection?.is_multi_select && {
                is_selected: false,
              }),
            };
          }

          return {
            ...prevOption,
            is_selected: newOptionSelectedValue,
          };
        }),
      };
    });

    storeDispatch(
      setQuoteGroupById({
        quoteId,
        groupId,
        data: {
          configurationSections: newValue,
        },
      }),
    );
  };

  const onSectionSelectedGroupByValueChange = (
    newGroupByValue: string,
    section: ConfigurationSectionSchemaV2,
  ) => {
    if (!quoteId || !groupId) return;

    let newValue: ConfigurationSectionSchemaV2[] = structuredClone(
      configurationSections,
    );
    newValue = newValue?.map((prevSection) => {
      if (prevSection?.id !== section?.id) return prevSection;

      return {
        ...prevSection,
        selected_option_manufacturer: newGroupByValue,
        options: prevSection?.options?.map((prevOption) => {
          return {
            ...prevOption,
            is_selected: false,
          };
        }),
      };
    });

    storeDispatch(
      setQuoteGroupById({
        quoteId,
        groupId,
        data: {
          configurationSections: newValue,
        },
      }),
    );
  };

  const renderConfigSections = (sections: ConfigurationSectionSchemaV2[]) => {
    return sections?.map((section, index, self) => {
      if (section?.linked_parent_option_id) {
        let parentOption: ConfigurationSectionOptionSchemaV2 | undefined;
        let isUpdated = false;
        self?.forEach((configSection) => {
          if (isUpdated) return;

          configSection?.options?.forEach((configOption) => {
            if (isUpdated) return;

            if (configOption?.id === section?.linked_parent_option_id) {
              parentOption = configOption;
              isUpdated = true;
            }
          });
        });

        if (!parentOption?.is_selected) return;
      }

      const sectionOptions = section?.options;
      const selectedOption = sectionOptions?.filter(
        (option) => option?.is_selected,
      );

      console.log("section details", section);

      return (
        <>
          {!section?.is_section_hidden && (
            <ListViewOptions
              key={index}
              isMultiSelect={Boolean(section?.is_multi_select)}
              areAllDeselectable={Boolean(!section?.cannot_deselect)}
              heading={section?.title}
              description={section?.description || ""}
              options={sectionOptions}
              selectedOption={selectedOption}
              onChange={(option) => onSectionOptionChange(option, section)}
              selectedGroupByValue={section?.selected_option_manufacturer}
              onSelectedGroupByValueChange={(newValue) => {
                onSectionSelectedGroupByValueChange(newValue, section);
              }}
            />
          )}
        </>
      );
    });
  };

  return (
    <ConfigurationOptionsStyled>
      <MuiBox className="configuration-options-container">
        <OrderQuantity
          totalQuantity={newQuoteById?.totalQuantity}
          onQuantityChange={(quantity) =>
            onQuantityChange(selectedGroup!, quantity)
          }
        />

        {paintTypeOptions?.length > 0 && (
          <PaintOptions
            colorsOptions={paintTypeOptions}
            selectedColorOption={selectedGroup?.paintType}
            onColorChange={(option) =>
              onPaintColorChange(option, selectedGroup!)
            }
          />
        )}

        {renderConfigSections(configurationSections)}
      </MuiBox>
    </ConfigurationOptionsStyled>
  );
}

const ConfigurationOptionsStyled = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.custom.tertiary}`,
  borderRadius: "0 0 0.625rem 0.625rem",
  padding: "12px 24px",

  ".configuration-options-container": {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  ".option-heading": {
    fontSize: "1rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    marginBottom: "0.5rem",
  },

  ".options-tabs": {
    marginBottom: "1.5rem",
  },
}));
