import { Html, useProgress } from "@react-three/drei";

export default function ModelLoader3D() {
  const { active, progress, errors, loaded, total } = useProgress();

  if (active) {
    return (
      <Html center>
        <span>{progress.toPrecision(2)} % loaded</span>
      </Html>
    );
  }
  if (errors.length) {
    return <Html center>Error!</Html>;
  }
  if (loaded && total) {
    return (
      <Html center>
        <span>
          Loaded {loaded} of {total}
        </span>
      </Html>
    );
  }
  return null;
}
