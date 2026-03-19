import { useState } from "react";

import Close from "@mui/icons-material/Close";
import { Modal, TextField, Typography, styled } from "@mui/material";

import CButton from "~/components/common/cbutton/cbutton";

import MuiBox from "../mui-box/mui-box";

const MAX_CHARACTER_LIMIT = 200;

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  initialDescription?: string;
  isEditable?: boolean;
  onSave?: (newValue: string) => void;
};
export default function VehicleDescriptionModal(props: Props) {
  const {
    isOpen,
    onClose,
    initialDescription = "",
    isEditable = true,
    onSave,
  } = props;

  const [description, setDescription] = useState<string>(initialDescription);

  const onDescriptionChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    const value = e.target.value;

    if (value.length > MAX_CHARACTER_LIMIT) return;

    setDescription(value);
  };

  const onSaveClick = () => {
    if (typeof onSave === "function") {
      onSave(description);
    }
  };

  return (
    <VehicleDescriptionModalStyled open={isOpen || false} onClose={onClose}>
      <MuiBox
        sx={(theme) => ({
          width: "95vw",
          maxWidth: "27.6875rem",
          maxHeight: "33.375rem",
          borderRadius: "0.625rem",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: theme.palette.custom.baseWhite,
          boxShadow: 24,
          p: 0,
          zIndex: 2,
        })}
      >
        <MuiBox component="header" className="modal-header">
          <Typography className="vehicle-description-text">
            Vehicle Description
          </Typography>

          <Close id="close-button" className="close-icon" onClick={onClose} />
        </MuiBox>

        <MuiBox component="main" className="modal-main">
          <TextField
            id="description-input"
            placeholder="Add Description"
            type="text"
            multiline
            rows={3}
            className="vehicle-description-input"
            value={description}
            onChange={onDescriptionChange}
            disabled={!isEditable}
          />
          <Typography className="character-limit-text">
            {description.length}/{MAX_CHARACTER_LIMIT}
          </Typography>
        </MuiBox>

        <MuiBox component="footer" className="modal-footer">
          <MuiBox className="save-button-container">
            {isEditable ? (
              <CButton id="save-button" onClick={onSaveClick}>
                Save
              </CButton>
            ) : (
              <CButton
                id="go-back-button"
                variant="outlined"
                onClick={onClose ? onClose : undefined}
              >
                Go Back
              </CButton>
            )}
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </VehicleDescriptionModalStyled>
  );
}

const VehicleDescriptionModalStyled = styled(Modal)(({ theme }) => ({
  ".modal-header": {
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.custom.tertiary}`,
  },

  ".vehicle-description-text": {
    fontSize: "1rem",
    fontWeight: 500,
    color: theme.palette.custom.accentBlack,
  },

  ".close-icon": {
    color: "#9a9393",
    height: "1.25rem",
    width: "1.25rem",
    cursor: "pointer",
  },

  ".character-limit-text": {
    color: theme.palette.custom.lightGray,
    fontSize: "0.6875rem",
    textAlign: "left",
    marginTop: "0.625rem",
  },

  ".modal-main": {
    padding: "20px",
  },

  ".vehicle-description-input": {
    width: "100%",
  },

  ".vehicle-description-input .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: "0.3125rem",
    fontSize: "0.875rem",
  },

  ".vehicle-description-input .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.custom.tertiary,
  },

  ".modal-footer": {
    padding: "10px 20px",
    borderTop: `1px solid ${theme.palette.custom.tertiary}`,
  },

  ".save-button-container": {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "0.8125rem",
  },

  ".save-button-container button": {
    borderRadius: "0.3125rem",
    fontSize: "0.825rem",
    paddingInline: "16px",
    paddingBlock: "10px",
    fontWeight: 700,
  },
}));
