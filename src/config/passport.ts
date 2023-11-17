import { env } from "@/env";
import { GITDEV_ERRORS } from "@components/auth/constants";
import { AuthUserServices } from "@components/auth/services";
import { UserServices } from "@components/user/services";
import { Application, Request } from "express";
import passport from "passport";
import { Strategy as JWTStrategy, StrategyOptions } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { accessTokenCookieConfig } from "./cookie";

export const initPassport = (app: Application): void => {
  const jwtOptions: StrategyOptions = {
    jwtFromRequest: (req: Request) => req.cookies[accessTokenCookieConfig.cookie.name] || null,
    secretOrKey: env.GITDEV_JWT_SECRET,
  };

  app.use(passport.initialize());

  passport.use(
    "jwt",
    new JWTStrategy(jwtOptions, async (payload, done) => {
      try {
        const user = await UserServices.findUserById(payload.userId);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }),
  );

  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },
      async (email, password, done) => {
        try {
          const auth = await AuthUserServices.findUserByEmail(email);
          if (!auth) return done(null, false, { message: GITDEV_ERRORS.EMAIL_NOT_FOUND.message });
          const isMatch = await auth.comparePassword(password);
          if (!isMatch) return done(null, false, { message: GITDEV_ERRORS.INVALID_PASSWORD.message });
          const user = await UserServices.findUserByAuthId(auth._id);
          if (!user) return done(null, false);
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );
};
