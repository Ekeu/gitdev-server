import { joiRequestValidator } from "@utils/decorators/joi-validation-decorator";
import { Request, Response } from "express";
import { messageSchema, messageSchemaParams } from "./data/joi-schemes/message";
import { Types } from "mongoose";
import { uploadImage } from "@helpers/cloudinary";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@utils/errors/api-error";
import { ChatServices } from "./services";
import { IChatDeletionType, IChatMessageDocument, IChatMessageEmit, IChatMessageNotification } from "./interfaces";
import { IOChat } from "./socket";
import { UserServices } from "@components/user/services";
import { MailServices } from "@components/mail/services";
import path from "path";
import { IAuthUserDocument } from "@components/auth/interfaces";
import { env } from "@/env";
import { emailChatMQ } from "@components/mail/bullmq/mail-mq";
import { GITDEV_EMAIL_CHAT_JOB } from "@components/mail/constants";
import { chatCache } from "./redis/cache/chat";
import { chatDeleteMessageMQ, chatReactionMessageMQ, chatReadMesssageMQ, chatSaveMessageMQ } from "./bullmq/chat-mq";
import {
  GITDEV_CHAT_DELETE_MESSAGE_JOB,
  GITDEV_CHAT_REACTION_MESSAGE_JOB,
  GITDEV_CHAT_READ_MESSAGE_JOB,
  GITDEV_CHAT_SAVE_MESSAGE_JOB,
} from "./constants";
import { IUserDocument } from "@components/user/interfaces";

export class ChatControllers {
  @joiRequestValidator(messageSchema)
  @joiRequestValidator(messageSchemaParams, { body: false, params: true })
  static async sendMessage(req: Request, res: Response): Promise<void> {
    const { chatId: _chatId, isRead, message } = req.body;
    const { to } = req.params;
    const { type, content } = message;

    const messageId = new Types.ObjectId();
    const chatId = _chatId ? new Types.ObjectId(_chatId) : new Types.ObjectId();

    let imgURL = "";

    if (type === "image" && content) {
      const response = await uploadImage(content, {
        folder: `messages/images/${req.currentUser?.userId}`,
        public_id: req.currentUser?.userId,
        invalidate: true,
        overwrite: true,
      });

      if (!response.public_id) {
        throw new ApiError("ImageUploadError", StatusCodes.BAD_REQUEST);
      }

      imgURL = response.secure_url;
    }

    const userTo = await UserServices.getAuthLookUpData(to, ["username", "_id"], ["avatar", "_id"]);
    const userFrom = await UserServices.getAuthLookUpData(
      req.currentUser?.userId as string,
      ["username", "_id"],
      ["avatar", "_id"],
    );

    if (!userTo || !userFrom) {
      throw new ApiError("UserNotFound", StatusCodes.NOT_FOUND);
    }

    const messageData = {
      _id: messageId,
      chat: chatId,
      message: {
        type,
        content: imgURL || content,
      },
      to,
      isRead,
      from: req.currentUser?.userId as string,
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const emitMessageData = {
      from: userFrom,
      to: userTo,
      message: {
        type,
        content: imgURL || content,
      },
    };

    const messageDoc = ChatServices.initChatMessageDocument(messageData);

    ChatControllers.emitChatMessage(emitMessageData);

    if (!isRead) {
      ChatControllers.sendChatMessageNotification({ from: req.currentUser?.userId as string, to });
    }

    await chatCache.createChatList(req.currentUser?.userId as string, to, chatId.toString());
    await chatCache.createChatList(to, req.currentUser?.userId as string, chatId.toString());
    await chatCache.saveMessage(chatId.toString(), messageDoc);

    chatSaveMessageMQ.addJob(GITDEV_CHAT_SAVE_MESSAGE_JOB, messageData);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Message sent successfully",
      data: {
        chatId: chatId.toString(),
      },
    });
  }

  private static emitChatMessage(data: IChatMessageEmit) {
    IOChat.io.emit("message", data);
    IOChat.io.emit("dms", data);
  }

  private static async sendChatMessageNotification(data: IChatMessageNotification) {
    const { from, to } = data;

    const userTo = await UserServices.getAuthLookUpData(to, ["username", "email"]);
    const userFrom = await UserServices.getAuthLookUpData(from, ["username"]);
    const ejsFile = path.join(__dirname, "..", "..", "config", "mail", "templates", "notification.ejs");

    const message = `${(userFrom?.authUser as IAuthUserDocument).username} sent you a message`;

    const ejsTemplate = await MailServices.getEJSTemplate(ejsFile, {
      username: (userTo?.authUser as IAuthUserDocument).username,
      message,
      notificationLink: `${env.GITDEV_CLIENT_URL}`,
    });

    emailChatMQ.addJob(GITDEV_EMAIL_CHAT_JOB, {
      value: {
        to: (userTo?.authUser as IAuthUserDocument).email,
        subject: `[GitDev] ${message}`,
        html: ejsTemplate,
      },
    });
  }

  static async addChatUsers(req: Request, res: Response): Promise<void> {
    const { to } = req.body;

    const chatUsers = await chatCache.addChatUsers({ from: req.currentUser?.userId as string, to });

    IOChat.io.emit("add_chat", chatUsers);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Chat users added successfully",
      data: {
        chatUsers,
      },
    });
  }

  static async removeChatUsers(req: Request, res: Response): Promise<void> {
    const { to } = req.body;

    const chatUsers = await chatCache.removeChatUsers({ from: req.currentUser?.userId as string, to });

    IOChat.io.emit("remove_chat", chatUsers);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Chat users removed successfully",
      data: {
        chatUsers,
      },
    });
  }

  static async getUserDMs(req: Request, res: Response): Promise<void> {
    const userId = req.currentUser?.userId as string;

    let messages: IChatMessageDocument[] = [];

    const cachedMessages = await chatCache.getUserDMs(userId);

    if (cachedMessages.length === 0) {
      messages = await ChatServices.getUserDMs(userId);
    } else {
      messages = cachedMessages;
      for (let index = 0; index < messages.length; index++) {
        const from = await UserServices.getAuthLookUpData(
          messages[index].from.toString(),
          ["username", "_id"],
          ["avatar", "_id"],
        );
        const to = await UserServices.getAuthLookUpData(
          messages[index].to.toString(),
          ["username", "_id"],
          ["avatar", "_id"],
        );
        messages[index].from = from as IUserDocument;
        messages[index].to = to as IUserDocument;
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User DMs fetched successfully",
      data: {
        dms: messages,
      },
    });
  }

  static async getMessages(req: Request, res: Response): Promise<void> {
    const { to } = req.params;

    let messages: IChatMessageDocument[] = [];

    const cachedMessages = await chatCache.getMessages(req.currentUser?.userId as string, to);

    if (cachedMessages.length === 0) {
      messages = await ChatServices.getMessages(req.currentUser?.userId as string, to);
    } else {
      messages = cachedMessages;
      for (let index = 0; index < messages.length; index++) {
        const from = await UserServices.getAuthLookUpData(
          messages[index].from.toString(),
          ["username", "_id"],
          ["avatar", "_id"],
        );
        const _to = await UserServices.getAuthLookUpData(
          messages[index].to.toString(),
          ["username", "_id"],
          ["avatar", "_id"],
        );
        messages[index].from = from as IUserDocument;
        messages[index].to = _to as IUserDocument;
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Messages fetched successfully",
      data: {
        messages,
      },
    });
  }

  static async deleteMessage(req: Request, res: Response): Promise<void> {
    const { to, messageId, deletionType } = req.params as {
      to: string;
      messageId: string;
      deletionType: IChatDeletionType;
    };

    const message = await chatCache.deleteMessage(req.currentUser?.userId as string, to, messageId, deletionType);

    if (!message) {
      throw new ApiError("MessageNotFound", StatusCodes.NOT_FOUND);
    }

    IOChat.io.emit("delete_message", message);
    IOChat.io.emit("dms", message);

    chatDeleteMessageMQ.addJob(GITDEV_CHAT_DELETE_MESSAGE_JOB, { messageId, deletionType });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Message deleted successfully",
    });
  }

  static async readMessages(req: Request, res: Response): Promise<void> {
    const { to } = req.params;

    const message = await chatCache.readMessages(req.currentUser?.userId as string, to);

    if (!message) {
      throw new ApiError("MessagesReadError", StatusCodes.NOT_FOUND);
    }

    IOChat.io.emit("read_messages", message);
    IOChat.io.emit("dms", message);

    chatReadMesssageMQ.addJob(GITDEV_CHAT_READ_MESSAGE_JOB, { from: req.currentUser?.userId as string, to });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Messages read successfully",
    });
  }

  static async addReaction(req: Request, res: Response): Promise<void> {
    const { messageId, reaction } = req.body;
    const { to } = req.params;

    const message = await chatCache.addReaction(req.currentUser?.userId as string, to, messageId, reaction);

    if (!message) {
      throw new ApiError("MessageNotFound", StatusCodes.NOT_FOUND);
    }

    IOChat.io.emit("message_reaction", message);
    IOChat.io.emit("dms", message);

    chatReactionMessageMQ.addJob(GITDEV_CHAT_REACTION_MESSAGE_JOB, {
      messageId,
      from: req.currentUser?.userId as string,
      reaction,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Reaction added successfully",
    });
  }
}
