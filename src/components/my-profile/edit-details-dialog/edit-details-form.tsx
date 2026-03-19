import { useEffect, useMemo, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";

import {
  Autocomplete,
  FormControl,
  TextField,
  Typography,
} from "@mui/material";

import LocalStorageKeys from "~/constants/local-storage-keys";

import { formatPhoneNumber } from "~/utils/misc";

import useGoogleAddress from "~/global/custom-hooks/useGoogleAddress/useGoogleAddress";

import { useGetDealerShipNamesQuery } from "~/store/endpoints/dealership/dealership";

import MuiBox from "~/components/shared/mui-box/mui-box";
import CustomPhoneInput from "~/components/shared/ui/phone-input.tsx/phone-input";

import { EditableFormValues } from "./edit.details.dialog";

export default function EditDetailsForm({
  editFieldName,
}: {
  editFieldName: string;
}) {
  const { control, formState, getValues, setValue, trigger } =
    useFormContext<EditableFormValues>();
  const { errors } = formState;
  const inputRef = useRef<HTMLInputElement>(null);

  console.log("%cvalues:", "background-color:pink", {
    values: getValues(),
  });

  const handleAddressChange = (
    address: string,
    zipCode: string,
    city: string,
    state: string,
  ) => {
    setValue("dealer_address", address);
    setValue("dealer_zip_code", zipCode);
    setValue("dealer_city", city);
    setValue("dealer_state", state);
  };

  const { initAutocomplete } = useGoogleAddress({
    handleAddressChange,
  });

  useEffect(() => {
    if (inputRef.current) {
      initAutocomplete(inputRef);
    }
  }, [initAutocomplete]);

  const dealerShipNamesQueryState = useGetDealerShipNamesQuery({
    headers: {
      Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
    },
  });

  const dealerShipNames = useMemo(() => {
    let names: string[] | { label: string }[] = [{ label: "" }];

    if (dealerShipNamesQueryState?.isSuccess) {
      names = (dealerShipNamesQueryState?.data as string[]) || [{ label: "" }];
      names =
        names.length > 0
          ? names
              .filter((filterName) => filterName !== null)
              .map((name) => ({
                label: name,
              }))
          : [{ label: "" }];
    }

    return names;
  }, [dealerShipNamesQueryState?.data, dealerShipNamesQueryState?.isSuccess]);

  return (
    <>
      {editFieldName === "dealership_name" && (
        <FormControl fullWidth className="form-control">
          <label htmlFor="input-dealership" className="form-label">
            Dealership Name
          </label>
          <Autocomplete
            freeSolo
            options={[...dealerShipNames]}
            onChange={(e, val) => {
              const { label } = (val || {}) as { label: string };
              setValue("dealership_name", label);

              void trigger("dealership_name");
            }}
            onInputChange={(e, val) => {
              if (!val) {
                setValue("dealership_name", val);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="input-dealership"
                placeholder="Enter dealership name"
                className="input--text autocomplete-input"
                type="text"
                onChange={(e) => setValue("dealership_name", e.target.value)}
              />
            )}
          />
          <Typography className="form-error-text">
            {errors?.dealership_name?.message}
          </Typography>
        </FormControl>
      )}

      {editFieldName === "job_title" && (
        <FormControl fullWidth className="form-control">
          <label htmlFor="input-job-title" className="form-label">
            Job Title
          </label>
          <Controller
            name="job_title"
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                {...field}
                placeholder="Job Title"
                id="job-title-input"
                variant="outlined"
              />
            )}
          />
          <Typography className="form-error-text">
            {errors?.job_title?.message}
          </Typography>
        </FormControl>
      )}
      {editFieldName === "email" && (
        <FormControl fullWidth className="form-control">
          <label htmlFor="input-email" className="form-label">
            Email
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                {...field}
                placeholder="Email Address"
                id="email-address-input"
                variant="outlined"
              />
            )}
          />
          <Typography className="form-error-text">
            {errors?.email?.message}
          </Typography>
        </FormControl>
      )}

      {editFieldName === "phone" && (
        <FormControl fullWidth className="form-control">
          <label htmlFor="input-phone-number" className="form-label">
            Phone Number
          </label>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, ref, value, name, onBlur } }) => (
              <CustomPhoneInput
                onChange={(e, countryData) =>
                  onChange(formatPhoneNumber(e, countryData.format))
                }
                value={value as string}
                onBlur={onBlur}
                ref={ref}
                id="input-phone-number"
                placeholder="Enter your phone number"
                name={name}
              />
            )}
          />
          <Typography className="form-error-text">
            {errors?.phone?.message}
          </Typography>
        </FormControl>
      )}

      {editFieldName === "dealer_address" && (
        <>
          <FormControl fullWidth className="form-control">
            <label htmlFor="input-dealer-address" className="form-label">
              Dealer Address
            </label>
            <Controller
              name="dealer_address"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  inputRef={inputRef}
                  {...field}
                  placeholder="Dealer Address"
                  variant="outlined"
                  id="dealer-address-input"
                />
              )}
            />
            <Typography className="form-error-text">
              {errors?.dealer_address?.message}
            </Typography>
          </FormControl>

          <FormControl fullWidth className="form-control">
            <label htmlFor="input-city" className="form-label">
              City
            </label>
            <Controller
              name="dealer_city"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  {...field}
                  placeholder="City"
                  variant="outlined"
                  id="dealer-city-input"
                />
              )}
            />
            <Typography className="form-error-text">
              {errors?.dealer_city?.message}
            </Typography>
          </FormControl>
          <MuiBox
            sx={{
              display: "flex",
              columnGap: "1rem",
            }}
          >
            <FormControl fullWidth className="form-control">
              <label htmlFor="input-state" className="form-label">
                State
              </label>
              <Controller
                name="dealer_state"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    {...field}
                    placeholder="State"
                    variant="outlined"
                    id="dealer-state-input"
                  />
                )}
              />
              <Typography className="form-error-text">
                {errors?.dealer_state?.message}
              </Typography>
            </FormControl>

            <FormControl fullWidth className="form-control">
              <label htmlFor="input-zip-code" className="form-label">
                Zip Code
              </label>
              <Controller
                name="dealer_zip_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    {...field}
                    placeholder="Zip Code"
                    id="dealer-zip-code-input"
                    variant="outlined"
                  />
                )}
              />
              <Typography className="form-error-text">
                {errors?.dealer_zip_code?.message}
              </Typography>
            </FormControl>
          </MuiBox>
        </>
      )}
    </>
  );
}
