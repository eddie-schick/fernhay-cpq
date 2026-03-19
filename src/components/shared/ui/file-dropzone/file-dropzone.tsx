import { useRef } from "react";

import { Box, Input, Stack, Typography, styled } from "@mui/material";

import { UploadFileIcon } from "~/global/icons";

import MuiBox from "../../mui-box/mui-box";
import useCustomToast from "../../use-custom-toast/use-custom-toast";

type FileDropzoneProps = {
  onFileUploaded?: (file: File) => void;
  allowedFileMimeTypes?: "*" | string[];
  id: string;
  uploadFile?: (
    file: File,
    fileName: string,
  ) => Promise<
    | {
        signed_url: string;
      }
    | undefined
  >;
  context?: "sign-up" | "my-orders";
};
function FileDropzone(props: FileDropzoneProps) {
  const {
    allowedFileMimeTypes,
    onFileUploaded,
    uploadFile,
    context = "sign-up",
  } = props;

  const dropzoneInputRef = useRef<HTMLInputElement | null>(null);
  const fileDropzoneRef = useRef<HTMLDivElement | null>(null);
  const dropzoneTextRef = useRef<HTMLParagraphElement | null>(null);

  const onDropzoneClick = () => {
    dropzoneInputRef?.current?.click();
  };

  const { triggerToast } = useCustomToast();

  return (
    <StyledDropzone
      id={`${props.id}-dropzone`}
      ref={fileDropzoneRef}
      onClick={onDropzoneClick}
      onDropCapture={(e) => {
        e.preventDefault();
        const uploaded = e?.dataTransfer?.files[0];
        if (uploaded) {
          console.log({ uploaded });

          if (typeof onFileUploaded === "function") {
            onFileUploaded(uploaded);
          }
        }
        if (dropzoneInputRef?.current) {
          dropzoneInputRef.current.value = "";
        }

        const dropArea = fileDropzoneRef?.current;
        dropArea?.classList.remove("dragging");

        const dropzoneText = dropzoneTextRef.current;
        if (dropzoneText) {
          dropzoneText.innerText = "Click or Drag/Drop to upload your File";
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        const dropArea = fileDropzoneRef?.current;
        dropArea?.classList.add("dragging");

        const dropzoneText = dropzoneTextRef.current;
        if (dropzoneText) {
          dropzoneText.innerText = "Drop here";
        }
      }}
    >
      {context === "sign-up" ? (
        <Stack gap="0.31rem" ref={dropzoneTextRef} alignItems={"center"}>
          <UploadFileIcon />
          <Typography textAlign="center">
            <Typography className="text">
              Drag and drop your <strong>company logo file</strong> here
            </Typography>
            or &nbsp;
            <Typography className="subtext" component="span">
              {""}choose file
            </Typography>
          </Typography>
        </Stack>
      ) : (
        <Stack
          direction={"row"}
          gap="0.4rem"
          ref={dropzoneTextRef}
          alignItems={"center"}
        >
          <UploadFileIcon />
          <MuiBox
            sx={{
              display: "flex",
              flexDirection: "row",

              gap: "0.2rem",
            }}
          >
            <Typography className="text">
              Drag and drop your file here or
            </Typography>

            <Typography className="subtext" component="span">
              {""}choose file
            </Typography>
          </MuiBox>
        </Stack>
      )}

      <Input
        inputRef={dropzoneInputRef}
        type="file"
        id={`${props.id}`}
        inputProps={{
          accept:
            allowedFileMimeTypes === "*"
              ? "*"
              : allowedFileMimeTypes?.join(","),
        }}
        sx={{ display: "none" }}
        onChange={(e) => {
          //@ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const uploaded: File = e?.target?.files[0];

          if (context === "sign-up" && typeof uploadFile === "function") {
            if (["image/png", "image/jpeg"].includes(uploaded?.type)) {
              void uploadFile(uploaded, uploaded.name);
            } else {
              triggerToast({
                message: "Invalid file type, only PNGs and JPGs are allowed",
                variant: "error",
              });
              return;
            }
          } else if (context === "my-orders") {
            if (!["application/pdf"].includes(uploaded?.type)) {
              triggerToast({
                message: "Invalid file type, only PDFs are allowed",
                variant: "error",
              });
              return;
            }
          }
          if (uploaded) {
            console.log({ uploaded });

            if (typeof onFileUploaded === "function") {
              onFileUploaded(uploaded);
            }
          }

          if (dropzoneInputRef?.current) {
            dropzoneInputRef.current.value = "";
          }
        }}
      />
    </StyledDropzone>
  );
}

export default FileDropzone;

const StyledDropzone = styled(Box)(({ theme }) => ({
  borderRadius: "0.3125rem",
  border: "1px dashed #BABABA",
  borderSpacing: "5px",
  width: "auto",
  padding: "1.75rem 3.41rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  flex: 1,

  ".text": {
    textAlign: "center",
    fontWeight: 400,
    lineHeight: "normal",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.25rem",
    fontSize: "0.875rem",

    svg: {
      marginRight: "0.45rem",
    },
  },
  ".subtext": {
    fontSize: "0.875rem",
    textAlign: "center",
    fontWeight: 700,
    lineHeight: "normal",
    color: theme.palette.primary.main,
    textDecorationLine: "underline",
    textUnderlineOffset: "20%",
    textDecorationColor: theme.palette.primary.main,
  },

  [theme.breakpoints.down("sm")]: {
    padding: ".8rem",

    ".text": {
      svg: {
        marginRight: "0.2",
        justifyContent: "space-between",
      },
    },
  },
}));
