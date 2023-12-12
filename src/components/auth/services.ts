import { ApiError } from "@utils/errors/api-error";
import { AuthUser } from "./data/models/auth-user";
import { IAuthUserDocument, ISignUp } from "./interfaces";
import { StatusCodes } from "http-status-codes";
import { ObjectId } from "mongoose";

export class AuthUserServices {
  static async findUserByEmail(email: string): Promise<IAuthUserDocument | null> {
    try {
      const user = await AuthUser.findOne({ email });
      if (!user) return null;
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
  static async findUserByUsername(username: string): Promise<IAuthUserDocument | null> {
    try {
      const user = await AuthUser.findOne({ username });
      if (!user) return null;
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
  static async createAuthUser(data: ISignUp): Promise<IAuthUserDocument> {
    try {
      const user = await AuthUser.create(data);
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
  static async findByUsernameOrEmail(username: string, email: string): Promise<IAuthUserDocument | null> {
    try {
      const user = await AuthUser.findOne({ $or: [{ username }, { email }] });
      if (!user) return null;
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
  static async findAuthUserById(id: ObjectId | string): Promise<IAuthUserDocument | null> {
    try {
      const user = await AuthUser.findById(id);
      if (!user) return null;
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async getSelectedFieldsById(id: ObjectId | string, fields: string[]): Promise<IAuthUserDocument | null> {
    try {
      const user = await AuthUser.findById(id).select(fields.join(" "));
      if (!user) return null;
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async updateEmailVerified(id: ObjectId | string): Promise<void> {
    try {
      await AuthUser.findByIdAndUpdate(id, { emailVerified: true });
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static initAuthUserDocument = (data: ISignUp): IAuthUserDocument => {
    const auth = new AuthUser({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return auth.toObject();
  };
}
