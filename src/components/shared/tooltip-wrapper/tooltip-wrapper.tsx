import React from "react";

import { Tooltip, TooltipProps } from "@mui/material";

const TooltipWrapper = ({
  title,
  delay = 0,
  children = <></>,
  placement = "top",
  tooltipStyles,
}: {
  title: string | Date;
  delay?: number;
  children: React.ReactElement<null, string>;
  placement?: TooltipProps["placement"];
  tooltipStyles?: NonNullable<
    NonNullable<TooltipProps["componentsProps"]>["tooltip"]
  >["sx"];
}) => {
  const formattedTitle = typeof title === "string" ? title : title.toString();
  return (
    <Tooltip
      title={formattedTitle}
      leaveDelay={delay || 0}
      placement={placement}
      enterTouchDelay={10}
      arrow
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -5],
              },
            },
          ],
        },
      }}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "#3C3C3C",
            fontSize: "0.875rem",
            ...(tooltipStyles || {}),
          },
        },
        arrow: {
          sx: {
            color: "#3C3C3C",
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default TooltipWrapper;
