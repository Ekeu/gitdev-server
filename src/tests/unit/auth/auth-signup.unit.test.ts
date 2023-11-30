import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";

import {
  mockAuthDoc,
  mockSignUpPayload,
  mockSignUpPayloadWithNoUsername,
  mockUser,
  mockAUthUsersArray,
} from "@/tests/mocks/auth-user";
import { AuthUserControllers } from "@components/auth/controllers";
import { initAndSave } from "@components/auth/utils/common";
import { AuthUserServices } from "@components/auth/services";

jest.mock("@sendgrid/mail");
jest.mock("@config/bullmq/basemq");
jest.mock("@components/user/redis/cache/user");
jest.mock("@components/auth/bullmq/auth-mq");
jest.mock("@components/user/bullmq/user-mq");

jest.mock("@components/auth/services", () => ({
  AuthUserServices: {
    findUserByUsername: jest.fn(),
    findUserByEmail: jest.fn(),
  },
}));

jest.mock("@components/auth/utils/common", () => {
  return {
    initAndSave: jest.fn().mockImplementation(async () => {
      const authDoc = mockAuthDoc;
      const userDoc = mockUser;
      return { authDoc, userDoc };
    }),
  };
});

describe("Auth Controller [SignUp]", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    req.body = { ...mockSignUpPayload };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("Validation Errors", () => {
    it("should throw an error if no username is provided", async () => {
      req.body = mockSignUpPayloadWithNoUsername;
      await expect(AuthUserControllers.signUp(req, res)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Hey there! We need a username to get you started.",
      });
    });
    it("should throw an error if username is less than 5 characters", async () => {
      req.body = {
        ...mockSignUpPayload,
        username: "ted",
      };
      await expect(AuthUserControllers.signUp(req, res)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Just a bit short! Usernames should be at least 5 characters long.",
      });
    });
    it("should throw an error if email is invalid", async () => {
      req.body = {
        ...mockSignUpPayload,
        email: "mail",
      };
      await expect(AuthUserControllers.signUp(req, res)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "That email seems a bit off. Can you check it?",
      });
    });
    it("should throw an error if password is less than 8 characters", async () => {
      req.body = {
        ...mockSignUpPayload,
        password: "pass",
      };
      await expect(AuthUserControllers.signUp(req, res)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Let's beef up that password! Make sure it's at least 8 characters.",
      });
    });
  });

  describe("Existing User Errors", () => {
    it("should throw an error if username already exists", async () => {
      (AuthUserServices.findUserByUsername as jest.Mock).mockImplementationOnce(async () => {
        return mockAUthUsersArray[3];
      });

      req.body = {
        ...mockSignUpPayload,
        username: "monks17",
      };
      await expect(AuthUserControllers.signUp(req, res)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message: "Oops! The username you've chosen is already in use. Please choose a different username.",
      });
    });
    it("should throw an error if email already exists", async () => {
      (AuthUserServices.findUserByEmail as jest.Mock).mockImplementationOnce(async () => {
        return mockAUthUsersArray[3];
      });

      req.body = {
        ...mockSignUpPayload,
        email: "ulrich.uk.pro@gmail.com",
      };
      await expect(AuthUserControllers.signUp(req, res)).rejects.toMatchObject({
        httpCode: 400,
        name: "ValidationError",
        message:
          "The provided email is already associated with an account. If you forgot your password, please use the reset password option.",
      });
    });
  });

  it("should create a new user and auth document", async () => {
    req.body = mockSignUpPayload;

    await AuthUserControllers.signUp(req, res);

    expect(initAndSave).toHaveBeenCalled();
    expect(initAndSave).toHaveBeenCalledWith(mockSignUpPayload);
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData().success).toEqual(true);
  });
});
