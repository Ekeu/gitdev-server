import { faker } from "@faker-js/faker";

const userId = faker.database.mongodbObjectId();
const postId = faker.database.mongodbObjectId();
const avatar = faker.image.avatar();
const createdAt = faker.date.anytime();
const content = faker.lorem.paragraph();
const commentId = faker.database.mongodbObjectId();

export const mockCommentReqBody = {
  content: "My second comment",
  parentCommentId: "",
};

export const mockCommentReqParams = {
  postId,
};

export const mockUpdateCommentReqParams = {
  commentId,
};

export const mockUpdateCommentReqBody = {
  content: "My updated comment",
};

export const mockCommentDoc = {
  _id: faker.database.mongodbObjectId(),
  content,
  user: {
    _id: userId,
    avatar,
  },
  createdAt,
};
