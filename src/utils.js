import cryptoString from "crypto-js/aes.js";
import CryptoJS from "crypto-js";
import { baseAxios, config, setEnvVariable } from "./config.js";
import { getDisplayDetailsV3 } from "./api/project.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
export const encryptString = (text) => {
  var key = config.ENCRYPTION_KEY;
  const encrypt = cryptoString.encrypt(text, key).toString();
  return encrypt;
};

export const decryptData = (text) => {
  var key = config.ENCRYPTION_KEY;
  const decrypt = CryptoJS.AES.decrypt(text, key);
  return decrypt.toString(CryptoJS.enc.Utf8);
};

export const encryptData = (text) => {
  var key = config.ENCRYPTION_KEY;
  const encrypt = CryptoJS.AES.encrypt(text, key);
  return encrypt.toString();
};

export const displayDetialsEnv = async (body, projKey) => {
  try {
    const displayDetails = await getDisplayDetailsV3(body, projKey);

    const GOOGLE_MAP_KEY = displayDetails?.envVariables?.find(
      (variable) => variable.key === "GOOGLE_MAP_KEY"
    )?.value;
    const THREE_DS_API_KEY = displayDetails?.envVariables?.find(
      (variable) => variable.key === "THREE_DS_API_KEY"
    )?.value;
    const THREE_DS_API_URL = displayDetails?.envVariables?.find(
      (variable) => variable.key === "THREE_DS_API_URL"
    )?.value;
    const THREE_DS_FORCE_TIMEOUT = displayDetails?.envVariables?.find(
      (variable) => variable.key === "THREE_DS_FORCE_TIMEOUT"
    )?.value;
    const USE_GEOCODE_API = displayDetails?.envVariables?.find(
      (variable) => variable.key === "USE_GEOCODE_API"
    )?.value;
    const GEOCODE_API_KEY = displayDetails?.envVariables?.find(
      (variable) => variable.key === "GEOCODE_API_KEY"
    )?.value;

    setEnvVariable("GOOGLE_MAP_KEY", GOOGLE_MAP_KEY);
    setEnvVariable("THREE_DS_API_KEY", THREE_DS_API_KEY);
    setEnvVariable("THREE_DS_API_KEY", THREE_DS_API_URL);
    setEnvVariable(
      "THREE_DS_FORCE_TIMEOUT",
      parseInt(THREE_DS_FORCE_TIMEOUT || 0)
    );
    setEnvVariable("USE_GEOCODE_API", USE_GEOCODE_API === "true");
    setEnvVariable("GEOCODE_API_KEY", GEOCODE_API_KEY);

    return displayDetails;
  } catch (err) {
    return err;
  }
};

export const userIdentifier = () => {
  const userIdentifierExist = !!sessionStorage.getItem("s_uid");
  if (!userIdentifierExist) {
    const userId = uuidv4();
    sessionStorage.setItem("s_uid", userId);
  }
};

export const getRedirectedURI = async (url) => {
  return await axios({
    method: "get",
    url,
    maxRedirects: 0,
    validateStatus: (status) => status < 400,
  })
    .then((res) => {
      return res?.request?.responseURL;
    })
    .catch((err) => {
      console.log(err);
    });
};
export const PAGE_TYPE = {
  PRESELL_PAGE: "presellPage",
  LEAD_PAGE: "leadPage",
  CHECKOUT_PAGE: "checkoutPage",
  UPSELL_PAGE1: "upsellPage1",
  UPSELL_PAGE2: "upsellPage2",
  UPSELL_PAGE3: "upsellPage3",
  UPSELL_PAGE4: "upsellPage4",
  THANKYOU_PAGE: "thankyouPage",
};

export const getUserIpAddress = async () => {
  try {
    return baseAxios
      ?.get(`/api/projects/get-user-ip`)
      .then((res) => res.data)
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    return err;
  }
};

export const CRM = {
  KONNEKTIVE: "konnektive",
  STICKY: "sticky",
};
