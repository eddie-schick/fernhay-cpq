import { createTheme } from "@mui/material/styles";

import HelveticaBlack from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-Black.woff2";
import HelveticaBlackItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-BlackIta.woff2";
import HelveticaBold from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-Bold.woff2";
import HelveticaBoldItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-BoldIta.woff2";
import HelveticaExtraBoldItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-ExtBdIta.woff2";
import HelveticaExtraBlack from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-ExtBlk.woff2";
import HelveticaExtraBlackItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-ExtBlkIta.woff2";
import HelveticaExtraLight from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-ExtLt.woff2";
import HelveticaExtraLightItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-ExtLtIta.woff2";
import HelveticaExtraBold from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-ExtraBold.woff2";
import HelveticaLight from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-Light.woff2";
import HelveticaLightItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-LightIta.woff2";
import HelveticaMediumItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-MedIta.woff2";
import HelveticaMedium from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-Medium.woff2";
import HelveticaReqularItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-RegIta.woff2";
import HelveticaReqular from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-Regular.woff2";
import HelveticaThin from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-Thin.woff2";
import HelveticaThinItalic from "~/assets/fonts/Helvetica-Now-Display/HelveticaNowDisplay-ThinIta.woff2";

import { ThemeOptions } from "~/context/global-theme-provider";

type CustomColors = {
  shaedBrand2_400: string;
  shaedBrand2_100: string;
  shaedBrand2_50: string;
  shaedBrand2_25: string;
  accentBlack: string;
  tertiary: string;
  greyAccent: string;
  subHeadlines: string;
  mainHover: string;
  white: string;
  darker: string;
  baseAccent: string;
  surfaceTertiary: string;
  charcoal: string;
  blueBackground: string;
  lightGray: string;
  lightGrayBg: string;
  backgroundGray: string;
  sideBarActive: string;
  gray_200: string;
  error_400: string;
  redHover: string;
  gray_300: string;
  purple: string;
  rose: string;
  green: string;
  yellow: string;
  boxShadow: string;
  boxShadow1: string;
  backroundLight: string;
  darkGray: string;
  splashScreenColor1: string;
  splashScreenColor2: string;
  splashScreenColor3: string;
  baseWhite: string;
  error: string;
  errorLight: string;
  navLinkActiveColor: string;
  miscActiveColor: string;
};
declare module "@mui/material/styles" {
  interface Palette {
    custom: CustomColors;
  }

  interface PaletteOptions {
    custom: CustomColors;
  }
}

export const getTheme = (themeOptions?: ThemeOptions) => {
  const theme = createTheme({
    palette: {
      primary: {
        main: themeOptions?.colors?.primaryColor || "#0465B6",
      },
      secondary: {
        main: themeOptions?.colors?.secondaryColor || "#51B0FF",
      },
      custom: {
        shaedBrand2_400: "#01BF69",
        shaedBrand2_100: "#2AFF9B",
        shaedBrand2_50: "#8FFFCA",
        shaedBrand2_25: "#FAFFFD",

        mainHover: themeOptions?.colors?.primaryHoverColor || "#034982",
        accentBlack: "#3C3C3C",
        tertiary: "#E6E6E6",
        greyAccent: "#BABABA",
        subHeadlines: "#646464",
        white: "#FFF",
        darker: "#1D4A94",
        baseAccent: "#4572C5",
        blueBackground: "#F1F6FF",
        darkGray: "#818181",
        charcoal: "#303030",
        backroundLight: "#FCFCFD",
        backgroundGray: "#EFEFEF",
        gray_200: "#F1F1F1",
        gray_300: "#E3E3E3",
        lightGray: "#909090",
        lightGrayBg: "#FAFAFA",
        sideBarActive:
          "linear-gradient(90deg, rgba(32, 73, 147, 0.19) 0%, rgba(32, 73, 147, 0.00) 109.03%), linear-gradient(90deg, #FFF 0%, rgba(255, 255, 255, 0.00) 73.61%)",
        splashScreenColor1:
          themeOptions?.colors?.splashScreenLoaderColor1 || "#51B0FF",
        splashScreenColor2:
          themeOptions?.colors?.splashScreenLoaderColor2 || "#97D0FF",
        splashScreenColor3:
          themeOptions?.colors?.splashScreenLoaderColor3 || "#B9DFFF",
        error_400: "#D32F2F",
        baseWhite: "#FEFEFE",
        surfaceTertiary: "#F6F6F6",
        purple: "#A269DB",
        rose: "#FF9393",
        green: "#47A580",
        yellow: "#FFA629",
        error: "#D32F2F",
        boxShadow: "#DFDFDF",
        boxShadow1: "0px 0px 3px 0px rgba(0, 0, 0, 0.15)",
        redHover: "#FEF3F2",
        errorLight: "#FFFBFA",
        navLinkActiveColor:
          themeOptions?.colors?.navLinkActiveColor ||
          "linear-gradient(90deg, rgba(32, 73, 147, 0.19) 0%, rgba(32, 73, 147, 0.00) 109.03%), linear-gradient(90deg, #FFF 0%, rgba(255, 255, 255, 0.00) 73.61%)",
        miscActiveColor: themeOptions?.colors?.miscActiveColor || "#F1F6FF",
      },
    },
    typography: (palette) => ({
      fontFamily: ["Helvetica Now Display", "sans-serif"].join(","),
      allVariants: {
        color: palette.custom.accentBlack,
      },
    }),
    components: {
      MuiStack: {
        defaultProps: {
          useFlexGap: true,
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            padding: "8px 12px",
            fontSize: "1rem",
            fontWeight: 400,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: (themeParams) => `
          *{
            font-family:'Helvetica Now Display', sans-serif;
          }
  
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaThin})
              format("woff2");
            font-weight: 100;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaThinItalic})
              format("woff2");
            font-weight: 100;
            font-style: italic;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaExtraLight})
              format("woff2");
            font-weight: 200;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaExtraLightItalic})
              format("woff2");
            font-weight: 200;
            font-style: italic;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaLight})
              format("woff2");
            font-weight: 300;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaLightItalic})
              format("woff2");
            font-weight: 300;
            font-style: italic;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaReqular})
              format("woff2");
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaReqularItalic})
              format("woff2");
            font-weight: normal;
            font-style: italic;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaMedium})
              format("woff2");
            font-weight: 500;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaMediumItalic})
              format("woff2");
            font-weight: 500;
            font-style: italic;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaBold})
              format("woff2");
            font-weight: 700;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaBoldItalic})
              format("woff2");
            font-weight: 700;
            font-style: italic;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaExtraBold})
              format("woff2");
            font-weight: 800;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaExtraBoldItalic})
              format("woff2");
            font-weight: 800;
            font-style: italic;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaBlack})
              format("woff2");
            font-weight: 900;
            font-style: italic;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaBlackItalic})
              format("woff2");
            font-weight: 900;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaExtraBlack})
              format("woff2");
            font-weight: 950;
            font-style: normal;
          }
          @font-face {
            font-family: "Helvetica Now Display";
            src: url(${HelveticaExtraBlackItalic})
              format("woff2");
            font-weight: 950;
            font-style: italic;
          }
          
          .input--text,.input--number,.input--textarea{
            all:unset;
            border:1px solid ${themeParams.palette.custom.tertiary};
            padding:8px 12px;
            border-radius:0.3125rem;
          }
          .input--text:disabled,.input--number:disabled,.input--textarea:disabled{
           background-color:rgba(0,0,0,0.05);
          }
          .input--text::placeholder,.input--number::placeholder,.input--textarea::placeholder{
            color:${themeParams.palette.custom.lightGray};
          }
          .input--textarea{
            word-break:break-word;
          }
          .input--text:focus,.input--number:focus,.input--textarea:focus{
            border-color:${themeParams.palette.primary.main};
          }
  
          .form-label{
            font-size:1rem;
            font-weight:700;
            line-height:normal;
            color:${themeParams.palette.custom.accentBlack};
            width:max-content;
          }
          .form-label--required{
            width:max-content;
            position:relative;
          }
          .form-label--required::after{
            content:"*";
            position:absolute;
            top:-2px;
            right:-8px;
            color:${themeParams.palette.primary.main};
          }
  
          .form-error-text{
            color:red !important;
            font-size:0.875rem !important;
            min-height:1.375rem;
          }
        `,
      },
    },
  });

  return theme;
};
