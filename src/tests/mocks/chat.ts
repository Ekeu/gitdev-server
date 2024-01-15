import { faker } from "@faker-js/faker";

export const mockChatReqBody = {
  chatId: faker.database.mongodbObjectId(),
  isRead: false,
  message: {
    type: "text",
    content: faker.lorem.sentence(),
  },
};

export const mockChatParams = {
  to: faker.database.mongodbObjectId(),
};

export const messageDoc = {
  _id: faker.database.mongodbObjectId(),
  chat: faker.database.mongodbObjectId(),
  message: {
    type: "text",
    content: faker.lorem.sentence(),
  },
  to: faker.database.mongodbObjectId(),
  isRead: false,
  from: faker.database.mongodbObjectId(),
  updatedAt: new Date(),
  createdAt: new Date(),
};
