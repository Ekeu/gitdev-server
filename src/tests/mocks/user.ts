import { faker } from "@faker-js/faker";

export const mockCurrentUserPayload = {
  authUser: faker.database.mongodbObjectId(),
  userId: faker.database.mongodbObjectId(),
};
