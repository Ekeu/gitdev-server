import { GITDEV_CHAT_CACHE } from "@components/chat/constants";
import { IChatDeletionType, IChatMessageDocument, IChatUsers } from "@components/chat/interfaces";
import { logger } from "@config/logger";
import { RedisClient } from "@config/redis/client";
import { ApiError } from "@utils/errors/api-error";
import _ from "lodash";

export class ChatCache extends RedisClient {
  constructor() {
    super(GITDEV_CHAT_CACHE);
  }

  async createChatList(from: string, to: string, chatId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const dms = await this.client.LRANGE(`dms:${from}`, 0, -1);
      if (dms.length === 0) {
        await this.client.LPUSH(`dms:${from}`, JSON.stringify({ to, chatId }));
      } else {
        const updatedDms = dms.map((dm) => JSON.parse(dm));
        const index = _.findIndex(updatedDms, { to });
        if (index === -1) {
          await this.client.LPUSH(`dms:${from}`, JSON.stringify({ to, chatId }));
        }
      }
    } catch (error) {
      logger.error(`Failed creating chat list in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async saveMessage(chatId: string, message: IChatMessageDocument): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.RPUSH(`messages:${chatId}`, JSON.stringify(message));
    } catch (error) {
      logger.error(`Failed saving message in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async addChatUsers(chatUsers: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const _chatUsers = await this.getChatUsers();
      const index = _.findIndex(_chatUsers, { from: chatUsers.from, to: chatUsers.to });
      if (index === -1) {
        await this.client.RPUSH("chatUsers", JSON.stringify(chatUsers));
        return [..._chatUsers, chatUsers];
      }
      return _chatUsers;
    } catch (error) {
      logger.error(`Failed adding chat users in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async removeChatUsers(chatUsers: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const _chatUsers = await this.getChatUsers();
      const index = _.findIndex(_chatUsers, { from: chatUsers.from, to: chatUsers.to });
      if (index !== -1) {
        await this.client.LREM("chatUsers", 0, JSON.stringify(chatUsers));
        _chatUsers.splice(index, 1);
      }
      return _chatUsers;
    } catch (error) {
      logger.error(`Failed removing chat users in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  private async getChatUsers(): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const chatUsers = await this.client.LRANGE("chatUsers", 0, -1);
      const parsedChatUsers = chatUsers.map((chatUser) => JSON.parse(chatUser));
      return parsedChatUsers;
    } catch (error) {
      logger.error(`Failed getting chat users in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async getUserDMs(userId: string): Promise<IChatMessageDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const dms = await this.client.LRANGE(`dms:${userId}`, 0, -1);
      const messages: IChatMessageDocument[] = [];

      for (const dm of dms) {
        const parsedDm = JSON.parse(dm);
        const lastMessage = await this.client.LINDEX(`messages:${parsedDm.chatId}`, -1);
        if (lastMessage) {
          messages.push(JSON.parse(lastMessage));
        }
      }

      return messages;
    } catch (error) {
      logger.error(`Failed getting user dms in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async getMessages(from: string, to: string): Promise<IChatMessageDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const dms = await this.client.LRANGE(`dms:${from}`, 0, -1);
      const parsedDms = dms.map((dm) => JSON.parse(dm));
      const _to = _.find(parsedDms, { to });
      if (_to) {
        const messages = await this.client.LRANGE(`messages:${_to.chatId}`, 0, -1);
        const parsedMessages = messages.map((message) => JSON.parse(message));
        return parsedMessages;
      }
      return [];
    } catch (error) {
      logger.error(`Failed getting messages in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async deleteMessage(
    from: string,
    to: string,
    messageId: string,
    deletetionType: IChatDeletionType,
  ): Promise<IChatMessageDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const dms = await this.client.LRANGE(`dms:${from}`, 0, -1);
      const parsedDms = dms.map((dm) => JSON.parse(dm));
      const _to = _.find(parsedDms, { to });
      if (_to) {
        const messages = await this.client.LRANGE(`messages:${_to.chatId}`, 0, -1);
        const parsedMessages = messages.map((message) => JSON.parse(message));
        const index = _.findIndex(parsedMessages, { _id: messageId });
        if (index !== -1) {
          if (deletetionType === "forMe") {
            parsedMessages[index].deleteForMe = true;
          } else {
            parsedMessages[index].deleteForMe = true;
            parsedMessages[index].deleteForEveryone = true;
          }
          await this.client.LSET(`messages:${_to.chatId}`, index, JSON.stringify(parsedMessages[index]));

          return parsedMessages[index];
        }
      }

      return null;
    } catch (error) {
      logger.error(`Failed deleting message in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async readMessages(from: string, to: string): Promise<IChatMessageDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const dms = await this.client.LRANGE(`dms:${from}`, 0, -1);
      const parsedDms = dms.map((dm) => JSON.parse(dm));
      const _to = _.find(parsedDms, { to });
      if (_to) {
        const messages = await this.client.LRANGE(`messages:${_to.chatId}`, 0, -1);
        const parsedMessages = messages.map((message) => JSON.parse(message));
        const notReadMessages = parsedMessages.filter((message) => !message.isRead);

        for (const message of notReadMessages) {
          message.isRead = true;
          const index = _.findIndex(parsedMessages, { _id: message._id });
          await this.client.LSET(`messages:${_to.chatId}`, index, JSON.stringify(message));
        }

        const lastMessage = (await this.client.LINDEX(`messages:${_to.chatId}`, -1)) as string;
        return JSON.parse(lastMessage);
      }

      return null;
    } catch (error) {
      logger.error(`Failed reading messages in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }

  async addReaction(
    from: string,
    to: string,
    messageId: string,
    reaction: string,
  ): Promise<IChatMessageDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const dms = await this.client.LRANGE(`dms:${from}`, 0, -1);
      const parsedDms = dms.map((dm) => JSON.parse(dm));
      const _to = _.find(parsedDms, { to });

      if (_to) {
        const messages = await this.client.LRANGE(`messages:${_to.chatId}`, 0, -1);
        const parsedMessages = messages.map((message) => JSON.parse(message));
        const index = _.findIndex(parsedMessages, { _id: messageId });

        if (index !== -1) {
          const uIndex = _.findIndex(parsedMessages[index].reactions, { from });
          if (uIndex !== -1) {
            if (parsedMessages[index].reactions[uIndex].reaction !== reaction) {
              parsedMessages[index].reactions[uIndex].reaction = reaction;
            } else {
              parsedMessages[index].reactions.splice(uIndex, 1);
            }
          } else {
            parsedMessages[index].reactions.push({ from, reaction });
          }
          await this.client.LSET(`messages:${_to.chatId}`, index, JSON.stringify(parsedMessages[index]));
          return parsedMessages[index];
        }
      }

      return null;
    } catch (error) {
      logger.error(`Failed adding reaction in cache: ${(error as Error).message}`, error);
      throw new ApiError("RedisError");
    }
  }
}

export const chatCache = new ChatCache();
