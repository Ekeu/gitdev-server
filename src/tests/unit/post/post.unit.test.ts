import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";

import { IUserDocument } from "@components/user/interfaces";
import { UserServices } from "@components/user/services";
import {
  mockCachedPost,
  mockAuthLookup,
  mockPostDoc,
  mockPostEmittedData,
  mockPostCurrentUserPayload,
  mockPostReqBody,
  mockPostUpdate,
} from "@/tests/mocks/post";
import { PostServices } from "@components/post/services";
import { IPostDocument } from "@components/post/interfaces";
import { IOPost } from "@components/post/socket";
import { postCache } from "@components/post/redis/cache/post";
import { PostControllers } from "@components/post/controllers";
import { createPostMQ, deletePostMQ, updatedPostMQ } from "@components/post/bullmq/post-mq";
import {
  GITDEV_CREATE_POST_JOB,
  GITDEV_DELETE_POST_JOB,
  GITDEV_IO_DELETE_POST,
  GITDEV_IO_NEW_POST,
  GITDEV_IO_UPDATE_POST,
  GITDEV_UPDATE_POST_JOB,
} from "@components/post/constants";

jest.mock("@sendgrid/mail");
jest.mock("@helpers/cloudinary");
jest.mock("@config/bullmq/basemq");
jest.mock("@components/post/bullmq/post-mq");
jest.mock("@components/post/redis/cache/post");
jest.mock("@components/post/socket/index", () => {
  return {
    IOPost: {
      io: {
        emit: jest.fn(),
      },
    },
  };
});

jest.spyOn(UserServices, "getAuthLookUpData").mockResolvedValue(mockAuthLookup as unknown as IUserDocument);

describe("Post Controller", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    req.currentUser = { ...mockPostCurrentUserPayload };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should create a post", async () => {
    req.body = { ...mockPostReqBody };
    jest.spyOn(PostServices, "initPostDocument").mockReturnValueOnce(mockPostDoc as unknown as IPostDocument);
    await PostControllers.createPost(req, res);

    expect(IOPost.io.emit).toHaveBeenCalledWith(GITDEV_IO_NEW_POST, mockPostEmittedData);
    expect(postCache.save).toHaveBeenCalledWith(mockCachedPost);
    expect(createPostMQ.addJob).toHaveBeenCalledWith(GITDEV_CREATE_POST_JOB, { value: mockPostDoc });
    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should get all posts if in cache", async () => {
    req.params = { page: 1 };
    jest.spyOn(postCache, "get").mockResolvedValueOnce([mockPostDoc] as unknown as IPostDocument[]);
    jest.spyOn(postCache, "count").mockResolvedValueOnce(1);
    jest.spyOn(UserServices, "getAuthLookUpData").mockResolvedValueOnce(mockAuthLookup as unknown as IUserDocument);
    await PostControllers.getPosts(req, res);

    expect(postCache.get).toHaveBeenCalledWith({ start: 0, end: 10 });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should get all posts drom DB if not in cache", async () => {
    req.params = { page: 1 };
    jest.spyOn(postCache, "get").mockResolvedValueOnce([]);
    jest.spyOn(postCache, "count").mockResolvedValueOnce(0);
    jest.spyOn(PostServices, "getPosts").mockResolvedValueOnce([mockPostDoc] as unknown as IPostDocument[]);
    jest.spyOn(PostServices, "countPosts").mockResolvedValueOnce(1);
    await PostControllers.getPosts(req, res);

    expect(PostServices.getPosts).toHaveBeenCalledWith({}, 0, 10, { createdAt: -1 });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should delete a post", async () => {
    req.params = { postId: "postId" };
    jest.spyOn(postCache, "delete").mockResolvedValueOnce();
    await PostControllers.deletePost(req, res);

    expect(IOPost.io.emit).toHaveBeenCalledWith(GITDEV_IO_DELETE_POST, { postId: "postId" });
    expect(postCache.delete).toHaveBeenCalledWith("postId", req.currentUser?.userId);
    expect(deletePostMQ.addJob).toHaveBeenCalledWith(GITDEV_DELETE_POST_JOB, {
      postId: "postId",
      userId: req.currentUser?.userId,
    });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should update a post", async () => {
    req.params = { postId: "postId" };
    req.body = { ...mockPostReqBody };
    const spy = jest.spyOn(postCache, "update").mockResolvedValueOnce(mockPostUpdate as unknown as IPostDocument);
    await PostControllers.updatePost(req, res);

    expect(postCache.update).toHaveBeenCalledWith("postId", req.body);
    expect(IOPost.io.emit).toHaveBeenCalledWith(GITDEV_IO_UPDATE_POST, mockPostUpdate);
    expect(updatedPostMQ.addJob).toHaveBeenCalledWith(GITDEV_UPDATE_POST_JOB, {
      postId: "postId",
      value: mockPostUpdate,
    });
    const result = await spy.mock.results[0].value;
    expect((result as IPostDocument).title).toEqual(mockPostUpdate.title);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });
});
