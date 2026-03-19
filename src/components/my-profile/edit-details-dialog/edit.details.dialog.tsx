import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import CloseIcon from "@mui/icons-material/Close";
import { Stack } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { Regexs } from "~/constants/constants";
import LocalStorageKeys from "~/constants/local-storage-keys";

import { camelCaseToSpaces, toTitleCase } from "~/utils/misc";

import { useUpdateUserMutation } from "~/store/endpoints/auth/auth";

import { AuthContextFactory } from "~/context/auth-context/auth-context";

import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

import EditDetailsForm from "./edit-details-form";

export type EditableFormValues = {
  dealership_name?: string;
  job_title?: string;
  phone?: string;
  email?: string;
  dealer_address?: string;
  dealer_city?: string;
  dealer_state?: string;
  dealer_zip_code?: string;
};

const validationSchema = yup
  .object({
    // Fields' validations are done in `submit` function handler instead of here.
    dealership_name: yup.string(),
    job_title: yup.string(),
    email: yup.string(),
    phone: yup.string(),
    dealer_address: yup.string(),
    dealer_city: yup.string(),
    dealer_state: yup.string(),
    dealer_zip_code: yup.string(),
  })
  .required();

export type EditableFieldsNames =
  | "dealership_name"
  | "phone"
  | "dealer_address"
  | "job_title"
  | "email";
export type EditableFieldData = {
  value?: string;
};
type EditDetailModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  editFieldName: EditableFieldsNames;
  fieldData: EditableFieldData;
};

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const fieldNames = {
  dealership_name: "dealershipName",
  phone: "phoneNumber",
  dealer_address: "address",
  job_title: "jobTitle",
  email: "email",
};

export default function EditDetailsDialog(props: EditDetailModalProps) {
  const { isOpen, onClose, editFieldName, fieldData } = props;

  const { triggerToast } = useCustomToast();

  const authContext = useContext(AuthContextFactory);
  const { token, user, setUser } = authContext;

  const [updateUser, updateUserMutationState] = useUpdateUserMutation();

  const methods = useForm<EditableFormValues>({
    //@ts-ignore
    resolver: yupResolver(validationSchema),
  });

  const { watch, handleSubmit, setError } = methods;

  const handleFormSubmit: SubmitHandler<EditableFormValues> = async (data) => {
    try {
      let dataToUpdate;
      if (editFieldName === "phone") {
        dataToUpdate = {
          [editFieldName]: data[editFieldName],
        };
      } else if (editFieldName === "email") {
        dataToUpdate = {
          [editFieldName]: data[editFieldName],
        };
      } else if (editFieldName === "dealer_address") {
        dataToUpdate = {
          metadata: {
            ...(user?.user?.metadata || {}),
            dealer_address: data?.dealer_address,
            dealer_city: data?.dealer_city,
            dealer_state: data?.dealer_state,
            dealer_zip_code: data?.dealer_zip_code,
          },
        };
      } else {
        dataToUpdate = {
          metadata: {
            ...(user?.user?.metadata || {}),
            [editFieldName]: data[editFieldName],
          },
        };
      }

      const validateFields = () => {
        const newValue = data[editFieldName];

        if (editFieldName === "dealership_name") {
          if (
            !Regexs.ALPHANUMERIC_AND_SPECIAL_CHARACTERS.test(newValue || "")
          ) {
            setError("dealership_name", {
              message:
                "Dealership name can only contain alphanumeric with special characters",
            });

            throw new Error("Invalid value provided.");
          }
        }
        if (editFieldName === "job_title") {
          if (
            !Regexs.ALPHANUMERIC_AND_SPECIAL_CHARACTERS.test(newValue || "")
          ) {
            setError("job_title", {
              message:
                "Job title can only contain alphanumeric with special characters",
            });

            throw new Error("Invalid value provided.");
          }
        }
        if (editFieldName === "phone") {
          if (!newValue) {
            setError("phone", {
              message: "Phone no. is required",
            });

            throw new Error("Invalid value provided.");
          }
        }
      };

      try {
        validateFields();
      } catch (error) {
        (() => {})();
        return;
      }

      const updateUserRes = await updateUser({
        data: dataToUpdate,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      console.log("%cupdateUserRes:", "background-color:green;color:white;", {
        updateUserRes,
      });

      triggerToast({
        variant: "success",
        message: "Details updated successfully!",
      });

      const setUserNewDetails = () => {
        const newUser = {
          ...(user || {}),
          user: {
            ...(user?.user || {}),
            ...updateUserRes,
          },
        };
        if (typeof setUser === "function") {
          setUser(newUser);
        }
        localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(newUser));
      };
      setUserNewDetails();

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      console.log("%cupdateUser error:", "background-color:red;color:white;", {
        error,
      });
      triggerToast({
        variant: "error",
        message: "Request failed! Some error occurred",
      });
    }
  };

  const values = watch();

  const isFieldFilled = (): boolean => {
    const value = values[editFieldName as keyof EditableFormValues];
    if (editFieldName === "dealer_address") {
      const addressFields = [
        "dealer_city",
        "dealer_state",
        "dealer_zip_code",
        "dealer_address",
      ];

      return addressFields.every(
        (field) =>
          values[field as keyof EditableFormValues] !== null &&
          values[field as keyof EditableFormValues] !== undefined &&
          values[field as keyof EditableFormValues] !== "",
      );
    }

    return value !== null && value !== undefined && value !== "";
  };

  return (
    <>
      <EditDialogStyled
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={isOpen}
      >
        <FormProvider {...methods}>
          <MuiBox
            component="form"
            className="form"
            id="form-id"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(handleFormSubmit)();
            }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              <Typography
                fontSize="1rem"
                fontWeight={500}
                color="custom.accentBlack"
              >
                Edit{" "}
                {toTitleCase(
                  fieldNames[editFieldName as keyof typeof fieldNames],
                )}
              </Typography>
            </DialogTitle>
            <IconButton
              aria-placeholder="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent dividers>
              <Stack gap="1.5rem">
                <Typography className="title-message-text">
                  Your current {camelCaseToSpaces(fieldNames[editFieldName])} is{" "}
                  <strong>{fieldData.value}</strong>
                </Typography>
                <EditDetailsForm editFieldName={editFieldName} />
              </Stack>
            </DialogContent>
            <DialogActions>
              <CButton
                sx={(theme) => ({
                  padding: "0.625rem 1rem",
                  fontWeight: 700,
                  border: `1.5px solid ${theme.palette.primary.main}`,
                })}
                id="cancel-modal-button"
                variant="outlined"
                autoFocus
                onClick={onClose}
              >
                Cancel
              </CButton>
              <CButton
                sx={{
                  padding: "0.625rem 1rem",
                  minWidth: "4.361rem",
                  fontWeight: 700,
                }}
                id="save-modal-button"
                variant="filled"
                autoFocus
                disabled={!isFieldFilled() || updateUserMutationState.isLoading}
                type="submit"
              >
                {updateUserMutationState.isLoading ? (
                  <CircularLoader size={18} color="#ffffff" />
                ) : (
                  "Save"
                )}
              </CButton>
            </DialogActions>
          </MuiBox>
        </FormProvider>
      </EditDialogStyled>
    </>
  );
}

const EditDialogStyled = styled(BootstrapDialog)(({ theme }) => ({
  ".MuiPaper-root": {
    borderRadius: "0.625rem",
    maxWidth: "25rem",
    minWidth: "20rem",
  },
  ".MuiDialogTitle-root": {
    padding: "1rem 1.25rem",
  },
  ".MuiDialogContent-root": {
    padding: "1rem 1.25rem 0.5rem 1.25rem",
  },
  ".MuiDialogActions-root": {
    padding: "0.62rem 1.25rem",
  },
  ".form-label": {
    marginBottom: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: theme.palette.custom.accentBlack,
  },
  input: {
    padding: "0.62rem",
  },
  fieldset: {
    border: `1px solid ${theme.palette.custom.tertiary} !important`,
  },

  ".title-message-text": {
    color: `${theme.palette.custom.darkGray}`,
    strong: {
      color: `${theme.palette.custom.accentBlack}`,
    },
  },
}));
