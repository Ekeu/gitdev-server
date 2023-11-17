import { ApiError } from "@utils/errors/api-error";
import { StatusCodes } from "http-status-codes";
import { generateFromEmail } from "unique-username-generator";
import { IUserDocument } from "./interfaces";
import { User } from "./data/models/user";
import { ObjectId, Types } from "mongoose";
import { ISocialAuthGithubProfile, ISocialAuthGoogleProfile } from "@components/auth/interfaces";
import { initAndSave } from "@components/auth/utils/common";

export class UserServices {
  static async createUser(data: IUserDocument): Promise<IUserDocument> {
    try {
      const user = await User.create(data);
      return user;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async findUserById(id: string): Promise<IUserDocument | null> {
    try {
      const data = await User.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "authusers",
            localField: "authUser",
            foreignField: "_id",
            as: "authUser",
          },
        },
        {
          $unwind: "$authUser",
        },
      ]);
      if (!data.length) return null;
      return data[0];
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async findUserByAuthId(id: string | ObjectId): Promise<IUserDocument | null> {
    try {
      const user = await User.findOne({ authUser: id });
      if (!user) return null;
      const data = await user.populate("authUser");
      return data;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async createSocialAccount(data: ISocialAuthGithubProfile | ISocialAuthGoogleProfile): Promise<IUserDocument> {
    try {
      const { userDoc, authDoc } = await initAndSave({
        username:
          (data as ISocialAuthGithubProfile).username ||
          (data as ISocialAuthGoogleProfile).displayName ||
          generateFromEmail(data._json.email),
        email: data._json.email,
        provider: data.provider,
      });

      return {
        ...userDoc,
        authUser: authDoc,
      } as IUserDocument;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
}
