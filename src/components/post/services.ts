import { ApiError } from "@utils/errors/api-error";
import { Post } from "./data/models/post";
import { INewPost, IPostDocument } from "./interfaces";
import { StatusCodes } from "http-status-codes";
import { User } from "@components/user/data/models/user";
import { IPostQuery } from "@components/post/interfaces";
import { Types } from "mongoose";
import { getUserAuthLookup } from "@utils/common";

export class PostServices {
  static initPostDocument(data: INewPost): IPostDocument {
    const post = new Post(data);
    return post;
  }

  static async createPost(data: INewPost): Promise<IPostDocument> {
    try {
      const post = Post.create(data);
      const user = User.updateOne({ _id: data.user }, { $inc: { postsCount: 1 } });
      const [postDoc] = await Promise.all([post, user]);
      return postDoc;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async getPosts(
    query: IPostQuery,
    skip: number = 0,
    limit: number = 0,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<IPostDocument[]> {
    try {
      const posts = await Post.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        getUserAuthLookup(),
        { $unwind: "$user" },
      ]);
      return posts;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async countPosts(): Promise<number> {
    try {
      const count = await Post.find({}).countDocuments();
      return count;
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const post = Post.findByIdAndDelete(postId);
      const user = User.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
      await Promise.all([post, user]);
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }

  static async updatePost(postId: string, updatedPost: IPostDocument): Promise<void> {
    await Post.findByIdAndUpdate(postId, updatedPost);
  }

  static async findPostById(id: string): Promise<IPostDocument | null> {
    try {
      const post = await Post.aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        getUserAuthLookup(),
        { $unwind: "$user" },
      ]);
      if (!post.length) return null;
      return post[0];
    } catch (error) {
      const err = error as Error;
      throw new ApiError(err.name, StatusCodes.BAD_REQUEST, err.message);
    }
  }
}
