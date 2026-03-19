import { useState } from "react";

import { Grid, Stack, Typography, styled } from "@mui/material";
import IconButton from "@mui/material/IconButton";

import EditIconSVG from "~/assets/icons/edit-icon.svg";

import { toTitleCase } from "~/utils/misc";

import EditDetailModal, {
  EditableFieldData,
  EditableFieldsNames,
} from "./edit-details-dialog/edit.details.dialog";

interface InfoContainerProps {
  title: string;
  details: {
    [key: string]: {
      value: string;
      editable: boolean;
    };
  };
}

export default function InfoContainer(props: InfoContainerProps) {
  const { title, details } = props;
  const classes: { [key: string]: string } = {
    address: "info-value-truncate",
    emailAddress: "info-value-underlined",
    default: "info-value",
  };

  const fieldNames = {
    dealershipName: "dealership_name",
    phoneNumber: "phone",
    address: "dealer_address",
    jobTitle: "job_title",
    emailAddress: "email",
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFieldDetails, setEditFieldDetails] = useState<{
    fieldName: EditableFieldsNames;
    fieldData: EditableFieldData;
  } | null>(null);
  const onEditClick = (
    fieldName: EditableFieldsNames,
    fieldData: EditableFieldData,
  ) => {
    setIsEditModalOpen(true);
    setEditFieldDetails({
      fieldName,
      fieldData,
    });
  };
  return (
    <>
      <Stack gap="1.5rem">
        <Typography color="primary" fontWeight={500}>
          {title}
        </Typography>
        <Grid container gap="1.5rem" flexDirection="row">
          {Object.entries(details).map(([key, value]) => (
            <Grid item key={key} lg={2}>
              <Stack gap="0.5rem">
                <Stack flexDirection="row" gap="0.5rem" alignItems="center">
                  <Typography
                    className="info-key"
                    color="custom.subHeadlines"
                    fontWeight={500}
                  >
                    {toTitleCase(key)}
                  </Typography>

                  {value.editable && (
                    <IconButton
                      id={`edit-icon__${
                        fieldNames[key as keyof typeof fieldNames]
                      }`}
                      disableRipple
                      className="edit-icon-button"
                      sx={{ padding: "unset", height: 12, width: 12 }}
                      onClick={() => {
                        const fieldName = fieldNames[
                          key as keyof typeof fieldNames
                        ] as EditableFieldsNames;
                        onEditClick(fieldName, { value: value.value });
                        console.log(fieldName);
                      }}
                    >
                      <EditIconStyled src={EditIconSVG} alt="edit-icon" />
                    </IconButton>
                  )}
                </Stack>
                <Typography
                  className={classes[key] || classes.default}
                  fontWeight={500}
                >
                  {value.value}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Stack>
      {isEditModalOpen && editFieldDetails && (
        <EditDetailModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editFieldName={editFieldDetails?.fieldName}
          fieldData={editFieldDetails?.fieldData}
        />
      )}
    </>
  );
}

const EditIconStyled = styled("img")({
  objectFit: "contain",
  height: "100%",
  width: "100%",
});
