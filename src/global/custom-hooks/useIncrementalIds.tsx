/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useRef, useEffect, useState } from "react";

type Props<T> = {
  ReactElement: T;
};

function useIncrementalIds<T>({ ReactElement }: Props<T>) {
  const isFirstMount = useRef(true);
  const [componentId, setComponentId] = useState<string>("");

  useEffect(() => {
    if (isFirstMount?.current) {
      isFirstMount.current = false;
      // @ts-ignore
      const compIdLocal = ReactElement?.id ? ReactElement?.id + 1 : 1;
      setComponentId(`${String(compIdLocal)}`);

      // @ts-ignore
      ReactElement.id = compIdLocal;
    }

    return () => {
      // @ts-ignore
      ReactElement.id = 0;
    };
  }, [ReactElement]);

  return componentId;
}

export default useIncrementalIds;
