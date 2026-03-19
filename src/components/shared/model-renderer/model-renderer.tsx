/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unknown-property */

import {
  Center,
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { PrimitiveProps, ThreeElements, useFrame } from "@react-three/fiber";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimationMixer,
  Box3,
  Clock,
  Vector3,
  PerspectiveCamera as ThreeJsPerspectiveCamera,
  AnimationAction,
  Object3D,
  Mesh,
  Group,
  Object3DEventMap,
} from "three";
// eslint-disable-next-line import/named
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { ModelGroupsNames } from "~/constants/model-3d-constants";

import { NewQuoteShape } from "~/store/slices/quotes/types";

interface Props {
  baseModelGLTF: GLTF;
  upfitGLTF: GLTF;
  shelvingGLTF: GLTF;
  loader: GLTFLoader;
  model3dDetails: NewQuoteShape["groups"][number]["model3dDetails"];
  upfitOption?: NewQuoteShape["groups"][number]["upfit"];
  paintOption?: NewQuoteShape["groups"][number]["paintType"];
  isModelAnimationPlaying?: React.MutableRefObject<boolean>;
  modelAnimationTimeScale?: React.MutableRefObject<number>;
}

function ModelRenderer(props: Props) {
  const {
    baseModelGLTF,
    upfitGLTF,
    shelvingGLTF,
    loader,
    model3dDetails,
    upfitOption,
    paintOption,
    isModelAnimationPlaying,
    modelAnimationTimeScale,
  } = props;
  console.log("%cModelRenderer props:", "background-color:darksalmon", props);

  const clock = useMemo(() => new Clock(), []);

  const mixer = useRef<null | AnimationMixer>(null);
  const chassisNodeRef = useRef<null | Object3D<Object3DEventMap>>(null);

  const [isCameraPositionSet, setIsCameraPositionSet] =
    useState<boolean>(false);
  const [cameraNode, setCameraNode] = useState<null | ThreeJsPerspectiveCamera>(
    null,
  );

  const resetCameraPosition = useCallback(
    (node: ThreeJsPerspectiveCamera) => {
      const box = new Box3().setFromObject(baseModelGLTF.scene);
      const size = box.getSize(new Vector3()).length();
      const center = box.getCenter(new Vector3());

      console.log("%ccameraRef:", "background-color:yellow;", {
        node,
        box,
        size,
        center,
      });

      if (node) {
        node.near = size / 100;
        node.far = size * 100;
        node.updateProjectionMatrix();

        node.position.copy(center);
        node.position.x += size / (upfitGLTF ? 1.0 : -1.0);
        node.position.y += size / 3.0;
        node.position.z += size / 2.0;
        // node.lookAt(center);
      }
    },
    [baseModelGLTF.scene, upfitGLTF],
  );

  useEffect(() => {
    if (cameraNode) {
      resetCameraPosition(cameraNode);
    }
  }, [cameraNode, resetCameraPosition, upfitGLTF]);

  useFrame((state, delta) => {
    if (
      mixer?.current &&
      isModelAnimationPlaying &&
      isModelAnimationPlaying.current &&
      (upfitGLTF || baseModelGLTF?.animations?.length)
    ) {
      mixer.current.update(delta);

      if (modelAnimationTimeScale) {
        mixer.current.timeScale = modelAnimationTimeScale.current;
      }
    }

    const chassisNode = chassisNodeRef?.current;
    if (chassisNode) {
      const shaedStickerMesh = chassisNode?.children?.find(
        (object) => object?.name?.toLowerCase() === "sticker",
      );

      if (shaedStickerMesh) {
        if (
          paintOption?.kontentAi__item__codename?.startsWith("shaed_wrapper")
        ) {
          shaedStickerMesh.visible = true;
        } else {
          shaedStickerMesh.visible = false;
        }
      }
    }
  });

  const renderDevObjects = () => {
    if (import.meta.env.MODE !== "development") return;

    return (
      <>
        <axesHelper args={[220]} />
        <gridHelper args={[200, 200, undefined, "teal"]} />
      </>
    );
  };

  const cameraRef = (node: ThreeJsPerspectiveCamera) => {
    setCameraNode(node);

    if (isCameraPositionSet) return;

    resetCameraPosition(node);

    setIsCameraPositionSet(true);
  };

  const chassisRefCallback = (node: Object3D) => {
    if (
      baseModelGLTF &&
      baseModelGLTF.animations?.length > 0 &&
      !upfitGLTF?.animations?.length
    ) {
      mixer.current = new AnimationMixer(node);

      baseModelGLTF.animations.forEach((clip) => {
        if (mixer?.current && node) {
          const action = mixer?.current?.clipAction(clip, node);
          if (modelAnimationTimeScale) {
            action.timeScale = modelAnimationTimeScale.current;
          }
          action?.play();
        }
      });
    }

    if (node) {
      chassisNodeRef.current = node;

      type Object3dType = Mesh | Group;

      const colorRelatedObjects = node.children.filter((mesh) =>
        mesh?.name?.startsWith(ModelGroupsNames.Paint),
      ) as Object3dType[];

      const applyColorToMeshes = (objects3d: Object3dType[]) => {
        objects3d.forEach((object) => {
          if (object?.type === "Group") {
            applyColorToMeshes(object?.children as Mesh[]);
          } else if (object && (object as Mesh)?.material) {
            /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
            // @ts-ignore
            object.material.color.set(paintOption?.hexCode);
            /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
          }
        });
      };

      applyColorToMeshes(colorRelatedObjects);

      console.log("%cchassis ref:", "background-color:yellow;", {
        node,
        colorRelatedObjects,
      });
    }
  };

  const upfitRefCallback = (node: Object3D) => {
    if (upfitGLTF && upfitGLTF.animations?.length > 0) {
      mixer.current = new AnimationMixer(node);

      upfitGLTF.animations.forEach((clip) => {
        if (mixer?.current && node) {
          const action = mixer?.current?.clipAction(clip, node);
          if (modelAnimationTimeScale) {
            action.timeScale = modelAnimationTimeScale.current;
          }
          action?.play();
        }
      });
    }
  };

  return (
    <>
      <Html center>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "1rem",
            // background: "#00000066",
          }}
        ></div>
      </Html>

      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        // zoom={1}
        // near={0.1}
        // far={200}
        // position={[-500, 200, 200] as Vector3Type}
        // {...model3dDetails?.details3d?.perspectiveCameraDetails}
      />
      <ambientLight intensity={0.5} color={"#FFFFFF"} />
      <color attach="background" args={["#FFFFFF"]} />
      <Environment files="/venice_sunset_1k.hdr" />

      {/* <Center> */}
      {baseModelGLTF && (
        <primitive
          ref={chassisRefCallback}
          object={baseModelGLTF.scene.clone()}
          // position={[0, -1, 0]}
        />
      )}
      {upfitGLTF && (
        <primitive
          ref={upfitRefCallback}
          object={upfitGLTF.scene.clone()}
          // position={
          // 	model3dDetails?.upfitDetails?.positionCoords || [0, -0.25, -0.1]
          // }
        />
      )}
      {shelvingGLTF && (
        <primitive ref={upfitRefCallback} object={shelvingGLTF.scene.clone()} />
      )}
      {/* </Center> */}

      <OrbitControls maxDistance={200} minDistance={1} />

      {/* {renderDevObjects()} */}
    </>
  );
}

export default memo(ModelRenderer);
