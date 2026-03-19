import { PropsWithChildren } from "react";

import {
  styled,
  SxProps,
  Theme,
  Tooltip,
  TooltipProps,
  Typography,
} from "@mui/material";

type Props = {
  linesToShow?: number;
  noTooltip?: boolean;
  customStyles?: SxProps<Theme> | undefined;
  tooltipProps?: Partial<TooltipProps>;
};
export default function CClampedText(props: Props & PropsWithChildren) {
  const {
    children,
    linesToShow = 1,
    noTooltip,
    customStyles,
    tooltipProps,
  } = props;

  if (noTooltip) {
    return (
      <CClampedTextStyled linesToShow={linesToShow} sx={customStyles}>
        {children}
      </CClampedTextStyled>
    );
  }

  return (
    <Tooltip title={children} arrow {...tooltipProps}>
      <CClampedTextStyled linesToShow={linesToShow} sx={customStyles}>
        {children}
      </CClampedTextStyled>
    </Tooltip>
  );
}

const CClampedTextStyled = styled(Typography)(
  ({ linesToShow }: { linesToShow: number }) => ({
    "--max-lines": linesToShow,
    display: "-webkit-box",
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: "var(--max-lines)",
  })
);
