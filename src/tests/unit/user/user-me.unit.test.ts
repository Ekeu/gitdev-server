import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";

import { mockCurrentUserPayload } from "@/tests/mocks/user";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { IUserDocument } from "@components/user/interfaces";
import { UserServices } from "@components/user/services";
import { UserControllers } from "@components/user/controllers";
import { mockAuthDoc, mockUser, mockUserDoc } from "@/tests/mocks/auth-user";
import { userCache } from "@components/user/redis/cache/user";

jest.mock("@config/bullmq/basemq");
jest.mock("@components/user/redis/cache/user");

jest.mock("@components/user/redis/cache/user", () => {
  return {
    userCache: {
      get: jest.fn<() => Promise<IAuthUserDocument | IUserDocument | null>>(),
    },
  };
});

describe("User Controller [Me]", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    req.currentUser = { ...mockCurrentUserPayload };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should return user as null if user is not found in cache or DB", async () => {
    req.currentUser = { ...mockCurrentUserPayload, userId: null, authUser: null };
    (userCache.get as jest.MockedFunction<typeof userCache.get>)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    jest.spyOn(UserServices, "findUserById").mockResolvedValueOnce(null);

    await UserControllers.fetchUserProfile(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
    expect(res._getJSONData().user).toEqual(null);
  });

  it("should return user if found in cache or DB", async () => {
    (userCache.get as jest.MockedFunction<typeof userCache.get>)
      .mockResolvedValueOnce(mockAuthDoc as unknown as IAuthUserDocument)
      .mockResolvedValueOnce(mockUserDoc as unknown as IUserDocument);
    jest.spyOn(UserServices, "findUserById").mockResolvedValueOnce(mockUser as unknown as IUserDocument);

    await UserControllers.fetchUserProfile(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
    expect(res._getJSONData().user).not.toEqual(null);
  });
});
