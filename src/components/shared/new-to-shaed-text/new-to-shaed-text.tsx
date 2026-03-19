import { useNavigate } from "react-router";

import { Typography, styled } from "@mui/material";

import RoutePaths from "~/constants/route-paths";

import useIncrementalIds from "~/global/custom-hooks/useIncrementalIds";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

export default function NewToShaedText() {
  const idNumber = useIncrementalIds({ ReactElement: NewToShaedText });

  const navigate = useNavigate();

  const { appSettings } = useAppSelector(rootSelector);

  const onSignUpClick = () => {
    window.open("https://shaed.ai", "_blank");
  };

  return (
    <NewToShaedTextStyled>
      New to SHAED?&nbsp;
      <Typography
        id={`sign-up-text-${idNumber}`}
        component="a"
        className="login-signup-link"
        onClick={onSignUpClick}
      >
        Sign up
      </Typography>
    </NewToShaedTextStyled>
  );
}

const NewToShaedTextStyled = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 400,
  lineHeight: "normal",

  ".login-signup-link": {
    color: theme.palette.primary.main,
    fontWeight: 700,
    cursor: "pointer",
  },
}));
