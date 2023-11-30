import { env } from "@/env";
import { GITDEV_ERRORS } from "@components/auth/constants";
import { AuthUserServices } from "@components/auth/services";
import { UserServices } from "@components/user/services";
import { Application, Request } from "express";
import passport from "passport";
import { Strategy as JWTStrategy, StrategyOptions, VerifiedCallback } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as GooglStrategy } from "passport-google-oauth2";
import { accessTokenCookieConfig } from "./cookie";
import { ISocialAuthGithubProfile, ISocialAuthGoogleProfile } from "@components/auth/interfaces";
import { AuthUser } from "@components/auth/data/models/auth-user";
import { IUserDocument } from "@components/user/interfaces";

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

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: env.GITDEV_GITHUB_CLIENT_ID,
        callbackURL: env.GITDEV_GITHUB_CALLBACK_URL,
        clientSecret: env.GITDEV_GITHUB_CLIENT_SECRET,
        scope: ["user:email"],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: ISocialAuthGithubProfile,
        done: VerifiedCallback,
      ) => {
        try {
          const authUserExists = await AuthUser.exists({ email: profile._json.email });
          if (!authUserExists) {
            const user = await UserServices.createSocialAccount(profile);
            return done(null, user);
          } else {
            const auth = await AuthUserServices.findUserByEmail(profile._json.email);
            const user = (await UserServices.findUserByAuthId(auth!._id)) as IUserDocument;
            return done(null, user);
          }
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );

  passport.use(
    "google",
    new GooglStrategy(
      {
        clientID: env.GITDEV_GOOGLE_CLIENT_ID,
        clientSecret: env.GITDEV_GOOGLE_CLIENT_SECRET,
        callbackURL: env.GITDEV_GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: ISocialAuthGoogleProfile,
        done: VerifiedCallback,
      ) => {
        try {
          const authUserExists = await AuthUser.exists({ email: profile._json.email });
          if (!authUserExists) {
            const user = await UserServices.createSocialAccount(profile);
            return done(null, user);
          } else {
            const auth = await AuthUserServices.findUserByEmail(profile._json.email);
            const user = (await UserServices.findUserByAuthId(auth!._id)) as IUserDocument;
            return done(null, user);
          }
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );
};
