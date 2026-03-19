import { MutableRefObject, useEffect } from "react";

import { Tab, Tabs, Theme } from "@mui/material";

import { ConfigurationSectionOptionSchemaV2 } from "~/global/types/types";

import { useAppDispatch, useAppSelector } from "~/store";
import {
  configuratorSelector,
  setSelectedTab,
} from "~/store/slices/configurator/slice";

import { useConfiguratorPageContextValue } from "~/context/configurator-page-provider";

type OptionsTabsProps = {
  isTabSelectedManually: MutableRefObject<boolean>;
};
export default function OptionsTabs(props: OptionsTabsProps) {
  const { isTabSelectedManually } = props;

  const storeDispatch = useAppDispatch();

  const { selectedGroup, paintTypeOptions } = useConfiguratorPageContextValue();

  const { selectedTab } = useAppSelector(configuratorSelector);

  useEffect(() => {
    // On first load, reset the tab to 'quantity'
    storeDispatch(setSelectedTab("quantity"));
  }, [storeDispatch]);

  const onTabChange:
    | ((event: React.SyntheticEvent<Element, Event>, value: string) => void)
    | undefined = (_, value) => {
    storeDispatch(setSelectedTab(value));

    // const headingInUi = tabValueToHeadingUiMap[value];

    const configOptionsHeadings = document.querySelectorAll(".option-heading");

    let theElem: null | Element = null;
    for (let i = 0; i < configOptionsHeadings?.length; i += 1) {
      const optionHeading = configOptionsHeadings[i];

      console.log("%ctheElem search:", "background-color:red;color:white;", {
        optionHeading,
        value,
      });
      if (optionHeading.textContent?.toLowerCase() === value) {
        theElem = optionHeading;
        break;
      }
    }

    if (theElem) {
      isTabSelectedManually.current = true;

      const bounds = theElem.getBoundingClientRect();
      const TOP_OFFSET_TO_ANCHOR_TO = 350;

      const differenceToOffsetBy = bounds.top - TOP_OFFSET_TO_ANCHOR_TO;
      window.scrollBy({ top: differenceToOffsetBy });

      console.log({ theElem, bounds });
    }
  };

  return (
    <Tabs
      value={selectedTab}
      onChange={onTabChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={(theme: Theme) => ({
        border: `1px solid ${theme.palette.custom.tertiary}`,
        borderRadius: "0.625rem 0.625rem 0 0",

        ".MuiTabScrollButton-root": {
          width: "max-content",
        },

        ".MuiTab-root": {
          textTransform: "capitalize",
        },
      })}
    >
      <Tab label="Quantity" value="order quantity" />
      {paintTypeOptions?.length > 0 && <Tab label="Paint" value="paint" />}
      {selectedGroup?.configurationSections?.map((section, _, self) => {
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

        return (
          <Tab
            key={section?.id}
            label={section?.title}
            value={section?.title?.toLowerCase()}
          />
        );
      })}
    </Tabs>
  );
}
