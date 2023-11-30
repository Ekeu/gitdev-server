import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";
import passport, { AuthenticateCallback } from "passport";
import { AuthToken } from "@components/auth/data/models/auth-token";

import { mockUser, mockSignInPayload } from "@/tests/mocks/auth-user";
import { AuthUserControllers } from "@components/auth/controllers";
import { NextFunction, Request, Response } from "express";

jest.mock("@sendgrid/mail");
jest.mock("@config/bullmq/basemq");

jest.mock("passport", () => ({
  authenticate: jest.fn(),
}));

jest.spyOn(AuthToken, "generateAccessToken").mockReturnValue("accessToken");
jest.spyOn(AuthToken, "generateRefreshToken").mockResolvedValue("refreshToken");
jest.spyOn(AuthToken, "findOne").mockResolvedValue(null);
jest.spyOn(AuthToken, "updateOne").mockResolvedValue({} as any);

describe("Auth Controller [SignIn]", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>, next: NextFunction;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    req.login = jest.fn();
    req.body = { ...mockSignInPayload };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("Validation Errors", () => {
    it("should throw an error if no email is provided", async () => {
      req.body = {
        ...mockSignInPayload,
        email: "",
      };
      await expect(AuthUserControllers.signIn(req, res, next)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Email field cannot be empty. Please enter your email.",
      });
    });
    it("should throw an error if no password is provided", async () => {
      req.body = {
        ...mockSignInPayload,
        password: "",
      };
      await expect(AuthUserControllers.signIn(req, res, next)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Password field cannot be empty. Please enter your password.",
      });
    });
  });

  it("should sign in a user", async () => {
    (passport.authenticate as any).mockImplementationOnce((_strategy: string, callback: AuthenticateCallback) => {
      return (_req: Request, _res: Response, _next: NextFunction) => {
        return callback(null, mockUser, undefined);
      };
    });

    req.login.mockImplementationOnce((...args: any[]) => {
      // args[2] is the done callback function
      args[2](null);
    });

    await AuthUserControllers.signIn(req, res, next);

    expect(passport.authenticate).toHaveBeenCalled();
    expect(AuthToken.generateAccessToken).toHaveBeenCalled();
    expect(AuthToken.generateRefreshToken).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().success).toEqual(true);
  });

  it("should not sign in a user with invalid credentials", async () => {
    (passport.authenticate as any).mockImplementationOnce((_strategy: string, callback: AuthenticateCallback) => {
      return (_req: Request, _res: Response, _next: NextFunction) => {
        return callback(new Error("Invalid credentials"), false);
      };
    });

    await AuthUserControllers.signIn(req, res, next);

    expect(passport.authenticate).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
