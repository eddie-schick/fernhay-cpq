import { useNavigate } from "react-router";

import { Typography, styled } from "@mui/material";

import RoutePaths from "~/constants/route-paths";

import useIncrementalIds from "~/global/custom-hooks/useIncrementalIds";

export default function AlreadyHaveAccountText() {
  const idNumber = useIncrementalIds({ ReactElement: AlreadyHaveAccountText });

  const navigate = useNavigate();

  const onLoginClick = () => {
    navigate(RoutePaths.LOGIN_PAGE);
  };

  return (
    <AlreadyHaveAccountTextStyled>
      Already have an account?&nbsp;
      <Typography
        id={`login-text-${idNumber}`}
        component="a"
        className="login-signup-link"
        onClick={onLoginClick}
      >
        Login
      </Typography>
    </AlreadyHaveAccountTextStyled>
  );
}

const AlreadyHaveAccountTextStyled = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 400,
  lineHeight: "normal",

  ".login-signup-link": {
    color: theme.palette.primary.main,
    fontWeight: 700,
    cursor: "pointer",
  },
}));
