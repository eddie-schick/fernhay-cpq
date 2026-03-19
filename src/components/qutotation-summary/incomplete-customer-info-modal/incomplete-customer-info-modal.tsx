import { Close } from "@mui/icons-material";
import { Modal, Typography, styled } from "@mui/material";

import { CautionCircularIcon } from "~/global/icons";
import { muiModalBaseStyles } from "~/global/styles/mui-styles";

import MuiBox from "~/components/shared/mui-box/mui-box";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};
export default function IncompleteCustomerInfoModal(props: Props) {
  const { isOpen, onClose } = props;

  return (
    <IncompleteCustomerInfoModalStyled open={Boolean(isOpen)} onClose={onClose}>
      <MuiBox
        sx={{
          ...muiModalBaseStyles,
          width: "95vw",
          maxWidth: "21.4375rem",
          borderRadius: "0.625rem",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <MuiBox component="header" className="modal-header">
          <Close className="close-icon" onClick={onClose} />
        </MuiBox>

        <CautionCircularIcon />

        <Typography className="modal-heading">
          Incomplete Customer Information
        </Typography>

        <Typography className="message-text">
          Before proceeding, please ensure that <strong>all</strong> required
          customer information fields are filled in. Failure to provide complete
          customer details may result in an <strong>incomplete</strong> or{" "}
          <strong>inaccurate quote</strong>.
        </Typography>
      </MuiBox>
    </IncompleteCustomerInfoModalStyled>
  );
}

const IncompleteCustomerInfoModalStyled = styled(Modal)(({ theme }) => ({
  ".modal-header": {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },

  ".close-icon": {
    color: theme.palette.custom.greyAccent,
    fontSize: "1.5rem",
    cursor: "pointer",
  },

  ".modal-heading": {
    marginBlock: "0.5rem",
    fontSize: "1rem",
    fontWeight: 500,
  },

  ".message-text": {
    textAlign: "center",
    fontSize: "0.875rem",
    maxWidth: "17.25rem",

    strong: {
      fontWeight: 700,
    },
  },
}));
