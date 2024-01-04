import { ApiError } from "@utils/errors/api-error";
import { StatusCodes } from "http-status-codes";
import { generateFromEmail } from "unique-username-generator";
import { IUserDocument, TUserBlockAction } from "./interfaces";
import { User } from "./data/models/user";
import { ObjectId, Types } from "mongoose";
import { ISocialAuthGithubProfile, ISocialAuthGoogleProfile } from "@components/auth/interfaces";
import { initAndSave } from "@components/auth/utils/common";
import { removeSpacesFromUsername } from "@utils/common";

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
      return data as IUserDocument;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async getSelectedFieldsById(id: string, fields: string[]): Promise<IUserDocument | null> {
    try {
      const data = await User.findById(id).select(fields.join(" "));
      if (!data) return null;
      return data;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async getAuthLookUpData(
    id: string,
    authFields: string[] = [],
    userFields: string[] = [],
  ): Promise<IUserDocument | null> {
    try {
      const user = await User.aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: "authusers",
            localField: "authUser",
            foreignField: "_id",
            as: "authUser",
            pipeline: [
              {
                $project: authFields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {}),
              },
            ],
          },
        },
        { $unwind: "$authUser" },
        {
          $project: userFields.reduce((acc, field) => ({ ...acc, [field]: 1 }), { authUser: 1 }),
        },
      ]);
      if (!user.length) return null;
      return user[0];
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async createSocialAccount(data: ISocialAuthGithubProfile | ISocialAuthGoogleProfile): Promise<IUserDocument> {
    try {
      const { userDoc, authDoc } = await initAndSave({
        username:
          removeSpacesFromUsername((data as ISocialAuthGithubProfile).username) ||
          removeSpacesFromUsername((data as ISocialAuthGoogleProfile).displayName) ||
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

  static initUserDocument = (authUser: string | ObjectId, avatar: string): IUserDocument => {
    const user = new User({
      avatar,
      authUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return user.toObject();
  };

  static async updateUserBlockList(userId: string, blockedUserId: string, action: TUserBlockAction) {
    try {
      const _userId = new Types.ObjectId(userId);
      const _blockedUserId = new Types.ObjectId(blockedUserId);
      const operator = action === "block" ? "$push" : "$pull";

      const blockedFilter = action === "block" ? { $ne: _blockedUserId } : _blockedUserId;
      const blockedByFilter = action === "block" ? { $ne: _userId } : _userId;

      await User.bulkWrite([
        {
          updateOne: {
            filter: { _id: _userId, blocked: blockedFilter },
            update: { [operator]: { blocked: _blockedUserId } },
          },
        },
        {
          updateOne: {
            filter: { _id: _blockedUserId, blockedBy: blockedByFilter },
            update: { [operator]: { blockedBy: _userId } },
          },
        },
      ]);
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
}
