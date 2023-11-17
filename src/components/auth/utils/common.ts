import crypto from "crypto";
import { IAuthUserDocument, ISignUp } from "../interfaces";
import { IUserDocument } from "@components/user/interfaces";
import { ObjectId } from "mongoose";
import { AuthUser } from "../data/models/auth-user";
import { User } from "@components/user/data/models/user";

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
