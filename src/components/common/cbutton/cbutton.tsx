import { PropsWithChildren } from "react";

import { ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

type ButtonVariants = "filled" | "outlined" | "link" | "underlinedLink";
type CButtonProps = {
  id: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonVariants;
};
export default function CButton(
  props: PropsWithChildren & Omit<ButtonProps, "variant"> & CButtonProps
) {
  const {
    id,
    children,
    disabled,
    onClick,
    variant = "filled",
    ...rest
  } = props;

  return (
    <CButtonStyled
      id={id}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      {...rest}
    >
      {children}
    </CButtonStyled>
  );
}

const CButtonStyled = styled("button")<{
  variant: ButtonVariants;
  disabled?: boolean;
}>(({ theme, variant }) => {
  const variantToStylesMap = {
    filled: {
      backgroundColor: theme.palette.primary.main,
      fontWeight: 700,
      color: "#ffffff",
      border: `1px solid transparent`,

      "&:hover": {
        backgroundColor: theme.palette.custom.mainHover,
      },

      "&:disabled": {
        backgroundColor: `${theme.palette.custom.greyAccent} !important`,
        pointerEvents: "none",
      },
    },

    outlined: {
      backgroundColor: "#ffffff",
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,

      "&:hover": {
        backgroundColor: "hsl(0, 0%, 95%)",
      },

      "&:disabled": {
        opacity: 0.5,
        pointerEvents: "none",
      },
    },

    link: {
      backgroundColor: "transparent",
      padding: 0,
      color: theme.palette.primary.main,

      "&:hover": {
        color: theme.palette.primary.dark,
      },

      "&:disabled": {
        color: `${theme.palette.custom.greyAccent} !important`,
        pointerEvents: "none",
      },
    },

    underlinedLink: {
      backgroundColor: "transparent",
      padding: 0,
      color: theme.palette.primary.main,
      textDecoration: "underline",
      textUnderlineOffset: "3px",

      "&:hover": {
        color: theme.palette.primary.dark,
      },

      "&:disabled": {
        color: `${theme.palette.custom.greyAccent} !important`,
        pointerEvents: "none",
      },
    },
  };

  return {
    all: "unset",
    padding: "0.688rem 1.875rem",
    borderRadius: "0.3125rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "center",
    ...variantToStylesMap[variant],
  };
});
