import { baseAxios, initialBaseAxios, setEnvVariable } from "./config.js";
import {
  displayDetailsCall,
  getIsInitialized,
  globalValues,
  val,
} from "./global/index.js";
import {
  displayDetialsEnv,
  getUserIpAddress,
  userIdentifier,
} from "./utils.js";

export const Initialize_SDK = async ({
  ProjectApiKey,
  ApiURL,
  fill3DSTokens = false,
  isInitialize3dsEnabled = true,
  isRebill3dsEnabled = true,
  useRebillTokenForInitial = false,
  useInitialTokenForRebill = false,
  useInitialTokenForUpsells = false,
  cardsAllowed3ds = [],
  cardsNotAllowed3ds = [],
  is3dsOnBoosterEnabled = false,
}) => {
  initialBaseAxios({ baseURL: ApiURL });
  setEnvVariable("PROJECT_API_KEY", ProjectApiKey);
  setEnvVariable("API_URL", ApiURL);
  setEnvVariable("FILL_3DS_TOKENS", fill3DSTokens);
  setEnvVariable("IS_INITIAL_3DS_ENABLED", isInitialize3dsEnabled);
  setEnvVariable("IS_REBILL_3DS_ENABLED", isRebill3dsEnabled);
  setEnvVariable("USE_REBILL_TOKEN_FOR_INITIAL", useRebillTokenForInitial);
  setEnvVariable("USE_INITIAL_TOKEN_FOR_REBILL", useInitialTokenForRebill);
  setEnvVariable("USE_INITIAL_TOKEN_FOR_UPSELLS", useInitialTokenForUpsells);
  setEnvVariable("CARDS_ALLOWED_3DS", cardsAllowed3ds);
  setEnvVariable("IS_3DS_ON_BOOSTER_ENABLED", is3dsOnBoosterEnabled);
  setEnvVariable("CARDS_NOT_ALLOWED_3DS", cardsNotAllowed3ds);
  await val();
  let { isInitialized, ipAddress, displayDetails } = globalValues;
  console.log(displayDetails);
};

export * from "./api/plugin.js";
export * from "./api/project.js";
export * from "./helper-functions/index.js";
export * from "./global/index.js";
