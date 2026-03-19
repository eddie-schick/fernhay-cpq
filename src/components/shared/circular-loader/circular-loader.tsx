import { CircularProgress } from "@mui/material";

type CircularLoaderProps = {
  size?: string | number;
  color?: string;
};
export default function CircularLoader(props: CircularLoaderProps) {
  const { size = 24, color } = props;

  return (
    <CircularProgress
      sx={(theme) => ({
        width: `${size}px !important`,
        height: `${size}px !important`,
        color: color || theme.palette.secondary.main,
      })}
    />
  );
}
