import { GITDEV_PASSWORD_REGEX } from "@components/auth/constants";
import { IAuthUserDocument, IAuthUserTokenDocument } from "@components/auth/interfaces";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import { removeNonAlphaNumericCharacters } from "@utils/common";
import RandExp from "randexp";

const password = new RandExp(GITDEV_PASSWORD_REGEX).gen();
const authUserId = faker.database.mongodbObjectId();
const refreshTokenCookie = faker.string.numeric(16);

// Compler User Mock //

export const mockUser = {
  notifications: {
    messages: true,
    follows: true,
    reactions: true,
    comments: true,
  },
  _id: faker.database.mongodbObjectId(),
  bio: null,
  avatar: faker.image.avatar(),
  website: null,
  company: null,
  location: null,
  postsCount: 0,
  blocked: [],
  blockedBy: [],
  followersCount: 0,
  followingCount: 0,
  social: [],
  authUser: {
    _id: faker.database.mongodbObjectId(),
    email: faker.internet.email().toLowerCase(),
    username: faker.internet.userName().toLowerCase(),
    emailVerified: false,
    role: "basic",
    provider: "local",
    redisId: faker.string.numeric(16),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    __v: 0,
  },
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.anytime(),
  __v: 0,
};

// Sign Up Mocks //

export const mockSignUpPayload = {
  password,
  email: faker.internet.email().toLowerCase(),
  username: removeNonAlphaNumericCharacters(faker.internet.userName().toLowerCase()),
};

export const mockSignUpPayloadWithNoUsername = {
  password,
  email: faker.internet.email().toLowerCase(),
};

// Sign In Mocks //

export const mockSignInPayload = {
  password,
  email: faker.internet.email().toLowerCase(),
};

// Sign Out Mocks //

export const mockSignOutRefreshTokenCookie = {
  rfToken: refreshTokenCookie,
};

export const mockSignOutPayload = {
  authUser: authUserId,
};

// AuthUser Mock Doc //

export const mockAuthDoc = {
  _id: authUserId,
  email: faker.internet.email().toLowerCase(),
  username: faker.internet.userName().toLowerCase(),
  emailVerified: false,
  role: "basic",
  provider: "local",
  redisId: faker.string.numeric(16),
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.anytime(),
  save: jest.fn().mockImplementationOnce(function (this: IAuthUserDocument) {
    return Promise.resolve(this);
  }),
  __v: 0,
};

// AuthToken Mock Doc //

export const mockAuthTokenDoc = {
  _id: faker.database.mongodbObjectId(),
  refreshTokens: [
    {
      token: refreshTokenCookie,
    },
  ],
  emailSecret: null,
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.anytime(),
  save: jest.fn().mockImplementationOnce(function (this: IAuthUserTokenDocument) {
    return Promise.resolve(this);
  }),
  __v: 0,
};

// User Mock Doc //

export const mockUserDoc = {
  notifications: {
    messages: true,
    follows: true,
    reactions: true,
    comments: true,
  },
  _id: faker.database.mongodbObjectId(),
  bio: null,
  avatar: faker.image.avatar(),
  website: null,
  company: null,
  location: null,
  postsCount: 0,
  blocked: [],
  blockedBy: [],
  followersCount: 0,
  followingCount: 0,
  social: [],
  authUser: authUserId,
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.anytime(),
  __v: 0,
};

// AuthUser Mock Array //

export const mockAUthUsersArray = [
  {
    ...mockAuthDoc,
    _id: faker.database.mongodbObjectId(),
  },
  {
    ...mockAuthDoc,
    _id: faker.database.mongodbObjectId(),
  },
  {
    ...mockAuthDoc,
    _id: faker.database.mongodbObjectId(),
  },
  {
    ...mockAuthDoc,
    username: "monks17",
    redisId: "9607626436397834",
    _id: "655d34ca729c51ef9820d190",
    email: "ulrich.uk.pro@gmail.com",
  },
];

// Forgot password Mocks //

export const mockForgotPasswordPayload = {
  email: faker.internet.email().toLowerCase(),
};

// Reset password Mocks //

export const mockResetPasswordPayload = {
  password,
  confirmPassword: password,
};

export const mockResetPasswordTokenParams = {
  resetToken: `${faker.string.alphanumeric(16)}+${faker.string.alphanumeric(16)}`,
};
