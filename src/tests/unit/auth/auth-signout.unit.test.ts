import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";
import crypto from "crypto";

import { AuthToken } from "@components/auth/data/models/auth-token";
import { mockAuthTokenDoc, mockSignOutPayload, mockSignOutRefreshTokenCookie } from "@/tests/mocks/auth-user";
import { AuthUserControllers } from "@components/auth/controllers";
import { IAuthUserTokenDocument } from "@components/auth/interfaces";

jest.mock("@sendgrid/mail");
jest.mock("@config/bullmq/basemq");
jest.mock("crypto", () => ({
  createHmac: jest.fn().mockImplementation(function () {
    return {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue(mockSignOutRefreshTokenCookie.rfToken),
    };
  }),
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue("hex"),
  }),
}));

jest.spyOn(AuthToken, "findOne").mockResolvedValue(null);

describe("Auth Controller [SignOut]", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    req.body = { ...mockSignOutPayload };
    req.cookies = { ...mockSignOutRefreshTokenCookie };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should return response if no refresh token", async () => {
    req.cookies = {};
    await AuthUserControllers.signOut(req, res);
    expect(mockAuthTokenDoc.save).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(204);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it("should return response and clear cookies if user not found", async () => {
    await AuthUserControllers.signOut(req, res);
    expect(mockAuthTokenDoc.save).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(204);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res.cookies["rfToken"].value).toBe("");
  });
  it("should update user auth user token and clear cookies", async () => {
    jest.spyOn(AuthToken, "findOne").mockResolvedValueOnce(mockAuthTokenDoc as unknown as IAuthUserTokenDocument);
    await AuthUserControllers.signOut(req, res);
    expect(crypto.createHmac).toHaveBeenCalled();
    expect(mockAuthTokenDoc.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(204);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res.cookies["rfToken"].value).toBe("");
  });
});
