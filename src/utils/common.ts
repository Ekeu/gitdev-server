import { IAuthUserDocument } from "@components/auth/interfaces";
import { IPostDocument } from "@components/post/interfaces";
import { IReactionDocument } from "@components/reaction/interfaces";
import { IUserDocument } from "@components/user/interfaces";

type TParsedData = IUserDocument | IPostDocument | IAuthUserDocument | IReactionDocument;

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

export interface IUserAuthLookup {
  user?: {
    localField?: string;
    foreignField?: string;
    as?: string;
    fields?: Array<string>;
  };
  authUser?: {
    localField?: string;
    foreignField?: string;
    as?: string;
    fields?: Array<string>;
  };
}

export const getUserAuthLookup = (config?: IUserAuthLookup) => {
  const _config = {
    user: {
      localField: "user",
      foreignField: "_id",
      as: "user",
      fields: [],
      ...(config?.user || {}),
    },
    authUser: {
      localField: "authUser",
      foreignField: "_id",
      as: "authUser",
      fields: [],
      ...(config?.authUser || {}),
    },
  };
  return {
    $lookup: {
      from: "users",
      localField: _config.user.localField,
      foreignField: _config.user.foreignField,
      as: _config.user.as,
      pipeline: [
        {
          $lookup: {
            from: "authusers",
            localField: _config.authUser.localField,
            foreignField: _config.authUser.foreignField,
            as: _config.authUser.as,
          },
        },
        {
          $project: {
            avatar: 1,
            _id: 1,
            ...(_config.user.fields.length
              ? _config.user.fields.reduce((acc: Record<string, number>, field: string) => {
                  acc[field] = 1;
                  return acc;
                }, {})
              : {}),
            authUser: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$authUser",
                    as: "au",
                    in: {
                      _id: "$$au._id",
                      username: "$$au.username",
                      ...(_config.authUser.fields.length
                        ? _config.authUser.fields.reduce((acc: Record<string, string>, field: string) => {
                            acc[field] = `$$au.${field}`;
                            return acc;
                          }, {})
                        : {}),
                    },
                  },
                },
                0,
              ],
            },
          },
        },
      ],
    },
  };
};
