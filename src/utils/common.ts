import _ from "lodash";

export const generateRandomNumericUUID = () => {
  let uuid = "";
  while (uuid.length < 16) {
    uuid += Math.floor(Math.random() * 10);
  }
  return uuid;
};

export const toLowerCase = (str: string) => _.toLower(str);

export const parseRedisData = (data: Record<string, string>): Record<string, any> => {
  const parsedData: Record<string, any> = {};
  for (const key in data) {
    try {
      parsedData[key] = JSON.parse(data[key]);
    } catch (error) {
      parsedData[key] = data[key];
    }
  }
  return parsedData;
};
