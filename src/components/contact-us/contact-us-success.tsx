import { Typography, styled } from "@mui/material";

import { ContactSuccessIcon } from "~/global/icons";

import MuiBox from "../shared/mui-box/mui-box";

const ContactUsSuccess = () => {
  return (
    <StyledContactSuccess>
      <ContactSuccessIcon className="contact-success-icon" />
      <MuiBox className="contact-success-content">
        <Typography className="contact-success-content-header">
          Contact Us
        </Typography>
        <Typography className="contact-success-content-text">
          Your message has been successfully sent. Our sales team will get back
          to you shortly.
        </Typography>
      </MuiBox>
    </StyledContactSuccess>
  );
};

const StyledContactSuccess = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "1rem 1rem 0rem 1rem",

  ".contact-success-icon": {
    ".contact-success_svg__main-circle": {
      stroke: theme.palette.primary.main,
    },
    ".contact-success_svg__message-box-outer": {
      fill: theme.palette.primary.main,
    },
    ".contact-success_svg__message-box-inner": {
      fill: theme.palette.primary.main,
    },
  },

  ".contact-success-content": {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  ".contact-success-content-header": {
    fontWeight: 500,
    marginTop: "0.5rem",
  },

  ".contact-success-content-text": {
    fontSize: "14px",
    maxWidth: "17.25rem",
  },
}));

export default ContactUsSuccess;
