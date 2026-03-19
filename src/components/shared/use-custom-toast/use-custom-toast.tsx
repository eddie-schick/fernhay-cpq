/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//@ts-nocheck
import { useSnackbar } from "notistack";
import { useCallback } from "react";

export default function useCustomToast() {
  const { enqueueSnackbar } = useSnackbar();

  const triggerToast = useCallback(
    ({ variant, message, ...rest }) =>
      enqueueSnackbar({
        variant,
        message,
        autoHideDuration: 3000,
        style: {
          fontSize: "1rem",
        },
        ...rest,
      }),
    [enqueueSnackbar]
  );

  const triggerGenericErrorMessage = useCallback(() => {
    triggerToast({
      variant: "error",
      message: "Request failed! Some error occurred",
    });
  }, [triggerToast]);

  return { triggerToast, triggerGenericErrorMessage };
}
