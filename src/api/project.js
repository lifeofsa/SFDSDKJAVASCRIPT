import { baseAxios, initialBaseAxios, Sdk_Ver } from "../config";
import { decryptData } from "../utils";
import { config } from "../config";
export const getDisplayDetailsV3 = (body, projectkey) => {
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
