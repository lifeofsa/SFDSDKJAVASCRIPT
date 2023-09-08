import {
  displayDetialsEnv,
  getUserIpAddress,
  userIdentifier,
} from "../utils.js";
let isRun = false;
export let globalValues = {
  isInitialized: false,
  ipAddress: "",
  displayDetails: {},
  isClickLoading: true,
  isThreeDSDeatilsLoading: false,
  threeDSdetails: null,
};
export function useGlobalValue(key, newValue) {
  if (typeof newValue !== "undefined") {
    globalValues[key] = newValue;
  }
  return globalValues[key];
}
export const displayDetailsCall = async () => {
  isRun = true;
  if (isRun == true) {
    const params = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(params.entries());
    const { affId, c1, c2, c3 } = queryParams;
    userIdentifier();
    const [displayDetailsResponse, ipAdressResponse] = await Promise.all([
      displayDetialsEnv({ ...queryParams, css: true }),
      getUserIpAddress(),
    ]);
    useGlobalValue("displayDetails", displayDetailsResponse);
    useGlobalValue("isInitialized", true);
    useGlobalValue("ipAddress", ipAdressResponse?.ipAddress);
  }

  return globalValues;
};

export const val = async () => await displayDetailsCall();

export function getIsInitialized() {
  console.log(globalValues.isInitialized);
}
