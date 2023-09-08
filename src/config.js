import axios from "axios";

export const Sdk_Ver = 3014;
export const config = {
  PROJECT_API_KEY: null,
  ENCRYPTION_KEY: "Aykasjd823jRPg9rGm0kt6bE4WL4R605SXuH",
  API_URL: null,
  FILL_3DS_TOKENS: false,
  GOOGLE_MAP_KEY: null,
  IS_INITIAL_3DS_ENABLED: true,
  IS_REBILL_3DS_ENABLED: true,
  USE_REBILL_TOKEN_FOR_INITIAL: false,
  USE_INITIAL_TOKEN_FOR_REBILL: false,
  USE_INITIAL_TOKEN_FOR_UPSELLS: false,
  THREE_DS_API_KEY: null,
  THREE_DS_API_URL: null,
  THREE_DS_FORCE_TIMEOUT: null,
  USE_GEOCODE_API: false,
  GEOCODE_API_KEY: null,
  CARDS_NOT_ALLOWED_3DS: [],
  CARDS_ALLOWED_3DS: [],
  IS_3DS_ON_BOOSTER_ENABLED: false,
};

export let baseAxios = null;
export const initialBaseAxios = ({ baseURL }) => {
  baseAxios = axios.create({
    baseURL,
  });
};

export const setEnvVariable = (key, value) => {
  config[key] = value;
};
