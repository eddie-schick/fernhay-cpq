import { Box, Typography, styled } from "@mui/material";

import { preventNonNumericalInput } from "~/utils/misc";

import {
  DecreaseQuantityDisabledIconSvg,
  DecreaseQuantityEnabledIconSvg,
  IncreaseQuantityDisabledIconSvg,
  IncreaseQuantityEnabledIconSvg,
} from "~/global/icons";

import MuiBox from "~/components/shared/mui-box/mui-box";

const QUANTITY_LOWER_LIMIT = 1;
const QUANTITY_UPPER_LIMIT = 99;
type OrderQuantityProps = {
  totalQuantity?: number;
  onQuantityChange: (newQuantity: number) => void;
};
export default function OrderQuantity(props: OrderQuantityProps) {
  const { totalQuantity = QUANTITY_LOWER_LIMIT, onQuantityChange } = props;

  const onTotalQuantityChange:
    | React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined = (event) => {
    const newQuantity = Number(event.target.value);

    if (newQuantity > QUANTITY_UPPER_LIMIT) {
      return;
    }

    onQuantityChange(newQuantity || QUANTITY_LOWER_LIMIT);
  };

  const handleFleetQuantityChange = (operator: "inc" | "dec") => {
    const newQuantity =
      operator === "dec" ? totalQuantity - 1 : totalQuantity + 1;

    if (
      newQuantity > QUANTITY_UPPER_LIMIT ||
      newQuantity < QUANTITY_LOWER_LIMIT
    )
      return;

    onQuantityChange(newQuantity);
  };

  return (
    <OrderQuantityStyled>
      <Typography className="option-heading">Order Quantity</Typography>
      <Typography sx={{ marginBottom: "0.5rem" }}>
        You can order Retail or a Fleet by changing the quantity
      </Typography>

      <MuiBox className="quantity-input-container">
        {totalQuantity === QUANTITY_LOWER_LIMIT ? (
          <DecreaseQuantityDisabledIconSvg
            id="decrease-quantity-icon-disabled"
            className="change-quantity-icon change-quantity-icon--disabled"
          />
        ) : (
          <DecreaseQuantityEnabledIconSvg
            id="increase-quantity-icon-enabled"
            className="change-quantity-icon"
            onClick={() => handleFleetQuantityChange("dec")}
          />
        )}
        <input
          type="number"
          id="order-quantity-input-box"
          className="quantity-input input--number"
          min={1}
          max={99}
          value={totalQuantity}
          onKeyDown={(e) => preventNonNumericalInput(e)}
          onChange={onTotalQuantityChange}
        />

        {totalQuantity >= QUANTITY_UPPER_LIMIT ? (
          <IncreaseQuantityDisabledIconSvg
            id="increase-quantity-icon-disabled"
            className="change-quantity-icon change-quantity-icon--disabled"
          />
        ) : (
          <IncreaseQuantityEnabledIconSvg
            id="increase-quantity-icon-enabled"
            className="change-quantity-icon"
            onClick={() => handleFleetQuantityChange("inc")}
          />
        )}
      </MuiBox>
    </OrderQuantityStyled>
  );
}

const OrderQuantityStyled = styled(Box)(() => ({
  ".quantity-input-container": {
    display: "flex",
    alignItems: "center",
    gap: "0.875rem",
  },

  ".quantity-input": {
    maxWidth: "1.25rem",
    textAlign: "center",
  },

  ".change-quantity-icon": {
    cursor: "pointer",
    minHeight: "1.5rem",
    minWidth: "1.5rem",
  },
  ".change-quantity-icon--disabled": {
    pointerEvents: "none",
  },
}));
