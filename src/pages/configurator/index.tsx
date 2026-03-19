import { Box, Skeleton, styled } from "@mui/material";

import { useConfiguratorPageContextValue } from "~/context/configurator-page-provider";

import MainLayout from "~/layout/main-layout/main-layout";

import ConfiguratorLeftSide from "~/components/configurator/configurator-left-side/configurator-left-side";
import ConfiguratorRightSide from "~/components/configurator/configurator-right-side/configurator-right-side";
import MuiBox from "~/components/shared/mui-box/mui-box";

export default function ConfiguratorPage() {
  const { getVehicleQueryState } = useConfiguratorPageContextValue();

  const renderMainContent = () => {
    if (getVehicleQueryState?.isFetching) {
      return (
        <MuiBox className="loader-container">
          <Skeleton height={632} sx={{ flex: 0.7 }} />

          <MuiBox
            sx={{
              flex: 0.3,
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <Skeleton height={300} />
            <Skeleton height={300} />
          </MuiBox>
        </MuiBox>
      );
    }

    return (
      <>
        <ConfiguratorLeftSide />

        <ConfiguratorRightSide />
      </>
    );
  };

  return (
    <MainLayout headerTitle="Build My Vehicle">
      <ConfiguratorPageStyled className="configurator-page">
        {renderMainContent()}
      </ConfiguratorPageStyled>
    </MainLayout>
  );
}

const ConfiguratorPageStyled = styled(Box)(({ theme }) => ({
  padding: "24px 24px 100px 24px",
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",

  ".loader-container": {
    flex: 1,
    display: "flex",
    gap: "1.5rem",

    ".MuiSkeleton-root": {
      transform: "unset",
    },
  },

  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));
