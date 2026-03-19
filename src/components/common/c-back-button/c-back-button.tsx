import { useNavigate } from "react-router";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { styled } from "@mui/material";

type Props = {
  customText?: string;
  onClick?: () => void;
};
export default function CBackButton(props: Props) {
  const { customText, onClick } = props;

  const navigate = useNavigate();

  const onBackButtonClick = () => {
    navigate(-1);
  };

  return (
    <CBackButtonStyled
      id="c-back-button"
      onClick={!onClick ? onBackButtonClick : onClick}
    >
      <ArrowBackIosIcon />
      {customText || "Back"}
    </CBackButtonStyled>
  );
}

const CBackButtonStyled = styled("button")(({ theme }) => ({
  all: "unset",
  color: theme.palette.custom.subHeadlines,
  fontWeight: 500,
  fontSize: "1rem",
  lineHeight: "normal",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",

  svg: {
    fontSize: "0.75rem",
  },
}));
