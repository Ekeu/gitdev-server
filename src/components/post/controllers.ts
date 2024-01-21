import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { Request, Response } from "express";
import { imageRemoveTagSchema, imageUploadSchema, postSchema } from "./data/joi-schemes/post";
import { PostServices } from "./services";
import { postCache } from "./redis/cache/post";
import { StatusCodes } from "http-status-codes";
import { IOPost } from "./socket";
import { UserServices } from "@components/user/services";
import { createPostMQ, deletePostMQ, updatedPostMQ } from "./bullmq/post-mq";
import {
  GITDEV_CREATE_POST_JOB,
  GITDEV_DELETE_POST_JOB,
  GITDEV_IO_DELETE_POST,
  GITDEV_IO_NEW_POST,
  GITDEV_IO_UPDATE_POST,
  GITDEV_POST_PAGE_SIZE,
  GITDEV_UPDATE_POST_JOB,
} from "./constants";
import { deleteImagesByTag, removeTagFromImages, uploadImage } from "@helpers/cloudinary";
import _ from "lodash";
import { IPostDocument, IPostRange } from "./interfaces";
import { IUserDocument } from "@components/user/interfaces";
import { ApiError } from "@utils/errors/api-error";

export class PostControllers {
  @joiRequestValidator(postSchema)
  static async createPost(req: Request, res: Response) {
    const postData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: req.currentUser?.userId,
    };

    const postDoc = PostServices.initPostDocument(postData);

    const user = await UserServices.getAuthLookUpData(
      req.currentUser?.userId as string,
      ["username", "_id"],
      ["avatar", "_id"],
    );

    const post = { ...postDoc.toObject(), user };

    IOPost.io.emit(GITDEV_IO_NEW_POST, post);

    await postCache.save({
      post: postDoc.toObject(),
      key: postDoc._id.toString(),
      userId: postDoc.user.toString(),
      redisId: req.currentUser?.redisId as string,
    });

    createPostMQ.addJob(GITDEV_CREATE_POST_JOB, { value: postDoc.toObject() });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Post created successfully",
    });
  }

  @joiRequestValidator(imageUploadSchema)
  static async uploadPostImage(req: Request, res: Response) {
    const { img, options } = req.body;

    const response = await uploadImage(img, {
      ...options,
      folder: "posts",
      tags: [`draft=${req.currentUser?.userId}`],
    });

    if (!response.public_id) {
      throw new ApiError("ImageUploadError", StatusCodes.BAD_REQUEST);
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: response.secure_url,
        public_id: response.public_id,
      },
    });
  }

  @joiRequestValidator(imageRemoveTagSchema)
  static async removeTagFromPostImages(req: Request, res: Response) {
    const { publicIds } = req.body;

    const response = await removeTagFromImages(publicIds, `draft=${req.currentUser?.userId}`);

    if (response.public_ids && response.public_ids.length > 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Tags removed successfully",
      });
    }

    throw new ApiError("NoImagesOrTagsFound", StatusCodes.NOT_FOUND);
  }

  static async deletePostDraftImagesByTag(req: Request, res: Response) {
    const response = await deleteImagesByTag(`draft=${req.currentUser?.userId}`);

    if (response.deleted && _.values(response.deleted).includes("deleted")) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Images deleted successfully",
      });
    }

    throw new ApiError("DeleteImagesError", StatusCodes.INTERNAL_SERVER_ERROR);
  }

  static async getPosts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;

    const skip = (parseInt(page) - 1) * GITDEV_POST_PAGE_SIZE;
    const limit = GITDEV_POST_PAGE_SIZE * parseInt(page);

    const range: IPostRange = {
      start: skip === 0 ? skip : skip + 1,
      end: limit,
    };

    let posts: IPostDocument[] = [];
    let total: number = 0;

    const cachedPosts = await postCache.getAll(range);

    if (cachedPosts?.length) {
      posts = cachedPosts;
      total = await postCache.count();

      for (let index = 0; index < posts.length; index++) {
        const user = await UserServices.getAuthLookUpData(
          posts[index].user.toString(),
          ["username", "_id"],
          ["avatar", "_id"],
        );
        posts[index].user = user as IUserDocument;
      }
    } else {
      posts = await PostServices.getPosts({}, skip, limit, { createdAt: -1 });
      total = await PostServices.countPosts();
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Posts fetched successfully",
      data: {
        posts,
        total,
      },
    });
  }

  static async deletePost(req: Request, res: Response) {
    const { postId } = req.params;

    IOPost.io.emit(GITDEV_IO_DELETE_POST, { postId });

    await postCache.delete(postId, req.currentUser?.userId as string);

    deletePostMQ.addJob(GITDEV_DELETE_POST_JOB, { postId, userId: req.currentUser?.userId });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Post deleted successfully",
    });
  }

  @joiRequestValidator(postSchema)
  static async updatePost(req: Request, res: Response) {
    const { postId } = req.params;

    const updatedPost = await postCache.update(postId, req.body);

    IOPost.io.emit(GITDEV_IO_UPDATE_POST, updatedPost);

    updatedPostMQ.addJob(GITDEV_UPDATE_POST_JOB, { postId, value: updatedPost });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Post updated successfully",
    });
  }

  static async getPost(req: Request, res: Response) {
    const { postId } = req.params;

    let post: IPostDocument | null = null;

    post = await postCache.get(postId);

    if (!post) {
      post = await PostServices.findPostById(postId);
    }

    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Post not found",
        data: null,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  }
}
