import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import { Box, styled } from "@mui/material";

import { Regexs } from "~/constants/constants";

import AuthPagesLayout from "~/layout/auth-pages-layout/auth-pages-layout";

import EmailLoginCard from "~/components/auth/email-login-card/email-login-card";
import AlreadyHaveAccountText from "~/components/shared/already-have-account-text/already-have-account-text";
import CustomStepper from "~/components/sign-up/custom-stepper";
import SignUpForm from "~/components/sign-up/sign-up-form";

export type SignUpFormInputs = {
  fullName: string;
  dealershipName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;
  dealerAddress: string;
  city: string;
  state: string;
  zipCode: string;
  companyLogo?: File;
  companyLogoUrl?: string;
};

const alphabetWithSpacesOnlyRegex = /^(?=.*[a-zA-Z]).*$/;
const alphaNumericSpecialCharacterNoSpacesRegex =
  /^(?!\s+$)(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()-_=+[\]{};:'",.<>?`~|\\/ ]*$/;

const schema = yup.object().shape({
  fullName: yup
    .string()
    .matches(
      Regexs.ALPHABET_WITH_SPACES_BUT_NOT_ONLY_SPACES,
      "Full name must contain only alphabet",
    )
    .required("Full Name is required"),
  dealershipName: yup
    .string()
    .matches(
      alphaNumericSpecialCharacterNoSpacesRegex,
      "Dealership name can only contain alphanumeric with special characters",
    )
    .required("Dealership Name is required"),
  jobTitle: yup
    .string()
    .matches(
      alphaNumericSpecialCharacterNoSpacesRegex,
      "Job title can only contain alphanumeric with special characters",
    )
    .required("Job Title is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: yup.string().required("Phone Number is required"),
  dealerAddress: yup.string().required("Dealer Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zipCode: yup.string().required("Zip Code is required"),
});
export default function SignUpPage() {
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const methods = useForm<SignUpFormInputs>({
    resolver: yupResolver(schema),
  });

  return (
    <AuthPagesLayout isSignupPage={true}>
      <SignUpPageStyled>
        <CustomStepper activeStep={activeStep} setActiveStep={setActiveStep} />
        <FormProvider {...methods}>
          <>
            {activeStep === 0 ? (
              <EmailLoginCard
                footerSlot={<AlreadyHaveAccountText />}
                setActiveStep={setActiveStep}
                isSignupPage={true}
              />
            ) : (
              <SignUpForm />
            )}
          </>
        </FormProvider>
      </SignUpPageStyled>
    </AuthPagesLayout>
  );
}

const SignUpPageStyled = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "4rem",
  // justifyContent: "center",
  alignItems: "center",
  backgroundColor: theme.palette.custom.shaedBrand2_25,
  paddingBottom: "3rem",
  paddingTop: "5rem",
}));
