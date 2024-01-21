import express, { Router } from "express";
import { AuthUserControllers } from "./controllers";
import { AuthMiddleware } from "./middlewares/auth";

export class AuthRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method POST
     * @param {string} path - /auth/signup
     * @description - Registers a new user
     */
    router.post("/auth/signup", AuthUserControllers.signUp);

    /**
     * @method POST
     * @param {string} path - /auth/signin
     * @description - Signs in a user
     */
    router.post("/auth/signin", AuthUserControllers.signIn);

    /**
     * @method POST
     * @param {string} path - /auth/signout
     * @description - Signs out a user
     */
    router.post("/auth/signout", AuthUserControllers.signOut);

    /**
     * @method GET
     * @param {string} path - /auth/github
     * @description - Makes a request to github for authentication
     */
    router.get("/auth/github", AuthUserControllers.socialAuth("github", ["user:email"]));

    /**
     * @method GET
     * @param {string} path - /auth/github/callback
     * @description - Endpoint for github to redirect to after authentication
     */
    router.get("/auth/github/callback", AuthUserControllers.socialAuthCallback("github"));

    /**
     * @method GET
     * @param {string} path - /auth/google
     * @description - Makes a request to google for authentication
     */
    router.get("/auth/google", AuthUserControllers.socialAuth("google", ["email", "profile"]));

    /**
     * @method GET
     * @param {string} path - /auth/google/callback
     * @description - Endpoint for google to redirect to after authentication
     */
    router.get("/auth/google/callback", AuthUserControllers.socialAuthCallback("google"));

    /**
     * @method POST
     * @param {string} path - /auth/forgot-password
     * @description - Sends a password reset link to the user's email
     */
    router.post("/auth/forgot-password", AuthUserControllers.forgotPassword);

    /**
     * @method PATCH
     * @param {string} path - /auth/update-password
     * @description - Update a user's password
     */
    router.patch("/auth/update-password", AuthMiddleware.isAuthtenticated, AuthUserControllers.updatePassword);

    /**
     * @method POST
     * @param {string} path - /auth/reset-password/:resetToken
     * @description - Resets a user's password
     */
    router.post("/auth/reset-password/:resetToken", AuthUserControllers.resetPassword);

    /**
     * @method POST
     * @param {string} path - /auth/verify-account
     * @description - Sends a verification token to the user's email
     */

    router.post(
      "/auth/send-email-token",
      AuthMiddleware.isAuthtenticated,
      AuthUserControllers.sendEmailVerificationToken,
    );

    /**
     * @method POST
     * @param {string} path - /auth/verify-account/:verificationToken
     * @description - Verifies a user's email
     */

    router.post("/auth/verify-email-token", AuthMiddleware.isAuthtenticated, AuthUserControllers.verifyEmailToken);

    return router;
  }
}
