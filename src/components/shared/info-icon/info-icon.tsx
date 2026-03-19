import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { IconButton, Theme } from "@mui/material";

import TooltipWrapper from "~/components/shared/tooltip-wrapper/tooltip-wrapper";

type InfoIconProps = {
  tooltipText?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};
export default function InfoIcon(props: InfoIconProps) {
  const { tooltipText, onClick } = props;

  const IconComp = (
    <IconButton
      onClick={onClick}
      sx={{
        padding: 0,
      }}
    >
      <InfoOutlined
        sx={(theme: Theme) => ({
          color: theme.palette.primary.main,
          height: "1rem",
          width: "1rem",
        })}
      />
    </IconButton>
  );

  return tooltipText ? (
    <TooltipWrapper title={tooltipText}>{IconComp}</TooltipWrapper>
  ) : (
    IconComp
  );
}
