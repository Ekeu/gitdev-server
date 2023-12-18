import { faker } from "@faker-js/faker";

const postId = faker.database.mongodbObjectId();
const type = "love";

export const mockReactionUser = faker.database.mongodbObjectId();

export const mockReactionDoc = {
  type,
  postId,
  user: mockReactionUser,
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.anytime(),
  _id: faker.database.mongodbObjectId(),
};

export const mockReactionReqBody = {
  postId,
  type,
};

export const mockReactionReqParams = {
  postId,
  userId: mockReactionUser,
  type,
};
