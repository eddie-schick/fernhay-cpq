import { useEffect, useState, useRef } from "react";

import {
  CircularProgress,
  Modal,
  Theme,
  Typography,
  styled,
  useMediaQuery,
} from "@mui/material";

import Envs from "~/constants/envs";
import LocalStorageKeys from "~/constants/local-storage-keys";

import { useGetBucketWriteSignedUrlMutation } from "~/store/endpoints/misc/misc";

import MuiBox from "../mui-box/mui-box";

type PdfModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  pdfBlobOrString: Blob | string;
  isSecuredString?: boolean; // If it's cloud bucket's link, it would need to use signed URL
};

export default function PdfModal(props: PdfModalProps) {
  const { isOpen, onClose, pdfBlobOrString, isSecuredString } = props;

  const isScreenLessThan1200 = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg"),
  );
  const isScreenLessThan1000 = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(1000),
  );

  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  const [
    getSignedUrl,
    { isLoading: isSignedUrlLoading, isError: isGetSignedUrlError },
  ] = useGetBucketWriteSignedUrlMutation();

  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (typeof pdfBlobOrString === "string") {
        if (!isSecuredString) {
          setPdfUrl(pdfBlobOrString);
          return () => {};
        }

        const res = await getSignedUrl({
          data: {
            fileName: pdfBlobOrString.split(
              `${Envs.GET_SIGNED_URL_CLOUD_FUNCTION_ENVIRONMENT}/`,
            )[1],
            type: "GET",
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              LocalStorageKeys.TOKEN,
            )}`,
          },
        }).unwrap();

        const objectUrl = res.url;
        setPdfUrl(objectUrl);

        return () => {};
      }
      const objectUrl = URL.createObjectURL(pdfBlobOrString);
      setPdfUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    })();
  }, [getSignedUrl, isSecuredString, pdfBlobOrString]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pdfUrl]);

  useEffect(() => {
    const cb = setTimeout(() => {
      if (isMobile && onClose && pdfUrl) {
        anchorRef?.current?.click();
        onClose();
      }
    }, 250);

    return () => {
      clearTimeout(cb);
    };
  }, [isMobile, onClose, pdfUrl]);

  const getInitialZoomForIframePdf: () => string = () => {
    if (isScreenLessThan1000) {
      return "#zoom=64";
    }
    if (isScreenLessThan1200) {
      return "#zoom=75";
    }

    return "";
  };

  console.log(
    "ends",
    typeof pdfBlobOrString,
    `${pdfUrl}${getInitialZoomForIframePdf()}`,
  );

  const errorStyles = {
    color: "red",
  };

  return (
    <FleetInvoiceStyled open={isOpen} onClose={onClose}>
      <MuiBox
        sx={{
          width: "95vw",
          height: "90vh",
          maxWidth: "144rem",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          p: 0,
        }}
      >
        {isSignedUrlLoading ? (
          <MuiBox
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress size={30} />
          </MuiBox>
        ) : isGetSignedUrlError ? (
          <Typography sx={errorStyles}>An Error Occured</Typography>
        ) : [null, undefined, ""].includes(pdfUrl) ? (
          <Typography>No data found</Typography>
        ) : (
          <>
            <a
              href={pdfUrl}
              ref={anchorRef}
              id="pdf-link"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "none" }}
            >
              Open PDF in new tab
            </a>
            <iframe
              id="myIframe"
              src={`${pdfUrl}${getInitialZoomForIframePdf()}`}
              style={{ width: "100%", height: "100%" }}
            ></iframe>
          </>
        )}
      </MuiBox>
    </FleetInvoiceStyled>
  );
}

const FleetInvoiceStyled = styled(Modal)(() => ({
  // [theme.breakpoints.down("md")]: {
  // 	display: "none",
  // },
}));
