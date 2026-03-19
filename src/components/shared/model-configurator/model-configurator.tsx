/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useLoader } from "@react-three/fiber";

import { memo, useEffect } from "react";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { useAppDispatch } from "~/store";
import { NewQuoteShape } from "~/store/slices/quotes/types";
import { setAllowPlaying3dModelAnimations } from "~/store/slices/root/slice";

import ModelRenderer from "../model-renderer/model-renderer";

interface Props {
  model3dDetails: NewQuoteShape["groups"][number]["model3dDetails"];
  upfitOption?: NewQuoteShape["groups"][number]["upfit"];
  paintOption?: NewQuoteShape["groups"][number]["paintType"];
  isModelAnimationPlaying?: React.MutableRefObject<boolean>;
  modelAnimationTimeScale?: React.MutableRefObject<number>;
}

function ModelConfigurator(props: Props) {
  const {
    model3dDetails,
    upfitOption,
    paintOption,
    isModelAnimationPlaying,
    modelAnimationTimeScale,
  } = props;
  const { baseModel, upfit, shelving } = model3dDetails || {};

  const storeDispatch = useAppDispatch();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "https://unpkg.com/three/examples/jsm/libs/draco/",
  );

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const modelsToFetch = (() => {
    if (baseModel?.url && upfit?.url) {
      return [baseModel?.url, upfit?.url];
    }

    if (!baseModel?.url && upfit?.url) {
      return [upfit?.url];
    }

    if (baseModel?.url && !upfit?.url) {
      return [baseModel?.url];
    }

    return [];
  })();
  const [baseModelGLTF, upfitGLTF] = useLoader(
    GLTFLoader,
    modelsToFetch,
    (loader) => {
      loader.setDRACOLoader(dracoLoader);
    },
  );
  const [shelvingGLTF] = useLoader(
    GLTFLoader,
    [shelving?.url || ""]?.filter(Boolean),
    (loader) => {
      loader.setDRACOLoader(dracoLoader);
    },
  );

  console.log("%cmultiples:", "background-color:gold", {
    baseModelGLTF,
    upfitGLTF,
    shelvingGLTF,
    camera: baseModelGLTF.cameras,
    modelsToFetch,
  });

  useEffect(() => {
    if (
      upfitGLTF?.animations?.length > 0 ||
      baseModelGLTF?.animations?.length > 0
    ) {
      storeDispatch(setAllowPlaying3dModelAnimations(true));
    } else {
      storeDispatch(setAllowPlaying3dModelAnimations(false));
    }
  }, [
    baseModelGLTF?.animations?.length,
    storeDispatch,
    upfitGLTF?.animations?.length,
  ]);

  return (
    <ModelRenderer
      baseModelGLTF={baseModelGLTF}
      upfitGLTF={upfitGLTF}
      shelvingGLTF={shelvingGLTF}
      loader={gltfLoader}
      model3dDetails={model3dDetails}
      upfitOption={upfitOption}
      paintOption={paintOption}
      isModelAnimationPlaying={isModelAnimationPlaying}
      modelAnimationTimeScale={modelAnimationTimeScale}
    />
  );
}

const MemoizedComp = memo(ModelConfigurator);
export default MemoizedComp;
