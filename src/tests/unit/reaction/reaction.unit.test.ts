import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";

import { mockAuthLookup, mockPostCurrentUserPayload } from "@/tests/mocks/post";
import { mockReactionDoc, mockReactionReqBody, mockReactionReqParams } from "@/tests/mocks/reaction";
import { mockReactionUser } from "@/tests/mocks/reaction";
import { ReactionControllers } from "@components/reaction/controllers";
import { reactionCache } from "@components/reaction/redis/cache/reaction";
import { createReactionMQ } from "@components/reaction/bullmq/reaction-mq";
import { IReactionDocument } from "@components/reaction/interfaces";
import { ReactionServices } from "@components/reaction/services";
import { Types } from "mongoose";
import { UserServices } from "@components/user/services";
import { IUserDocument } from "@components/user/interfaces";

jest.mock("@config/bullmq/basemq");
jest.mock("@components/reaction/bullmq/reaction-mq");
jest.mock("@components/reaction/redis/cache/reaction");
jest.mock("@components/user/services");
jest.mock("@components/reaction/services");

jest.spyOn(UserServices, "getAuthLookUpData").mockResolvedValue(mockAuthLookup as unknown as IUserDocument);

describe("Reaction Controller", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    req.currentUser = { ...mockPostCurrentUserPayload, userId: mockReactionUser };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should create a reaction", async () => {
    req.body = { ...mockReactionReqBody };

    const saveSpy = jest.spyOn(reactionCache, "save");
    const jobSpy = jest.spyOn(createReactionMQ, "addJob");

    await ReactionControllers.createReaction(req, res);

    expect(reactionCache.save).toHaveBeenCalledWith(
      saveSpy.mock.calls[0][0],
      saveSpy.mock.calls[0][1],
      saveSpy.mock.calls[0][2],
    );

    expect(createReactionMQ.addJob).toHaveBeenCalledWith(jobSpy.mock.calls[0][0], jobSpy.mock.calls[0][1]);
    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should delete a reaction", async () => {
    req.body = { ...mockReactionReqBody };
    req.params = { ...mockReactionReqParams };

    const deleteSpy = jest.spyOn(reactionCache, "delete");
    const jobSpy = jest.spyOn(createReactionMQ, "addJob");

    await ReactionControllers.deleteReaction(req, res);

    expect(reactionCache.delete).toHaveBeenCalledWith(
      deleteSpy.mock.calls[0][0],
      deleteSpy.mock.calls[0][1],
      deleteSpy.mock.calls[0][2],
    );

    expect(createReactionMQ.addJob).toHaveBeenCalledWith(jobSpy.mock.calls[0][0], jobSpy.mock.calls[0][1]);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  describe("All reactions", () => {
    it("should get all reactions [cache]", async () => {
      req.params = { ...mockReactionReqParams };

      jest
        .spyOn(reactionCache, "get")
        .mockResolvedValueOnce({ reactions: [mockReactionDoc as IReactionDocument], total: 1 });
      await ReactionControllers.getPostReactions(req, res);

      expect(reactionCache.get).toHaveBeenCalledWith(req.params.postId);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData().success).toEqual(true);
    });

    it("should get all reactions [db]", async () => {
      req.params = { ...mockReactionReqParams };

      jest.spyOn(reactionCache, "get").mockResolvedValueOnce({ reactions: [], total: 0 });
      jest
        .spyOn(ReactionServices, "getPostReactions")
        .mockResolvedValueOnce({ reactions: [mockReactionDoc as IReactionDocument], total: 1 });
      await ReactionControllers.getPostReactions(req, res);

      expect(ReactionServices.getPostReactions).toHaveBeenCalledWith(
        { postId: new Types.ObjectId(req.params.postId) },
        { createdAt: -1 },
      );
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData().success).toEqual(true);
    });
  });

  describe("Post reaction by user", () => {
    it("should get a post reaction by user [cache]", async () => {
      req.params = { ...mockReactionReqParams };

      jest.spyOn(reactionCache, "getPostReactionByUser").mockResolvedValueOnce(mockReactionDoc as IReactionDocument);

      await ReactionControllers.getPostReactionByUser(req, res);

      expect(ReactionServices.getPostReactionByUser).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData().success).toEqual(true);
    });

    it("should get a post reaction by user [db]", async () => {
      req.params = { ...mockReactionReqParams };

      jest.spyOn(reactionCache, "getPostReactionByUser").mockResolvedValueOnce(null);
      jest.spyOn(ReactionServices, "getPostReactionByUser").mockResolvedValueOnce(mockReactionDoc as IReactionDocument);
      await ReactionControllers.getPostReactionByUser(req, res);

      expect(ReactionServices.getPostReactionByUser).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData().success).toEqual(true);
    });
  });

  describe("Reactions by user", () => {
    it("should get reactions by user [cache]", async () => {
      req.params = { ...mockReactionReqParams };

      jest
        .spyOn(reactionCache, "getReactionsByUser")
        .mockResolvedValueOnce({ reactions: [mockReactionDoc as IReactionDocument], total: 1 });
      await ReactionControllers.getReactionsByUser(req, res);

      expect(reactionCache.getReactionsByUser).toHaveBeenCalledWith(req.params.userId);
      expect(ReactionServices.getReactionsByUser).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData().success).toEqual(true);
    });

    it("should get reactions by user [db]", async () => {
      req.params = { ...mockReactionReqParams };

      jest.spyOn(reactionCache, "getReactionsByUser").mockResolvedValueOnce({ reactions: [], total: 0 });
      jest
        .spyOn(ReactionServices, "getReactionsByUser")
        .mockResolvedValueOnce({ reactions: [mockReactionDoc as IReactionDocument], total: 1 });
      await ReactionControllers.getReactionsByUser(req, res);

      expect(ReactionServices.getReactionsByUser).toHaveBeenCalledWith(req.params.userId);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData().success).toEqual(true);
    });
  });
});
