import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";

import { mockPostCurrentUserPayload } from "@/tests/mocks/post";
import { mockFollowDoc, mockFollowGetUser, mockFollowReqParams } from "@/tests/mocks/follow";
import { followCache } from "@components/follow/redis/cache/follow";
import { userCache } from "@components/user/redis/cache/user";
import { IUserDocument } from "@components/user/interfaces";
import { UserServices } from "@components/user/services";
import { FollowServices } from "@components/follow/services";
import { IFollowDocument } from "@components/follow/interfaces";
import { FollowControllers } from "@components/follow/controllers";

jest.mock("@sendgrid/mail");
jest.mock("@config/bullmq/basemq");
jest.mock("@components/follow/bullmq/follow-mq");
jest.mock("@components/follow/redis/cache/follow");
jest.mock("@components/user/services");
jest.mock("@components/notification/services");
jest.mock("@components/follow/services");
jest.mock("@components/follow/socket/index", () => {
  return {
    IOFollow: {
      io: {
        emit: jest.fn(),
      },
    },
  };
});

describe("Following Controller", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    req.currentUser = { ...mockPostCurrentUserPayload };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should follow a user", async () => {
    req.params = { ...mockFollowReqParams };

    jest.spyOn(followCache, "follow");
    jest.spyOn(userCache, "get").mockResolvedValue(mockFollowGetUser as unknown as IUserDocument);
    jest.spyOn(UserServices, "getSelectedFieldsById").mockResolvedValue(mockFollowGetUser as unknown as IUserDocument);
    jest.spyOn(FollowServices, "initFollowDocument").mockReturnValue(mockFollowDoc as unknown as IFollowDocument);

    await FollowControllers.follow(req, res);

    expect(followCache.follow).toHaveBeenCalled();
    expect(followCache.follow).toHaveBeenCalledWith(mockPostCurrentUserPayload.userId, mockFollowReqParams.followingId);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should dunfollow a user", async () => {
    req.params = { ...mockFollowReqParams };

    jest.spyOn(followCache, "unfollow");

    await FollowControllers.unfollow(req, res);

    expect(followCache.unfollow).toHaveBeenCalled();
    expect(followCache.unfollow).toHaveBeenCalledWith(
      mockPostCurrentUserPayload.userId,
      mockFollowReqParams.followingId,
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });
});
