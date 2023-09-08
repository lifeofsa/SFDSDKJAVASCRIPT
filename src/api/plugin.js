import { baseAxios, Sdk_Ver } from "../config";
import { decryptData, encryptData } from "../utils";
import { config } from "../config";
import axios from "axios";
export const konnektiveImportClick = async (
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

export const konnektiveImportLead = (
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

export const konnektiveQueryCampaign = async (
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

export const binRecordCheckResponse = async (body = {}) => {
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

export const konnektiveImportOrder = async (
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
