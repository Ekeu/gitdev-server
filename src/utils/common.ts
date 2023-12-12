import { IAuthUserDocument } from "@components/auth/interfaces";
import { IPostDocument } from "@components/post/interfaces";
import { IUserDocument } from "@components/user/interfaces";

type TParsedData = IUserDocument | IPostDocument | IAuthUserDocument;

export const generateRandomNumericUUID = () => {
  let uuid = "";
  while (uuid.length < 16) {
    uuid += Math.floor(Math.random() * 10);
  }
  return uuid;
};

export const parseRedisData = (data: TParsedData): TParsedData => {
  const parsedData: TParsedData = {} as TParsedData;
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
