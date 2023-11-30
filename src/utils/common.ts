export const generateRandomNumericUUID = () => {
  let uuid = "";
  while (uuid.length < 16) {
    uuid += Math.floor(Math.random() * 10);
  }
  return uuid;
};

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

export const removeSpacesFromUsername = (name: string): string => {
  const username = name.replace(/\s/g, "").toLowerCase();
  return username;
};

export const removeNonAlphaNumericCharacters = (str: string): string => {
  const formattedStr = str.replace(/[^a-zA-Z0-9]/g, "");
  return formattedStr;
};
