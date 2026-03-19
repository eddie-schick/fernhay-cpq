import React from "react";

import { Grid, Stack, Typography, styled } from "@mui/material";
import Box from "@mui/material/Box";

import { DeleteIcon, FileIcon } from "~/global/icons";

import FileUploadProgress from "./file-upload-progress";

export default function FileDetails({
  currentFile,
  progress,
  handleCancelUpload,
  handleRemoveFile,
  shouldDisplayLogo,
}: {
  currentFile: File;
  progress: number;
  shouldDisplayLogo: boolean;
  handleCancelUpload: () => void;
  handleRemoveFile: () => void;
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const fileSizeInBytes = currentFile.size;
  const fileSizeInMB = fileSizeInBytes / 1024 / 1024;
  const roundedFileSizeInMB = fileSizeInMB.toFixed(2);
  React.useEffect(() => {
    if (currentFile) {
      const fileBlob = new Blob([currentFile], { type: currentFile.type });
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(fileBlob);
    }
  }, [currentFile]);

  const handleCancleRequest = () => {
    handleCancelUpload();
    handleRemoveFile();
  };

  return (
    <>
      {progress < 100 ? (
        <Container>
          <Stack className="box" gap="0.5rem" width="100%">
            <Grid container rowGap="0.75rem">
              <Grid item xs={6}>
                <Stack flexDirection="row" alignItems="center" gap="0.4rem">
                  <FileIcon />
                  <Typography maxWidth="8rem" textOverflow="hidden" noWrap>
                    {currentFile.name}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack alignItems="flex-end">
                  <DeleteIcon
                    className="icon"
                    id="delete-icon-1"
                    onClick={handleCancleRequest}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Typography fontSize="0.85rem">{`File size - ${roundedFileSizeInMB}MB`}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography fontSize="0.85rem" textAlign="right">{`${Math.round(
                  progress
                )}%`}</Typography>
              </Grid>
            </Grid>
            <FileUploadProgress progress={progress} />
          </Stack>
        </Container>
      ) : (
        <>
          {shouldDisplayLogo && (
            <Stack gap="0.8rem" flexDirection="row" alignItems="center">
              <ImageContainer>
                <img src={imageUrl} alt="" height="100%" width="100%" />
              </ImageContainer>
              <DeleteIcon
                className="icon"
                id="delete-icon-2"
                onClick={handleRemoveFile}
                style={{ cursor: "pointer" }}
              />
            </Stack>
          )}
        </>
      )}
    </>
  );
}

const Container = styled(Box)(({ theme }) => ({
  borderRadius: "0.3125rem",
  border: `1px dashed ${theme.palette.custom.greyAccent}`,
  borderSpacing: "5px",
  width: "auto",
  padding: "1.25rem 1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  minHeight: "137.95px",
  flex: 1,
  ".box": {
    borderRadius: "0.3125rem",
    border: `0.5px solid ${theme.palette.custom.greyAccent}`,
    padding: "1rem",
    background: theme.palette.custom.backroundLight,
  },
  ".icon": {
    cursor: "pointer",
  },
}));

const ImageContainer = styled(Box)({
  width: "3.7475rem",
  height: "3.7475rem",
  marginLeft: "0.5rem",
});
