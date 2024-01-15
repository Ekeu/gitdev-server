import { jest, describe, it, expect, afterAll, beforeEach } from "@jest/globals";
import httpMocks from "node-mocks-http";

import { mockAuthLookup, mockPostCurrentUserPayload } from "@/tests/mocks/post";

import { UserServices } from "@components/user/services";
import { IUserDocument } from "@components/user/interfaces";
import { ChatControllers } from "@components/chat/controllers";
import { IOChat } from "@components/chat/socket";
import { mockChatReqBody, mockChatParams } from "@/tests/mocks/chat";
import { MailServices } from "@components/mail/services";
import { emailChatMQ } from "@components/mail/bullmq/mail-mq";
import { afterEach } from "node:test";
import { IEmailJob } from "@components/mail/interfaces";

jest.mock("@sendgrid/mail");
jest.mock("@helpers/cloudinary");
jest.mock("@config/bullmq/basemq");
jest.mock("@components/user/services");
jest.mock("@components/mail/services");
jest.mock("@components/chat/bullmq/chat-mq");
jest.mock("@components/mail/bullmq/mail-mq");
jest.mock("@components/chat/redis/cache/chat");
jest.mock("@components/chat/socket/index", () => {
  return {
    IOChat: {
      io: {
        emit: jest.fn(),
      },
    },
  };
});

jest.spyOn(UserServices, "getAuthLookUpData").mockResolvedValue(mockAuthLookup as unknown as IUserDocument);
jest.spyOn(MailServices, "getEJSTemplate").mockResolvedValue("template");

describe("Chat Controller", () => {
  let req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    emailChatMQ.addJob = jest.fn() as (jobName: string, data: IEmailJob) => Promise<void>;
    req.currentUser = { ...mockPostCurrentUserPayload };
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("should call socket.io emit twice", async () => {
      req.body = { ...mockChatReqBody };
      req.params = { ...mockChatParams };

      await ChatControllers.sendMessage(req, res);
      expect(IOChat.io.emit).toHaveBeenCalledTimes(2);
    });

    it("should call addJob on emailChatMQ", async () => {
      req.body = { ...mockChatReqBody };
      req.params = { ...mockChatParams };

      await ChatControllers.sendMessage(req, res);
      expect(emailChatMQ.addJob).toHaveBeenCalled();
    });

    it("should not call addJob on emailChatMQ", async () => {
      req.body = { ...mockChatReqBody, isRead: true };
      req.params = { ...mockChatParams };

      await ChatControllers.sendMessage(req, res);
      expect(emailChatMQ.addJob).not.toHaveBeenCalled();
    });

    it("should throw an error if userTo is not found", async () => {
      req.body = { ...mockChatReqBody };
      req.params = { ...mockChatParams, to: "123" };

      await expect(ChatControllers.sendMessage(req, res)).rejects.toThrow("UserNotFound");
    });

    it("should call socket.io emit twice", async () => {
      req.body = { ...mockChatReqBody };
      req.params = { ...mockChatParams };

      await ChatControllers.sendMessage(req, res);
      expect(IOChat.io.emit).toHaveBeenCalledTimes(2);
    });
  });
});
