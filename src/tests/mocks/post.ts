import { IPostDocument } from "@components/post/interfaces";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";

const title = faker.lorem.words(5);
const content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const commentsEnabled = true;
const tags = [faker.lorem.word(5), faker.lorem.word(5)];
const privacy = "public";
const user = faker.database.mongodbObjectId();
const authUser = faker.database.mongodbObjectId();
const redisId = faker.database.mongodbObjectId();

const mockPostDocMeta = {
  _id: faker.database.mongodbObjectId(),
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.anytime(),
  __v: 0,
};

const toObject = jest.fn(function (this: IPostDocument) {
  return this;
});

export const mockPostReqBody = {
  title,
  content,
  commentsEnabled,
  tags,
  privacy,
};

export const mockPostUpdate = {
  ...mockPostReqBody,
  title: "Updated title",
};

export const mockPostData = {
  ...mockPostReqBody,
  user,
  authUser,
};

export const mockPostCurrentUserPayload = {
  authUser,
  redisId,
  userId: user,
};

export const mockPostAuth = {
  username: faker.internet.userName(),
  _id: faker.database.mongodbObjectId(),
};

export const mockPostUser = {
  avatar: faker.image.avatar(),
  _id: faker.database.mongodbObjectId(),
};

export const mockPostEmittedData = {
  title,
  content,
  commentsEnabled,
  tags,
  privacy,
  ...mockPostDocMeta,
  authUser: {
    ...mockPostAuth,
  },
  user: {
    ...mockPostUser,
  },
  toObject,
};

export const mockPostDoc = {
  title,
  content,
  commentsEnabled,
  tags,
  privacy,
  user,
  authUser,
  ...mockPostDocMeta,
  toObject,
};

export const mockCachedPost = {
  post: mockPostEmittedData,
  key: mockPostDoc._id,
  userId: mockPostDoc.user,
  redisId: redisId,
};
