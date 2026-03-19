export function convertWeeksToDays(weeks: number) {
  return weeks * 7;
}

export function getLeadTimeInDays(
  leadtime: number,
  leadtimeUnit?: "day" | "week",
) {
  if (leadtimeUnit === "week") {
    return convertWeeksToDays(leadtime);
  }

  return leadtime;
}

export function getWeightInLbs(weight: number, weightUnit?: "kg" | "lbs") {
  if (weightUnit === "kg") {
    return weight * 2.20462;
  }

  return weight;
}
