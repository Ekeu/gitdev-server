import { ObjectId } from "mongoose";
import gravatar from "gravatar";

import crypto from "crypto";
import { IAuthUserDocument, ISignUp } from "../interfaces";
import { IUserDocument } from "@components/user/interfaces";
import { AuthUser } from "../data/models/auth-user";
import { User } from "@components/user/data/models/user";
import { generateRandomNumericUUID } from "@utils/common";
import { userCache } from "@components/user/redis/cache/user";
import _ from "lodash";
import { authMQ } from "../bullmq/auth-mq";
import { userMQ } from "@components/user/bullmq/user-mq";
import { GITDEV_AUTH_SIGNUP_JOB } from "../constants";
import { GITDEV_USER_SIGNUP_JOB } from "@components/user/constants";

export interface IAuthAndUser {
  authDoc: IAuthUserDocument;
  userDoc: IUserDocument;
}

export const initAuthUserDocument = (data: ISignUp): IAuthUserDocument => {
  const auth = new AuthUser({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return auth.toObject();
};

export const initUserDocument = (authUser: ObjectId, avatar: string): IUserDocument => {
  const user = new User({
    avatar,
    authUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return user.toObject();
};

export const generateToken = () => {
  const token = crypto.randomBytes(20).toString("base64url");
  const tokenSecret = crypto.randomBytes(12).toString("hex");

  const tokenString = `${token}+${tokenSecret}`;

  return {
    token,
    tokenSecret,
    tokenString,
  };
};

/**
 *
 * @param data {ISignUp} - data to create a new user
 * @returns {IAuthAndUser} - returns a new user and auth document
 * @description - creates a new user and auth document and saves them to the database and to redis
 */

export const initAndSave = async (data: ISignUp): Promise<IAuthAndUser> => {
  const { email } = data;
  const avatar = gravatar.url(email, { d: "retro" }, true);
  const redisId = generateRandomNumericUUID();

  const authDoc = initAuthUserDocument({ ...data, redisId });
  const userDoc = initUserDocument(authDoc._id, avatar);

  await userCache.save("users", `${userDoc._id}`, redisId, userDoc as IUserDocument);
  await userCache.save("authusers", `${authDoc._id}`, redisId, _.omit(authDoc, ["password"]) as IAuthUserDocument);

  authMQ.addJob(GITDEV_AUTH_SIGNUP_JOB, { value: authDoc });
  userMQ.addJob(GITDEV_USER_SIGNUP_JOB, { value: userDoc });

  return {
    authDoc,
    userDoc,
  };
};

/**
 *
 * @param user {IUserDocument} - user document
 * @returns {IJWTPayload} - returns a jwt payload
 * @description - generates a jwt payload used to create a jwt token
 */

export const generateJwtPayload = (user: IUserDocument) => {
  return {
    role: (user.authUser as IAuthUserDocument).role,
    email: (user.authUser as IAuthUserDocument).email,
    redisId: (user.authUser as IAuthUserDocument).redisId,
    username: (user.authUser as IAuthUserDocument).username,
    authUser: (user.authUser as IAuthUserDocument)._id.toString(),
    userId: user._id.toString(),
  };
};
