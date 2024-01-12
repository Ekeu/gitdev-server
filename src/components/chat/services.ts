import { Types } from "mongoose";
import { Chat } from "./data/models/chat";
import { Message } from "./data/models/message";
import { IChatDeletionType, IChatMessage, IChatMessageDocument } from "./interfaces";
import { getUserAuthLookup } from "@utils/common";

export class ChatServices {
  static initChatMessageDocument(data: IChatMessage): IChatMessageDocument {
    const messageDoc = new Message(data);
    return messageDoc;
  }

  static async saveMessage(data: IChatMessage): Promise<void> {
    const chatExists = await Chat.exists({ _id: data.chat });
    if (!chatExists) {
      await Chat.create({ from: data.from, to: data.to, _id: data.chat });
    }
    await Message.create(data);
  }

  static async getUserDMs(userId: string): Promise<IChatMessageDocument[]> {
    const messages = await Message.aggregate([
      { $match: { $or: [{ from: new Types.ObjectId(userId) }, { to: new Types.ObjectId(userId) }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$chat",
          message: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$message" } },
      { $sort: { createdAt: -1 } },
      getUserAuthLookup({ user: { localField: "from", as: "from" } }),
      getUserAuthLookup({ user: { localField: "to", as: "to" } }),
      {
        $unwind: "$from",
      },
      {
        $unwind: "$to",
      },
    ]);

    return messages;
  }

  static async getMessages(
    from: string,
    to: string,
    sort: Record<string, -1 | 1> = { createdAt: 1 },
  ): Promise<IChatMessageDocument[]> {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { $and: [{ from: new Types.ObjectId(from) }, { to: new Types.ObjectId(to) }] },
            { $and: [{ from: new Types.ObjectId(to) }, { to: new Types.ObjectId(from) }] },
          ],
        },
      },
      { $sort: sort },
      getUserAuthLookup({ user: { localField: "from", as: "from" } }),
      getUserAuthLookup({ user: { localField: "to", as: "to" } }),
      {
        $unwind: "$from",
      },
      {
        $unwind: "$to",
      },
    ]);

    return messages;
  }

  static async deleteMessage(messageId: string, deletionType: IChatDeletionType): Promise<void> {
    if (deletionType === "forMe") {
      await Message.findByIdAndUpdate(messageId, { deleteForMe: true }, { new: true });
    } else {
      await Message.findByIdAndUpdate(messageId, { deleteForEveryone: true, deleteForMe: true }, { new: true });
    }
  }

  static async readMeassages(from: string, to: string): Promise<void> {
    await Message.updateMany(
      {
        $or: [
          { $and: [{ from: new Types.ObjectId(from) }, { to: new Types.ObjectId(to) }] },
          { $and: [{ from: new Types.ObjectId(to) }, { to: new Types.ObjectId(from) }] },
        ],
        isRead: false,
      },
      { isRead: true },
    );
  }

  static async addReaction(messageId: string, from: string, reaction: string): Promise<void> {
    const message = await Message.findOne({ _id: messageId, "reactions.from": from });

    if (message) {
      const index = message.reactions.findIndex((reaction) => reaction.from.toString() === from);
      if (message.reactions[index].reaction === reaction) {
        await Message.findOneAndUpdate({ _id: messageId }, { $pull: { reactions: { from } } });
      } else {
        await Message.findOneAndUpdate(
          { _id: messageId, "reactions.from": from },
          { $set: { "reactions.$.reaction": reaction } },
        );
      }
    } else {
      await Message.findByIdAndUpdate(messageId, { $push: { reactions: { from, reaction } } });
    }
  }
}
