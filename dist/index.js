'use strict';

var axios = require('axios');
require('crypto-js/aes.js');
var CryptoJS = require('crypto-js');
var uuid = require('uuid');
var qs = require('qs');
var loadash = require('lodash');
var creditCardType = require('credit-card-type');

const Sdk_Ver = 3014;
const config = {
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

let baseAxios = null;
const initialBaseAxios = ({ baseURL }) => {
  baseAxios = axios.create({
    baseURL,
  });
};

const setEnvVariable = (key, value) => {
  config[key] = value;
};

const getDisplayDetailsV3 = (body, projectkey) => {
  return baseAxios
    ?.post(
      `/api/projects/display-details-v3?projectKey=${
        projectkey || config.PROJECT_API_KEY
      }`,
      body,
      {
        headers: { "X-Sdk-Ver": Sdk_Ver },
      }
    )
    .then((res) => {
      const data = JSON.parse(decryptData(res.data));
      return data;
    })
    .catch((err) => {
      throw err;
    });
};

const decryptData = (text) => {
  var key = config.ENCRYPTION_KEY;
  const decrypt = CryptoJS.AES.decrypt(text, key);
  return decrypt.toString(CryptoJS.enc.Utf8);
};

const encryptData = (text) => {
  var key = config.ENCRYPTION_KEY;
  const encrypt = CryptoJS.AES.encrypt(text, key);
  return encrypt.toString();
};

const displayDetialsEnv = async (body, projKey) => {
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

const userIdentifier = () => {
  const userIdentifierExist = !!sessionStorage.getItem("s_uid");
  if (!userIdentifierExist) {
    const userId = uuid.v4();
    sessionStorage.setItem("s_uid", userId);
  }
};

const getRedirectedURI = async (url) => {
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
const PAGE_TYPE = {
  PRESELL_PAGE: "presellPage",
  LEAD_PAGE: "leadPage",
  CHECKOUT_PAGE: "checkoutPage",
  UPSELL_PAGE1: "upsellPage1",
  UPSELL_PAGE2: "upsellPage2",
  UPSELL_PAGE3: "upsellPage3",
  UPSELL_PAGE4: "upsellPage4",
  THANKYOU_PAGE: "thankyouPage",
};

const getUserIpAddress = async () => {
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

const CRM = {
  KONNEKTIVE: "konnektive",
  STICKY: "sticky",
};

let isRun = false;
let globalValues = {
  isInitialized: false,
  ipAddress: "",
  displayDetails: {},
  isClickLoading: true,
  isThreeDSDeatilsLoading: false,
  threeDSdetails: null,
};
function useGlobalValue(key, newValue) {
  if (typeof newValue !== "undefined") {
    globalValues[key] = newValue;
  }
  return globalValues[key];
}
const displayDetailsCall = async () => {
  isRun = true;
  if (isRun == true) {
    const params = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(params.entries());
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

const val = async () => await displayDetailsCall();

function getIsInitialized() {
  console.log(globalValues.isInitialized);
}

const konnektiveImportClick = async (
  body,
  { isEncrypted = false, isPayloadEncrypted = false }
) => {
  const modifiedBody =
    isPayloadEncrypted && body
      ? { data: encryptData(JSON.stringify(body)) }
      : body;
  return baseAxios
    ?.post(
      `/api/plugins/konnektive/import-clicks?projectKey=${config.PROJECT_API_KEY}`,
      modifiedBody,
      {
        headers: { "X-Sdk-Ver": Sdk_Ver },
      }
    )
    .then((res) => {
      const data = isEncrypted ? JSON.parse(decryptData(res.data)) : res.data;
      return data;
    })
    .catch((err) => {
      throw err;
    });
};

const konnektiveImportLead = (
  body,
  { isEncrypted = false, isPayloadEncrypted = false }
) => {
  const modifiedBody =
    isPayloadEncrypted && body
      ? { data: encryptData(JSON.stringify(body)) }
      : body;
  return baseAxios
    ?.post(
      `/api/plugins/konnektive/import-lead?projectKey=${config.PROJECT_API_KEY}`,
      modifiedBody,
      {
        headers: { "X-Sdk-Ver": Sdk_Ver },
      }
    )
    .then((res) => {
      const data = isEncrypted ? JSON.parse(decryptData(res.data)) : res.data;
      return data;
    })
    .catch((err) => {
      throw err;
    });
};

const konnektiveQueryCampaign = async (
  body,
  { isEncrypted = false, isPayloadEncrypted = false }
) => {
  const modifiedBody =
    isPayloadEncrypted && body
      ? { data: encryptData(JSON.stringify(body)) }
      : body;
  return baseAxios
    ?.post(
      `/api/plugins/konnektive/query-current-campaign?projectKey=${config.PROJECT_API_KEY}`,
      modifiedBody,
      {
        headers: {
          "X-Sdk-Ver": Sdk_Ver,
        },
      }
    )
    .then((res) => {
      const data = isEncrypted ? JSON.parse(decryptData(res.data)) : res.data;
      return data;
    })
    .catch((err) => {
      throw err;
    });
};

const binRecordCheckResponse = async (body = {}) => {
  return baseAxios
    ?.post(
      `/api/plugins/bin/check?projectKey=${config.PROJECT_API_KEY}`,
      body,
      { headers: { "X-Sdk-Ver": Sdk_Ver } }
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
};

const konnektiveImportOrder = async (
  body,
  { isEncrypted = false, isPayloadEncrypted = false }
) => {
  const modifiedBody =
    isPayloadEncrypted && body
      ? { data: encryptData(JSON.stringify(body)) }
      : body;
  return baseAxios
    ?.post(
      `/api/plugins/konnektive/import-order?projectKey=${config.PROJECT_API_KEY}`,
      modifiedBody,
      {
        headers: { "X-Sdk-Ver": Sdk_Ver },
      }
    )
    .then((res) => {
      const data = isEncrypted ? JSON.parse(decryptData(res.data)) : res.data;
      return data;
    })
    .catch((err) => {
      throw err;
    });
};

const getDecryptedData = (key) => {
  let decryptedDataString;
  let encryptedDataString = sessionStorage.getItem(key);
  if (encryptedDataString) {
    decryptedDataString = decryptData(encryptedDataString);
  }
  return decryptedDataString ? JSON.parse(decryptedDataString) : null;
};

const createThreeDSInstance = async () => {
  return new ThreeDS("billing-form", config.THREE_DS_API_KEY, null, {
    forcedTimeOut: config.THREE_DS_FORCE_TIMEOUT,
    endpoint: config.THREE_DS_API_URL,
    autoSubmit: false,
    verbose: false,
    showChallenge: false,
    iframeId: "verify-frame",
  });
};

const cardDetails = (cardParams) => {
  if (
    !cardParams.cardNumber ||
    (!cardParams.cardSecurityCode &&
      !cardParams.cardMonth &&
      !cardParams.cardYear)
  ) {
    return false;
  }
  let foundCard = sessionStorage.getItem("cardParams");
  if (foundCard) {
    foundCard = JSON.parse(foundCard);
    const isEqual = loadash.isEqual(cardParams, foundCard);
    if (!isEqual) {
      sessionStorage.setItem("cardParams", JSON.stringify(cardParams));
      return true;
    }
  } else {
    sessionStorage.setItem("cardParams", JSON.stringify(cardParams));
    return true;
  }
  return false;
};

const verify3DSPrice = (amount, isEnabled = true) => {
  let failureTriggered = false;

  if (!isEnabled) return new Promise((resolve, reject) => resolve(null));
  const threeDSInstance = createThreeDSInstance();

  return new Promise((resolve, reject) => {
    threeDSInstance.verify(
      (res) => {
        if (res.status !== "R" && res.status !== "U") {
          resolve(res);
        } else {
          resolve(null);
        }
      },
      () => {
        if (!failureTriggered) {
          resolve(null);
          failureTriggered = true;
        }
      },
      {
        amount: parseFloat(amount),
      }
    );
  });
};

const check3ds = async (
  selectedProducts = [],
  selectedUpsell = [],
  isEncrypted,
  isPayloadEncrypted,
  crm
) => {
  const sessionId = sessionStorage.getItem("s_uid");
  const { scrubSettings, splitSettings } = getDecryptedData("e_scrubSet") || {};

  const campaignDetails = await konnektiveQueryCampaign(
    {
      productIdentifiers: selectedProducts.map(
        (product) => product?.identifier
      ),
      upsellIdentifier: selectedUpsell.map((upsell) => upsell?.identifier),
      sessionId,
      scrubSettings,
      splitSettings,
    },
    {
      isEncrypted,
      isPayloadEncrypted,
    }
  );

  const verify3DSupsells = async (
    useInitial3DSToken = true,
    verifyInitialResponse = null
  ) => {
    const upsells = campaignDetails?.upsellPrices.filter(
      (upsell) => !upsell.isManualUpsell
    );

    const res = {};

    await Promise.all(
      upsells.map(async (upsell) => {
        const upsellDetails = selectedUpsell.find(
          (u) => u.identifier == upsell.identifier
        );
        const [initialResponse, rebillResponse] = await Promise.all([
          verify3DSPrice(
            upsell.price,
            upsellDetails?.isInitial3dsEnabled &&
              !upsellDetails?.useRebillTokenForInitial
          ),
          verify3DSPrice(
            upsell.rebillPrice,
            upsellDetails?.isRebill3dsEnabled &&
              !upsellDetails?.useInitalTokenForRebill
          ),
        ]);

        res[upsell.identifier] = {
          initialResponse: useInitial3DSToken
            ? verifyInitialResponse
            : upsellDetails?.useRebillTokenForInitial
            ? rebillResponse
            : initialResponse,
          rebillResponse: useInitial3DSToken
            ? verifyInitialResponse
            : upsellDetails?.useInitalTokenForRebill
            ? initialResponse
            : rebillResponse,
        };
      })
    );
    return res;
  };

  const verify3ds = async () => {
    if (crm == CRM.STICKY) {
      const productPrice = Object.values(
        campaignDetails?.stickyProductDetails?.products || {}
      )?.at(0)?.product_price;

      const verifyResponse = await verify3DSPrice(
        productPrice,
        config.IS_INITIAL_3DS_ENABLED
      );

      return [verifyResponse];
    } else {
      const [verifyResponse, verifyResponseRebill] = await Promise.all([
        verify3DSPrice(
          campaignDetails?.secureProductPrice,
          config.IS_INITIAL_3DS_ENABLED && !config.USE_REBILL_TOKEN_FOR_INITIAL
        ),

        verify3DSPrice(
          campaignDetails?.secureProductPrice,
          config.IS_REBILL_3DS_ENABLED && !config.USE_INITIAL_TOKEN_FOR_REBILL
        ),
      ]);

      const verifyResponseUpsells = await verify3DSupsells(
        config.USE_INITIAL_TOKEN_FOR_UPSELLS,
        verifyResponse
      );

      return [verifyResponse, verifyResponseRebill, verifyResponseUpsells];
    }
  };

  const response = await verify3ds();
  return response;
};

const map3dsPayload = ({
  verifyResponse,
  verifyResponseRebill,
  verifyResponseUpsells,
}) => {
  const threedsPayload = {
    params: {
      eci: verifyResponse?.eci || null,
      xid: verifyResponse?.dsTransId || null,
      cavv: verifyResponse?.authenticationValue || null,
      rebill_eci: verifyResponseRebill?.eci || null,
      rebill_xid: verifyResponseRebill?.dsTransId || null,
      rebill_cavv: verifyResponseRebill?.authenticationValue || null,
    },
    isProductsSecure:
      verifyResponse?.status === "A" || verifyResponse?.status === "Y",
    isRebillProductsSecure:
      verifyResponseRebill?.status === "A" ||
      verifyResponseRebill?.status === "Y",
    upsells: {},
  };

  const keys = Object.keys(verifyResponseUpsells || {});
  keys.forEach((upsellIdentifier) => {
    threedsPayload.upsells[upsellIdentifier] = {
      eci:
        verifyResponseUpsells[upsellIdentifier]?.initialResponse?.eci || null,
      xid:
        verifyResponseUpsells[upsellIdentifier]?.initialResponse?.dsTransId ||
        null,
      cavv:
        verifyResponseUpsells[upsellIdentifier]?.initialResponse
          ?.authenticationValue || null,
      rebill_eci:
        verifyResponseUpsells[upsellIdentifier]?.rebillResponse?.eci || null,
      rebill_xid:
        verifyResponseUpsells[upsellIdentifier]?.rebillResponse?.dsTransId ||
        null,
      rebill_cavv:
        verifyResponseUpsells[upsellIdentifier]?.rebillResponse
          ?.authenticationValue || null,
      isInitialSecure:
        verifyResponseUpsells[upsellIdentifier]?.initialResponse?.status ===
          "A" ||
        verifyResponseUpsells[upsellIdentifier]?.initialResponse?.status ===
          "Y",
      isRebillSecure:
        verifyResponseUpsells[upsellIdentifier]?.rebillResponse?.status ===
          "A" ||
        verifyResponseUpsells[upsellIdentifier]?.rebillResponse?.status === "Y",
    };
  });

  if (config.FILL_3DS_TOKENS) {
    const secureInitial =
      verifyResponse?.status === "A" || verifyResponse?.status === "Y"
        ? verifyResponse
        : null;
    const secureInitialRebill =
      verifyResponseRebill?.status === "A" ||
      verifyResponseRebill?.status === "Y"
        ? verifyResponseRebill
        : null;

    let secureUpsellInitial = null;
    let secureUpsellRebill = null;

    let secureUpsellFound = false;

    keys.forEach((upsellIdentifier) => {
      const isInitialSecure =
        verifyResponseUpsells[upsellIdentifier].initialResponse?.status ===
          "A" ||
        verifyResponseUpsells[upsellIdentifier]?.initialResponse?.status ===
          "Y";
      const isRebillSecure =
        verifyResponseUpsells[upsellIdentifier]?.rebillResponse?.status ===
          "A" ||
        verifyResponseUpsells[upsellIdentifier]?.rebillResponse?.status === "Y";

      if (!secureUpsellFound && (isInitialSecure || isRebillSecure)) {
        secureUpsellInitial =
          verifyResponseUpsells[upsellIdentifier]?.initialResponse;
        secureUpsellRebill =
          verifyResponseUpsells[upsellIdentifier]?.rebillResponse;
        secureUpsellFound = true;
      }
    });

    const tokensFoundOf =
      secureInitial ||
      secureInitialRebill ||
      secureUpsellInitial ||
      secureUpsellRebill ||
      null;

    if (tokensFoundOf) {
      if (!threedsPayload.params.isProductsSecure) {
        threedsPayload.params.eci = tokensFoundOf.eci || null;
        threedsPayload.params.xid = tokensFoundOf.dsTransId || null;
        threedsPayload.params.cavv = tokensFoundOf.authenticationValue || null;
        threedsPayload.isProductsSecure = !!tokensFoundOf;
      }

      if (!threedsPayload.params.isRebillProductsSecure) {
        threedsPayload.params.rebill_eci = tokensFoundOf.eci || null;
        threedsPayload.params.rebill_xid = tokensFoundOf.dsTransId || null;
        threedsPayload.params.rebill_cavv =
          tokensFoundOf.authenticationValue || null;
        threedsPayload.isRebillProductsSecure = !!tokensFoundOf;
      }

      keys.forEach((upsellIdentifier) => {
        const upsellDetails = threedsPayload.upsells
          ? threedsPayload.upsells[upsellIdentifier]
          : null;

        if (!upsellDetails?.isInitialSecure && upsellDetails) {
          threedsPayload.upsells[upsellIdentifier].eci =
            tokensFoundOf.eci || null;
          threedsPayload.upsells[upsellIdentifier].xid =
            tokensFoundOf.dsTransId || null;
          threedsPayload.upsells[upsellIdentifier].cavv =
            tokensFoundOf.authenticationValue || null;
          threedsPayload.upsells[upsellIdentifier].isInitialSecure =
            !!tokensFoundOf;
        }

        if (!upsellDetails?.isRebillSecure && upsellDetails) {
          threedsPayload.upsells[upsellIdentifier].rebill_eci =
            tokensFoundOf.eci || null;
          threedsPayload.upsells[upsellIdentifier].rebill_xid =
            tokensFoundOf.dsTransId || null;
          threedsPayload.upsells[upsellIdentifier].rebill_cavv =
            tokensFoundOf.authenticationValue || null;
          threedsPayload.upsells[upsellIdentifier].isRebillSecure =
            !!tokensFoundOf;
        }
      });
    }
  }

  return threedsPayload;
};

const helper_konnektive_import_click = () => {
  // await displayDetailsCall();
  const params = new URLSearchParams(window.location.search);
  const queryParams = Object.fromEntries(params.entries());
  const pathName = window.location.pathname;
  const { affId, c1, c2, c3 } = queryParams;
  let { isInitialized, ipAddress, displayDetails, isClickLoading } =
    globalValues;
  const setIsClickLoading = (value) => {
    isClickLoading = value;
  };
  const setDisplayDetails = (value) => {
    displayDetails = value;
  };
  setIsClickLoading(false);
  if (isInitialized) {
    if (typeof window !== "undefined") {
      if (!sessionStorage.getItem("sessionId")) {
        importClick(ipAddress);
      } else {
        setIsClickLoading(false);
      }
    }
  }
  async function importClick(ip) {
    setIsClickLoading(true);
    const origin = window.location.origin || "";
    let requestUri = `${origin}${pathName}`;

    const sourceParams = {
      affId: affId || null,
      c1: c1 || null,
      c2: c2 || null,
      c3: c3 || null,
    };
    if (displayDetails?.scrubSettings?.isScrubActive) {
      const smartLinkResponse =
        (await getRedirectedURI(
          displayDetails?.scrubSettings.scrubSmartlink
        )) || "";
      const queryString = new URL(smartLinkResponse).search?.replace("?", "");
      const parsedQueryParams = qs.parse(queryString || "");

      requestUri = smartLinkResponse;
      c1 = parsedQueryParams.c1;
      c2 = parsedQueryParams.c2;
      c3 = parsedQueryParams.c3;
      affId = parsedQueryParams.affId;
    }

    konnektiveImportClick(
      {
        params: {
          pageType: PAGE_TYPE.LEAD_PAGE,
          ipAddress: ip,
          requestUri,
        },
        c1,
        c2,
        c3,
        scrubSettings: displayDetails?.scrubSettings,
        splitSettings: displayDetails?.splitSettings,
        sourceParams,
      },
      {
        isEncrypted: displayDetails.isEncrypted,
        isPayloadEncrypted: displayDetails.isPayloadEncrypted,
      }
    )
      .then(async (res) => {
        const { trafficSplitSettings, projectKey } = res;

        if (typeof window !== "undefined") {
          const createdParams = {
            c1: c1 || null,
            c2: c2 || null,
            c3: c3 || null,
            affId: affId || null,
          };

          const createdScrubSettings = {
            scrubSettings: displayDetails?.scrubSettings,
            splitSettings: displayDetails?.splitSettings,
          };
          const encryptedParams = encryptData(JSON.stringify(createdParams));
          const encryptedScrubSettings = encryptData(
            JSON.stringify(createdScrubSettings)
          );
          const encryptedSourceParam = encryptData(
            JSON.stringify(sourceParams)
          );

          sessionStorage.setItem("sessionId", res.message?.sessionId || "");
          sessionStorage.setItem("e_param", encryptedParams);
          sessionStorage.setItem("e_scrubSet", encryptedScrubSettings);
          sessionStorage.setItem("e_sourceParam", encryptedSourceParam);

          if (
            displayDetails?.scrubSettings?.isScrubActive ||
            displayDetails?.splitSettings.isSplitActive
          ) {
            const updatedDisplaySettings = await displayDetialsEnv(
              { css: false },
              projectKey
            );
            const newDisplayDetails = {
              ...(updatedDisplaySettings || {}),
              token: displayDetails?.token,
              isEncrypted: displayDetails?.isEncrypted,
              isPayloadEncrypted: displayDetails?.isPayloadEncrypted,
            };
            setDisplayDetails(newDisplayDetails);
            setIsClickLoading(false);
          }
        }
        setIsClickLoading(false);
        console.log(displayDetails);
      })
      .catch((error) => {
        console.log(error);
        setIsClickLoading(false);
      });
  }

  return { ip: ipAddress, displayDetails };
};

const helper_konnektive_import_lead = () => {
  const { displayDetails, isClickLoading } = globalValues;
  let args,
    isLoading = false;
  const setArgs = (value) => {
    args = value;
  };
  const setIsLoading = (value) => {
    isLoading = value;
  };

  const executeLead = async () => {
    const { params, onSuccess = () => {}, onError = () => {} } = args;
    if (sessionStorage.getItem("alreadyPlaces") !== "true") {
      const { affId, c1, c2, c3 } = getDecryptedData("e_param") || {};
      const sourceParams = getDecryptedData("e_sourceParam");
      const { scrubSettings, splitSettings } = getDecryptedData("e_scrubSet");

      const data = {
        params: params,
        userIdentifier: sessionStorage.getItem("s_uid"),
        data: "",
        affId,
        c1,
        c2,
        c3,
        sessionId: sessionStorage.getItem("sessionId"),
        scrubSettings,
        splitSettings,
        sourceParams,
      };

      return konnektiveImportLead(data, {
        isEncrypted: displayDetails.isEncrypted,
        isPayloadEncrypted: displayDetails.isPayloadEncrypted,
      })
        .then((res) => {
          const encryptedDataString = encryptData(
            JSON.stringify({
              affId,
              c1,
              c2,
              c3,
              orderId:
                displayDetails.crm == CRM.KONNEKTIVE
                  ? res?.message?.orderId || null
                  : res?.prospectId || null,
            })
          );
          sessionStorage.setItem("e_param", encryptedDataString);
          onSuccess(res);
        })
        .catch((err) => {
          console.log(err);
          onError(err?.response?.data?.message || "Lead Failed");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      onError("Order Already Placed");
      setIsLoading(false);
    }
  };

  // window.addEventListener("submit", () => {
  //   if (args) {
  //     executeLead();
  //   }
  // });

  const submitLead = async (payload) => {
    setIsLoading(true);
    setArgs(payload);
  };

  return { executeLead, submitLead, isLoading, args };
};

const helper_konnektive_import_order = () => {
  let { displayDetails, isThreeDSDetailsLoading, threeDSdetails, ipAddress } =
    globalValues;

  let args,
    isLoading = false;

  const setArgs = (value) => {
    args = value;
  };
  const setIsLoading = (value) => {
    isLoading = value;
  };
  const setThreeDSdetails = (value) => {
    threeDSdetails = value;
  };
  const setIsThreeDSDetailsLoading = (value) => {
    isThreeDSDetailsLoading = value;
  };

  const executeOrder = async () => {
    const {
      params,
      selectedProducts = [],
      selectedUpsells = [],
      onSuccess = () => {},
      onError = () => {},
    } = args;

    const productDetails = displayDetails;

    const isThreeDSpluginEnabled =
      !!productDetails?.organization?.activatedPlugins?.find(
        (plu) => plu.plugin?.identifier === "3ds"
      );
    const isThreeDSInProjectEnabled = productDetails?.is3dsEnabled;

    const importOrder = async (
      verifyResponse = null,
      rebillVerifyResponse = null,
      verifyResponseUpsell = null
    ) => {
      const { affId, c1, c2, c3, orderId } = getDecryptedData("e_param") || {};
      const sourceParams = getDecryptedData("e_sourceParam") || {};
      const { scrubSettings, splitSettings } =
        getDecryptedData("e_scrubSet") || {};

      let threeDSPayload = map3dsPayload({
        verifyResponse: verifyResponse,
        verifyResponseRebill: rebillVerifyResponse,
        verifyResponseUpsells: verifyResponseUpsell,
      });
      const { params: threeDsParams, ...threeDsRestPayload } = threeDSPayload;

      const data = {
        params: {
          orderId,
          lead_id: orderId,
          sessionId: sessionStorage.getItem("sessionId"),
          userIdentifier: sessionStorage.getItem("s_uid"),
          ...params,
          ...threeDsParams,
        },
        sessionId: sessionStorage.getItem("sessionId"),
        userIdentifier: sessionStorage.getItem("s_uid"),
        ipAddress,
        data: "",
        affId,
        c1,
        c2,
        c3,
        selectedProducts,
        selectedUpsells,
        splitSettings,
        scrubSettings,
        sourceParams,
        ...threeDsRestPayload,
      };
      await konnektiveImportOrder(data, {
        isEncrypted: displayDetails.isEncrypted,
        isPayloadEncrypted: displayDetails.isPayloadEncrypted,
      })
        .then((res) => {
          if (res?.result !== "ERROR") {
            onSuccess(res);
            sessionStorage.setItem("alreadyPlaced", "true");

            //SetTimeOut to be remaining

            const iFramePixels =
              displayDetails.pixels?.filter(
                (pixel) =>
                  pixel.type === "iframe" &&
                  pixel.traffic_source?.crmID === affId
              ) || [];

            iFramePixels.forEach((pixels) => {
              const pixelURL = pixels?.body
                ?.replace(`{transactionId}`, c3)
                ?.replace(`{sub3}`, c2 || c1 || "")
                ?.replace(`{c2}`, c2 || "")
                ?.replace(`{c1}`, c1 || "");

              const iframe = document.createElement("iframe");
              iframe.src = pixelURL;
              iframe.setAttribute("width", "1");
              iframe.setAttribute("height", "1");
              iframe.setAttribute("frameborder", "0");
              document.body.append(iframe);
            });
          } else {
            let errMsg = res?.message || "Checkout Failed";
            if (errMsg.includes("cardBin blacklisted")) {
              errMsg = "Card not accepted, Please try another card";
            }
            onError(errMsg);
          }
        })
        .catch((err) => {
          if (
            err?.response?.data?.message?.includes("Order is already completed")
          )
            onSuccess();
          else {
            let errMsg = err?.response?.data?.message || "Checkout Failed";

            if (errMsg.includes("cardBin blacklisted")) {
              errMsg = "Card not accepted, Please try another card";
            }

            onError(errMsg);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    if (sessionStorage.getItem("alreadyPlaced") !== true) {
      setThreeDSdetails([]);
      setIsThreeDSDetailsLoading(false);

      const checkCardDetails = cardDetails({
        cardNumber: params?.cardNumber,
        cardMonth: params?.cardMonth,
        cardYear: params?.cardYear,
        cardSecurityCode: params?.cardSecurityCode,
      });

      // BIN RECORD CHECK
      const binCheck = await binRecordCheckResponse({
        cardNumber: params?.cardNumber,
      });

      const cardType =
        creditCardType(params?.cardNumber)[0]?.niceType?.toUpperCase() || "";
      const isCardAllowed3dws =
        (config.CARDS_ALLOWED_3DS?.length || 0) > 0
          ? !!config.CARDS_ALLOWED_3DS?.find((cardT) => cardT === cardType)
          : true;
      console.log("card allowed", cardType, isCardAllowed3dws);
      if (
        isThreeDSpluginEnabled &&
        isThreeDSInProjectEnabled &&
        checkCardDetails &&
        !threeDSdetails &&
        !binCheck?.cardFoundInBin &&
        isCardAllowed3dws
      ) {
        setIsThreeDSDetailsLoading(true);
        const [verifyResponse, verifyResponseRebill, verifyResponseUpells] =
          await check3ds({
            selectedProducts,
            selectedUpsells,
            isEncrypted: displayDetails?.isEncrypted,
            isPayloadEncrypted: displayDetails?.isPayloadEncrypted,
            crm: displayDetails?.crm,
          });

        setThreeDSdetails([
          verifyResponse,
          verifyResponseRebill,
          verifyResponseUpells,
        ]);

        setIsThreeDSDetailsLoading(false);

        importOrder(
          config.USE_REBILL_TOKEN_FOR_INITIAL
            ? verifyResponseRebill
            : verifyResponse,
          config.USE_INITIAL_TOKEN_FOR_REBILL
            ? verifyResponse
            : verifyResponseRebill,
          verifyResponseUpells
        );
      } else {
        const [verifyResponse, verifyResponseRebill, verifyResponseUpsells] =
          threeDSdetails || {};
        importOrder(
          config.USE_REBILL_TOKEN_FOR_INITIAL
            ? verifyResponseRebill
            : verifyResponse,
          config.USE_INITIAL_TOKEN_FOR_REBILL
            ? verifyResponse
            : verifyResponseRebill,
          verifyResponseUpsells
        );
      }
    } else {
      setIsLoading(false);
      onError("Order Already Placed");
    }
  };

  // window.addEventListener("submit", () => {
  //   if (args) {
  //     setIsRun(true);
  //     executeOrder();
  //   }
  // });
  const submitOrder = async (payload) => {
    setIsLoading(true);
    setArgs(payload);
  };

  return { executeOrder, submitOrder, isLoading };
};

const Initialize_SDK = async ({
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

exports.Initialize_SDK = Initialize_SDK;
exports.binRecordCheckResponse = binRecordCheckResponse;
exports.displayDetailsCall = displayDetailsCall;
exports.getDisplayDetailsV3 = getDisplayDetailsV3;
exports.getIsInitialized = getIsInitialized;
exports.globalValues = globalValues;
exports.helper_konnektive_import_click = helper_konnektive_import_click;
exports.helper_konnektive_import_lead = helper_konnektive_import_lead;
exports.helper_konnektive_import_order = helper_konnektive_import_order;
exports.konnektiveImportClick = konnektiveImportClick;
exports.konnektiveImportLead = konnektiveImportLead;
exports.konnektiveImportOrder = konnektiveImportOrder;
exports.konnektiveQueryCampaign = konnektiveQueryCampaign;
exports.useGlobalValue = useGlobalValue;
exports.val = val;
//# sourceMappingURL=index.js.map
