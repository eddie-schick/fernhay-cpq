import axios from "axios";

import { ENDPOINT } from "~/constants/endpoints";

const axiosAuthInstance = axios.create({
  baseURL: ENDPOINT.AUTH_SERVICE_URI,
  headers: {
    "x-api-key": ENDPOINT.AUTH_SERVICE_API_KEY,
  },
});

const axiosSignedUrlInstance = axios.create({
  baseURL: ENDPOINT.AUTH_SERVICE_URI,
});

export { axiosAuthInstance, axiosSignedUrlInstance };
