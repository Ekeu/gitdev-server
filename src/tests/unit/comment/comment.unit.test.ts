import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";

import { mockPostCurrentUserPayload } from "@/tests/mocks/post";
import {
  mockCommentDoc,
  mockUpdateCommentReqBody,
  mockUpdateCommentReqParams,
  mockCommentReqBody,
  mockCommentReqParams,
} from "@/tests/mocks/comment";
import { CommentServices } from "@components/comment/services";
import { ICommentDocument } from "@components/comment/interfaces";
import { CommentControllers } from "@components/comment/controllers";

jest.mock("@sendgrid/mail");
jest.mock("@config/bullmq/basemq");
jest.mock("@components/user/services");
jest.mock("@components/notification/services");

jest.spyOn(CommentServices, "createComment").mockResolvedValue(mockCommentDoc as ICommentDocument);
jest.spyOn(CommentServices, "getComments").mockResolvedValue([mockCommentDoc] as ICommentDocument[]);

describe("Comment Controller", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    req.currentUser = { ...mockPostCurrentUserPayload };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should create a comment", async () => {
    req.body = { ...mockCommentReqBody };
    req.params = { ...mockCommentReqParams };

    await CommentControllers.createComment(req, res);

    expect(CommentServices.createComment).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should get all comments", async () => {
    req.params = { ...mockCommentReqParams, page: "1" };

    jest.spyOn(CommentServices, "countComments").mockResolvedValueOnce(1);

    await CommentControllers.getComments(req, res);

    expect(CommentServices.getComments).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should delete a comment", async () => {
    req.params = { ...mockCommentReqParams, commentId: mockCommentDoc._id };

    jest.spyOn(CommentServices, "deleteComment").mockResolvedValueOnce({ commentId: req.params.commentId });

    await CommentControllers.deleteComment(req, res);

    expect(CommentServices.deleteComment).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should update a comment", async () => {
    req.params = { ...mockCommentReqParams, ...mockUpdateCommentReqParams };
    req.body = { ...mockUpdateCommentReqBody };

    jest
      .spyOn(CommentServices, "updateComment")
      .mockResolvedValueOnce({ content: req.body.content } as ICommentDocument);

    await CommentControllers.updateComment(req, res);

    expect(CommentServices.updateComment).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should vote a comment", async () => {
    req.params = { ...mockCommentReqParams, ...mockUpdateCommentReqParams };
    req.body = { value: 1 };

    jest.spyOn(CommentServices, "voteComment").mockResolvedValueOnce({ voted: true });

    await CommentControllers.voteComment(req, res);

    expect(CommentServices.voteComment).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });
});
