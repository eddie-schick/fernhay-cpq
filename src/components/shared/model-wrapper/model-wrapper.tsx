import { Canvas } from "@react-three/fiber";

import { Suspense } from "react";

import { Typography } from "@mui/material";

import ErrorBoundary from "~/global/error-boundary";

import { NewQuoteShape } from "~/store/slices/quotes/types";

import ModelConfigurator from "../model-configurator/model-configurator";
import ModelLoader3D from "../model-loader-3d/model-loader-3d";
import MuiBox from "../mui-box/mui-box";

type ModelWrapperProps = {
  selectedGroup: NewQuoteShape["groups"][number];
  isModelAnimationPlaying?: React.MutableRefObject<boolean>;
  modelAnimationTimeScale?: React.MutableRefObject<number>;
};
export default function ModelWrapper(props: ModelWrapperProps) {
  const { selectedGroup, isModelAnimationPlaying, modelAnimationTimeScale } =
    props;
  const chassisOption = selectedGroup?.configurationSections
    ?.find((configSection) => configSection?.title?.toLowerCase() === "chassis")
    ?.options?.find((configOption) => configOption?.is_selected);
  const upfitOption = selectedGroup?.configurationSections
    ?.find((configSection) => configSection?.title?.toLowerCase() === "upfit")
    ?.options?.find((configOption) => configOption?.is_selected);
  const isChassisSelected = chassisOption?.is_selected;
  const isUpfitSelected = upfitOption?.is_selected;

  return (
    <>
      {/* @ts-ignore */}
      <ErrorBoundary
        customRender={
          <MuiBox
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography sx={{ fontSize: "1rem", color: "red" }}>
              Failed to load model.
            </Typography>
          </MuiBox>
        }
      >
        <Canvas>
          <Suspense fallback={<ModelLoader3D />}>
            <ModelConfigurator
              model3dDetails={{
                baseModel: (() => {
                  if (
                    (isUpfitSelected &&
                      upfitOption?.model_3d?.prioritizeModel) ||
                    !chassisOption?.model_3d?.url
                  ) {
                    return undefined;
                  }

                  return { url: chassisOption?.model_3d?.url };
                })(),
                upfit: (() => {
                  if (!upfitOption?.model_3d?.url || !isUpfitSelected) {
                    return undefined;
                  }

                  return { url: upfitOption?.model_3d?.url };
                })(),
                upfitDetails: {
                  prioritizeModel: upfitOption?.model_3d?.prioritizeModel,
                },
              }}
              upfitOption={selectedGroup?.upfit}
              paintOption={selectedGroup?.paintType}
              isModelAnimationPlaying={isModelAnimationPlaying}
              modelAnimationTimeScale={modelAnimationTimeScale}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </>
  );
}
