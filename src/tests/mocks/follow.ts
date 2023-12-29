import { IFollowDocument } from "@components/follow/interfaces";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";

export const mockFollowReqParams = {
  followingId: faker.database.mongodbObjectId(),
};

export const mockFollowGetUser = {
  _id: faker.database.mongodbObjectId(),
  username: faker.internet.userName(),
};

export const mockFollowDoc = {
  _id: faker.database.mongodbObjectId(),
  follower: faker.database.mongodbObjectId(),
  following: faker.database.mongodbObjectId(),
  toObject: jest.fn(function (this: IFollowDocument) {
    return this;
  }),
};
