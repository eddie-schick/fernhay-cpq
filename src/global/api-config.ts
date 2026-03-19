import { ENDPOINT } from "~/constants/endpoints";

const config = {
  redirectUri: `${ENDPOINT.SSO_SUCCESS_URI}`,
  failureUri: `${ENDPOINT.SSO_FAILTURE_URI}`,
  isNewAuth: "true", // 'true' or '' empty string in case of false
};

export { config };
