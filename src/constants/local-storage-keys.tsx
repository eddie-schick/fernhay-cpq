import Envs from "./envs";

const APP_PREFIX = `shaed:cpq-${(Envs?.APP_NAME || "")?.toLowerCase()}:`;

const LocalStorageKeys = {
  USER: `${APP_PREFIX}user`,
  TOKEN: `${APP_PREFIX}token`,
  TEMP_TOKEN: `${APP_PREFIX}temp-token`,
  SSO_TOKEN: `${APP_PREFIX}sso-token`,
  DEALER_DETAILS: `${APP_PREFIX}dealer-details`,
  IS_SSO_SIGNUP: `${APP_PREFIX}sso-signup`,
  EXCLUDE_DATADOG_RUM: `${APP_PREFIX}exclude-datadog-rum`,
  SIGNUP_ACTIVE_STEP_TEMP_FLAG: `${APP_PREFIX}tempActiveStepFlag`,
} as const;

export default LocalStorageKeys;
