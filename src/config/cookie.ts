import { env } from "@/env";
import { CookieOptions } from "express";

export const refreshTokenCookieConfig = {
  secret: env.GITDEV_REFRESH_JWT_SECRET,
  cookie: {
    name: "rfToken",
    options: {
      httpOnly: true,
      secure: env.GITDEV_SERVER_ENV === "production",
      sameSite: env.GITDEV_SERVER_ENV === "production" ? "strict" : "none",
      maxAge: 1000 * 60 * 60 * 24 * 3,
    } as CookieOptions,
  },
};

export const accessTokenCookieConfig = {
  secret: env.GITDEV_JWT_SECRET,
  cookie: {
    name: "acToken",
    options: {
      httpOnly: true,
      secure: env.GITDEV_SERVER_ENV === "production",
      sameSite: env.GITDEV_SERVER_ENV === "production" ? "strict" : "none",
      maxAge: 1000 * 60 * 60 * 24,
    } as CookieOptions,
  },
};
