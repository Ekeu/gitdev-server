import { IAuthUserTokenDocument } from "@components/auth/interfaces";
import { Schema, model } from "mongoose";

const authTokenSchema = new Schema(
  {
    authUser: {
      type: Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetTokenExpiresAt: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const AuthToken = model<IAuthUserTokenDocument>("AuthToken", authTokenSchema);

export { AuthToken };
