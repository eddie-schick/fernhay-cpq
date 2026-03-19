import { Checkbox, FormControlLabel, Typography, styled } from "@mui/material";

import useIncrementalIds from "~/global/custom-hooks/useIncrementalIds";

import MuiBox from "~/components/shared/mui-box/mui-box";

interface CheckBoxFilterProps {
  content: {
    isChecked: boolean;
    title: string;
    id: number | string | undefined;

    kontentAi__item__codename: string;
  }[];
  onCheckboxChange: (
    isCheck: boolean,
    id: number | string | undefined,
    title: string,

    kontentAi__item__codename: string
  ) => void;
  id: string;
}

const CheckBoxFilter = (props: CheckBoxFilterProps) => {
  const { content } = props;

  console.log("mobcontent", content);

  if (!content.length)
    return (
      <StyledCheckBoxFilterSection>
        <Typography
          sx={(theme) => ({ color: theme.palette.custom.accentBlack })}
        >
          No options found
        </Typography>
      </StyledCheckBoxFilterSection>
    );

  return (
    <StyledCheckBoxFilterSection>
      {content.map((el) => {
        return (
          <CustomCheckbox
            key={el.id}
            label={el.title}
            value={el.id}
            checked={el.isChecked}
            item={el}
            onCheckboxChange={props.onCheckboxChange}
            id={props.id}
          />
        );
      })}
    </StyledCheckBoxFilterSection>
  );
};

function CustomCheckbox(props: {
  label: string;
  value: number | string | undefined;
  checked: boolean;
  onCheckboxChange: (
    isCheck: boolean,
    id: number | string | undefined,
    title: string,

    kontentAi__item__codename: string
  ) => void;
  item: {
    isChecked: boolean;
    title: string;
    id: number | string | undefined;

    kontentAi__item__codename: string;
  };
  id: string;
}) {
  const onCheckboxChangeLocal = (
    event: React.ChangeEvent<HTMLInputElement>,
    checkbox: CheckBoxFilterProps["content"][0]
  ) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { id, title, kontentAi__item__codename } = checkbox;
    console.log({ id });
    props.onCheckboxChange(
      event.target.checked,
      id,
      title,
      kontentAi__item__codename
    );
  };
  const testId = useIncrementalIds({ ReactElement: Checkbox });
  return (
    <FormControlLabel
      label={props.label}
      value={props.value}
      control={
        <Checkbox
          id={`${props.id}-checkbox-${testId}`}
          sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
          className="checkbox"
          disableRipple
          onChange={(e) => onCheckboxChangeLocal(e, props.item)}
          checked={props.checked}
        />
      }
    />
  );
}

export default CheckBoxFilter;

export const StyledCheckBoxFilterSection = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  padding: "2rem",
  flexDirection: "column",
  gap: "0.75rem",
  fontSize: "0.875rem",

  ".MuiFormControlLabel-label": {
    fontSize: "0.875rem",
    color: theme.palette.custom.accentBlack,
  },

  ".MuiCheckbox-root": {
    paddingTop: 0,
    paddingBottom: 0,
  },
  ".checkbox.Mui-checked": {
    color: `${theme.palette.primary.main} !important`,
  },
}));
