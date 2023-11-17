import { ApiError } from "@utils/errors/api-error";
import { AuthUser } from "./data/models/auth-user";
import { IAuthUserDocument, ISignUp } from "./interfaces";
import { StatusCodes } from "http-status-codes";

export class AuthUserServices {
  static async findUserById(id: string): Promise<IAuthUserDocument | null> {
    try {
      const user = AuthUser.findById(id).exec();
      if (!user) return null;
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
  static async findUserByEmail(email: string): Promise<IAuthUserDocument | null> {
    try {
      const user = AuthUser.findOne({ email }).exec();
      if (!user) return null;
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
  static async findUserByUsername(username: string): Promise<IAuthUserDocument | null> {
    try {
      const user = AuthUser.findOne({ username }).exec();
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
      const user = AuthUser.findOne({ $or: [{ username }, { email }] }).exec();
      if (!user) return null;
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
}
