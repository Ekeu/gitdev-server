import { Document, Model, ObjectId } from "mongoose";

export interface IAuthUser {
  authUser: string;
  userId: string;
  token: string;
  email: string;
  username: string;
  isVerified: boolean;
  redisId: string;
}

export interface IAuthUserDocument extends Document {
  [key: string]: any;
  role: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  redisId: string;
  username: string;
  emailVerified: boolean;
  _id: string | ObjectId;
  comparePassword: (password: string) => Promise<boolean>;
  password?: string;
}

export interface IAuthUserTokenDocument extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  authUser: ObjectId;
  refreshTokens: Array<Record<string, string>>;
  emailSecret: string;
  resetPasswordToken: string;
  resetPasswordTokenExpiresAt: number;
}

export interface IAuthUserTokenModel extends Model<IAuthUserTokenDocument> {
  generateRefreshToken: (payload: IJWTPayload, authUser: string | ObjectId) => Promise<string>;
  generateAccessToken: (payload: IJWTPayload) => string;
  generateEmailToken: () => Promise<string>;
  generateResetPasswordToken: (authUser: string | ObjectId) => Promise<string>;
}

export interface ISignUp {
  email: string;
  provider?: string;
  redisId?: string;
  username: string;
  password?: string;
}

export interface IAuthUserJob {
  value: string | IAuthUserDocument;
}

export interface IAuthUserJobResponse {
  _id: string | ObjectId;
  username: string;
}

export interface IJWTPayload {
  role: string;
  email: string;
  userId: string;
  redisId: string;
  username: string;
  authUser: string;
}

export interface ISocialAuthGithubProfile {
  provider: string;
  username: string;
  _json: {
    email: string;
  };
}

export interface ISocialAuthGoogleProfile {
  provider: string;
  displayName: string;
  _json: {
    email: string;
  };
}
