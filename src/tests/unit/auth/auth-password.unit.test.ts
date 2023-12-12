import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";
import { AuthToken } from "@components/auth/data/models/auth-token";

import {
  mockResetPasswordPayload,
  mockResetPasswordTokenParams,
  mockForgotPasswordPayload,
  mockAuthDoc,
  mockAuthTokenDoc,
} from "@/tests/mocks/auth-user";
import { AuthUserControllers } from "@components/auth/controllers";
import { NextFunction } from "express";
import { AuthUserServices } from "@components/auth/services";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { emailMQ } from "@components/mail/bullmq/mail-mq";

jest.mock("@sendgrid/mail");
jest.mock("@config/bullmq/basemq");
jest.mock("@components/mail/bullmq/mail-mq");

jest.spyOn(AuthToken, "generateResetPasswordToken").mockResolvedValue("accessToken");
jest.spyOn(AuthToken, "updateOne").mockResolvedValue({} as any);
jest.spyOn(AuthToken, "findOne").mockResolvedValue(null);

describe("Auth Controller [Password]", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>, next: NextFunction;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("Forgot Password", () => {
    beforeEach(() => {
      req.body = { ...mockForgotPasswordPayload };
    });

    it("should throw an error if no email is provided", async () => {
      req.body = {
        ...mockForgotPasswordPayload,
        email: "",
      };
      await expect(AuthUserControllers.forgotPassword(req, res, next)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Don't forget to enter your email address!",
      });
    });
    it("should throw an error if email is not found", async () => {
      jest.spyOn(AuthUserServices, "findUserByEmail").mockResolvedValueOnce(null);
      await AuthUserControllers.forgotPassword(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it("should send an email and json response", async () => {
      jest
        .spyOn(AuthUserServices, "findUserByEmail")
        .mockResolvedValueOnce(mockAuthDoc as unknown as IAuthUserDocument);
      jest.spyOn(emailMQ, "addJob");
      await AuthUserControllers.forgotPassword(req, res, next);
      expect(emailMQ.addJob).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().success).toEqual(true);
    });
  });

  describe("Reset Password", () => {
    beforeEach(() => {
      req.body = { ...mockResetPasswordPayload };
      req.params = { ...mockResetPasswordTokenParams };
    });
    it("should throw an error if no password is provided", async () => {
      req.body = {
        ...mockResetPasswordPayload,
        password: "",
      };
      await expect(AuthUserControllers.resetPassword(req, res, next)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Please enter a new password.",
      });
    });
    it("should throw an error if password and confirm password do not match", async () => {
      req.body = {
        ...mockResetPasswordPayload,
        confirmPassword: "password1",
      };

      await expect(AuthUserControllers.resetPassword(req, res, next)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Passwords do not match.",
      });
    });
    it("should throw an error if reset token is invalid", async () => {
      jest.spyOn(AuthToken, "findOne").mockResolvedValueOnce(null);
      await AuthUserControllers.resetPassword(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it("should throw an error if reet token exists but does not match the user", async () => {
      jest.spyOn(AuthToken, "findOne").mockResolvedValueOnce(mockAuthDoc);
      jest.spyOn(AuthUserServices, "findAuthUserById").mockResolvedValueOnce(null);
      await AuthUserControllers.resetPassword(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it("should send an email and json response", async () => {
      jest.spyOn(AuthToken, "findOne").mockResolvedValueOnce(mockAuthTokenDoc);
      jest
        .spyOn(AuthUserServices, "findAuthUserById")
        .mockResolvedValueOnce(mockAuthDoc as unknown as IAuthUserDocument);
      jest.spyOn(emailMQ, "addJob");
      await AuthUserControllers.resetPassword(req, res, next);

      expect(emailMQ.addJob).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().success).toEqual(true);
    });
  });
});
