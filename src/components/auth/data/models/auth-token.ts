import { IAuthUserTokenDocument, IAuthUserTokenModel, IJWTPayload } from "@components/auth/interfaces";
import { ObjectId, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import { env } from "@/env";
import crypto from "crypto";
import { generateToken } from "@components/auth/utils/common";

const authTokenSchema = new Schema(
  {
    authUser: {
      type: Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    emailToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordTokenExpiresAt: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, authUser } = ret;
        return { _id, authUser };
      },
    },
  },
);

authTokenSchema.index({ "refreshTokens.index": 1 });

authTokenSchema.statics.generateAccessToken = function (payload: IJWTPayload): string {
  const accessToken = jwt.sign(payload, env.GITDEV_JWT_SECRET, { expiresIn: env.GITDEV_JWT_SECRET_EXPIRES_IN });
  return accessToken;
};

authTokenSchema.statics.generateRefreshToken = async function (
  payload: IJWTPayload,
  authUser: ObjectId,
): Promise<string> {
  const refreshToken = jwt.sign(payload, env.GITDEV_REFRESH_JWT_SECRET, {
    expiresIn: env.GITDEV_REFRESH_JWT_SECRET_EXPIRES_IN,
  });

  const refreshTokenHash = crypto
    .createHmac("sha256", env.GITDEV_REFRESH_JWT_SECRET)
    .update(refreshToken)
    .digest("hex");

  const authUserToken = await this.findOne({ authUser });

  if (!authUserToken) {
    await this.create({
      authUser,
      refreshTokens: [{ token: refreshTokenHash }],
    });
  } else {
    authUserToken.refreshTokens.push({ token: refreshTokenHash });
    await authUserToken.save();
  }

  return refreshToken;
};

authTokenSchema.statics.generateResetPasswordToken = async function (authUser: ObjectId): Promise<string> {
  const { token, tokenSecret, tokenString } = generateToken();

  const resetPasswordTokenHash = crypto.createHmac("sha256", tokenSecret).update(token).digest("hex");

  const authUserToken = await this.findOne({ authUser });

  authUserToken.resetPasswordToken = resetPasswordTokenHash;
  authUserToken.resetPasswordTokenExpiresAt =
    Date.now() + (parseInt(env.GITDEV_RESET_PASSWORD_JWT_SECRET_EXPIRES_MINS) || 10) * 60 * 1000;
  await authUserToken.save();

  return tokenString;
};

authTokenSchema.statics.generateEmailToken = async function (authUser: ObjectId): Promise<string> {
  const { token, tokenSecret, tokenString } = generateToken();

  const emailTokenHash = crypto.createHmac("sha256", tokenSecret).update(token).digest("hex");

  const authUserToken = await this.findOne({ authUser });

  if (!authUserToken) {
    await this.create({
      authUser,
      emailToken: emailTokenHash,
    });
  } else {
    authUserToken.emailToken = emailTokenHash;
    await authUserToken.save();
  }

  return tokenString;
};

const AuthToken = model<IAuthUserTokenDocument, IAuthUserTokenModel>("AuthToken", authTokenSchema);

export { AuthToken };
