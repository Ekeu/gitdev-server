import express, { Router } from "express";
import { UserControllers } from "./controllers";
import { AuthMiddleware } from "@components/auth/middlewares/auth";

export class UserRoutes {
  static getRoutes(): Router {
    const router = express.Router();

    /**
     * @method GET
     * @param {string} path - /users/me
     * @description - Fetches the current user's profile
     */
    router.get("/users/me", AuthMiddleware.isAuthtenticated, UserControllers.fetchUserProfile);

    /**
     * @method PATCH
     * @param {string} path - /users/:action/:blockedUserId
     * @description - Block or unblock a user
     * @example - /users/block/60f7a9b9e6b3a4b6f0b0a4a1
     * @example - /users/unblock/60f7a9b9e6b3a4b6f0b0a4a1
     */
    router.patch("/users/:action/:blockedUserId", AuthMiddleware.isAuthtenticated, UserControllers.updateUserBlockList);

    return router;
  }
}
