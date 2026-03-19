import Envs from "./envs";

const ENDPOINT = {
  // Base url
  BASE_URL: import.meta.env.VITE_BASE_URL,
  // Auth
  GOOGLE_SSO: import.meta.env.VITE_GOOGLE_SSO,
  MICROSOFT_SSO: import.meta.env.VITE_MICROSOFT_SSO,
  SSO_FAILTURE_URI: import.meta.env.VITE_SSO_FAILTURE_URI,
  SSO_SUCCESS_URI: import.meta.env.VITE_SSO_SUCCESS_URI,
  AUTH_SERVICE_URI: import.meta.env.VITE_AUTH_SERVICE_URI,
  SUSPICIOUS_LOGIN_REPORT: `${import.meta.env.VITE_AUTH_SERVICE_URI}/auth/report`,
  AUTH_SERVICE_API_KEY: import.meta.env.VITE_AUTH_SERVICE_API_KEY,
  // misc
  GET_SIGNED_URL_CLOUD_FUNCTION:
    "https://us-central1-arcane-transit-357411.cloudfunctions.net/get-signed-url",
  DATADOG_SUBMIT_COUNT_METRIC: `${Envs.BACKEND_URL}/datadog/submit-count-metric`,
  PUSH_TO_CEVS: `${Envs.BACKEND_URL}/retisio/products`,
} as const;

export { ENDPOINT };
