import { datadogRum } from "@datadog/browser-rum";
import { client, v2 } from "@datadog/datadog-api-client";
import axios, { AxiosRequestConfig } from "axios";

import { ENDPOINT } from "~/constants/endpoints";
import Envs from "~/constants/envs";
import LocalStorageKeys from "~/constants/local-storage-keys";

const shouldExcludeFromDetection = Boolean(
  JSON.parse(
    localStorage.getItem(LocalStorageKeys.EXCLUDE_DATADOG_RUM) || "false",
  ),
);
export function initializeDatadog() {
  if (import.meta.env.MODE === "production" && !shouldExcludeFromDetection) {
    // Initialize Datadog RUM (Real User Monitoring)
    datadogRum.init({
      applicationId: Envs.DATADOG_RUM_APPLICATION_ID,
      clientToken: Envs.DATADOG_RUM_CLIENT_TOKEN,
      site: "us5.datadoghq.com",
      service: Envs.DATADOG_RUM_SERVICE,
      env: Envs.DATADOG_RUM_ENV,
      // Specify a version number to identify the deployed version of your application in Datadog
      version: Envs.DATADOG_RUM_VERSION,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 100,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    });
  }
}

export function addUserDetailsInDatadog(user: {
  id: number | string;
  name: string;
  email: string;
}) {
  if (import.meta.env.MODE === "production" && !shouldExcludeFromDetection) {
    datadogRum.setUser({
      id: String(user?.id),
      name: user?.name,
      email: user?.email,
    });
  }
}

let apiInstance: v2.MetricsApi;
export function getApiInstance() {
  if (apiInstance) return apiInstance;

  const configuration = client.createConfiguration({
    authMethods: {
      apiKeyAuth: Envs.DATADOG_API_KEY,
      appKeyAuth: Envs.DATADOG_APPLICATION_KEY,
    },
  });

  configuration.setServerVariables({
    site: Envs.DATADOG_API_SITE,
  });
  apiInstance = new v2.MetricsApi(configuration);

  return apiInstance;
}

export function submitDatadogCountMetric(
  {
    metric,
    tags,
  }: {
    metric: string;
    tags: string[];
  },
  requestConfig?: AxiosRequestConfig,
) {
  if (!metric) {
    console.log(
      "%cplease provide a `metric`",
      "background-color:red;color:white;",
    );
    return;
  }

  // Skip if no backend URL is configured (self-contained demo mode)
  if (!ENDPOINT.DATADOG_SUBMIT_COUNT_METRIC || ENDPOINT.DATADOG_SUBMIT_COUNT_METRIC === "undefined/datadog/submit-count-metric") {
    return;
  }

  const token = localStorage.getItem(LocalStorageKeys.TOKEN);

  void axios.post(
    ENDPOINT.DATADOG_SUBMIT_COUNT_METRIC,
    {
      tags,
      metric,
    },
    {
      headers: { ...requestConfig?.headers, Authorization: `Bearer ${token}` },
      ...requestConfig,
    },
  );
}
