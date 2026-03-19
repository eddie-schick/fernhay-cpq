/* eslint-disable react/display-name */
import { ForwardedRef, PropsWithChildren, forwardRef } from "react";

import { Box, BoxProps } from "@mui/material";

const MuiBox = forwardRef(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (props: BoxProps & PropsWithChildren, ref: ForwardedRef<HTMLElement>) => (
    //@ts-ignore
    <Box component="div" {...props}>
      {props.children}
    </Box>
  )
);

export default MuiBox;
