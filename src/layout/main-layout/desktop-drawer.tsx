import { Drawer, styled } from "@mui/material";

type Props = {
  isOpen: boolean;
};
export default function DesktopDrawer(props: Props) {
  const { isOpen } = props;

  return (
    <DesktopDrawerStyled
      variant="permanent"
      open={isOpen}
    ></DesktopDrawerStyled>
  );
}

const DesktopDrawerStyled = styled(Drawer)(() => ({}));
