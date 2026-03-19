import { useCallback } from "react";

import { ENDPOINT } from "~/constants/endpoints";

import { config } from "~/global/api-config";
import { GoogleIconSvg32x32, OfficeIconSvg32x32 } from "~/global/icons";

import MuiBox from "~/components/shared/mui-box/mui-box";

export default function SSOLogin() {
  console.log("configs", config);

  const handleGoogleSSO = useCallback(() => {
    try {
      const { redirectUri, failureUri } = config;

      const endpoint = `${ENDPOINT.AUTH_SERVICE_URI}${ENDPOINT.GOOGLE_SSO}?callbackUri=${redirectUri}&failureUri=${failureUri}&apiKey=${ENDPOINT.AUTH_SERVICE_API_KEY}`;

      window.location.href = endpoint;
    } catch (err) {
      console.log(err);
    }
  }, []);

  const handleMicrosoftSSO = useCallback(() => {
    try {
      const { redirectUri, failureUri } = config;

      const endpoint = `${ENDPOINT.AUTH_SERVICE_URI}${ENDPOINT.MICROSOFT_SSO}?callbackUri=${redirectUri}&failureUri=${failureUri}&apiKey=${ENDPOINT.AUTH_SERVICE_API_KEY}`;

      window.location.href = endpoint;
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <MuiBox className="social-icons-container">
      <MuiBox
        component="button"
        className="social-icon-button"
        onClick={handleGoogleSSO}
        id="google-sso-button"
      >
        <GoogleIconSvg32x32 />
        Google
      </MuiBox>

      <MuiBox
        component="button"
        className="social-icon-button"
        onClick={handleMicrosoftSSO}
        id="microsoft-sso-button"
      >
        <OfficeIconSvg32x32 />
        Office 365
      </MuiBox>
    </MuiBox>
  );
}
