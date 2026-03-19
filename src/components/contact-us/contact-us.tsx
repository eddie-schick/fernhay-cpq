import { SubmitHandler, useForm } from "react-hook-form";

import { Typography, styled } from "@mui/material";

import { submitDatadogCountMetric } from "~/helpers/datadog-helpers";

import { useAppSelector } from "~/store";
import {
  usePushEventsLogsToDBMutation,
  useSendContactEmailMutation,
} from "~/store/endpoints/misc/misc";
import { rootSelector } from "~/store/slices/root/slice";

import { useAuthContextValue } from "~/context/auth-context";

import { CModalFooter } from "../common/c-modal/c-modal";
import MuiBox from "../shared/mui-box/mui-box";
import useCustomToast from "../shared/use-custom-toast/use-custom-toast";

export type ContactUsInputs = {
  name: string;
  message: string;
  email: string;
  companyName: string;
  phoneNumber: string;
};

const ContactUs = ({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) => {
  const rootSlice = useAppSelector(rootSelector);

  const { user } = useAuthContextValue();

  const INPUT_MIN_LENGTH = 5;

  const {
    register,
    handleSubmit,
    formState: { errors },

    watch,
  } = useForm<ContactUsInputs>({
    defaultValues: {
      name: user?.user?.name || "",
      email: user?.user?.email || "",
      phoneNumber: user?.user?.phone || "",
      companyName: user?.user?.metadata?.dealership_name || "",
      message: "",
    },
  });

  const isError = Object.keys(errors).length > 0;

  const { triggerToast } = useCustomToast();

  const [sendEmail, sendEmailQueryState] = useSendContactEmailMutation();
  const [pushEventsLogsToDB] = usePushEventsLogsToDBMutation();

  const areFieldsFilled = () => {
    const fieldsToCheck = [
      "name",
      "companyName",
      "phoneNumber",
      "message",
      "email",
    ] as readonly (
      | "name"
      | "message"
      | "email"
      | "companyName"
      | "phoneNumber"
    )[];

    for (const field of fieldsToCheck) {
      const value = watch(field);
      if (Array.isArray(value)) {
        if (value.some((val) => !val)) {
          return false;
        }
      } else {
        if (!value || !value) {
          return false;
        }
      }
    }

    return true;
  };

  const onSubmit: SubmitHandler<ContactUsInputs> = async (data) => {
    try {
      const response = await sendEmail({ data, headers: {} });

      if (response) {
        onSuccess();

        void pushEventsLogsToDB({
          events: [
            {
              metric: `${(
                rootSlice?.appSettings?.name || ""
              )?.toLowerCase()}_cpq:contact_us_form`,
              miscDetails: {
                userEmail: user?.user?.email,
                userName: user?.user?.name,
              },
            },
          ],
        });
        submitDatadogCountMetric({
          metric: `${(
            rootSlice?.appSettings?.name || ""
          )?.toLowerCase()}_cpq.contact_us_form`,
          tags: [
            `user.email:${user?.user?.email}`,
            `user.name:${user?.user?.name}`,
          ],
        });
      }
    } catch (error) {
      console.log(JSON.stringify(error));

      triggerToast({
        variant: "error",
        message: "An error occured",
      });
    }
  };

  return (
    <>
      <ContactUsStyled>
        <form>
          <MuiBox className="contact-us-top">
            <MuiBox className="contact-us-input-container">
              <MuiBox className="contact-us-label-container">
                <Typography>
                  Your Name{" "}
                  <Typography
                    className="contact-us-mandatory-asterisk-mark"
                    component="span"
                  >
                    *
                  </Typography>
                </Typography>
                {/*<InfoIcon />*/}
              </MuiBox>
              <input
                id="input-fullname"
                placeholder="Enter your full name"
                className="contact-input--text"
                type="text"
                {...register("name", {
                  required: true,
                  minLength: {
                    value: INPUT_MIN_LENGTH,
                    message: "Full name must be at least 5 characters long",
                  },
                  validate: (value) =>
                    /^[A-Za-z].*$/i.test(value) ||
                    "Full name must contain at least one alphabet",
                })}
              />
              {errors.name && (
                <Typography variant="caption" color="error">
                  {errors?.name?.message || "Your Name is required."}
                </Typography>
              )}
            </MuiBox>
            <MuiBox className="contact-us-input-container">
              <MuiBox className="contact-us-label-container">
                <Typography>
                  Email{" "}
                  <Typography
                    className="contact-us-mandatory-asterisk-mark"
                    component="span"
                  >
                    *
                  </Typography>
                </Typography>
                {/*<InfoIcon />*/}
              </MuiBox>
              <input
                id="input-fullname"
                placeholder="Enter your Email"
                className="contact-input--text"
                type="text"
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <Typography variant="caption" color="error">
                  {errors?.email?.message || "Email is Required"}
                </Typography>
              )}
            </MuiBox>
            <MuiBox className="contact-us-input-container">
              <MuiBox className="contact-us-label-container">
                <Typography>
                  Phone Number{" "}
                  <Typography
                    className="contact-us-mandatory-asterisk-mark"
                    component="span"
                  >
                    *
                  </Typography>
                </Typography>
                {/* <InfoIcon /> */}
              </MuiBox>
              <input
                id="input-fullname"
                placeholder="Enter your phone nuber"
                className="contact-input--text"
                type="text"
                {...register("phoneNumber", {
                  required: true,
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                })}
              />
              {errors.phoneNumber && (
                <Typography variant="caption" color="error">
                  {errors?.phoneNumber?.message || "Phone is Required"}
                </Typography>
              )}
            </MuiBox>
            <MuiBox className="contact-us-input-container">
              <MuiBox className="contact-us-label-container">
                <Typography>
                  Company Name{" "}
                  <Typography
                    className="contact-us-mandatory-asterisk-mark"
                    component="span"
                  >
                    *
                  </Typography>
                </Typography>
                {/*<InfoIcon />*/}
              </MuiBox>
              <input
                id="input-fullname"
                placeholder="Enter your company name"
                className="contact-input--text"
                type="text"
                {...register("companyName", {
                  required: true,
                  validate: (value) =>
                    /^[A-Za-z].*$/i.test(value) ||
                    "Company name must contain at least one alphabet",
                })}
              />
              {errors.companyName && (
                <Typography variant="caption" color="error">
                  {errors?.companyName?.message || "Company name is Required"}
                </Typography>
              )}
            </MuiBox>
          </MuiBox>
          <MuiBox className="message-container">
            <MuiBox className="contact-us-label-container">
              <Typography>
                Message{" "}
                <Typography
                  className="contact-us-mandatory-asterisk-mark"
                  component="span"
                >
                  *
                </Typography>
              </Typography>
              {/*<InfoIcon />*/}
            </MuiBox>
            <textarea
              placeholder="Type here "
              className="contact-input--richtext"
              {...register("message", { required: true })} // Registering textarea with React Hook Form
            />
            {errors.message && (
              <Typography variant="caption" color="error">
                {errors?.message?.message || "Company name is Required"}
              </Typography>
            )}
          </MuiBox>
        </form>
        <CModalFooter
          isError={isError || !areFieldsFilled()}
          onSubmit={() => void handleSubmit(onSubmit)()}
          isLoading={sendEmailQueryState?.isLoading || false}
          onCancel={onCancel}
        />
      </ContactUsStyled>
    </>
  );
};

const ContactUsStyled = styled(MuiBox)(({ theme }) => ({
  paddingInline: "20px",
  paddingBottom: "2.5rem",
  paddingTop: "2rem",
  [theme.breakpoints.down("sm")]: {
    paddingInline: "1rem",
  },
  ".contact-us-top": {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "1rem",
    rowGap: "1.5rem",
  },

  ".contact-us-input-container": {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.5rem",
    width: "47%",

    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },

  ".contact-us-label-container": {
    display: "flex",
    flexDirection: "row",
    gap: "0.5rem",
    alignItems: "center",

    p: {
      fontSize: "0.875rem",
      color: theme.palette.custom.subHeadlines,
      fontWeight: 500,
    },
  },

  ".contact-us-mandatory-asterisk-mark": {
    color: theme.palette.custom.error_400,
  },

  ".contact-input--text": {
    padding: "0.75rem 0.75rem",
    border: `1px solid ${theme.palette.custom.tertiary}`,
    borderRadius: "0.3125rem",
    width: "100%",
    background: theme.palette.custom.lightGrayBg,
    color: theme.palette.custom.accentBlack,
    "&:focus": {
      borderColor: theme.palette.primary.main,
    },
  },

  ".contact-input--richtext": {
    padding: "0.75rem 0.75rem",
    border: `1px solid ${theme.palette.custom.tertiary}`,
    borderRadius: "0.3125rem",
    width: "100%",
    height: "9rem",
    resize: "none",
    color: theme.palette.custom.accentBlack,
  },

  ".message-container": {
    marginTop: "1.5rem",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
}));

export default ContactUs;
