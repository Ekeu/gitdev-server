import { IAuthUserDocument } from "@components/auth/interfaces";
import { CallbackError, Schema, model } from "mongoose";
import { compare, hash } from "bcrypt";
import { env } from "@/env";

const authUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["basic", "admin"],
      default: "basic",
    },
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    redisId: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, "password");
        return ret;
      },
    },
  },
);

authUserSchema.pre("save", async function (this: IAuthUserDocument, next) {
  if (!this.isModified("password")) return next();
  try {
    if (this.password) {
      this.password = await hash(this.password as string, env.GITDEV_AUTH_SALT_ROUNDS);
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

authUserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword = (this as IAuthUserDocument).password!;
  return compare(password, hashedPassword);
};

const AuthUser = model<IAuthUserDocument>("AuthUser", authUserSchema);

export { AuthUser };
